-- CreateTable
CREATE TABLE "Record" (
    "id" SERIAL NOT NULL,
    "emotion" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "student" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Record_date_idx" ON "Record"("date");

-- CreateIndex
CREATE INDEX "Record_student_idx" ON "Record"("student");
