import { Metadata } from 'next';
import { updateOrderToPaid } from '@/lib/actions/order.action';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Payment Successful | Daggers',
  description: 'Your payment has been processed successfully',
};

// This page handles the redirect after a successful Paystack payment
const PaystackSuccessPage = async ({
  searchParams,
  params,
}: {
  searchParams: { reference?: string; trxref?: string; };
  params: { id: string };
}) => {
  const { reference, trxref } = searchParams;
  const { id: orderId } = params;
  
  // Use either reference or trxref, whichever is available
  const paymentReference = reference || trxref || '';
  
  if (!paymentReference) {
    // If no reference is provided, just redirect back to the order page
    redirect(`/order/${orderId}`);
  }

  try {
    // Update the order status in the database
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: paymentReference,
        status: 'COMPLETED',
        email_address: '', // This will be populated on the backend
        pricePaid: '', // Actual amount will be populated on the backend
      },
    });
    
    // Redirect to order page after successful update
    redirect(`/order/${orderId}?success=true`);
  } catch (error) {
    console.error('Error processing Paystack success:', error);
    // Redirect to order page with error parameter
    redirect(`/order/${orderId}?error=payment-verification-failed`);
  }
};

export default PaystackSuccessPage; 