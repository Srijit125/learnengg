import { MCQ } from "../models/MCQ";
import { api } from "./api";

export async function fetchMCQs(courseId: string) {
    const res = await api.get(`/mcqs/${courseId}`);
    return res.data
}

export async function fetchMCQsByChapter(courseId: string, chapterId: string) {
    const res = await api.get(`/courses/${courseId}/chapters/${chapterId}/mcqs`);
    return res.data;
}

export async function updateMCQ(courseId: string, mcqId: string, mcq: Partial<MCQ>) {
    return api.post(`mcq/${mcqId}/update`, { mcq: mcq, course_id: courseId })
}

export async function approveMCQ(courseId: string, mcqId: string) {
    return api.post(`mcq/${mcqId}/course/${courseId}/approve`)
}

export async function rejectMCQ(courseId: string, mcqId: string) {
    return api.post(`mcq/${mcqId}/course/${courseId}/reject`)
}

export async function addMCQToBackend(courseId: string, chapterId: string, mcq: MCQ) {
    return api.post(`/courses/${courseId}/chapters/${chapterId}/mcq`, { mcq })
}

export async function deleteMCQ(courseId: string, mcqId: string) {
    return api.post(`/mcq/${mcqId}/course/${courseId}/delete`)
}
