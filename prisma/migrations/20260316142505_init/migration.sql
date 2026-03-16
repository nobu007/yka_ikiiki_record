-- CreateTable
CREATE TABLE "Record" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "emotion" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "student" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Record_date_idx" ON "Record"("date");

-- CreateIndex
CREATE INDEX "Record_student_idx" ON "Record"("student");
