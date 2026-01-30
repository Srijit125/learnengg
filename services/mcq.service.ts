import { api } from "./api";
import { MCQ } from "../models/MCQ";

export async function fetchMCQs(courseId:string) {
    const res = await api.get(`/mcqs/${courseId}`);
    return res.data
}

export async function updateMCQ(courseId: string, mcqId: string, mcq: Partial<MCQ>) {
    return api.post(`mcq/${mcqId}/update`, {mcq: mcq, course_id: courseId})
}

export async function approveMCQ(courseId: string, mcqId: string) {
    return api.post(`mcq/${mcqId}/course/${courseId}/approve`)
}

export async function rejectMCQ(courseId: string, mcqId: string) {
    return api.post(`mcq/${mcqId}/course/${courseId}/reject`)
}