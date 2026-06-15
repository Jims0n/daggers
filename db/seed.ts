import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import sampleData from "./sample-data";

neonConfig.webSocketConstructor = ws;

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });
    await prisma.product.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();           

    await prisma.product.createMany({ data: sampleData.products });
    await prisma.user.createMany({ data: sampleData.users });


    console.log('Database seeded successfully!');
    
}

main()