import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!; // Use service role key for migration if possible
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateCourse(jsonFilePath: string) {
  const rawData = fs.readFileSync(jsonFilePath, "utf8");
  const data = JSON.parse(rawData);

  console.log(`Migrating Course: ${data.CourseName} (${data.CourseID})`);

  // 1. Upsert Course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .upsert(
      {
        course_id: data.CourseID,
        course_name: data.CourseName,
      },
      { onConflict: "course_id" },
    )
    .select()
    .single();

  if (courseError) {
    console.error("Error upserting course:", courseError);
    return;
  }

  const courseIdUuid = course.id;

  // 2. Build Units, Chapters, and Topics
  for (const unitData of data.Units) {
    console.log(`  Unit: ${unitData.UnitTitle}`);
    const { data: unit, error: unitError } = await supabase
      .from("units")
      .insert({
        course_id: courseIdUuid,
        unit_id_code: unitData.UnitId,
        unit_title: unitData.UnitTitle,
      })
      .select()
      .single();

    if (unitError) {
      console.error("Error inserting unit:", unitError);
      continue;
    }

    const unitIdUuid = unit.id;

    for (const chapterData of unitData.Chapters) {
      console.log(`    Chapter: ${chapterData.ChapterTitle}`);
      const { data: chapter, error: chapterError } = await supabase
        .from("chapters")
        .insert({
          unit_id: unitIdUuid,
          chapter_id_code: chapterData.ChapterId,
          chapter_title: chapterData.ChapterTitle,
          notes_file: chapterData.RawFiles?.notes || null,
        })
        .select()
        .single();

      if (chapterError) {
        console.error("Error inserting chapter:", chapterError);
        continue;
      }

      const chapterIdUuid = chapter.id;

      if (chapterData.Topics && chapterData.Topics.length > 0) {
        const topicsToInsert = chapterData.Topics.map((topic: any) => ({
          chapter_id: chapterIdUuid,
          topic_id_code: topic.TopicId,
          topic_title: topic.TopicTitle,
          content: topic.Content,
          section: topic.Reference?.Section || null,
        }));

        const { error: topicsError } = await supabase
          .from("topics")
          .insert(topicsToInsert);

        if (topicsError) {
          console.error("Error inserting topics:", topicsError);
        }
      }
    }
  }

  console.log("Migration completed successfully.");
}

// Usage: ts-node migrate_course.ts C:\Users\test\Desktop\E-Learning\UI\C003.json
const filePath = process.argv[2];
if (filePath) {
  migrateCourse(path.resolve(filePath));
} else {
  console.log("Please provide a path to the JSON file.");
}
