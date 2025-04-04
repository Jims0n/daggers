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
        success: false,
        message: 'Invalid signature' 
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
          success: false,
          message: 'Invalid reference format' 
        }, { status: 400 });
      }
      
      const orderId = referenceParts[1];
      
      // Update the order as paid
      const result = await updateOrderToPaid({
        orderId,
        paymentResult: {
          id: data.id.toString(),
          status: 'COMPLETED',
          email_address: data.customer.email,
          pricePaid: (data.amount / 100).toFixed(2),
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
        message: 'Order updated to paid successfully'
      });
    }
    
    // For other event types, just acknowledge receipt
    return NextResponse.json({
      success: true,
      message: 'Webhook received, but no action taken for this event type'
    });
    
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ 
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
} 