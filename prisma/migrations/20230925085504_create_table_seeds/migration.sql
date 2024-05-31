-- CreateTable
CREATE TABLE "seeds" (
    "id" VARCHAR(36) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seeds_key_key" ON "seeds"("key");
