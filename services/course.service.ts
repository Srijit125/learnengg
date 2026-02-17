import { api } from "./api";
import { Course } from "../models/Course";

export async function listCourses(): Promise<Course[]> {
  const res = await api.get("/courses");
  return res.data;
}

export async function uploadCourseXml(file: any) {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name || "course.xml",
    type: "text/xml",
  } as any);

  const res = await api.post("/metadata/upload-xml", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function getCourseSummary(courseId: string) {
  const res = await api.get(`/courses/${courseId}/summary`);
  return res.data;
}

export async function fetchCourseStructure(courseId: string) {
  const res = await api.get(`/courses/${courseId}/structure`);
  return res.data;
}

export async function fetchCourseChapterNotes(
  courseId: string,
  chapterId: string,
) {
  const res = await api.get(`/courses/${courseId}/chapters/${chapterId}/notes`);
  return res.data;
}

export async function updateNoteProgress(
  userId: string,
  courseId: string,
  chapterId: string,
  progress: number,
) {
  const res = await api.post("/notes/progress", {
    user_id: userId,
    course_id: courseId,
    chapter_id: chapterId,
    progress: progress,
  });
  return res.data;
}

export async function searchFAISS(query: string, courseId: string | null) {
  const payload = {
    query: query,
    course_id: courseId,
    top_k: 5,
  };
  const res = await api.post("/search/", payload);
  return res.data;
}
