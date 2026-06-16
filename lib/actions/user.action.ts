'use server';

import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  updateUserSchema,
} from '../validator';
import { auth, signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { hashSync } from 'bcrypt-ts-edge';
import { db, users } from '@/db';
import { formatError } from '../utils';
import { ShippingAddress } from '@/types';
import { z } from 'zod';
import { PAGE_SIZE } from '../constants';
import { revalidatePath } from 'next/cache';
import { count, desc, eq, ilike } from 'drizzle-orm';

// Sign in the user with credentials
export async function signInWithCredentials(prevState: unknown, formData: FormData) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', user);

    return { success: true, message: 'Signed in successfully' };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: 'Invalid email or password' };
  }
}

// Sign user out
export async function signOutUser() {
  await signOut();
}

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    const plainPassword = user.password;
    user.password = hashSync(user.password, 10);

    await db.insert(users).values({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    await signIn('credentials', { email: user.email, password: plainPassword });

    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

// Get user by the ID
export async function getUserById(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new Error('User not found');
  return user;
}

// Update user address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));

    if (!currentUser) throw new Error('User not found');

    const address = shippingAddressSchema.parse(data);

    await db.update(users).set({ address }).where(eq(users.id, currentUser.id));

    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user's payment method
export async function updateUserPaymentMethod(data: z.infer<typeof paymentMethodSchema>) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));

    if (!currentUser) throw new Error('User not found');

    const paymentMethod = paymentMethodSchema.parse(data);

    await db
      .update(users)
      .set({ paymentMethod: paymentMethod.type })
      .where(eq(users.id, currentUser.id));

    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update the user profile
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));

    if (!currentUser) throw new Error('User not found');

    await db.update(users).set({ name: user.name }).where(eq(users.id, currentUser.id));

    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all the users (admin)
export async function getAllUsers({
  query,
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const session = await auth();
  if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

  const whereClause = query && query !== 'all' ? ilike(users.name!, `%${query}%`) : undefined;

  const data = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const [{ value: dataCount }] = await db.select({ value: count() }).from(users);

  return { data, totalPages: Math.ceil(dataCount / limit) };
}

// Delete a user (admin)
export async function deleteUser(id: string) {
  try {
    const session = await auth();
    if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

    await db.delete(users).where(eq(users.id, id));

    revalidatePath('/admin/users');

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a user (admin)
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    const session = await auth();
    if (session?.user.role !== 'admin') throw new Error('Unauthorized: admin access required');

    await db
      .update(users)
      .set({ name: user.name, role: user.role })
      .where(eq(users.id, user.id));

    revalidatePath('/admin/users');

    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
