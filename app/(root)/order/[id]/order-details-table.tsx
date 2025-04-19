'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Order } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { upadteOrderToPaidCOD, deliverOrder } from "@/lib/actions/order.action";
import { useToast } from "@/hooks/use-toast";
import { useTransition, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import StripePayment from "./stipe-payment";
import PaystackPayment from "./paystack-payment";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

// Success Banner Component
const PaymentSuccessBanner = () => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-center">
      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
      <div>
        <h3 className="text-green-800 font-medium">Payment Successful!</h3>
        <p className="text-green-700 text-sm">Your payment has been processed successfully. Thank you for your order.</p>
      </div>
    </div>
  );
};

const OrderDetailsTable = ({ order, isAdmin, stripeClientSecret, paystackPublicKey }: { order: Order;  isAdmin: boolean; stripeClientSecret: string | null; paystackPublicKey: string; }) => {
    const {
        id,
        shippingAddress,
        orderitems,
        itemsPrice,
        shippingPrice,
        totalPrice,
        paymentMethod,
        isDelivered,
        isPaid,
        paidAt,
        deliveredAt,
        user
      } = order;

      const searchParams = useSearchParams();
      const [showSuccessBanner, setShowSuccessBanner] = useState(false);

      // Check URL parameters for success messages
      useEffect(() => {
        const success = searchParams.get('success');
        if (success === 'true') {
          setShowSuccessBanner(true);
          // Hide banner after 5 seconds
          const timer = setTimeout(() => {
            setShowSuccessBanner(false);
          }, 5000);
          return () => clearTimeout(timer);
        }
      }, [searchParams]);

      // Button to mark order as paid
      const MarkAsPaidButton = () => {
        const [isPending, startTransition] = useTransition();
        const { toast } = useToast();

        return (
            <Button
            type="button"
            className="w-full bg-black hover:bg-zinc-800 text-white py-3 rounded-none transition-all font-medium"
            disabled={isPending}
            onClick={() => startTransition(async () => {
                const res = await upadteOrderToPaidCOD(order.id);
                toast({
                    variant: res.success ? 'default' : 'destructive',
                    description: res.message,
                });
            })}
            >
                {isPending ? 'Processing...' : 'Mark As Paid'}
            </Button>
        )
      }

       // Button to mark order as delivered
       const MarkAsDeliveredButton = () => {
        const [isPending, startTransition] = useTransition();
        const { toast } = useToast();

        return (
            <Button
            type="button"
            className="w-full bg-black hover:bg-zinc-800 text-white py-3 rounded-none transition-all font-medium"
            disabled={isPending}
            onClick={() => startTransition(async () => {
                const res = await deliverOrder(order.id);
                toast({
                    variant: res.success ? 'default' : 'destructive',
                    description: res.message,
                });
            })}
            >
                {isPending ? 'Processing...' : 'Mark As Delivered'}
            </Button>
        )
      }

    return <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {showSuccessBanner && <PaymentSuccessBanner />}
      
      <h1 className="text-3xl font-bold tracking-tight mb-8 border-b pb-4">Order {formatId(id)}</h1>
      
      <div className="grid md:grid-cols-3 md:gap-8">
          <div className="col-span-2 space-y-6 mb-8 md:mb-0">
              <Card className="overflow-hidden border-0 shadow-md">
                  <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4 uppercase tracking-wide">Payment Method</h2>
                      <p className="text-lg mb-4">{paymentMethod}</p>
                      {isPaid ? (
                          <Badge className="py-1.5 px-4 rounded-md font-medium bg-green-50 text-green-800 border-green-200">
                              Paid on {formatDateTime(paidAt!).dateTime}
                          </Badge>
                      ) : (
                          <Badge className="py-1.5 px-4 rounded-md font-medium bg-red-50 text-red-800 border-red-200">
                              Awaiting Payment
                          </Badge>
                      )}
                  </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-md">
                  <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4 uppercase tracking-wide">Shipping Details</h2>
                      <p className="font-medium text-lg">{shippingAddress.fullName}</p>
                      <p className="mb-1 text-gray-600">
                          {shippingAddress.phoneNumber && (
                            <>Phone: {shippingAddress.phoneNumber}</>
                          )}
                      </p>
                      <p className="mb-4 text-gray-600">
                          {shippingAddress.streetAddress}, {shippingAddress.city},<br/>
                          {shippingAddress.postalCode}, {shippingAddress.country}
                      </p>
                      {isDelivered ? (
                          <Badge className="py-1.5 px-4 rounded-md font-medium bg-green-50 text-green-800 border-green-200">
                              Delivered on {formatDateTime(deliveredAt!).dateTime}
                          </Badge>
                      ) : (
                          <Badge className="py-1.5 px-4 rounded-md font-medium bg-amber-50 text-amber-800 border-amber-200">
                              Preparing Shipment
                          </Badge>
                      )}
                  </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-md">
                  <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4 uppercase tracking-wide">Items Ordered</h2>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-gray-50">
                              <TableRow>
                                  <TableHead className="py-4">Product</TableHead>
                                  <TableHead className="text-right py-4">Quantity</TableHead>
                                  <TableHead className="text-right py-4">Price</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orderitems.map((item) => (
                              <TableRow key={item.slug} className="hover:bg-gray-50 transition-colors">
                                  <TableCell className="py-4">
                                      <Link href={`/product/${item.slug}`} className="flex items-center group">
                                        <div className="relative w-16 h-16 overflow-hidden rounded border border-gray-200 mr-4">
                                          <Image 
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                            sizes="64px"
                                          />
                                        </div>
                                        <span className="font-medium group-hover:text-black/70 transition-colors">{item.name}</span>
                                      </Link>
                                  </TableCell>
                                  <TableCell className="text-right py-4">
                                      <span className="px-2 py-1 bg-gray-100 rounded font-medium">{item.qty}</span>
                                  </TableCell>
                                  <TableCell className="text-right py-4 font-medium">
                                      {formatCurrency(item.price)}
                                  </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                  </CardContent>
              </Card>
          </div>
          <div>
              <Card className="sticky top-8 border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 bg-black text-white">
                    <h2 className="text-xl font-semibold mb-2 uppercase tracking-wide">Order Summary</h2>
                    <p className="text-gray-300 text-sm">Review your order details</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between text-gray-600">
                        <div>Items Subtotal</div>
                        <div>{formatCurrency(itemsPrice)}</div>
                    </div>
                    
                    <div className="flex justify-between text-gray-600">
                        <div>Shipping Fee</div>
                        <div>{formatCurrency(shippingPrice)}</div>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                        <div>Total</div>
                        <div>{formatCurrency(totalPrice)}</div>
                    </div>

                    {/* Stripe Payment */}
                    {
                      !isPaid && paymentMethod === 'Stripe' && stripeClientSecret && (
                        <div className="mt-6">
                          <StripePayment 
                          priceInCents={Number(order.totalPrice) * 100}
                          orderId={order.id}
                          clientSecret={stripeClientSecret}
                          />
                        </div>
                      )
                    }

                    {/* Paystack Payment */}
                    {
                      !isPaid && paymentMethod === 'Paystack' && (
                        <div className="mt-6">
                          <PaystackPayment 
                            amount={Number(order.totalPrice)}
                            orderId={order.id}
                            email={user.email}
                            paystackPublicKey={paystackPublicKey}
                          />
                        </div>
                      )
                    }

                    {/* Cash on Delivery */}
                    {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                        <div className="mt-6">
                          <MarkAsPaidButton />
                        </div>
                    )}
                    {isAdmin && isPaid && !isDelivered && (
                        <div className="mt-6">
                          <MarkAsDeliveredButton />
                        </div>
                    )}
                  </div>
                </CardContent> 
              </Card>
          </div>
      </div>
    </div>
    </>;
}
 
export default OrderDetailsTable;