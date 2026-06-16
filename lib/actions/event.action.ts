'use server';

import { db, events, eventTicketTiers, eventTicketOrders } from '@/db';
import { eq, sql, and, or, isNull, inArray, asc, desc } from 'drizzle-orm';
import { formatError } from '../utils';

// How long an unpaid reservation holds a seat before it's reclaimed. Paystack
// inline checkout normally completes in 1–3 min, so 15 is comfortably generous.
const RESERVATION_TTL_MINUTES = 15;

function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FRAT-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Reclaim inventory from pending reservations that were never paid (closed tab,
// lost connection, etc.) so abandoned holds don't lock seats forever. Runs
// lazily on read + reserve — no cron required. Self-healing: even a tier that
// looks "sold out" frees up the moment the next visitor loads the page.
async function releaseExpiredReservations() {
  try {
    await db.transaction(async (tx) => {
      const expired = await tx
        .update(eventTicketOrders)
        .set({ paymentStatus: 'expired' })
        .where(
          and(
            eq(eventTicketOrders.paymentStatus, 'pending'),
            sql`${eventTicketOrders.createdAt} < now() - interval '${sql.raw(
              String(RESERVATION_TTL_MINUTES)
            )} minutes'`
          )
        )
        .returning({ tierId: eventTicketOrders.tierId });

      if (expired.length === 0) return;

      // Decrement each tier's counter by how many of its holds we reclaimed.
      const perTier = new Map<string, number>();
      for (const row of expired) {
        perTier.set(row.tierId, (perTier.get(row.tierId) ?? 0) + 1);
      }
      for (const [tierId, releasedCount] of perTier) {
        await tx
          .update(eventTicketTiers)
          .set({
            soldCount: sql`GREATEST(${eventTicketTiers.soldCount} - ${releasedCount}, 0)`,
          })
          .where(eq(eventTicketTiers.id, tierId));
      }
    });
  } catch (error) {
    // Never let reconciliation break the page load / reservation it precedes.
    console.error('Failed to release expired reservations:', error);
  }
}

export async function getEventBySlug(slug: string) {
  // Reconcile stale holds first so the tier counters the UI renders are current.
  await releaseExpiredReservations();

  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
    with: {
      ticketTiers: {
        orderBy: [asc(eventTicketTiers.sortOrder)],
      },
    },
  });
  return event ?? null;
}

