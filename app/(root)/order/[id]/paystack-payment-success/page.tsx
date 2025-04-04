import { Metadata } from 'next';
import { updateOrderToPaid } from '@/lib/actions/order.action';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Payment Successful | Daggers',
  description: 'Your payment has been processed successfully',
};

// This page handles the redirect after a successful Paystack payment
const PaystackSuccessPage = async (props: {
  searchParams: Promise<{ reference?: string; trxref?: string; }>,
  params: Promise<{ id: string }>,
}) => {
  const { reference, trxref } = await props.searchParams;
  const {  id } = await props.params;
  
  // Use either reference or trxref, whichever is available
  const paymentReference = reference || trxref || '';
  
  if (!paymentReference) {
    // If no reference is provided, just redirect back to the order page
    redirect(`/order/${id}`);
  }

  try {
    // Update the order status in the database
    await updateOrderToPaid({
      orderId: id,
      paymentResult: {
        id: paymentReference,
        status: 'COMPLETED',
        email_address: '', // This will be populated on the backend
        pricePaid: '', // Actual amount will be populated on the backend
      },
    });
    
    // Redirect to order page after successful update
    redirect(`/order/${id}?success=true`);
  } catch (error) {
    console.error('Error processing Paystack success:', error);
    // Redirect to order page with error parameter
    redirect(`/order/${id}?error=payment-verification-failed`);
  }
};

export default PaystackSuccessPage; 