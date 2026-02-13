import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/auth.store";
import {
  getTopicStats,
  getTopicMastery,
  getUserLogsData,
  getHierarchicalStats,
} from "@/services/analyticsService";
import TopicMasteryChart from "@/components/Dashboard/Charts/TopicMasteryChart";
import RadarChart from "@/components/Dashboard/Charts/RadarChart";
import CPIGauge from "@/components/Dashboard/Charts/CPIGauge";
import EnhancedBarChart from "@/components/Dashboard/Charts/EnhancedBarChart";
import DonutChart from "@/components/Dashboard/Charts/DonutChart";
import AccuracyTrendChart from "@/components/Dashboard/Charts/AccuracyTrendChart";
import UnitProgressChart from "@/components/Dashboard/Charts/UnitProgressChart";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const PerformancePage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [topicStats, setTopicStats] = useState<any[]>([]);
  const [masteryData, setMasteryData] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [hierarchicalStats, setHierarchicalStats] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [stats, mastery, userLogs, hStats] = await Promise.all([
        getTopicStats(user!.id),
        getTopicMastery(user!.id),
        getUserLogsData(user!.id),
        getHierarchicalStats(user!.id),
      ]);
      setTopicStats(stats);
      setMasteryData(mastery);
      setLogs(userLogs);
      setHierarchicalStats(hStats);
    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>
          Fetching your performance metrics...
        </Text>
      </View>
    );
  }

  const accuracy =
    logs.length > 0
      ? Math.round((logs.filter((l) => l.correct).length / logs.length) * 100)
      : 0;

  const radarData = Array.isArray(masteryData)
    ? masteryData.slice(0, 6).map((m) => ({
        label: m.topic.length > 15 ? m.topic.substring(0, 12) + "..." : m.topic,
        overall: m.mastery_score,
        today: Math.random() * 20 + 70, // Mocking today's data for visualization if not present
      }))
    : [];

  const weeklyActivityData = [
    { value: 12, label: "M" },
    { value: 18, label: "T" },
    { value: 15, label: "W" },
    { value: 25, label: "T" },
    { value: 20, label: "F" },
    { value: 8, label: "S" },
    { value: 5, label: "S" },
  ];

  // Process data for Accuracy Trend
  const trendData = logs
    .slice(0, 10)
    .reverse()
    .map((log, index) => ({
      value: log.correct ? 100 : 0,
      label: `Q${index + 1}`,
    }));

  // Process data for Unit Progress
  const unitColors = ["#667eea", "#764ba2", "#10b981", "#f59e0b", "#ef4444"];
  const unitProgressData = Array.isArray(hierarchicalStats)
    ? [...new Set(hierarchicalStats.map((s) => s.unit))].map((unit, index) => {
        const unitAttempts = hierarchicalStats
          .filter((s) => s.unit === unit)
          .reduce((acc, s) => acc + s.attempts, 0);
        return {
          value: unitAttempts,
          label: unit as string,
          color: unitColors[index % unitColors.length],
        };
      })
    : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Performance Dashboard</Text>
          <Text style={styles.subtitle}>
            Analyzing your learning path and mastery levels
          </Text>
        </View>
        <View style={styles.statsOverview}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{logs.length}</Text>
            <Text style={styles.statLabel}>Total Question Attempts</Text>
          </View>
          <View style={styles.donutCard}>
            <DonutChart
              percentage={accuracy}
              size={80}
              strokeWidth={10}
              centerLabel="Avg. Acc."
              centerValue={`${accuracy}%`}
            />
          </View>
        </View>
      </View>

      <View style={styles.mainGrid}>
        {/* Left Column */}
        <View style={styles.leftCol}>
          <CPIGauge value={45} />
          <View style={styles.spacer} />
          <AccuracyTrendChart data={trendData} />
          <View style={styles.spacer} />
          <RadarChart
            data={radarData}
            title="Skill Mastery Distribution"
            size={350}
          />
        </View>

        {/* Right Column */}
        <View style={styles.rightCol}>
          <UnitProgressChart data={unitProgressData} />
          <View style={styles.spacer} />
          <TopicMasteryChart data={topicStats} />

          <View style={styles.chartCard}>
            <EnhancedBarChart
              data={weeklyActivityData}
              title="Weekly Quiz Activity"
              barWidth={35}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="lightbulb-on-outline"
            size={24}
            color="#f59e0b"
          />
          <View style={styles.infoContent}>
            {/* <Text style={styles.infoTitle}>AI Recommendation</Text>
            <Text style={styles.infoText}>
              Your accuracy in "Structural Mechanics" has improved by 15% this
              week. Focus on "Fluid Dynamics" to maintain your current CPI.
            </Text> */}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PerformancePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    padding: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
  },
  statsOverview: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#667eea",
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: 2,
  },
  donutCard: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 120,
  },
  mainGrid: {
    flexDirection: "row",
    gap: 24,
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    flex: 2,
  },
  spacer: {
    height: 24,
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 24,
  },
  footer: {
    marginTop: 32,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#fffbeb",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#b45309",
    lineHeight: 20,
  },
});
