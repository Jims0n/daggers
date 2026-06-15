import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export const metadata: Metadata = {
  title: 'Payment Successful | Daggers',
  description: 'Your payment has been processed successfully',
};

// This page handles the redirect after a successful Paystack payment.
// It verifies the payment through the secure /api/paystack/verify endpoint
// which checks auth, validates the amount, and confirms with Paystack's API.
const PaystackSuccessPage = async (props: {
  searchParams: Promise<{ reference?: string; trxref?: string; }>,
  params: Promise<{ id: string }>,
}) => {
  const { reference, trxref } = await props.searchParams;
  const { id } = await props.params;
  
  // Use either reference or trxref, whichever is available
  const paymentReference = reference || trxref || '';
  
  if (!paymentReference) {
    redirect(`/order/${id}`);
  }

  try {
    // Forward cookies so the verify endpoint can authenticate the user
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';

    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/api/paystack/verify?reference=${encodeURIComponent(paymentReference)}&orderId=${encodeURIComponent(id)}`;

    const res = await fetch(verifyUrl, {
      headers: { cookie },
    });

    const data = await res.json();

    if (!data.success) {
      console.error('Payment verification failed:', data.message);
      redirect(`/order/${id}?error=payment-verification-failed`);
    }

    redirect(`/order/${id}?success=true`);
  } catch (error) {
    // redirect() throws a special error in Next.js — rethrow it
    if (isRedirectError(error)) throw error;
    console.error('Error processing Paystack success:', error);
    redirect(`/order/${id}?error=payment-verification-failed`);
  }
};

export default PaystackSuccessPage; 