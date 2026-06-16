-- Event Ticket Sales tables

CREATE TABLE "Event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "venue" TEXT NOT NULL,
    "description" TEXT,
    "tagline" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now(),
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "event_slug_idx" ON "Event"("slug");

CREATE TABLE "EventTicketTier" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "eventId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "maxQuantity" INTEGER,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now(),
    CONSTRAINT "EventTicketTier_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EventTicketTier_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE
);

CREATE TABLE "EventTicketOrder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "eventId" UUID NOT NULL,
    "tierId" UUID NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paystackReference" TEXT NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now(),
    CONSTRAINT "EventTicketOrder_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EventTicketOrder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE,
    CONSTRAINT "EventTicketOrder_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "EventTicketTier"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "ticket_code_idx" ON "EventTicketOrder"("ticketCode");

-- Seed: The Frat Night event
INSERT INTO "Event" ("name", "slug", "date", "venue", "description", "tagline", "isActive")
VALUES (
    'The Frat Night at Spiffy''s House',
    'frat-night',
    '2026-07-03 20:00:00',
    'Undisclosed — revealed to ticket holders only',
    'One last party. One last night. Same community.',
    'After School. After Hours. After Dark.',
    true
);

-- Seed: Ticket tiers
INSERT INTO "EventTicketTier" ("eventId", "name", "price", "maxQuantity", "soldCount", "isActive", "sortOrder")
SELECT e."id", 'Early Bird', 6500.00, 30, 0, true, 1
FROM "Event" e WHERE e."slug" = 'frat-night';

INSERT INTO "EventTicketTier" ("eventId", "name", "price", "maxQuantity", "soldCount", "isActive", "sortOrder")
SELECT e."id", 'Regular', 10000.00, NULL, 0, false, 2
FROM "Event" e WHERE e."slug" = 'frat-night';

INSERT INTO "EventTicketTier" ("eventId", "name", "price", "maxQuantity", "soldCount", "isActive", "sortOrder")
SELECT e."id", 'VIP', 20000.00, NULL, 0, false, 3
FROM "Event" e WHERE e."slug" = 'frat-night';
