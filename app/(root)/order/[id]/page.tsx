import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.action";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { ShippingAddress } from "@/types";
import { auth } from "@/auth";


export const metadata: Metadata = {
    title: 'Order Details | Daggers',
    description: 'Review your order details and track your Daggers purchase.'
}

const OrderDetailsPage = async (props: {
    params: Promise<{
        id: string;
    }>;
}) => {
    const { id } = await props.params;

    const order = await getOrderById(id);
    if (!order) notFound();

    const session = await auth();

    // Make sure we have the Paystack public key available
    const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackPublicKey && order.paymentMethod === 'Paystack' && !order.isPaid) {
        console.error('Missing Paystack public key in environment variables');
    }

    return (
        <OrderDetailsTable
        order={{
            ...order,
            shippingAddress: order.shippingAddress as ShippingAddress,
            isPaid: Boolean(order.isPaid),
            isDelivered: Boolean(order.isDelivered),
            user: {
                ...order.user,
                name: order.user.name || ''
            },
            paymentResult: typeof order.paymentResult === 'object' && order.paymentResult !== null
              ? order.paymentResult as {
                  id: string;
                  status: string;
                  email_address: string;
                  pricePaid: string;
                }
              : {
                  id: '',
                  status: '',
                  email_address: '',
                  pricePaid: ''
                }
        }}
        paystackPublicKey={paystackPublicKey || ''}
        isAdmin={session?.user.role === 'admin' || false}
    />
    );
}
 
export default OrderDetailsPage;