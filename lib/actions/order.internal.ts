import { db, orders, orderItems, products } from '@/db';
import { PaymentResult, ShippingAddress } from '@/types';
import { sendPurchaseReceipt } from '@/email';
import { eq, sql } from 'drizzle-orm';

// Internal function — NOT a server action, not callable from client
export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order) return { success: false, message: 'Order not found' };
    if (order.isPaid) return { success: true, message: 'Order is already paid' };

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.qty}` })
          .where(eq(products.id, item.productId));
      }

      await tx
        .update(orders)
        .set({ isPaid: true, paidAt: new Date(), paymentResult })
        .where(eq(orders.id, orderId));
    });

    const updatedOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        orderItems: true,
        user: { columns: { name: true, email: true } },
      },
    });

    if (!updatedOrder) return { success: false, message: 'Order not found after update' };

    await sendPurchaseReceipt({
      order: {
        ...updatedOrder,
        shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
        paymentResult: updatedOrder.paymentResult as PaymentResult,
        isPaid: Boolean(updatedOrder.isPaid),
        isDelivered: Boolean(updatedOrder.isDelivered),
        user: {
          ...updatedOrder.user,
          name: updatedOrder.user.name || '',
        },
      },
    });

    return {
      success: true,
      message: 'Payment processed successfully',
      order: updatedOrder,
    };
  } catch (error) {
    console.error('Error updating order to paid:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred processing payment',
    };
  }
}
