'use client';

import { useState, ReactNode } from 'react';
import ProductImages from '@/components/shared/product/product-images';
import ProductActions from '@/components/shared/product/product-actions';
import { Cart, CartItem } from '@/types';

const ProductGalleryWithColors = ({
  images,
  cart,
  item,
  colors,
  children,
  footer,
}: {
  images: string[];
  cart?: Cart;
  item: Omit<CartItem, 'color'>;
  colors?: string[] | null;
  children?: ReactNode;
  footer?: ReactNode;
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | undefined>(undefined);

  return (
    <>
      <div>
        <ProductImages images={images} selectedIndex={selectedImageIndex} />
      </div>

      <div className="mt-10 lg:mt-0 lg:pl-8">
        {children}

        <div className="mb-8">
          <ProductActions
            cart={cart}
            item={item}
            colors={colors}
            images={images}
            onColorChange={setSelectedImageIndex}
          />
        </div>

        {footer}
      </div>
    </>
  );
};

export default ProductGalleryWithColors;
