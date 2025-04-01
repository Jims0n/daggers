import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import { updateOrderToPaid } from "@/lib/actions/order.action";

// Verify that the request is from Paystack
const verifyPaystackSignature = (
  requestBody: string,
  paystackSignature?: string
) => {
  if (!paystackSignature) return false;
  
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error('PAYSTACK_SECRET_KEY is not defined in environment variables');
    return false;
  }

  const hash = crypto
    .createHmac('sha512', secretKey)
    .update(requestBody)
    .digest('hex');

  return hash === paystackSignature;
};

export async function POST(req: NextRequest) {
  try {
    // Get the request body as text
    const requestBody = await req.text();
    
    // Verify Paystack signature
    const paystackSignature = req.headers.get('x-paystack-signature') || undefined;
    
    if (!verifyPaystackSignature(requestBody, paystackSignature)) {
      return NextResponse.json({ 
        error: 'Invalid signature' 
      }, { status: 401 });
    }

    // Parse the request body as JSON
    const event = JSON.parse(requestBody);

    // Check if this is a charge.success event
    if (event.event === 'charge.success') {
      const { data } = event;
      
      // Extract order ID from the reference
      // Reference format is: order_[orderId]_[timestamp]
      const referenceParts = data.reference.split('_');
      if (referenceParts.length < 3) {
        return NextResponse.json({ 
          error: 'Invalid reference format' 
        }, { status: 400 });
      }
      
      const orderId = referenceParts[1];
      
      // Update the order as paid
      await updateOrderToPaid({
        orderId,
        paymentResult: {
          id: data.id.toString(),
          status: 'COMPLETED',
          email_address: data.customer.email,
          pricePaid: (data.amount / 100).toFixed(2),
        },
      });
      
      return NextResponse.json({
        message: 'Order updated to paid successfully'
      });
    }
    
    // For other event types, just acknowledge receipt
    return NextResponse.json({
      message: 'Webhook received, but no action taken for this event type'
    });
    
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 