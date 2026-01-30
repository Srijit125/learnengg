import { api } from "./api";

export async function fetchCourseXML(courseId:string) {
    const res = await api.get(`/courses/${courseId}/xml`)
    return res.data.xml
}

export async function saveCourseXML(courseId:string, xml: string) {
    const res = await api.post(`/courses/${courseId}/xml`, {xml})
    return res.data
}

export async function validateXML(xml: string) {
    const res = await api.post("/courses/validate-xml", {xml})
    return res.data
}