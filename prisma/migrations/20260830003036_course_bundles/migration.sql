-- CreateTable
CREATE TABLE "_CourseBundle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CourseBundle_A_fkey" FOREIGN KEY ("A") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CourseBundle_B_fkey" FOREIGN KEY ("B") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_CourseBundle_AB_unique" ON "_CourseBundle"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseBundle_B_index" ON "_CourseBundle"("B");
