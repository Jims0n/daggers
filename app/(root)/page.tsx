import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.action";
import IconBoxes from "@/components/icon-boxes";
import DealCountdown from "@/components/deal-countdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HeroSlider } from "@/components/shared/hero-slider";

export const metadata = {
  title: 'Daggers - Premium Streetwear Brand',
  description: 'Discover the latest in urban streetwear fashion with Daggers - Nigeria\'s premium clothing brand',
}

const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Banner Slider */}
      <HeroSlider />
      
      {/* Featured Products Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Latest Drops</h2>
          <p className="mt-2 text-gray-600">Check out our newest additions to the collection</p>
        </div>
        <ProductList 
          data={latestProducts} 
          limit={4} 
        />
        <div className="mt-12 flex justify-center">
          <Button 
            asChild 
            variant="outline" 
            className="group border-gray-300 px-6"
          >
            <Link href="/products" className="flex items-center gap-2">
              View All Products
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Deal Section */}
      <DealCountdown />
      
      {/* Trust Badges Section */}
      <IconBoxes />
    </main>
  );
}

export default Homepage;