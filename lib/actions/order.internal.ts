import { prisma } from "@/db/prisma";
import { PaymentResult, ShippingAddress } from "@/types";
import { sendPurchaseReceipt } from "@/email";

// Internal function — NOT a server action, not callable from client
export async function updateOrderToPaid({orderId, paymentResult}: {orderId: string; paymentResult?: PaymentResult}) {
    try {
        // Get order from database
        const order = await prisma.order.findFirst({
            where: {
                id: orderId
            },
            include: {
                orderitems: true
            }
        });

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        if (order.isPaid) {
            return { success: true, message: 'Order is already paid' };
        }

        // Transaction to update order and account for product stock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) => {
            // Iterate over products and update stock
            for (const item of order.orderitems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: -item.qty }},
                });
            }

            // Set the order to paid
            await tx.order.update({
                where: { id: orderId },
                data: {
                    isPaid: true,
                    paidAt: new Date(),
                    paymentResult
                }
            });
        });

        // Get updated order after transaction
        const updatedOrder = await prisma.order.findFirst({
            where: { id: orderId },
            include: {
                orderitems: true,
                user: { select: {name: true, email: true }},
            },
        });

        if(!updatedOrder) {
            return { success: false, message: 'Order not found after update' };
        }

        // Send email receipt
        await sendPurchaseReceipt({
            order: {
                ...updatedOrder,
                shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
                paymentResult: updatedOrder.paymentResult as PaymentResult,
                isPaid: Boolean(updatedOrder.isPaid),
                isDelivered: Boolean(updatedOrder.isDelivered),
                user: {
                    ...updatedOrder.user,
                    name: updatedOrder.user.name || ''
                }
            }
        });

        return { 
            success: true, 
            message: 'Payment processed successfully',
            order: updatedOrder
        };
    } catch (error) {
        console.error('Error updating order to paid:', error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : 'An error occurred processing payment'
        };
    }
}
