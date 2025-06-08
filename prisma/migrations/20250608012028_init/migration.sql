-- CreateTable
CREATE TABLE "accounts" (
    "uid" UUID NOT NULL,
    "email" VARCHAR,
    "displayName" VARCHAR NOT NULL,
    "password" VARCHAR,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "image" VARCHAR,
    "deletedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pushNotificationTokens" VARCHAR[],
    "subscription" VARCHAR,
    "phone" VARCHAR,
    "hasPreApprovalLetter" BOOLEAN NOT NULL DEFAULT false,
    "workingWithAgent" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" VARCHAR,
    "systemRole" VARCHAR NOT NULL DEFAULT 'user',

    CONSTRAINT "accounts_pk" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "cached_response" (
    "key" VARCHAR NOT NULL,
    "cached_data" JSON NOT NULL,
    "last_cached_datetime" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "cached_response_pk" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "claimed_property" (
    "realstateId" VARCHAR NOT NULL,
    "askingPrice" DOUBLE PRECISION,
    "owner" UUID NOT NULL,
    "highlights" VARCHAR,
    "saleConditions" VARCHAR,
    "sellerDisclosureDocument" BOOLEAN NOT NULL DEFAULT false,
    "copyTitleDocument" BOOLEAN NOT NULL DEFAULT false,
    "pictures" VARCHAR[],
    "listed" BOOLEAN NOT NULL DEFAULT false,
    "slug" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR,

    CONSTRAINT "claimedproperty_pk" PRIMARY KEY ("realstateId")
);

-- CreateTable
CREATE TABLE "contact_request" (
    "seller" UUID NOT NULL,
    "buyer" UUID NOT NULL,
    "buyerApprovedAt" TIMESTAMP(6),
    "sellerApprovedAt" TIMESTAMP(6),
    "propertyId" VARCHAR NOT NULL,
    "initiator" UUID NOT NULL,

    CONSTRAINT "contact_request_pk" PRIMARY KEY ("seller","buyer")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "uid" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "needs" VARCHAR NOT NULL,
    "desires" VARCHAR NOT NULL,
    "markets" JSON[],
    "visibleToSellers" BOOLEAN NOT NULL,
    "hasPreApprovalLetter" BOOLEAN NOT NULL,
    "workingWithAgent" BOOLEAN NOT NULL,
    "buyer" UUID NOT NULL,
    "search" JSON NOT NULL,
    "allowNotifications" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "saved_searches_pk" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "contact_unlisted_request" (
    "buyer" UUID NOT NULL,
    "propertyId" VARCHAR NOT NULL,
    "uid" UUID NOT NULL,
    "email" VARCHAR NOT NULL,
    "phone" VARCHAR NOT NULL,
    "message" VARCHAR,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "propertySlug" VARCHAR NOT NULL,

    CONSTRAINT "contact_unlisted_request_pk" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "partners" (
    "uid" UUID NOT NULL,
    "date_record" DATE,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "address" TEXT,
    "email" VARCHAR(255),
    "website" VARCHAR(255),
    "category" VARCHAR(255),
    "tags" VARCHAR(500),
    "image" VARCHAR(255),
    "location" VARCHAR(255) NOT NULL,

    CONSTRAINT "partners_pk" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "transactions" (
    "uid" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethodType" VARCHAR NOT NULL,
    "object" VARCHAR NOT NULL,
    "paymentReference" VARCHAR NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'usd',
    "status" VARCHAR NOT NULL,
    "description" VARCHAR,
    "claimed_property_id" VARCHAR NOT NULL,
    "accounts_uid" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripePaymentIntentId" VARCHAR,
    "paidAt" TIMESTAMP(6),
    "errorMessage" VARCHAR(255),
    "refundedAt" TIMESTAMP(6),
    "disputeStatus" VARCHAR(50),
    "disputeReason" VARCHAR(100),
    "disputeResolvedAt" TIMESTAMP(6),

    CONSTRAINT "transactions_pk" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_stripePaymentIntentId_key" ON "transactions"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "claimed_property" ADD CONSTRAINT "claimed_property_accounts_fk" FOREIGN KEY ("owner") REFERENCES "accounts"("uid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contact_request" ADD CONSTRAINT "contact_buyer" FOREIGN KEY ("buyer") REFERENCES "accounts"("uid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contact_request" ADD CONSTRAINT "contact_request_claimed_property_fk" FOREIGN KEY ("propertyId") REFERENCES "claimed_property"("realstateId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contact_request" ADD CONSTRAINT "contact_request_initiator" FOREIGN KEY ("initiator") REFERENCES "accounts"("uid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contact_request" ADD CONSTRAINT "contact_seller" FOREIGN KEY ("seller") REFERENCES "accounts"("uid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_buyer" FOREIGN KEY ("buyer") REFERENCES "accounts"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contact_unlisted_request" ADD CONSTRAINT "contact_unlisted_request_accounts_fk" FOREIGN KEY ("buyer") REFERENCES "accounts"("uid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_claimed_property_fk" FOREIGN KEY ("claimed_property_id") REFERENCES "claimed_property"("realstateId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accounts_fk" FOREIGN KEY ("accounts_uid") REFERENCES "accounts"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
