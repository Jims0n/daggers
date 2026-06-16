import { Resend } from 'resend';
import { SENDER_EMAIL, APP_NAME } from '@/lib/constants';
import { Order } from '@/types';
import PurchaseReceiptEmail from './purchase-receipt';
import TicketConfirmationEmail from './ticket-confirmation';

const getResend = () => new Resend(process.env.RESEND_API_KEY as string);

export const sendPurchaseReceipt = async ({order }: {order: Order}) => {
    const resend = getResend();
    await resend.emails.send({
        from: `${APP_NAME} <${SENDER_EMAIL}>`,
        to: order.user.email,
        subject: `Order Confirmation ${order.id}`,
        react: <PurchaseReceiptEmail order={order} />,
    });
};

export const sendTicketConfirmation = async ({
    buyerName,
    buyerEmail,
    eventName,
    eventDate,
    tierName,
    amount,
    ticketCode,
}: {
    buyerName: string;
    buyerEmail: string;
    eventName: string;
    eventDate: Date;
    tierName: string;
    amount: number;
    ticketCode: string;
}) => {
    const resend = getResend();
    await resend.emails.send({
        from: `Spiffy Events <${SENDER_EMAIL}>`,
        to: buyerEmail,
        subject: `🎟️ Your Ticket for ${eventName}`,
        react: (
            <TicketConfirmationEmail
                buyerName={buyerName}
                eventName={eventName}
                eventDate={eventDate}
                tierName={tierName}
                amount={amount}
                ticketCode={ticketCode}
            />
        ),
    });
};
