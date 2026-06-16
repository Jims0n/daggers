'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Drawer } from 'vaul';
import { Music, Camera, UtensilsCrossed, Gamepad2, Heart, Calendar, MapPin, X, Check, Loader2, Ticket } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { reserveEventTicket, releaseEventTicket } from '@/lib/actions/event.action';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Tier = {
  id: string;
  name: string;
  price: string;
  maxQuantity: number | null;
  soldCount: number;
  isActive: boolean;
  sortOrder: number;
};

type Event = {
  id: string;
  name: string;
  slug: string;
  date: Date;
  venue: string;
  description: string | null;
  tagline: string | null;
  isActive: boolean;
  ticketTiers: Tier[];
};

const highlights = [
  { icon: Music, label: 'Music & Live DJs' },
  { icon: Camera, label: 'Photo Moments' },
  { icon: UtensilsCrossed, label: 'Food & Drinks' },
  { icon: Gamepad2, label: 'Games & Vibes' },
  { icon: Heart, label: 'Good People Good Energy' },
];

function TierCard({ tier, onSelect }: { tier: Tier; onSelect?: () => void }) {
  const isSoldOut = tier.maxQuantity !== null && tier.soldCount >= tier.maxQuantity;
  const remaining = tier.maxQuantity !== null ? tier.maxQuantity - tier.soldCount : null;

  if (!tier.isActive) {
    return (
      <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
          {tier.name}
        </div>
        <div className="mt-1.5 text-xl font-bold text-white/20">
          ₦{Number(tier.price).toLocaleString()}
        </div>
        <div className="mt-3 text-[11px] font-medium uppercase tracking-wider text-white/20">
          Coming Soon
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onSelect}
      disabled={isSoldOut}
      className="group relative w-full overflow-hidden rounded-xl border border-[#FF6B00]/40 bg-[#FF6B00]/[0.04] p-5 text-left transition-all hover:border-[#FF6B00]/70 hover:bg-[#FF6B00]/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {remaining !== null && !isSoldOut && (
        <div className="absolute right-3 top-3 rounded-full bg-[#FF6B00]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#FF6B00]">
          {remaining} left
        </div>
      )}
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF6B00]">
        {tier.name}
      </div>
      <div className="mt-1.5 text-2xl font-bold text-white">
        ₦{Number(tier.price).toLocaleString()}
      </div>
      {isSoldOut ? (
        <div className="mt-3 text-[11px] font-bold uppercase tracking-wider text-red-400">
          Sold Out
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#FF6B00]/70 transition-colors group-hover:text-[#FF6B00]">
          <Ticket size={12} />
          Get Ticket
        </div>
      )}
    </button>
  );
}

function PaymentButton({
  reference,
  amount,
  email,
  onSuccess,
  onClose,
}: {
  reference: string;
  amount: number;
  email: string;
  onSuccess: (ref: string) => void;
  onClose: () => void;
}) {
  const config = {
    reference,
    email,
    amount: amount * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    currency: 'NGN',
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <button
      type="button"
      onClick={() =>
        initializePayment({
          onSuccess: () => onSuccess(reference),
          onClose,
        })
      }
      className="w-full rounded-xl bg-[#FF6B00] py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#e55f00] active:scale-[0.98]"
    >
      Pay ₦{amount.toLocaleString()}
    </button>
  );
}

