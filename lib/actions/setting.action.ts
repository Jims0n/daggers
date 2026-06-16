'use server';

import { db, settings } from '@/db';
import { auth } from '@/auth';
import { formatError } from '../utils';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

// Get deal settings
export async function getDealSettings() {
  const [row] = await db.select().from(settings).where(eq(settings.id, 'site-settings'));

  if (!row) return null;

  return {
    dealTitle: row.dealTitle,
    dealDescription: row.dealDescription,
    dealEndDate: row.dealEndDate,
    dealEnabled: row.dealEnabled,
  };
}

// Update deal settings (admin only)
export async function updateDealSettings(data: {
  dealTitle: string;
  dealDescription: string;
  dealEndDate: string;
  dealEnabled: boolean;
}) {
  try {
    const session = await auth();
    if (session?.user.role !== 'admin') throw new Error('Unauthorized');

    const values = {
      id: 'site-settings',
      dealTitle: data.dealTitle,
      dealDescription: data.dealDescription,
      dealEndDate: new Date(data.dealEndDate),
      dealEnabled: data.dealEnabled,
      updatedAt: new Date(),
    };

    await db
      .insert(settings)
      .values(values)
      .onConflictDoUpdate({
        target: settings.id,
        set: {
          dealTitle: values.dealTitle,
          dealDescription: values.dealDescription,
          dealEndDate: values.dealEndDate,
          dealEnabled: values.dealEnabled,
          updatedAt: values.updatedAt,
        },
      });

    revalidatePath('/');
    revalidatePath('/admin/settings');

    return { success: true, message: 'Deal settings updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
