'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { usePaystackPayment } from 'react-paystack';
import { updateOrderToPaid } from '@/lib/actions/order.action';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type PaystackConfig = {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
};

const PaystackPayment = ({
  amount,
  orderId,
  email,
}: {
  amount: number;
  orderId: string;
  email: string;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Convert amount to kobo (smallest currency unit in Nigeria)
  const amountInKobo = Math.round(amount * 100);

  // Generate a unique reference for this transaction
  const reference = `order_${orderId}_${Date.now()}`;

  // Configure Paystack
  const config: PaystackConfig = {
    reference,
    email,
    amount: amountInKobo,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };

  // The react-paystack package doesn't have perfect TypeScript definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initializePayment = usePaystackPayment(config) as any;

  // Define callback functions
  const onSuccess = async () => {
    setIsProcessing(true);
    
    try {
      await updateOrderToPaid({
        orderId,
        paymentResult: {
          id: reference,
          status: 'COMPLETED',
          email_address: email,
          pricePaid: amount.toFixed(2),
        },
      });
      
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
      
      // Reload the page to show updated payment status
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "There was an error processing your payment. Please contact support.";
      toast({
        variant: 'destructive',
        title: "Payment Error",
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onClose = () => {
    toast({
      title: "Payment Cancelled",
      description: "You've cancelled the payment. You can try again when ready.",
    });
  };

  const handlePayment = () => {
    initializePayment(onSuccess, onClose);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-medium">Total Payment:</span>
        <span className="font-bold text-lg">{formatCurrency(amount)}</span>
      </div>
      
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-[#0BA4DB] hover:bg-[#098abf] text-white py-3 rounded-none transition-all font-medium"
      >
        {isProcessing ? 'Processing...' : 'Pay with Paystack'}
      </Button>
      
      <p className="text-xs text-center text-gray-500 mt-2">
        Secure payment powered by Paystack
      </p>
    </div>
  );
};

export default PaystackPayment; 