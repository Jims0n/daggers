'use server';

import { prisma } from "@/db/prisma";
import { auth } from "@/auth";
import { formatError } from "../utils";
import { revalidatePath } from "next/cache";

// Get deal settings
export async function getDealSettings() {
    const settings = await prisma.setting.findFirst({
        where: { id: 'site-settings' },
    });

    if (!settings) return null;

    return {
        dealTitle: settings.dealTitle,
        dealDescription: settings.dealDescription,
        dealEndDate: settings.dealEndDate,
        dealEnabled: settings.dealEnabled,
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
        if (session?.user.role !== 'admin') {
            throw new Error('Unauthorized');
        }

        await prisma.setting.upsert({
            where: { id: 'site-settings' },
            update: {
                dealTitle: data.dealTitle,
                dealDescription: data.dealDescription,
                dealEndDate: new Date(data.dealEndDate),
                dealEnabled: data.dealEnabled,
            },
            create: {
                id: 'site-settings',
                dealTitle: data.dealTitle,
                dealDescription: data.dealDescription,
                dealEndDate: new Date(data.dealEndDate),
                dealEnabled: data.dealEnabled,
            },
        });

        revalidatePath('/');
        revalidatePath('/admin/settings');

        return { success: true, message: 'Deal settings updated successfully' };
    } catch (error) {
        return { success: false, message: formatError(error) };
    }
}
