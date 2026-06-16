import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import sampleData from './sample-data';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
    await db.delete(schema.orderItems);
    await db.delete(schema.orders);
    await db.delete(schema.carts);
    await db.delete(schema.reviews);
    await db.delete(schema.accounts);
    await db.delete(schema.sessions);
    await db.delete(schema.verificationTokens);
    await db.delete(schema.products);
    await db.delete(schema.users);

    await db.insert(schema.products).values(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sampleData.products.map((p: any) => ({
            ...p,
            price: String(p.price),
            rating: String(p.rating),
        }))
    );
    await db.insert(schema.users).values(sampleData.users);

    console.log('Database seeded successfully!');
}

main().catch(console.error);
