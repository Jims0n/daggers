import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import ProductPrice from "./product-price";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Link 
      href={`/product/${product.slug}`}
      className="group block"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Out of Stock */}
        {product.stock <= 0 && (
          <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
            Sold Out
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="mt-3 space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {product.category}
        </p>
        <h3 className="text-sm font-medium leading-tight group-hover:underline underline-offset-4">
          {product.name}
        </h3>
        <ProductPrice
          value={Number(product.price)}
          className="text-sm font-bold"
        />
      </div>
    </Link>
  );
};

export default ProductCard;