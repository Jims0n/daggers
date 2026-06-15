'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { usePaystackPayment } from 'react-paystack';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const PaystackPayment = ({
  amount,
  orderId,
  email,
  paystackPublicKey
}: {
  amount: number;
  orderId: string;
  email: string;
  paystackPublicKey: string;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Stable reference — only generated once per mount
  const reference = useMemo(
    () => `dgr_${orderId}_${Date.now()}`,
    [orderId]
  );

  // Amount in kobo
  const amountInKobo = Math.round(amount * 100);

  const config = {
    reference,
    email,
    amount: amountInKobo,
    publicKey: paystackPublicKey,
  };

  const initializePayment = usePaystackPayment(config);

  const verifyAndMarkPaid = async (paymentReference: string) => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const res = await fetch(
        `/api/paystack/verify?reference=${encodeURIComponent(paymentReference)}&orderId=${encodeURIComponent(orderId)}`
      );
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Payment verification failed');
      }

      toast({
        title: "Payment Successful",
        description: "Your order has been confirmed.",
      });

      router.refresh();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Verification failed. Contact support.";
      setPaymentError(msg);
      toast({ variant: 'destructive', title: "Payment Error", description: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    setPaymentError(null);

    if (!paystackPublicKey) {
      setPaymentError('Paystack public key is missing. Please contact support.');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (initializePayment as any)({
      onSuccess: (response: { reference: string }) => {
        verifyAndMarkPaid(response.reference);
      },
      onClose: () => {
        toast({
          title: "Payment Cancelled",
          description: "You can try again when ready.",
        });
      },
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-medium">Total Payment:</span>
        <span className="font-bold text-lg">{formatCurrency(amount)}</span>
      </div>
      
      {paymentError && (
        <div className="text-red-500 text-sm bg-red-50 p-3 border border-red-100">
          {paymentError}
        </div>
      )}
      
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-[#0BA4DB] hover:bg-[#098abf] text-white py-3 rounded-none transition-all font-medium"
      >
        {isProcessing ? 'Verifying payment...' : 'Pay with Paystack'}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground mt-2">
        Secure payment powered by Paystack
      </p>
    </div>
  );
};

export default PaystackPayment; 