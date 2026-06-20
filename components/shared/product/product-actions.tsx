'use client';

import { useState } from 'react';
import { Cart, CartItem } from '@/types';
import AddToCart from './add-to-cart';

const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  brown: '#8B4513',
  green: '#2E5A2E',
  red: '#C41E3A',
  beige: '#F5F5DC',
  white: '#FFFFFF',
  navy: '#1B2A4A',
  grey: '#808080',
  gray: '#808080',
  pink: '#FFC0CB',
  blue: '#2563EB',
};

const ProductActions = ({
  cart,
  item,
  colors,
  images,
  onColorChange,
}: {
  cart?: Cart;
  item: Omit<CartItem, 'color'>;
  colors?: string[] | null;
  images?: string[];
  onColorChange?: (index: number) => void;
}) => {
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

  const hasColors = colors && colors.length > 0;

  const handleColorSelect = (color: string, index: number) => {
    setSelectedColor(color);
    onColorChange?.(index);
  };

  const selectedIndex = hasColors && selectedColor ? colors.indexOf(selectedColor) : 0;
  const cartImage = images && hasColors && selectedColor ? (images[selectedIndex] || item.image) : item.image;

  const cartItem: CartItem = {
    ...item,
    image: cartImage,
    color: selectedColor,
  };

  return (
    <div className="space-y-4">
      {hasColors && (
        <div>
          <p className="text-sm font-medium mb-2">
            Color: {selectedColor ? <span className="capitalize">{selectedColor}</span> : <span className="text-gray-400">Select a color</span>}
          </p>
          <div className="flex gap-3">
            {colors.map((color, index) => {
              const hex = COLOR_MAP[color.toLowerCase()] || color;
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color, index)}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-black border-black scale-110'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: hex }}
                  title={color}
                />
              );
            })}
          </div>
        </div>
      )}

      {hasColors && !selectedColor ? (
        <button
          disabled
          className="w-full h-10 bg-gray-200 text-gray-500 rounded cursor-not-allowed text-sm"
        >
          Select a color to add to cart
        </button>
      ) : (
        <AddToCart cart={cart} item={cartItem} />
      )}
    </div>
  );
};

export default ProductActions;
