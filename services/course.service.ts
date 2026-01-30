import { api } from "./api";
import { Course } from "../models/Course";

export async function listCourses(): Promise<Course[]> {
    const res = await api.get("/courses")
    return res.data
}

export async function uploadCourseXml(file: any){
    const formData = new FormData();
    formData.append("file", {
        uri: file.uri,
        name: file.name || "course.xml",
        type: "text/xml"
    } as any)

    const res = await api.post("/metadata/upload-xml", formData, {
        headers: {"Content-Type": "multipart/form-data"}
    });

    return res.data;
}

export async function getCourseSummary(courseId:string) {
    const res = await api.get(`/courses/${courseId}/summary`)
    return res.data
}