// Reserve a ticket (create pending order + atomic increment soldCount)
export async function reserveEventTicket({
  tierId,
  eventId,
  buyerName,
  buyerEmail,
  buyerPhone,
}: {
  tierId: string;
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}) {
  try {
    // Free up any seats held by abandoned reservations before checking capacity.
    await releaseExpiredReservations();

    const result = await db.transaction(async (tx) => {
      // Atomically increment soldCount only if under maxQuantity
      const updated = await tx
        .update(eventTicketTiers)
        .set({ soldCount: sql`${eventTicketTiers.soldCount} + 1` })
        .where(
          and(
            eq(eventTicketTiers.id, tierId),
            eq(eventTicketTiers.isActive, true),
            // NOTE: must use or()/isNull() so the unlimited-tier branch is
            // parenthesized. A raw `... OR maxQuantity IS NULL` string would
            // bind looser than the surrounding AND and match every NULL-cap
            // row in the table.
            or(
              sql`${eventTicketTiers.soldCount} < ${eventTicketTiers.maxQuantity}`,
              isNull(eventTicketTiers.maxQuantity)
            )
          )
        )
        .returning({ id: eventTicketTiers.id, price: eventTicketTiers.price });

      if (updated.length === 0) {
        throw new Error('Tickets are sold out or tier is unavailable');
      }

      const tier = updated[0];
      const ticketCode = generateTicketCode();
      const reference = `evt_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}_${Date.now()}`;

      const [order] = await tx
        .insert(eventTicketOrders)
        .values({
          eventId,
          tierId,
          buyerName,
          buyerEmail,
          buyerPhone,
          amount: tier.price,
          paystackReference: reference,
          ticketCode,
          paymentStatus: 'pending',
        })
        .returning();

      return order;
    });

    return {
      success: true,
      data: {
        orderId: result.id,
        reference: result.paystackReference,
        amount: Number(result.amount),
        ticketCode: result.ticketCode,
      },
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Release a reservation (if user cancels before payment)
export async function releaseEventTicket(orderId: string) {
  try {
    const [order] = await db
      .select()
      .from(eventTicketOrders)
      .where(
        and(
          eq(eventTicketOrders.id, orderId),
          eq(eventTicketOrders.paymentStatus, 'pending')
        )
      );

    if (!order) return;

    await db.transaction(async (tx) => {
      await tx
        .update(eventTicketTiers)
        .set({ soldCount: sql`GREATEST(${eventTicketTiers.soldCount} - 1, 0)` })
        .where(eq(eventTicketTiers.id, order.tierId));

      await tx
        .update(eventTicketOrders)
        .set({ paymentStatus: 'cancelled' })
        .where(eq(eventTicketOrders.id, orderId));
    });
  } catch (error) {
    console.error('Failed to release ticket reservation:', error);
  }
}

// Mark event ticket as paid (called from verify route + webhook)
export async function markEventTicketPaid({
  reference,
  amountPaid,
}: {
  reference: string;
  // Amount actually charged by Paystack, in kobo.
  amountPaid: number;
}) {
  const [order] = await db
    .select()
    .from(eventTicketOrders)
    .where(eq(eventTicketOrders.paystackReference, reference));

  if (!order) return { success: false, message: 'Order not found' };
  if (order.paymentStatus === 'paid') {
    return { success: true, message: 'Already paid', data: order };
  }

  // Guard against client-side tampering: the charged amount must match the
  // amount we recorded on the order at reservation time.
  const expectedKobo = Math.round(Number(order.amount) * 100);
  if (amountPaid !== expectedKobo) {
    return { success: false, message: 'Payment amount mismatch' };
  }

  // The hold may have been swept to 'expired' if payment landed slowly; a paid
  // buyer still keeps their ticket, so we accept that state too and re-claim the
  // seat below.
  const wasExpired = order.paymentStatus === 'expired';

  // Atomically transition pending/expired -> paid. The verify route and the
  // webhook can both fire for the same reference; only the one that flips the
  // row wins and proceeds to send the confirmation email.
  const transitioned = await db
    .update(eventTicketOrders)
    .set({ paymentStatus: 'paid' })
    .where(
      and(
        eq(eventTicketOrders.id, order.id),
        inArray(eventTicketOrders.paymentStatus, ['pending', 'expired'])
      )
    )
    .returning({ id: eventTicketOrders.id });

  if (transitioned.length === 0) {
    // A concurrent caller already marked it paid; return the bare order so the
    // caller's `'event' in data` email guard is false and we don't double-send.
    return { success: true, message: 'Already paid', data: order };
  }

  // Re-claim the seat that the expiry sweep had released. This can momentarily
  // push soldCount past maxQuantity in a rare race, which is the correct
  // tradeoff: never reject a buyer who has already paid.
  if (wasExpired) {
    await db
      .update(eventTicketTiers)
      .set({ soldCount: sql`${eventTicketTiers.soldCount} + 1` })
      .where(eq(eventTicketTiers.id, order.tierId));
  }

  const updated = await db.query.eventTicketOrders.findFirst({
    where: eq(eventTicketOrders.id, order.id),
    with: {
      event: true,
      tier: true,
    },
  });

  return { success: true, data: updated };
}

// Admin: get event stats + orders
export async function getEventAdminData(slug: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
    with: {
      ticketTiers: {
        orderBy: [asc(eventTicketTiers.sortOrder)],
      },
      ticketOrders: {
        orderBy: [desc(eventTicketOrders.createdAt)],
        with: {
          tier: true,
        },
      },
    },
  });

  if (!event) return null;

  const paidOrders = event.ticketOrders.filter((o) => o.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.amount), 0);

  return {
    event,
    stats: {
      totalTicketsSold: paidOrders.length,
      totalRevenue,
      tierBreakdown: event.ticketTiers.map((tier) => ({
        name: tier.name,
        sold: paidOrders.filter((o) => o.tierId === tier.id).length,
        max: tier.maxQuantity,
        revenue: paidOrders
          .filter((o) => o.tierId === tier.id)
          .reduce((sum, o) => sum + Number(o.amount), 0),
      })),
    },
    orders: paidOrders,
  };
}
