-- AlterTable
ALTER TABLE "SiteContent" ADD COLUMN     "maintenanceMessage" TEXT NOT NULL DEFAULT 'Estamos em manutenção. Voltamos em breve!',
ADD COLUMN     "maintenanceMode" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LessonQuizQuestion" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "LessonQuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonQuizOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "LessonQuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonQuizQuestion_lessonId_idx" ON "LessonQuizQuestion"("lessonId");

-- CreateIndex
CREATE INDEX "LessonQuizOption_questionId_idx" ON "LessonQuizOption"("questionId");

-- AddForeignKey
ALTER TABLE "LessonQuizQuestion" ADD CONSTRAINT "LessonQuizQuestion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonQuizOption" ADD CONSTRAINT "LessonQuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "LessonQuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
