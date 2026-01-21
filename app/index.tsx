import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from 'react'
import CustomButton from "@/components/Buttons/CustomButton";
import { StatsButton } from "@/components/Buttons/StatsButton";
import { getUserLogs } from "@/services/analyticsService";
import MetricCard from "@/components/Dashboard/Cards/MetricCard";

export default function Index() {

  const [userId, setUserId] = useState("cbae9003-9c6c-4cb9-a658-7ebf7cc7cb23")
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [totalIncorrect, setTotalIncorrect] = useState(0)
  const [accuracy, setAccuracy] = useState(0.0)

  useEffect(()=>{
    getAnalyticsData()
  },[userId])

  const getAnalyticsData = async()=> {
const data = await getUserLogs(userId)
    if (data){
      setTotalAttempts(data.total_attempts)
      setTotalCorrect(data.correct)
      setTotalIncorrect(data.incorrect)
      setAccuracy(data.accuracy)
    }
  }

  const onPress = async(userId: string) =>{
    console.log(`Get analytics from API for ${userId}` )
    getAnalyticsData()
  }

  return (
    <View
      style={styles.container}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Dashboard</Text>
      </View>
      <View style={styles.metricCardsContainer}>
      <MetricCard metric={totalCorrect} title="Total Correct"/>
      <MetricCard metric={totalIncorrect} title="Total Incorrect"/>
      <MetricCard metric={totalAttempts} title="Total Attempts"/>
      <MetricCard metric={accuracy} title="Accuracy"/>
      </View>
      <TextInput placeholder="Enter the User ID" value={userId} onChangeText={setUserId}/>
      <CustomButton title="Get User Analytics" onPress={()=>onPress(userId)}/>
      {/* <StatsButton state="Pressed" /> */}
      <StatsButton state="Default" />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor:"#FFD600"
  },
  metricCardsContainer:{
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  titleContainer:{
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  title:{
    fontWeight: "700",
    fontSize: 28
  }
})
