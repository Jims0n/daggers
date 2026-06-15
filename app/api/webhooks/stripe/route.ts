import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderToPaid } from "@/lib/actions/order.internal";

export async function POST(req: NextRequest) {
   try {
       //Build the webhook event
       const event = await Stripe.webhooks.constructEvent(
        await req.text(),
        req.headers.get('stripe-signature') as string,
        process.env.STRIPE_WEBHOOK_SECRET as string
       );

       // Check for successful payment
       if (event.type === 'charge.succeeded') {
        const { object } = event.data;
        const orderId = object.metadata.orderId;

        if (!orderId) {
            console.error('No orderId found in metadata');
            return NextResponse.json({
                success: false,
                message: 'No orderId found in metadata'
            }, { status: 400 });
        }

        // Update order status
        const result = await updateOrderToPaid({
            orderId,
            paymentResult: {
                id: object.id,
                status: 'COMPLETED',
                email_address: object.billing_details.email || '',
                pricePaid: (object.amount / 100).toFixed(2),
            },
        });

        if (!result.success) {
            console.error(`Failed to update order: ${result.message}`);
            return NextResponse.json({
                success: false,
                message: result.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Order payment updated successfully'
        });
       }

       return NextResponse.json({
        success: true,
        message: 'Event processed but no action taken'
       });
   } catch (error) {
       console.error('Stripe webhook error:', error);
       return NextResponse.json({
           success: false,
           message: error instanceof Error ? error.message : 'Unknown error processing webhook'
       }, { status: 500 });
   }
}