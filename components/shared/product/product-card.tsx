import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import ProductPrice from "./product-price";
import Rating from "./rating";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg transition-all duration-300 hover:shadow-md">
      {/* Product Image with Overlay on Hover */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            priority={true}
          />
          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black shadow-md transition-transform hover:bg-black hover:text-white">
              View Details
            </span>
          </div>
        </Link>
        
        {/* Wishlist Button */}
        <button 
          className={cn(
            "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-gray-900 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100",
            "hover:bg-black hover:text-white"
          )}
          aria-label="Add to wishlist"
        >
          <Heart size={16} />
        </button>
        
        {/* Out of Stock Badge */}
        {product.stock <= 0 && (
          <div className="absolute left-0 top-4 bg-black px-3 py-1 text-xs font-medium text-white">
            OUT OF STOCK
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-xs text-gray-500">{product.category}</div>
        <Link href={`/product/${product.slug}`} className="group-hover:text-black/70">
          <h3 className="mb-2 font-medium leading-tight tracking-tight transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto flex items-center justify-between">
          <ProductPrice
            value={Number(product.price)}
            className="text-base font-semibold"
          />
          <Rating value={Number(product.rating)} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;