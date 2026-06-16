'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { convertToPlainObject, formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.action';
import { getUserById } from './user.action';
import { insertOrderSchema } from '../validator';
import { db, orders, orderItems, products, users, carts } from '@/db';
import { CartItem } from '@/types';
import { revalidatePath } from 'next/cache';
import { PAGE_SIZE } from '../constants';
import { updateOrderToPaid } from './order.internal';
import { and, count, desc, eq, sql, sum } from 'drizzle-orm';

// Create order and create the order items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return { success: false, message: 'Your cart is empty', redirectTo: '/cart' };
    }

    if (!user.address) {
      return { success: false, message: 'No shipping address', redirectTo: '/shipping-method' };
    }

    if (!user.paymentMethod) {
      return { success: false, message: 'No payment method', redirectTo: '/payment-method' };
    }

    // Verify stock availability
    for (const item of cart.items as CartItem[]) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (!product) {
        return { success: false, message: `Product "${item.name}" is no longer available` };
      }
      if (product.stock < item.qty) {
        return {
          success: false,
          message: `Not enough stock for "${item.name}". Only ${product.stock} left.`,
        };
      }
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await db.transaction(async (tx) => {
      const [insertedOrder] = await tx.insert(orders).values(order).returning({ id: orders.id });

      for (const item of cart.items as CartItem[]) {
        await tx.insert(orderItems).values({
          ...item,
          price: item.price,
          orderId: insertedOrder.id,
        });
      }

      await tx
        .update(carts)
        .set({ items: [], totalPrice: '0', shippingPrice: '0', itemsPrice: '0' })
        .where(eq(carts.id, cart.id));

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error('Order not created');

    return { success: true, message: 'Order created', redirectTo: `/order/${insertedOrderId}` };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

// Get order by id
export async function getOrderById(orderId: string) {
  const session = await auth();
  if (!session) throw new Error('User is not authenticated');

  const data = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      orderItems: true,
      user: { columns: { name: true, email: true } },
    },
  });

  if (!data) return null;

  if (data.userId !== session.user.id && session.user.role !== 'admin') {
    throw new Error('Unauthorized: you do not have access to this order');
  }

  return convertToPlainObject(data);
}

// Get user's orders
export async function getMyOrders({ limit = PAGE_SIZE, page }: { limit?: number; page: number }) {
  const session = await auth();
  if (!session) throw new Error('User is not authorized');

  const userId = session.user.id!;

  const data = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const [{ value: dataCount }] = await db
    .select({ value: count() })
    .from(orders)
    .where(eq(orders.userId, userId));

  return { data, totalPages: Math.ceil(dataCount / limit) };
}

type SalesDataType = { month: string; totalSales: number }[];

// Get Order summary
export async function getOrderSummary() {
  const session = await auth();
  if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

  const [{ ordersCount }] = await db.select({ ordersCount: count() }).from(orders);
  const [{ productsCount }] = await db.select({ productsCount: count() }).from(products);
  const [{ usersCount }] = await db.select({ usersCount: count() }).from(users);

  const [{ totalSales }] = await db.select({ totalSales: sum(orders.totalPrice) }).from(orders);

  const salesDataRaw = await db.execute<{ month: string; totalSales: string }>(
    sql`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`
  );

  const salesData: SalesDataType = (
    salesDataRaw.rows as Array<{ month: string; totalSales: string }>
  ).map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }));

  const latestSales = await db.query.orders.findMany({
    orderBy: desc(orders.createdAt),
    limit: 6,
    with: { user: { columns: { name: true } } },
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales: { _sum: { totalPrice: totalSales } },
    latestSales,
    salesData,
  };
}

// Get all orders (admin)
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const session = await auth();
  if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

  const whereClause =
    query && query !== 'all'
      ? and(
          eq(orders.id, orders.id), // dummy truthy condition, replaced by join filter below
          sql`EXISTS (SELECT 1 FROM "User" u WHERE u.id = "Order"."userId" AND u.name ILIKE ${`%${query}%`})`
        )
      : undefined;

  const data = await db.query.orders.findMany({
    where: whereClause,
    orderBy: desc(orders.createdAt),
    limit,
    offset: (page - 1) * limit,
    with: { user: { columns: { name: true } } },
  });

  const [{ value: dataCount }] = await db
    .select({ value: count() })
    .from(orders)
    .where(whereClause);

  return { data, totalPages: Math.ceil(dataCount / limit) };
}

// Delete an order
export async function deleteOrder(id: string) {
  try {
    const session = await auth();
    if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

    await db.delete(orders).where(eq(orders.id, id));

    revalidatePath('/admin/orders');

    return { success: true, message: 'Order deleted successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update Cash On Delivery to paid
export async function upadteOrderToPaidCOD(orderId: string) {
  try {
    const session = await auth();
    if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

    const result = await updateOrderToPaid({ orderId });

    if (!result.success) return result;

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: 'Order marked as paid' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update COD order to delivered
export async function deliverOrder(orderId: string) {
  try {
    const session = await auth();
    if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));

    if (!order) throw new Error('Order not found');
    if (!order.isPaid) throw new Error('Order is not paid');

    await db
      .update(orders)
      .set({ isDelivered: true, deliveredAt: new Date() })
      .where(eq(orders.id, orderId));

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: 'Order has been marked delivered' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
