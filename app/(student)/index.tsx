import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { getUserLogs, getUserLogsData } from "../../services/analyticsService";
import { useAuthStore } from "../../store/auth.store";
import { analyticsInfo, logDataInfo } from "../../types/analyticsType";

interface WeakConcept {
  chapter: string;
  count: number;
}

const defaultAnalytics: analyticsInfo = {
  total_attempts: 0,
  correct: 0,
  incorrect: 0,
  accuracy: 0,
  timeline: [],
  difficulty_distribution: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
  difficulty_accuracy: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
};

const AnalyticsMobile = () => {
  const { user } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const [analytics, setAnalytics] = useState<analyticsInfo | null>(null);
  const [logs, setLogs] = useState<logDataInfo[]>([]);
  const [weakConcepts, setWeakConcepts] = useState<WeakConcept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics(user.id);
    }
  }, [user]);

  const loadAnalytics = async (userId: string) => {
    setLoading(true);
    try {
      const [summaryData, logsData] = await Promise.all([
        getUserLogs(userId),
        getUserLogsData(userId),
      ]);
      setAnalytics(summaryData || defaultAnalytics);
      setLogs(logsData || []);

      if (logsData) {
        const incorrectLogs = logsData.filter((l) => !l.correct);
        const counts: Record<string, number> = {};
        incorrectLogs.forEach((l) => {
          const key = l.reference?.Chapter || "General";
          counts[key] = (counts[key] || 0) + 1;
        });
        const sorted = Object.entries(counts)
          .map(([chapter, count]) => ({ chapter, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
        setWeakConcepts(sorted);
      }
    } catch (e) {
      console.error(e);
      setAnalytics(defaultAnalytics);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <Text className="text-error text-base">Could not load analytics.</Text>
      </View>
    );
  }

  const hasActivity = analytics.total_attempts > 0;

  return (
    <ScrollView className="flex-1 bg-background-light dark:bg-background-dark" contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
      <Text className="text-3xl font-extrabold text-text-light dark:text-text-dark mb-1">Your Progress</Text>
      <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark mb-6">Keep pushing forward!</Text>

      <View className="flex-row gap-4 mb-4">
        <StatCardMobile
          label="Total Questions"
          value={analytics.total_attempts}
          icon="albums"
          colors={["#6366F1", "#4F46E5"]}
        />
        <StatCardMobile
          label="Accuracy"
          value={`${analytics.accuracy}%`}
          icon="trending-up"
          colors={["#10B981", "#059669"]}
        />
      </View>

      <View className="flex-row gap-4 mb-4">
        <StatCardMobile
          label="Correct"
          value={analytics.correct}
          icon="checkmark-circle"
          colors={["#14B8A6", "#0D9488"]}
        />
        <StatCardMobile
          label="Incorrect"
          value={analytics.incorrect}
          icon="close-circle"
          colors={["#EF4444", "#DC2626"]}
        />
      </View>

      {!hasActivity ? (
        <View className="items-center justify-center p-8 bg-card-light dark:bg-card-dark rounded-3xl mt-4">
          <Ionicons name="bar-chart-outline" size={48} className="opacity-40 text-textSecondary-light dark:text-textSecondary-dark" />
          <Text className="text-lg font-bold text-text-light dark:text-text-dark mt-3 mb-1">No activity yet</Text>
          <Text className="text-sm italic text-textSecondary-light dark:text-textSecondary-dark text-center">
            Start taking quizzes to populate your dashboard!
          </Text>
        </View>
      ) : (
        <>
          <View className="bg-card-light dark:bg-card-dark p-5 rounded-3xl mt-2 shadow-sm">
            <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-4">Difficulty Breakdown</Text>
            <DistributionBarMobile
              label="Easy"
              count={analytics.difficulty_distribution?.easy || 0}
              total={analytics.total_attempts}
              color="#34D399"
            />
            <DistributionBarMobile
              label="Medium"
              count={analytics.difficulty_distribution?.medium || 0}
              total={analytics.total_attempts}
              color="#FBBF24"
            />
            <DistributionBarMobile
              label="Hard"
              count={analytics.difficulty_distribution?.hard || 0}
              total={analytics.total_attempts}
              color="#F87171"
            />
          </View>

          <View className="bg-card-light dark:bg-card-dark p-5 rounded-3xl mt-2 shadow-sm">
            <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-4">Focus Areas</Text>
            {weakConcepts.length > 0 ? (
              <View className="gap-2">
                {weakConcepts.map((concept, index) => (
                  <View key={index} className="flex-row items-center gap-3 p-3 rounded-xl bg-error/10">
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-light dark:text-text-dark">{concept.chapter}</Text>
                      <Text className="text-xs font-medium text-error">
                        {concept.count} Incorrect
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm italic text-textSecondary-light dark:text-textSecondary-dark text-center py-2">No weak areas identified!</Text>
            )}
          </View>

          <View className="bg-card-light dark:bg-card-dark p-5 rounded-3xl mt-2 shadow-sm mb-10">
            <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-4">Recent Activity</Text>
            {logs.length > 0 ? (
              <View>
                {logs.slice(0, 5).map((log, index) => (
                  <View key={index} className={`flex-row items-center gap-3 py-3 ${index !== logs.slice(0, 5).length - 1 ? 'border-b border-border-light dark:border-border-dark' : ''}`}>
                    <Ionicons
                      name={log.correct ? "checkmark-circle" : "close-circle"}
                      size={20}
                      color={log.correct ? "#10B981" : "#EF4444"}
                    />
                    <View className="flex-1">
                      <Text className="text-[13px] font-semibold text-text-light dark:text-text-dark" numberOfLines={1}>
                        {log.question}
                      </Text>
                      <Text className="text-[11px] text-textSecondary-light dark:text-textSecondary-dark">
                        {new Date(log.timestamp).toLocaleDateString()} •{" "}
                        {log.difficulty}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm italic text-textSecondary-light dark:text-textSecondary-dark text-center py-2">No recent activity.</Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const StatCardMobile = ({ label, value, icon, colors }: any) => {
  return (
    <LinearGradient colors={colors} className="flex-1 p-4 rounded-3xl flex-col justify-between h-[120px] shadow-lg shadow-black/10">
      <View className="mb-3">
        <Ionicons name={icon} size={24} color="#FFF" />
      </View>
      <View>
        <Text className="text-2xl font-bold text-white">{value}</Text>
        <Text className="text-xs font-semibold text-white/90">{label}</Text>
      </View>
    </LinearGradient>
  );
};

const DistributionBarMobile = ({ label, count, total, color }: any) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <View className="flex-row items-center gap-3 mb-3">
      <Text className="w-[50px] text-xs font-semibold text-textSecondary-light dark:text-textSecondary-dark">{label}</Text>
      <View className="flex-1 h-2.5 bg-border-light dark:bg-border-dark rounded-full overflow-hidden">
        <View
          style={{ width: `${percentage}%` as any, backgroundColor: color }}
          className="h-full rounded-full"
        />
      </View>
      <Text className="w-[30px] text-right text-xs font-bold text-text-light dark:text-text-dark">{count}</Text>
    </View>
  );
};

export default AnalyticsMobile;
