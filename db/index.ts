import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// Node.js (local dev) needs the ws package as the WebSocket constructor.
// Cloudflare Workers has a native WebSocket — no setup needed there.
if (typeof navigator === 'undefined' || navigator.userAgent !== 'Cloudflare-Workers') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require('ws');
}

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
  }
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

export const db = createDb();

export * from './schema';
