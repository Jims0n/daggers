import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// Node.js (local dev) needs the ws package as the WebSocket constructor.
// Cloudflare Workers has a native WebSocket — no setup needed there.
if (typeof navigator === 'undefined' || navigator.userAgent !== 'Cloudflare-Workers') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require('ws');
}

// Creating the Pool + drizzle wrapper does NOT open a connection — that happens
// lazily on the first query. So it's safe to construct at import time even when
// DATABASE_URL is absent (e.g. during `next build` page-data collection). The
// connection string is only dereferenced when a query actually runs at runtime,
// where DATABASE_URL is always present (Worker var / local .env).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });

export * from './schema';