export default function FratNightClient({ event }: { event: Event }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [step, setStep] = useState<'form' | 'paying' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<{
    orderId: string;
    reference: string;
    amount: number;
    ticketCode: string;
  } | null>(null);
  const paymentSucceededRef = useRef(false);

  const activeTier = event.ticketTiers.find((t) => t.isActive);
  const isSoldOut =
    !activeTier ||
    (activeTier.maxQuantity !== null && activeTier.soldCount >= activeTier.maxQuantity);

  const handleGetTicket = () => {
    if (isSoldOut) return;
    setStep('form');
    setError('');
    setOrderData(null);
    paymentSucceededRef.current = false;
    setDrawerOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTier) return;

    setLoading(true);
    setError('');

    const result = await reserveEventTicket({
      tierId: activeTier.id,
      eventId: event.id,
      buyerName: formData.name.trim(),
      buyerEmail: formData.email.trim(),
      buyerPhone: formData.phone.trim(),
    });

    if (!result.success) {
      setError(result.message || 'Something went wrong');
      setLoading(false);
      return;
    }

    setOrderData(result.data!);
    setStep('paying');
    setLoading(false);
  };

  const handlePaymentSuccess = useCallback(
    async (reference: string) => {
      paymentSucceededRef.current = true;
      setStep('paying');
      setLoading(true);

      try {
        const res = await fetch(`/api/events/verify?reference=${encodeURIComponent(reference)}`);
        const data = await res.json();

        if (data.success) {
          setStep('success');
          router.refresh();
        } else {
          setError(data.message || 'Verification failed');
          setStep('form');
        }
      } catch {
        setError('Verification failed. Your payment was received — check your email.');
        setStep('success');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handlePaymentClose = useCallback(() => {
    if (paymentSucceededRef.current) return;
    if (orderData && step !== 'success') {
      releaseEventTicket(orderData.orderId);
      setOrderData(null);
      setStep('form');
    }
  }, [orderData, step]);

  const handleDrawerClose = (open: boolean) => {
    if (!open && step === 'paying') return;
    if (!open && orderData && step !== 'success') {
      releaseEventTicket(orderData.orderId);
      setOrderData(null);
    }
    setDrawerOpen(open);
    if (!open && step === 'success') {
      router.refresh();
    }
  };

  const eventDate = new Date(event.date);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF6B00]/30">
      {/* ── Hero: Full-bleed flyer image ── */}
      <section className="relative min-h-[100svh] flex items-end">
        {/* Flyer background */}
        <div className="absolute inset-0">
          <Image
            src="/images/frat-night.jpeg"
            alt="The Frat Night at Spiffy's House"
            fill
            className="object-cover object-top"
            priority
            unoptimized
          />
          {/* Gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/30 to-transparent" />
        </div>

        {/* Hero content at bottom */}
        <div className="relative z-10 w-full px-5 pb-10 pt-32 sm:px-8 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="mx-auto max-w-2xl"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#FF6B00]">
              July 3rd, 2026
            </p>

            <div className="mt-6">
              <button
                onClick={handleGetTicket}
                disabled={isSoldOut}
                className="group inline-flex items-center gap-3 rounded-full bg-[#FF6B00] pl-8 pr-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:gap-4 hover:shadow-[0_0_40px_rgba(255,107,0,0.3)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
              >
                {isSoldOut ? 'Sold Out' : 'Get Your Ticket'}
                {!isSoldOut && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <Ticket size={14} />
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Event Info ── */}
      <section className="relative px-5 py-20 sm:px-8 md:px-12">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-lg leading-relaxed text-white/60 sm:text-xl">
              {event.description}
            </p>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B00]/80">
              {event.tagline}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-sm text-white/40">
              <span className="inline-flex items-center gap-2">
                <Calendar size={14} className="text-[#FF6B00]/60" />
                {eventDate.toLocaleDateString('en-NG', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} className="text-[#FF6B00]/60" />
                Venue revealed to ticket holders
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="px-5 pb-20 sm:px-8 md:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex flex-col items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-5 text-center"
              >
                <h.icon size={20} className="text-[#FF6B00]/70" strokeWidth={1.5} />
                <span className="text-[11px] font-medium leading-tight text-white/50">
                  {h.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ticket Tiers ── */}
      <section className="px-5 pb-24 sm:px-8 md:px-12">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 text-[11px] font-bold uppercase tracking-[0.3em] text-white/30">
              Tickets
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {event.ticketTiers.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  onSelect={handleGetTicket}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] px-5 py-10 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/20">
          Powered by Spiffy
        </p>
        <p className="mt-2 text-[11px] text-white/10">
          Tickets are non-refundable &middot; Terms &amp; conditions apply
        </p>
      </footer>

      {/* ── Purchase Drawer ── */}
      <Drawer.Root open={drawerOpen} onOpenChange={handleDrawerClose}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-2xl border-t border-white/[0.08] bg-[#111] outline-none">
            <div className="mx-auto mb-2 mt-3 h-1 w-10 rounded-full bg-white/10" />
            <div className="max-h-[85vh] overflow-y-auto px-6 pb-8">
              {step === 'form' && (
                <>
                  <div className="mb-5 flex items-center justify-between pt-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Get Your Ticket
                    </h3>
                    <button
                      onClick={() => handleDrawerClose(false)}
                      className="rounded-full p-1.5 text-white/30 transition-colors hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmitForm} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[#FF6B00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF6B00]/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="john@example.com"
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[#FF6B00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF6B00]/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        minLength={10}
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="08012345678"
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[#FF6B00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF6B00]/30"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B00] py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#e55f00] active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" /> Reserving...
                          </>
                        ) : (
                          <>
                            Continue &middot; ₦{activeTier ? Number(activeTier.price).toLocaleString() : ''}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {step === 'paying' && orderData && (
                <div className="py-2">
                  <h3 className="mb-5 text-center text-sm font-bold uppercase tracking-wider text-white">
                    Complete Payment
                  </h3>

                  {loading ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                      <Loader2 size={28} className="animate-spin text-[#FF6B00]" />
                      <p className="text-xs text-white/40">Verifying payment...</p>
                    </div>
                  ) : (
                    <>
                      {error && (
                        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                          {error}
                        </div>
                      )}
                      <div className="mb-5 space-y-2 rounded-lg bg-white/[0.03] p-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/30">Name</span>
                          <span className="text-white">{formData.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/30">Email</span>
                          <span className="text-white">{formData.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/30">Ticket</span>
                          <span className="font-semibold text-[#FF6B00]">
                            Early Bird &middot; ₦{orderData.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <PaymentButton
                        reference={orderData.reference}
                        amount={orderData.amount}
                        email={formData.email}
                        onSuccess={handlePaymentSuccess}
                        onClose={handlePaymentClose}
                      />
                      <p className="mt-3 text-center text-[10px] text-white/20">
                        Secured by Paystack &middot; Non-refundable
                      </p>
                    </>
                  )}
                </div>
              )}

              {step === 'success' && orderData && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="py-6 text-center"
                >
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                    <Check size={28} className="text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">You&apos;re in!</h3>
                  <p className="mt-1 text-sm text-white/40">
                    Your ticket for The Frat Night is confirmed.
                  </p>

                  <div className="mx-auto mt-6 rounded-xl border border-[#FF6B00]/20 bg-[#FF6B00]/[0.04] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
                      Ticket Code
                    </p>
                    <p
                      className="mt-2 font-mono text-xl font-bold text-[#FF6B00]"
                      style={{ letterSpacing: '0.12em' }}
                    >
                      {orderData.ticketCode}
                    </p>
                    <p className="mt-1.5 text-[11px] text-white/25">
                      Present this at the door
                    </p>
                  </div>

                  <div className="mt-5 space-y-1.5 text-left text-[12px] text-white/40">
                    <p>📧 Confirmation sent to <strong className="text-white/60">{formData.email}</strong></p>
                    <p>📍 Venue will be shared before the event</p>
                  </div>

                  <button
                    onClick={() => handleDrawerClose(false)}
                    className="mt-6 w-full rounded-xl bg-white/[0.06] py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
