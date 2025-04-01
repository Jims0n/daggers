import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.action";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { ShippingAddress } from "@/types";
import { auth } from "@/auth";
import { Stripe } from "stripe";


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

    let client_secret = null;

    //Check if is not paid and using stripe
    if (order.paymentMethod === 'Stripe' && !order.isPaid) {
        //Init stripe instance
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

        //Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(order.totalPrice) * 100),
            currency: 'ngn',
            metadata: { orderId: order.id },
        });
        client_secret = paymentIntent.client_secret;
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
        stripeClientSecret={client_secret}
        isAdmin={session?.user.role === 'admin' || false}
    />
    );
}
 
export default OrderDetailsPage;