import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

/**
 * Self-contained event promo banner for the homepage.
 * Remove this component and its import from page.tsx when the event is over.
 */
export default function EventBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <Link href="/events/frat-night" className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] h-[280px] sm:h-[220px]">
          {/* Flyer background */}
          <Image
            src="/images/frat-night.jpeg"
            alt="The Frat Night"
            fill
            className="object-cover object-top opacity-40 transition-opacity duration-500 group-hover:opacity-50"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FF6B00]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF6B00] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FF6B00]" />
              </span>
              Tickets Live
            </div>

            <h2 className="mt-3 text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
              The Frat <span className="text-[#FF6B00]">Night</span>
            </h2>

            <p className="mt-1.5 text-xs text-white/40 max-w-xs">
              One last party. One last night. Same community.
            </p>

            <div className="mt-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all group-hover:gap-3 group-hover:shadow-[0_0_24px_rgba(255,107,0,0.25)]">
                Get Tickets
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>

          {/* Date badge */}
          <div className="absolute right-5 top-5 rounded-lg bg-[#FF6B00] px-3 py-2 text-center leading-none">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">Jul</div>
            <div className="text-xl font-black text-white">3</div>
          </div>
        </div>
      </Link>
    </section>
  );
}
