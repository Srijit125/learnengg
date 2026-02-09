import { RecommendationPayload } from "@/models/Recommendations";
import { api } from "./api";

export async function getAIRecommendations(userId: string, courseId: string) {
  const res = await api.get(`recommendations/${userId}`, {
    params: { course_id: courseId },
  });
  return res.data;
}

export async function recommendWeakTopics(
  userId: string,
  payload: RecommendationPayload,
) {
  const res = await api.request({
    method: "POST",
    url: `/recommendations/${userId}/weakrecommendations`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

export async function getPersonalizedPlan(
  userId: string,
  payload: RecommendationPayload,
) {
  const res = await api.request({
    method: "POST",
    url: `recommendations/${userId}/personalizedplan`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}
