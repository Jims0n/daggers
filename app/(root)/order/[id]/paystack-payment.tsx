'use client';

import { useState, useEffect } from 'react';
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
  callback_url?: string;
};

interface PaymentResult {
  success: boolean;
  message: string;
  order?: Record<string, unknown>;
}

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

  // Determine the hostname - works in browser only
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    // Fallback for SSR context
    return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
  };

  // Validate required parameters
  useEffect(() => {
    if (!paystackPublicKey) {
      setPaymentError('Paystack public key is missing. Please contact support.');
    } else if (!email) {
      setPaymentError('Email address is required for payment.');
    } else if (amount <= 0) {
      setPaymentError('Invalid payment amount.');
    } else {
      setPaymentError(null);
    }
  }, [paystackPublicKey, email, amount]);

  // Convert amount to kobo (smallest currency unit in Nigeria)
  const amountInKobo = Math.round(amount * 100);

  // Generate a unique reference for this transaction
  const reference = `order_${orderId}_${Date.now()}`;

  // Configure Paystack with redirect URL
  const config: PaystackConfig = {
    reference,
    email,
    amount: amountInKobo,
    publicKey: paystackPublicKey,
    callback_url: `${getBaseUrl()}/order/${orderId}/paystack-payment-success?reference=${reference}`
  };

  // The type definitions from react-paystack are not complete
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initializePayment = usePaystackPayment(config) as any;

  // Define callback functions
  const onSuccess = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // We need to cast the result as the return type has been updated
      const result = await updateOrderToPaid({
        orderId,
        paymentResult: {
          id: reference,
          status: 'COMPLETED',
          email_address: email,
          pricePaid: amount.toFixed(2),
        },
      }) as PaymentResult;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update order payment status');
      }
      
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
      
      // Reload the page to show updated payment status
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "There was an error processing your payment. Please contact support.";
      setPaymentError(errorMessage);
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
    // Clear any previous errors
    setPaymentError(null);
    
    // Validate required parameters again before initializing payment
    if (!paystackPublicKey) {
      setPaymentError('Paystack public key is missing. Please contact support.');
      return;
    }
    
    if (!email) {
      setPaymentError('Email address is required for payment.');
      return;
    }
    
    if (amount <= 0) {
      setPaymentError('Invalid payment amount.');
      return;
    }
    
    initializePayment(onSuccess, onClose);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-medium">Total Payment:</span>
        <span className="font-bold text-lg">{formatCurrency(amount)}</span>
      </div>
      
      {paymentError && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-100">
          {paymentError}
        </div>
      )}
      
      <Button
        onClick={handlePayment}
        disabled={isProcessing || !!paymentError}
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