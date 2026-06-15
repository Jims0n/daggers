import { Product } from "@/types";
import ProductCard from "./product-card";
import { cn } from "@/lib/utils";

const ProductList = ({ 
  data, 
  title, 
  limit,
  className
}: {
  data: Product[]; 
  title?: string; 
  limit?: number;
  className?: string;
}) => {
  const limitedData = limit ? data.slice(0, limit) : data;
  
  return (
    <div className={cn("", className)}>
      {title && (
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-8">
          {title}
        </h2>
      )}
      
      {data.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {limitedData.map((product: Product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center border border-dashed border-border py-12 text-center">
          <p className="text-muted-foreground">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground/60">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;