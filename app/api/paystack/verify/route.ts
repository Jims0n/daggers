import { NextRequest, NextResponse } from "next/server";
import { updateOrderToPaid } from "@/lib/actions/order.internal";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";

export async function GET(req: NextRequest) {
    try {
        // Verify user is authenticated
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const reference = searchParams.get('reference');
        const orderId = searchParams.get('orderId');

        if (!reference || !orderId) {
            return NextResponse.json(
                { success: false, message: 'Missing reference or orderId' },
                { status: 400 }
            );
        }

        // Verify the user owns this order
        const order = await prisma.order.findFirst({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        if (order.userId !== session.user.id && session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: you do not own this order' },
                { status: 403 }
            );
        }

        if (order.isPaid) {
            return NextResponse.json(
                { success: true, message: 'Order is already paid' },
            );
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            console.error('PAYSTACK_SECRET_KEY is not defined');
            return NextResponse.json(
                { success: false, message: 'Payment configuration error' },
                { status: 500 }
            );
        }

        // Verify the transaction with Paystack's API
        const verifyResponse = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                },
            }
        );

        const verifyData = await verifyResponse.json();

        if (!verifyData.status || verifyData.data?.status !== 'success') {
            return NextResponse.json(
                { success: false, message: 'Payment verification failed. Transaction was not successful.' },
                { status: 400 }
            );
        }

        const txData = verifyData.data;

        // Verify the paid amount matches the order total (amount is in kobo)
        const paidAmountInNaira = txData.amount / 100;
        const orderTotal = Number(order.totalPrice);

        if (Math.abs(paidAmountInNaira - orderTotal) > 0.01) {
            console.error(
                `Payment amount mismatch: paid ${paidAmountInNaira}, expected ${orderTotal} for order ${orderId}`
            );
            return NextResponse.json(
                { success: false, message: 'Payment amount does not match order total' },
                { status: 400 }
            );
        }

        // Mark order as paid with verified data from Paystack
        const result = await updateOrderToPaid({
            orderId,
            paymentResult: {
                id: txData.id.toString(),
                status: 'COMPLETED',
                email_address: txData.customer?.email || '',
                pricePaid: paidAmountInNaira.toFixed(2),
            },
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified and order updated successfully',
        });
    } catch (error) {
        console.error('Paystack verify error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error during verification' },
            { status: 500 }
        );
    }
}
