import { logDataInfo } from "@/types/analyticsType";
import { api } from "./api";

export async function getUserLogs(userId: string) {
  try {
    const response = await api.get(`/analytics/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user logs:", error);
    return null;
  }
}

export async function getUserLogsData(userId: string) {
  try {
    const response = await api.get(`/analytics/${userId}/logs`);
    return response.data as logDataInfo[];
  } catch (error) {
    console.error("Error fetching user log data:", error);
    return [];
  }
}

export async function getTopicStats(userId: string) {
  try {
    const response = await api.get(`/mastery/${userId}/topicstats`);
    // The backend returns a JSON string of the dataframe, so we might need to parse it if not already object
    return typeof response.data === "string"
      ? JSON.parse(response.data)
      : response.data;
  } catch (error) {
    console.error("Error fetching topic stats:", error);
    return [];
  }
}

export async function getHierarchicalStats(userId: string) {
  try {
    const response = await api.get(`/mastery/${userId}/hierarchicalstats`);
    return typeof response.data === "string"
      ? JSON.parse(response.data)
      : response.data;
  } catch (error) {
    console.error("Error fetching hierarchical stats:", error);
    return [];
  }
}

export async function getTopicMastery(userId: string) {
  try {
    const response = await api.get(`/mastery/${userId}/topicmastery`);
    return typeof response.data === "string"
      ? JSON.parse(response.data)
      : response.data;
  } catch (error) {
    console.error("Error fetching topic mastery:", error);
    return [];
  }
}

export async function getUserCPI(userId: string) {
  try {
    const response = await api.get(`/mastery/${userId}/cpi`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user cpi:", error);
    return null;
  }
}

export async function getNoteStudyAnalysis(userId: string) {
  try {
    const response = await api.get(`/notes/${userId}/analysis`);
    return response.data;
  } catch (error) {
    console.error("Error fetching note study analysis:", error);
    return null;
  }
}

export async function logStudyActivity(activity: {
  user_id: string;
  course_id?: string;
  chapter_id?: string;
  event_type: string;
  metadata?: any;
}) {
  try {
    const response = await api.post("/notes/log", activity);
    return response.data;
  } catch (error) {
    console.error("Error logging study activity:", error);
    return null;
  }
}

export async function getUserActivityLogs(userId: string) {
  try {
    const response = await api.get(`/notes/${userId}/activity`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user activity logs:", error);
    return [];
  }
}

// Aggregated Analytics for Admin
export async function getSystemOverview() {
  try {
    const response = await api.get("/analytics/system/overview");
    return response.data;
  } catch (error) {
    console.error("Error fetching system overview:", error);
    return {
      total_students: 0,
      active_today: 0,
      total_study_sessions: 0,
      avg_accuracy: 0
    };
  }
}

export async function getAllStudentsStats() {
  try {
    const response = await api.get("/analytics/system/students");
    return response.data;
  } catch (error) {
    console.error("Error fetching all students stats:", error);
    return [];
  }
}

export async function getAllCoursesStats() {
  try {
    const response = await api.get("/analytics/system/courses");
    return response.data;
  } catch (error) {
    console.error("Error fetching all courses stats:", error);
    return [];
  }
}

export async function getGlobalStudyLogs() {
  try {
    const response = await api.get("/analytics/system/logs");
    return response.data;
  } catch (error) {
    console.error("Error fetching global study logs:", error);
    return [];
  }
}

export async function getCourseDetails(courseId: string) {
  try {
    const response = await api.get(`/analytics/system/courses/${courseId}/details`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course details for ${courseId}:`, error);
    return null;
  }
}
