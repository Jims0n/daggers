const dotenv = require('dotenv');
dotenv.config();

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');

neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = fs.readFileSync('prisma/migrations/20260616_event_tickets/migration.sql', 'utf8');
  await pool.query(sql);
  console.log('Migration complete!');
  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error('Migration failed:', e.message || e);
  process.exit(1);
});
