import { api } from "./api";
import { logDataInfo } from "@/types/analyticsType";

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
