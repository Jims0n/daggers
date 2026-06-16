import {
  boolean,
  integer,
  json,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const products = pgTable('Product', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique('product_slug_idx'),
  category: text('category').notNull(),
  images: text('images').array().notNull(),
  description: text('description').notNull(),
  stock: integer('stock').notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull().default('0'),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0'),
  numReviews: integer('numReviews').notNull().default(0),
  isFeatured: boolean('isFeatured').notNull(),
  banner: text('banner'),
  createdAt: timestamp('createdAt', { precision: 6 }).defaultNow().notNull(),
});

export const users = pgTable('User', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').default('NO_NAME'),
  email: text('email').notNull().unique('user_email_idx'),
  emailVerified: timestamp('emailVerified', { precision: 6 }),
  image: text('image'),
  password: text('password'),
  role: text('role').notNull().default('user'),
  address: json('address'),
  paymentMethod: text('paymentMethod'),
  createdAt: timestamp('createdAt', { precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').notNull().default(sql`now()`).$onUpdate(() => new Date()),
});

export const accounts = pgTable(
  'Account',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
    createdAt: timestamp('createdAt', { precision: 6 }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').notNull().default(sql`now()`).$onUpdate(() => new Date()),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]
);

export const sessions = pgTable('Session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { precision: 6 }).notNull(),
  createdAt: timestamp('createdAt', { precision: 6 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').notNull().default(sql`now()`).$onUpdate(() => new Date()),
});

export const verificationTokens = pgTable(
  'VerificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires').notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);

export const carts = pgTable('Cart', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('userId').references(() => users.id, { onDelete: 'cascade' }),
  sessionCartId: text('sessionCartId').notNull(),
  items: json('items').array().notNull().default(sql`'{}'::json[]`),
  itemsPrice: numeric('itemsPrice', { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric('totalPrice', { precision: 12, scale: 2 }).notNull(),
  shippingPrice: numeric('shippingPrice', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('createdAt', { precision: 6 }).defaultNow().notNull(),
});

export const orders = pgTable('Order', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  shippingAddress: json('shippingAddress').notNull(),
  paymentMethod: text('paymentMethod').notNull(),
  paymentResult: json('paymentResult'),
  itemsPrice: numeric('itemsPrice', { precision: 12, scale: 2 }).notNull(),
  shippingPrice: numeric('shippingPrice', { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric('totalPrice', { precision: 12, scale: 2 }).notNull(),
  isPaid: boolean('isPaid').default(false),
  paidAt: timestamp('paidAt', { precision: 6 }),
  isDelivered: boolean('isDelivered').notNull().default(false),
  deliveredAt: timestamp('deliveredAt', { precision: 6 }),
  createdAt: timestamp('createdAt', { precision: 6 }).defaultNow().notNull(),
});

export const orderItems = pgTable(
  'OrderItem',
  {
    orderId: uuid('orderId')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('productId')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    qty: integer('qty').notNull(),
    price: numeric('price', { precision: 12, scale: 2 }).notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    image: text('image').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.orderId, table.productId],
      name: 'orderitems_orderId_productId_pk',
    }),
  ]
);

export const reviews = pgTable('Review', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: uuid('productId')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  isVerifiedPurchase: boolean('isVerifiedPurchase').notNull().default(true),
  createdAt: timestamp('createdAt', { precision: 6 }).defaultNow().notNull(),
});

export const settings = pgTable('Setting', {
  id: text('id').primaryKey().default('site-settings'),
  dealTitle: text('dealTitle').notNull().default('Deal of the month'),
  dealDescription: text('dealDescription')
    .notNull()
    .default('Get ready for a shopping experience like never before with our Deals of the month!'),
  dealEndDate: timestamp('dealEndDate', { precision: 6 }).notNull(),
  dealEnabled: boolean('dealEnabled').notNull().default(true),
  updatedAt: timestamp('updatedAt').notNull().default(sql`now()`).$onUpdate(() => new Date()),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  carts: many(carts),
  orders: many(orders),
  reviews: many(reviews),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const cartsRelations = relations(carts, ({ one }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));
