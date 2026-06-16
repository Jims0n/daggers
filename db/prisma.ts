import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

// Node.js 21+ has a native WebSocket global that is incompatible with
// @neondatabase/serverless. Always use the ws package on the server.
// eslint-disable-next-line @typescript-eslint/no-require-imports
neonConfig.webSocketConstructor = require('ws');

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Please check your .env file.'
    );
  }
  // PrismaNeon in @prisma/adapter-neon v7 is a factory that accepts a connection
  // string and manages the Pool internally — do not pass a Pool instance.
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({ adapter }).$extends({
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
}

let _prisma: ReturnType<typeof createPrismaClient> | undefined;

export function getPrisma() {
  if (!_prisma) {
    _prisma = createPrismaClient();
  }
  return _prisma;
}

export const prisma = new Proxy({} as ReturnType<typeof createPrismaClient>, {
  get(_target, prop) {
    if (!_prisma) {
      _prisma = createPrismaClient();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_prisma as any)[prop];
  },
});
