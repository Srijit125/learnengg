import AccuracyTrendChart from "@/components/Dashboard/Charts/AccuracyTrendChart";
import CPIGauge from "@/components/Dashboard/Charts/CPIGauge";
import DonutChart from "@/components/Dashboard/Charts/DonutChart";
import EnhancedBarChart from "@/components/Dashboard/Charts/EnhancedBarChart";
import RadarChart from "@/components/Dashboard/Charts/RadarChart";
import TopicMasteryChart from "@/components/Dashboard/Charts/TopicMasteryChart";
import UnitProgressChart from "@/components/Dashboard/Charts/UnitProgressChart";
import {
  getHierarchicalStats,
  getTopicMastery,
  getTopicStats,
  getUserCPI,
  getUserLogsData,
} from "@/services/analyticsService";
import { useAuthStore } from "@/store/auth.store";
import { logDataInfo } from "@/types/analyticsType";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";

const PerformancePage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [topicStats, setTopicStats] = useState<any[]>([]);
  const [masteryData, setMasteryData] = useState<any[]>([]);
  const [logs, setLogs] = useState<logDataInfo[]>([]);
  const [hierarchicalStats, setHierarchicalStats] = useState<any[]>([]);
  const [cpi, setCpi] = useState<number | null>(null);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (user?.id) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [stats, mastery, userLogs, hStats, cpi] = await Promise.all([
        getTopicStats(user!.id),
        getTopicMastery(user!.id),
        getUserLogsData(user!.id),
        getHierarchicalStats(user!.id),
        getUserCPI(user!.id),
      ]);
      setTopicStats(stats);
      setMasteryData(mastery);
      setLogs(userLogs);
      setHierarchicalStats(hStats);
      setCpi(cpi);
    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const weeklyActivityData = useMemo(() => {
    const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
    const counts = new Array(7).fill(0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDay = today.getDay();
    const mondayIndex = currentDay === 0 ? 6 : currentDay - 1;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - mondayIndex);

    logs.forEach((log) => {
      const logDate = new Date(log.timestamp);
      if (logDate >= startOfWeek) {
        const diffTime = logDate.getTime() - startOfWeek.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          counts[diffDays]++;
        }
      }
    });

    return dayLabels.map((label, index) => ({
      value: counts[index],
      label: label,
      frontColor: index === mondayIndex ? (isDark ? "#818cf8" : "#667eea") : (isDark ? "#1e293b" : "#e2e8f0"),
      gradientColor: index === mondayIndex ? (isDark ? "#6366f1" : "#764ba2") : (isDark ? "#0f172a" : "#f1f5f9"),
    }));
  }, [logs]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#667eea"} />
        <Text className="mt-4 text-textSecondary-light dark:text-textSecondary-dark text-sm font-medium">
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
      today: Math.random() * 20 + 70,
    }))
    : [];

  const trendData = logs
    .slice(0, 10)
    .reverse()
    .map((log, index) => ({
      value: log.correct ? 100 : 0,
      label: `Q${index + 1}`,
    }));

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
      className="flex-1 bg-background-light dark:bg-background-dark"
      contentContainerStyle={{ padding: 24 }}
    >
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-3xl font-extrabold text-text-light dark:text-text-dark mb-1">Performance Dashboard</Text>
          <Text className="text-[15px] text-textSecondary-light dark:text-textSecondary-dark font-medium">
            Analyzing your learning path and mastery levels
          </Text>
        </View>
        <View className="flex-row gap-4">
          <View className="bg-card-light dark:bg-card-dark px-5 py-3 rounded-xl items-center shadow-sm">
            <Text className="text-xl font-bold text-[#667eea]">{logs.length}</Text>
            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold mt-1">Total Question Attempts</Text>
          </View>
          <View className="bg-card-light dark:bg-card-dark px-4 py-2 rounded-xl items-center justify-center shadow-sm min-w-[120px]">
            <DonutChart
              percentage={accuracy}
              size={80}
              strokeWidth={10}
              centerLabel="Avg. Acc."
              centerValue={`${accuracy}%`}
              color={isDark ? "#818cf8" : "#667eea"}
            />
          </View>
        </View>
      </View>

      <View className="flex-row gap-6">
        {/* Left Column */}
        <View className="flex-1">
          <CPIGauge value={cpi!} />
          <View className="h-6" />
          <AccuracyTrendChart data={trendData} />
          <View className="h-6" />
          <RadarChart
            data={radarData}
            title="Skill Mastery Distribution"
            size={350}
          />
        </View>

        {/* Right Column */}
        <View className="flex-[2]">
          <UnitProgressChart data={unitProgressData} />
          <View className="h-6" />
          <TopicMasteryChart data={topicStats} />

          <View className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-sm mt-6">
            <EnhancedBarChart
              data={weeklyActivityData}
              title="Weekly Quiz Activity"
              barWidth={35}
            />
          </View>
        </View>
      </View>

      <View className="mt-8">
        <View className="flex-row bg-warning/10 dark:bg-warning/20 rounded-2xl p-5 items-center gap-4 border border-warning/20">
          <MaterialCommunityIcons
            name="lightbulb-on-outline"
            size={24}
            color={isDark ? "#fbbf24" : "#f59e0b"}
          />
          <View className="flex-1">
            {/* Added for structural parity although commented out originally */}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PerformancePage;
