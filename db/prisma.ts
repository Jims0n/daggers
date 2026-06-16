import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
// Cloudflare Workers have a native WebSocket global, so ws is only needed in Node.js.
if (typeof globalThis.WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ws = require('ws');
  neonConfig.webSocketConstructor = ws;
}

// Creates a new connection pool using the provided connection string
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Instantiates the Prisma adapter using the Neon connection pool
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaNeon(pool as any);

// Extends the PrismaClient with a custom result transformer to convert the price and rating fields to strings.
export const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    product: {
      price: {
        needs: { price: true },
        compute(product: { price: { toString(): string } }) {
          return product.price.toString();
        },
      },
      rating: {
        needs: { rating: true },
        compute(product: { rating: { toString(): string } }) {
          return product.rating.toString();
        },
      },
    },
    cart: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(cart: { itemsPrice: { toString(): string } }) {
          return cart.itemsPrice.toString();
        }
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(cart: { shippingPrice: { toString(): string } }) {
          return cart.shippingPrice.toString();
        }
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(cart: { totalPrice: { toString(): string } }) {
          return cart.totalPrice.toString();
        }
      },
    },
    order: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(cart: { itemsPrice: { toString(): string } }) {
          return cart.itemsPrice.toString();
        }
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(cart: { shippingPrice: { toString(): string } }) {
          return cart.shippingPrice.toString();
        }
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(cart: { totalPrice: { toString(): string } }) {
          return cart.totalPrice.toString();
        }
      },
    },
    orderItem: {
      price: {
        needs: { price: true },
        compute(cart: { price: { toString(): string } }) {
          return cart.price.toString();
        },
      }
    }
  },
});
