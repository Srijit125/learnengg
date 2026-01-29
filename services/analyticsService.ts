import axiosInstance from "@/helpers/axiosInstance";
import { logDataInfo } from "@/types/analyticsType";


export async function getUserLogs(userId:string) {
   const logAnalytics = await axiosInstance.get(`/analytics/${userId}`)
    .then(function (response){
        return response.data
    })
    .catch(function (error){
        console.error(error)
        return null
    })
    .finally(function (){
        console.log("Finished API Call")
    })
    return logAnalytics
}

export async function getUserLogsData(userId: string){
    const logData = await axiosInstance.get(`/analytics/${userId}/logs`)
    .then(function (response){
        return response.data
    })
    .catch(function (error){
        console.error(error)
        return null
    })
    .finally(function (){
        console.log("Finished API Call for Logs Data")
    })
    return logData as logDataInfo[]
}