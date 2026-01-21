import axiosInstance from "@/helpers/axiosInstance";


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