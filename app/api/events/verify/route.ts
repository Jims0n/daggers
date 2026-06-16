import { NextRequest, NextResponse } from 'next/server';
import { markEventTicketPaid } from '@/lib/actions/event.action';
import { sendTicketConfirmation } from '@/email';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Missing reference' },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Verify with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      return NextResponse.json(
        { success: false, message: 'Payment verification failed' },
        { status: 400 }
      );
    }

    const txData = verifyData.data;

    // Mark as paid (amount comes from Paystack's verified record, in kobo)
    const result = await markEventTicketPaid({
      reference,
      amountPaid: txData.amount,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    // Send confirmation email
    if (result.data && 'event' in result.data && result.data.event) {
      try {
        await sendTicketConfirmation({
          buyerName: result.data.buyerName,
          buyerEmail: result.data.buyerEmail,
          eventName: result.data.event.name,
          eventDate: result.data.event.date,
          tierName: result.data.tier!.name,
          amount: Number(result.data.amount),
          ticketCode: result.data.ticketCode,
        });
      } catch (emailErr) {
        console.error('Failed to send ticket confirmation email:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified',
      data: {
        ticketCode: result.data?.ticketCode,
        buyerName: result.data?.buyerName,
      },
    });
  } catch (error) {
    console.error('Event verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
