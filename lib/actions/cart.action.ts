'use server';

import { CartItem } from '@/types';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { convertToPlainObject, formatError, round2 } from '../utils';
import { db, carts, products } from '@/db';
import { cartItemSchema, insertCartSchema } from '../validator';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0));
  const shippingPrice = round2(itemsPrice > 200000 ? 0 : 6000);
  const totalPrice = round2(itemsPrice + shippingPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Cart session not found');

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    const cart = await getMyCart();

    const item = cartItemSchema.parse(data);

    const [product] = await db.select().from(products).where(eq(products.id, item.productId));
    if (!product) throw new Error('Product not found');

    if (!cart) {
      const newCart = insertCartSchema.parse({
        userId,
        items: [item],
        sessionCartId,
        ...calcPrice([item]),
      });

      await db.insert(carts).values({
        ...newCart,
        items: newCart.items as unknown[],
      });

      revalidatePath(`/product/${product.slug}`);

      return { success: true, message: `${product.name} added to cart` };
    } else {
      const existItem = (cart.items as CartItem[]).find((x) => x.productId === item.productId);

      if (existItem) {
        if (product.stock < existItem.qty + 1) throw new Error('Not enough stock');
        (cart.items as CartItem[]).find((x) => x.productId === item.productId)!.qty =
          existItem.qty + 1;
      } else {
        if (product.stock < 1) throw new Error('Not enough stock');
        (cart.items as CartItem[]).push(item);
      }

      await db
        .update(carts)
        .set({
          items: cart.items as unknown[],
          ...calcPrice(cart.items as CartItem[]),
        })
        .where(eq(carts.id, cart.id));

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${existItem ? 'updated in' : 'added to'} cart`,
      };
    }
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if (!sessionCartId) throw new Error('Cart session not found');

  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  const [cart] = await db
    .select()
    .from(carts)
    .where(
      userId ? eq(carts.userId, userId) : eq(carts.sessionCartId, sessionCartId)
    );

  if (!cart) return undefined;

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Cart session not found');

    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) throw new Error('Product not found');

    const cart = await getMyCart();
    if (!cart) throw new Error('Cart not found');

    const exist = (cart.items as CartItem[]).find((x) => x.productId === productId);
    if (!exist) throw new Error('Item not found');

    if (exist.qty === 1) {
      cart.items = (cart.items as CartItem[]).filter((x) => x.productId !== exist.productId);
    } else {
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty = exist.qty - 1;
    }

    await db
      .update(carts)
      .set({
        items: cart.items as unknown[],
        ...calcPrice(cart.items as CartItem[]),
      })
      .where(eq(carts.id, cart.id));

    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: `${product.name} was removed from cart` };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
