import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.action";
import IconBoxes from "@/components/icon-boxes";
import DealCountdown from "@/components/deal-countdown";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HeroSlider } from "@/components/shared/hero-slider";
import { getDealSettings } from "@/lib/actions/setting.action";

export const metadata = {
  title: 'Daggers - Premium Streetwear Brand',
  description: 'Discover the latest in urban streetwear fashion with Daggers - Nigeria\'s premium clothing brand',
}

const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  const dealSettings = await getDealSettings();
  
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Banner Slider */}
      <HeroSlider />
      
      {/* Featured Products Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ProductList 
          data={latestProducts} 
          title="Latest Drops"
          limit={4} 
        />
        <div className="mt-12 flex justify-center">
          <Link 
            href="/search" 
            className="group inline-flex items-center gap-2 border border-foreground px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
          >
            View All Products
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
      
      {/* Deal Section */}
      {dealSettings && (
        <DealCountdown
          dealTitle={dealSettings.dealTitle}
          dealDescription={dealSettings.dealDescription}
          dealEndDate={dealSettings.dealEndDate}
          dealEnabled={dealSettings.dealEnabled}
        />
      )}
      
      {/* Trust Badges Section */}
      <IconBoxes />
    </main>
  );
}

export default Homepage;