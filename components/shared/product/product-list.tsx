import { Product } from "@/types";
import ProductCard from "./product-card";
import { cn } from "@/lib/utils";
import { Grid, List, SlidersHorizontal } from "lucide-react";

const ProductList = ({ 
  data, 
  title, 
  limit,
  showFilters = false,
  className
}: {
  data: Product[]; 
  title?: string; 
  limit?: number;
  showFilters?: boolean;
  className?: string;
}) => {
  // Apply limit if provided, otherwise show all products
  const limitedData = limit ? data.slice(0, limit) : data;
  
  return (
    <div className={cn("my-12", className)}>
      {/* Section Header with Title and Filters */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        {title && (
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        )}
        
        {showFilters && (
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:flex">
              <select 
                className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-8 text-sm focus:border-black focus:outline-none"
                defaultValue="featured"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <SlidersHorizontal size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex items-center rounded-lg border border-gray-200">
              <button 
                className="flex h-9 w-9 items-center justify-center border-r border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-black"
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button 
                className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-black"
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Products Grid */}
      {data.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {limitedData.map((product: Product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <p className="text-gray-500">No products found</p>
          <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filter to find what you&apos;re looking for.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;