'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.action";
import { getUserById } from "./user.action";
import { insertOrderSchema } from "../validator";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { updateOrderToPaid } from "./order.internal";

// Create order and create the order items
export async function createOrder() {
    try {
        const session = await auth();
        if(!session) throw new Error('User is not authenticated');

        const cart = await getMyCart();
        const userId = session?.user?.id;
        if (!userId) throw new Error('User not found');

        const user = await getUserById(userId);

        if (!cart || cart.items.length === 0) {
            return { success: false, message: 'Your cart is empty', redirectTo: '/cart' }
        }

        if (!user.address) {
            return { success: false, message: 'No shipping address', redirectTo: '/shipping-method' }
        }

        if (!user.paymentMethod) {
            return { success: false, message: 'No payment method', redirectTo: '/payment-method' }
        }

        // Verify stock availability before creating order
        for (const item of cart.items as CartItem[]) {
            const product = await prisma.product.findFirst({
                where: { id: item.productId },
            });
            if (!product) {
                return { success: false, message: `Product "${item.name}" is no longer available` };
            }
            if (product.stock < item.qty) {
                return { success: false, message: `Not enough stock for "${item.name}". Only ${product.stock} left.` };
            }
        }

        //Create order object
        const order = insertOrderSchema.parse({
            userId: user.id,
            shippingAddress: user.address,
            paymentMethod: user.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            totalPrice: cart.totalPrice,
        });

        // Create a transaction to create order and order items in database
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       const insertedOrderId = await prisma.$transaction(async (tx: any) => {
            // Create order
            const insertedOrder = await tx.order.create({ data: order });
            // Create order items from the cart items
            for (const item of cart.items as CartItem[]) {
                await tx.orderItem.create({
                    data: {
                        ...item,
                        price: item.price,
                        orderId: insertedOrder.id,
                    },
                });
            }
            // Clear cart
            await tx.cart.update({
                where: { id: cart.id },
                data: {
                    items: [],
                    totalPrice: 0,
                    shippingPrice: 0,
                    itemsPrice: 0
                }
            });
            
            return insertedOrder.id;
        });

        if (!insertedOrderId) throw new Error('Order not created');

        return { success: true, message: 'Order created', redirectTo: `/order/${insertedOrderId}`,}
    } catch (error) {
        if (isRedirectError(error)) throw error;
        
        return {success: false, message: formatError(error)}
    }
}


// Get order by id
export async function getOrderById(orderId: string) {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    const data = await prisma.order.findFirst({
        where: {
            id: orderId,
        },
        include: {
            orderitems: true,
            user: {select: { name: true, email: true}},
        },
    });

    if (!data) return null;

    // Verify ownership: only order owner or admin can view
    if (data.userId !== session.user.id && session.user.role !== 'admin') {
        throw new Error('Unauthorized: you do not have access to this order');
    }

    return convertToPlainObject(data);
}

// Note: updateOrderToPaid is imported from order.internal.ts for internal use only.
// API routes should import directly from '@/lib/actions/order.internal'.

// Get user's orders
export async function getMyOrders({
    limit = PAGE_SIZE,
    page,
}: {
    limit?: number;
    page: number;
}) {
    const session = await auth();
    if (!session) throw new Error('User is not authorized');

    const data = await prisma.order.findMany({
        where: { userId: session?.user?.id },
        orderBy: { createdAt: 'desc'},
        take: limit,
        skip: (page - 1) * limit
    });

    const dataCount = await prisma.order.count({
        where: { userId: session.user?.id }
    });

    return {
        data,
        totalPages: Math.ceil(dataCount / limit)
    }
}

type SalesDataType = {
    month: string;
    totalSales: number
}[];

// Get Order summary
export async function getOrderSummary() {
    const session = await auth();
    if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');
    // Get counts for each resource
    const ordersCount = await prisma.order.count();
    const productsCount = await prisma.product.count();
    const usersCount = await prisma.user.count();

    // Calculate the total sales
    const totalSales = await prisma.order.aggregate({
        _sum: { totalPrice: true }
    });

    // Get monthly sales
  const salesDataRaw = await prisma.$queryRaw<
  Array<{ month: string; totalSales: Prisma.Decimal }>
>`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

const salesData: SalesDataType = salesDataRaw.map((entry) => ({
  month: entry.month,
  totalSales: Number(entry.totalSales),
}));

    //Get lastest sales
    const latestSales = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true }},
        },
        take: 6,
    });

    return {
        ordersCount,
        productsCount,
        usersCount,
        totalSales,
        latestSales,
        salesData
    }
}

// Get all orders
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
    const queryFilter: Prisma.OrderWhereInput = query && query !== 'all' ? {
        user: {
            name: {
                contains: query,
                mode: 'insensitive',
            } as Prisma.StringFilter,
        }
    } : {};

    const data = await prisma.order.findMany({
        where: {
            ...queryFilter,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page -1 ) * limit,
        include: { user: { select: { name: true } } },
    });

    const dataCount = await prisma.order.count({
        where: {
            ...queryFilter,
        },
    });

    return {
        data,
        totalPages: Math.ceil(dataCount / limit),
    }
}

// Delete an order
export async function deleteOrder(id: string) {
    try {
       const session = await auth();
       if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

       await prisma.order.delete({ where: { id }});
       
       revalidatePath('/admin/orders');

       return {
        success: true,
        message: "Order deleted successfully"
       }
    } catch (error) {
        return { success: false, message: formatError(error)}
    }
}

// Update Cash On Delivery to paid
export async function upadteOrderToPaidCOD(orderId: string) {
    try {
        const session = await auth();
        if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

        const result = await updateOrderToPaid({ orderId });
        
        if (!result.success) {
            return result; // Pass through any error from updateOrderToPaid
        }

        revalidatePath(`/order/${orderId}`);

        return { success: true, message: "Order marked as paid" };
    } catch (error) {
        return { success: false, message: formatError(error) };
    }
}

// Update COD order to delivered
export async function deliverOrder(orderId: string) {
    try {
        const session = await auth();
        if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
            },
        });

        if (!order) throw new Error('Order not found');
        if (!order.isPaid) throw new Error('Order is not paid');

        await prisma.order.update({
            where: { id: orderId },
            data: {
                isDelivered: true,
                deliveredAt: new Date(),
            },
        });

        revalidatePath(`/order/${orderId}`);

        return {
            success: true,
            message: "Order has been marked delivered",
        }
    } catch (error) {
        return { success: false, message: formatError(error) };
    }
}