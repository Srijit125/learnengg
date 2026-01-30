import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import CustomButton from "@/components/Buttons/CustomButton";
import { getUserLogs, getUserLogsData } from "@/services/analyticsService";
import MetricCard from "@/components/Dashboard/Cards/MetricCard";
import StatCard from "@/components/Dashboard/Cards/StatCard";
import ChartCard from "@/components/Dashboard/Cards/ChartCard";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import ProgressRing from "@/components/Dashboard/ProgressRing";
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
  const [logData, setLogData] = useState<logDataInfo[]>([]);

  useEffect(() => {
    setLoading(true);
    getAnalyticsData();
  }, [userId]);

  const getAnalyticsData = async () => {
    try {
      const data = await getUserLogs(userId);
      const logDataInfo = await getUserLogsData(userId);
      setAnalyticsData(data);
      setLogData(logDataInfo);

      if (data) {
        const listDiffDistribution = Object.entries(
          data.difficulty_distribution,
        ).map(([key, value]) => ({
          label: key,
          value: value,
        }));
        const listDiffAccuracy = Object.entries(data.difficulty_accuracy).map(
          ([key, value]) => ({
            label: key,
            value: value,
          }),
        );
        const progressionOverTime = Object.entries(data.timeline).map(
          ([key, value]: [string, any]) => ({
            label: key,
            value: value.correct ? 1 : 0,
          }),
        );
        setDiffDistribution(listDiffDistribution as barDataItem[]);
        setDiffAccuracy(listDiffAccuracy as barDataItem[]);
        setProgression(progressionOverTime as barDataItem[]);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const onPress = () => {
    setLoading(true);
    getAnalyticsData();
  };

  // Transform logData for ActivityFeed
  const activityItems = logData.map((log, index) => ({
    id: `${log.user_id}-${index}`,
    difficulty: log.difficulty || "medium",
    correct: log.correct || false,
    timestamp: log.timestamp || new Date().toISOString(),
    topic: log.reference?.Chapter || "Quiz",
  }));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f8fafc", "#f1f5f9", "#e2e8f0"]}
        style={styles.gradientBackground}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Analytics Dashboard</Text>
              <Text style={styles.subtitle}>
                Track your learning progress and performance
              </Text>
            </View>
          </View>

          {/* User ID Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter User ID"
                value={userId}
                onChangeText={setUserId}
                placeholderTextColor="#94a3b8"
              />
              <CustomButton title="Load Analytics" onPress={onPress} />
            </View>
          </View>

          {/* Stats Cards Section */}
          <View style={styles.statsSection}>
            <StatCard
              title="Total Attempts"
              value={analyticsData?.total_attempts || 0}
              icon="clipboard-check-outline"
              gradientColors={["#667eea", "#764ba2"]}
              trend="up"
              trendValue="+12% this week"
            />
            <StatCard
              title="Correct Answers"
              value={analyticsData?.correct || 0}
              icon="check-circle-outline"
              gradientColors={["#10b981", "#059669"]}
              trend="up"
              trendValue="+8% improvement"
            />
            <StatCard
              title="Incorrect Answers"
              value={analyticsData?.incorrect || 0}
              icon="close-circle-outline"
              gradientColors={["#ef4444", "#dc2626"]}
              trend="down"
              trendValue="-5% this week"
            />
            <StatCard
              title="Accuracy Rate"
              value={analyticsData?.accuracy || 0}
              suffix="%"
              icon="chart-line"
              gradientColors={["#f59e0b", "#d97706"]}
              trend="up"
              trendValue="+3.2%"
            />
          </View>

          {/* Main Content Grid */}
          <View style={styles.contentGrid}>
            {/* Left Column - Charts */}
            <View style={styles.leftColumn}>
              <ChartCard
                title="Difficulty Distribution"
                subtitle="Questions attempted by difficulty level"
                loading={loading}
              >
                <BarChart
                  data={diffDistribution}
                  frontColor="#667eea"
                  barWidth={50}
                  width={280}
                  height={200}
                  isAnimated
                  barBorderRadius={6}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules
                />
              </ChartCard>

              <ChartCard
                title="Accuracy by Difficulty"
                subtitle="Performance across difficulty levels"
                loading={loading}
              >
                <BarChart
                  data={diffAccuracy}
                  frontColor="#10b981"
                  barWidth={50}
                  width={280}
                  height={200}
                  isAnimated
                  barBorderRadius={6}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules
                />
              </ChartCard>

              <ChartCard
                title="Performance Overview"
                subtitle="Your overall accuracy"
                height={280}
              >
                <ProgressRing
                  percentage={analyticsData?.accuracy || 0}
                  size={160}
                  strokeWidth={16}
                  color="#667eea"
                  label="Overall Accuracy"
                />
              </ChartCard>
            </View>

            {/* Right Column - Activity Feed */}
            <View style={styles.rightColumn}>
              <ActivityFeed activities={activityItems} maxItems={15} />
            </View>
          </View>

          {/* Quick Stats Cards */}
          <View style={styles.quickStatsSection}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <View style={styles.quickStatsGrid}>
              <MetricCard
                title="Total Attempts"
                metric={analyticsData?.total_attempts || 0}
                color="#667eea"
              />
              <MetricCard
                title="Correct"
                metric={analyticsData?.correct || 0}
                color="#10b981"
              />
              <MetricCard
                title="Incorrect"
                metric={analyticsData?.incorrect || 0}
                color="#ef4444"
              />
              <MetricCard
                title="Accuracy"
                metric={analyticsData?.accuracy || 0}
                suffix="%"
                color="#f59e0b"
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerContent: {
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#64748b",
  },
  inputSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#1e293b",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
  },
  contentGrid: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 20,
  },
  leftColumn: {
    flex: 2,
    gap: 12,
  },
  rightColumn: {
    flex: 1,
    minWidth: 350,
  },
  quickStatsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  quickStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
