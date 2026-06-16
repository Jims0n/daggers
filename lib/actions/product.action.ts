'use server';

import { db, products } from '@/db';
import { convertToPlainObject, formatError } from '../utils';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from '../constants';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { insertProductSchema, updateProductSchema } from '../validator';
import { auth } from '@/auth';
import { and, asc, count, desc, eq, gte, ilike, lte } from 'drizzle-orm';

// Get latest products
export async function getLatestProducts() {
  const data = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(LATEST_PRODUCTS_LIMIT);

  return convertToPlainObject(data);
}

// Get single product by its slug
export async function getProductBySlug(slug: string) {
  const data = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return data[0] ?? null;
}

// Get single product by its ID
export async function getProductById(productId: string) {
  const data = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return convertToPlainObject(data[0] ?? null);
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  const conditions = [];

  if (query && query !== 'all') {
    conditions.push(ilike(products.name, `%${query}%`));
  }
  if (category && category !== 'all') {
    conditions.push(eq(products.category, category));
  }
  if (price && price !== 'all') {
    const [min, max] = price.split('-');
    conditions.push(gte(products.price, min));
    conditions.push(lte(products.price, max));
  }
  if (rating && rating !== 'all') {
    conditions.push(gte(products.rating, rating));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy =
    sort === 'lowest'
      ? asc(products.price)
      : sort === 'highest'
        ? desc(products.price)
        : sort === 'rating'
          ? desc(products.rating)
          : desc(products.createdAt);

  const data = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset((page - 1) * limit);

  const [{ value: dataCount }] = await db
    .select({ value: count() })
    .from(products)
    .where(where);

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    const session = await auth();
    if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

    const [exists] = await db.select({ id: products.id }).from(products).where(eq(products.id, id));
    if (!exists) throw new Error('Product not found');

    await db.delete(products).where(eq(products.id, id));

    revalidatePath('/admin/products');

    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const session = await auth();
    if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

    const product = insertProductSchema.parse(data);
    await db.insert(products).values(product);

    revalidatePath('/admin/products');

    return { success: true, message: 'Product created successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const session = await auth();
    if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

    const product = updateProductSchema.parse(data);
    const [exists] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, product.id));
    if (!exists) throw new Error('Product not found');

    await db.update(products).set(product).where(eq(products.id, product.id));

    revalidatePath('/admin/products');

    return { success: true, message: 'Product updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all categories
export async function getAllCategories() {
  const data = await db
    .select({ category: products.category, _count: count() })
    .from(products)
    .groupBy(products.category);

  return data;
}

// Get featured products
export async function getFeaturedProducts() {
  const data = await db
    .select()
    .from(products)
    .where(eq(products.isFeatured, true))
    .orderBy(desc(products.createdAt))
    .limit(4);

  return convertToPlainObject(data);
}

// Get product count (used by admin summary)
export async function getProductsCount() {
  const [{ value }] = await db.select({ value: count() }).from(products);
  return value;
}
