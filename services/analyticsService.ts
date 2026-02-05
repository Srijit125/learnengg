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
