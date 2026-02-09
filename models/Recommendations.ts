export type RecommendationPayload = {
  user_id: string;
  course_id: string;
  weak_topics: string[];
};

export interface Recommendation {
  recommendation_text: string;
  strong_topics: Record<string, string> | string[]; // Handle both potential formats just in case, but JSON shows object
  study_order: string[];
  weak_topics: string[];
}
