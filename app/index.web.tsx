import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "@/components/Buttons/CustomButton";
import { StatsButton } from "@/components/Buttons/StatsButton";
import { getUserLogs, getUserLogsData } from "@/services/analyticsService";
import MetricCard from "@/components/Dashboard/Cards/MetricCard";
import { BarChart, barDataItem, LineChart } from "react-native-gifted-charts";
import { analyticsInfo, logDataInfo } from "@/types/analyticsType";

export default function Index() {
  const [userId, setUserId] = useState("cbae9003-9c6c-4cb9-a658-7ebf7cc7cb23");
  const [diffDistribution, setDiffDistribution] = useState<barDataItem[]>([]);
  const [diffAccuracy, setDiffAccuracy] = useState<barDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progression, setProgression] = useState<barDataItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<analyticsInfo | null>(
    null,
  );
  const [logData, setLogData] = useState<logDataInfo[]>([])

  useEffect(() => {
    setLoading(true);
    getAnalyticsData();
    setLoading(false);
  }, [userId]);

  const getAnalyticsData = async () => {
    const data = await getUserLogs(userId);
    const logDataInfo = await getUserLogsData(userId)
    setAnalyticsData(data);
    setLogData(logDataInfo)
    console.log(logData);
    if (analyticsData) {
      const listDiffDistribution = Object.entries(
        analyticsData.difficulty_distribution,
      ).map(([key, value]) => ({
        label: key,
        value: value,
      }));
      const listDiffAccuracy = Object.entries(
        analyticsData.difficulty_accuracy,
      ).map(([key, value]) => ({
        label: key,
        value: value,
      }));
      const progressionOverTime = Object.entries(analyticsData.timeline).map(
        ([key, value]) => ({
          label: key,
          value: value.correct ? 1 : 0,
        }),
      );
      setDiffDistribution(listDiffDistribution as barDataItem[]);
      setDiffAccuracy(listDiffAccuracy as barDataItem[]);
      setProgression(progressionOverTime as barDataItem[]);
    }
  };

  const onPress = () => {
    getAnalyticsData();
  };

  if (loading) {
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size={"large"} color={"#0000ff"} />
    </View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Analytics</Text>
      </View>
      <View style={styles.metricCardsContainer}>
        <MetricCard
          metric={analyticsData?.total_attempts!}
          title="Total Attempts"
        />
        <MetricCard
          metric={analyticsData?.total_attempts!}
          title="Total Correct"
        />
        <MetricCard
          metric={analyticsData?.incorrect!}
          title="Total Incorrect"
        />
        <MetricCard metric={analyticsData?.accuracy!} title="Accuracy" />
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <TextInput
          placeholder="Enter the User ID"
          value={userId}
          onChangeText={setUserId}
        />
        <CustomButton title="Get User Analytics" onPress={onPress} />
      </View>
      <View style={styles.charts}>
        <View style={styles.chartContainer}>
          <Text>Difficulty Distribution</Text>
          <BarChart
            data={diffDistribution}
            frontColor={"#177AD5"}
            barWidth={40}
            width={200}
            isAnimated
          />
        </View>
        <View style={styles.chartContainer}>
          <Text>Accuracy by Difficulty</Text>
          <BarChart
            data={diffAccuracy}
            frontColor="#FF6677"
            barWidth={40}
            width={200}
            isAnimated
          />
        </View>
      </View>
      <View style={styles.charts}>
        {/* <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Progression Over Time</Text>
        <LineChart
          data={progression}
          // width={300}
          curved
          rotateLabel
          height={200}/>
          </View> */}
      </View>
      <StatsButton state="Default" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#FFD600",
  },
  metricCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    margin: 15,
  },
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontWeight: "700",
    fontSize: 28,
  },
  charts: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  chartContainer: {
    height: 300,
    width: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 20,
    margin: 10,
    boxShadow: "0px 0px 8px 4px rgba(26,26,26,0.5)",
  },
});
