-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "polygon" JSONB NOT NULL,
    "geom" geometry(Polygon,4326),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_entry_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_entry_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "areas_geom_gist_idx" ON "areas" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "area_entry_logs_userId_idx" ON "area_entry_logs"("userId");

-- CreateIndex
CREATE INDEX "area_entry_logs_areaId_idx" ON "area_entry_logs"("areaId");

-- CreateIndex
CREATE INDEX "area_entry_logs_entryTime_idx" ON "area_entry_logs"("entryTime");

-- CreateIndex
CREATE INDEX "area_entry_logs_createdAt_idx" ON "area_entry_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "area_entry_logs" ADD CONSTRAINT "area_entry_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_entry_logs" ADD CONSTRAINT "area_entry_logs_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
