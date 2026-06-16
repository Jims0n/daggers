'use server';

import { auth } from '@/auth';
import { formatError } from '../utils';
import { insertReviewSchema } from '../validator';
import { z } from 'zod';
import { db, reviews, products } from '@/db';
import { revalidatePath } from 'next/cache';
import { and, avg, count, desc, eq } from 'drizzle-orm';

// Create & Update Review
export async function createUpdateReview(data: z.infer<typeof insertReviewSchema>) {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user?.id,
    });

    const [product] = await db.select().from(products).where(eq(products.id, review.productId));
    if (!product) throw new Error('Product not found');

    const [reviewExists] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, review.productId), eq(reviews.userId, review.userId)));

    await db.transaction(async (tx) => {
      if (reviewExists) {
        await tx
          .update(reviews)
          .set({
            title: review.title,
            description: review.description,
            rating: review.rating,
          })
          .where(eq(reviews.id, reviewExists.id));
      } else {
        await tx.insert(reviews).values(review);
      }

      const [{ avgRating }] = await tx
        .select({ avgRating: avg(reviews.rating) })
        .from(reviews)
        .where(eq(reviews.productId, review.productId));

      const [{ numReviews }] = await tx
        .select({ numReviews: count() })
        .from(reviews)
        .where(eq(reviews.productId, review.productId));

      await tx
        .update(products)
        .set({ rating: avgRating ?? '0', numReviews })
        .where(eq(products.id, review.productId));
    });

    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: 'Review Updated Successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await db.query.reviews.findMany({
    where: eq(reviews.productId, productId),
    orderBy: desc(reviews.createdAt),
    with: { user: { columns: { name: true } } },
  });

  return { data };
}

// Get a review written by the current user
export async function getReviewByProductId({ productId }: { productId: string }) {
  const session = await auth();
  if (!session) throw new Error('User is not authenticated');

  const [review] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.userId, session.user.id!)));

  return review ?? null;
}
