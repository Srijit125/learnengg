import { MCQ } from "../models/MCQ";
import { api } from "./api";

export type SubmittedAnswerType = {
  user_id: string;
  question: MCQ;
  selected_index: number;
  course_id: string;
  quiz_id: string;
};

export const fetchMCQ = async (
  course_id: string,
  difficulty?: string,
  exclude_ids: string[] = [],
) => {
  const response = await api.get(`/adaptive-quiz/next`, {
    params: {
      course_id,
      difficulty,
      exclude_ids: exclude_ids.join(","),
    },
  });
  return response.data; // Gets { question, difficulty }
};

export const submitAnswer = async (payload: SubmittedAnswerType) => {
  const response = await api.post(`/adaptive-quiz/answer`, payload);
  return response.data;
};
