import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
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

const AnalyticsDashboard = () => {
  const router = useRouter();
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

      // Calculate Weak Concepts
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
        <Text className="text-error text-lg">Could not load analytics.</Text>
      </View>
    );
  }

  const hasActivity = analytics.total_attempts > 0;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        contentContainerStyle={{ padding: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-start mb-10 flex-wrap gap-4">
          <View>
            <Text className="text-3xl font-extrabold text-text-light dark:text-text-dark mb-2">
              Performance Overview
            </Text>
            <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark">
              Track your progress and mastery
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center bg-primary px-4 py-2.5 rounded-xl gap-2 shadow-lg shadow-primary/20"
            onPress={() => router.push("/(student)/performance")}
          >
            <Text className="text-white text-sm font-bold">
              View Detailed Insights
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-6 mb-12 flex-wrap">
          <StatCard
            label="Total Questions"
            value={analytics.total_attempts}
            icon="albums-outline"
            color="blue"
          />
          <StatCard
            label="Accuracy"
            value={`${analytics.accuracy}%`}
            icon="trending-up-outline"
            color="green"
          />
          <StatCard
            label="Correct"
            value={analytics.correct}
            icon="checkmark-circle-outline"
            color="teal"
          />
          <StatCard
            label="Incorrect"
            value={analytics.incorrect}
            icon="close-circle-outline"
            color="red"
          />
        </View>

        <View className="flex-row gap-4 mb-8 flex-wrap">
          <TouchableOpacity
            className="flex-1 min-w-[160px] p-5 rounded-3xl items-center justify-center gap-3 border border-border-light dark:border-border-dark bg-primary/10"
            onPress={() => router.push("/(student)/reports")}
          >
            <View className="w-11 h-11 rounded-full items-center justify-center bg-primary/20">
              <MaterialCommunityIcons name="file-chart" size={20} color="#6366F1" />
            </View>
            <Text className="text-sm font-bold text-text-light dark:text-text-dark">My Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 min-w-[160px] p-5 rounded-3xl items-center justify-center gap-3 border border-border-light dark:border-border-dark bg-error/10"
            onPress={() => router.push("/(student)/weaknesses")}
          >
            <View className="w-11 h-11 rounded-full items-center justify-center bg-error/20">
              <MaterialCommunityIcons name="alert-decagram" size={20} color="#EF4444" />
            </View>
            <Text className="text-sm font-bold text-text-light dark:text-text-dark">Weaknesses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 min-w-[160px] p-5 rounded-3xl items-center justify-center gap-3 border border-border-light dark:border-border-dark bg-success/10"
            onPress={() => router.push("/(student)/strengths")}
          >
            <View className="w-11 h-11 rounded-full items-center justify-center bg-success/20">
              <MaterialCommunityIcons name="shield-check" size={20} color="#10B981" />
            </View>
            <Text className="text-sm font-bold text-text-light dark:text-text-dark">Strengths</Text>
          </TouchableOpacity>
        </View>

        {!hasActivity ? (
          <View className="items-center justify-center p-12 bg-card-light dark:bg-card-dark rounded-3xl border border-border-light dark:border-border-dark">
            <Ionicons name="bar-chart-outline" size={64} className="opacity-40 text-textSecondary-light dark:text-textSecondary-dark" />
            <Text className="text-xl font-bold text-text-light dark:text-text-dark mt-4 mb-2">No activity yet</Text>
            <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark text-center">
              Start taking quizzes to see your analytics here!
            </Text>
          </View>
        ) : (
          <>
            <View className="flex-row gap-6 mb-6 flex-wrap">
              <View className="flex-1 min-w-[300px] bg-card-light dark:bg-card-dark p-8 rounded-3xl border border-border-light dark:border-border-dark">
                <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-6">Difficulty Breakdown</Text>
                <View className="gap-5">
                  <DistributionBar
                    label="Easy"
                    count={analytics.difficulty_distribution?.easy || 0}
                    total={analytics.total_attempts}
                    color="#34D399"
                  />
                  <DistributionBar
                    label="Medium"
                    count={analytics.difficulty_distribution?.medium || 0}
                    total={analytics.total_attempts}
                    color="#FBBF24"
                  />
                  <DistributionBar
                    label="Hard"
                    count={analytics.difficulty_distribution?.hard || 0}
                    total={analytics.total_attempts}
                    color="#F87171"
                  />
                </View>
              </View>

              <View className="flex-1 min-w-[300px] bg-card-light dark:bg-card-dark p-8 rounded-3xl border border-border-light dark:border-border-dark">
                <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-6">Focus Areas</Text>
                {weakConcepts.length > 0 ? (
                  <View className="gap-3">
                    {weakConcepts.map((concept, index) => (
                      <FocusAreaCard
                        key={index}
                        chapter={concept.chapter}
                        count={concept.count}
                      />
                    ))}
                  </View>
                ) : (
                  <Text className="text-sm italic text-textSecondary-light dark:text-textSecondary-dark">
                    Great job! No weak areas detected yet.
                  </Text>
                )}
              </View>
            </View>

            <View className="bg-card-light dark:bg-card-dark p-8 rounded-3xl border border-border-light dark:border-border-dark">
              <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-6">Recent Activity</Text>
              {logs.length > 0 ? (
                <View>
                  {logs.slice(0, 5).map((log, index) => (
                    <ActivityItem key={index} log={log} isLast={index === 4 || index === logs.length - 1} />
                  ))}
                </View>
              ) : (
                <Text className="text-sm italic text-textSecondary-light dark:text-textSecondary-dark">No recent activity.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const StatCard = ({ label, value, icon, color }: any) => {
  const colorMap: any = {
    blue: { bg: "bg-info/10", text: "text-info" },
    green: { bg: "bg-success/10", text: "text-success" },
    teal: { bg: "bg-primary/10", text: "text-primary" },
    red: { bg: "bg-error/10", text: "text-error" },
  };
  const theme = colorMap[color] || colorMap.blue;

  return (
    <View className="flex-1 min-w-[200px] bg-card-light dark:bg-card-dark p-6 rounded-3xl border border-border-light dark:border-border-dark flex-row items-center gap-4 shadow-sm">
      <View className={`w-12 h-12 rounded-xl justify-center items-center ${theme.bg}`}>
        <Ionicons name={icon} size={24} className={theme.text} />
      </View>
      <View>
        <Text className="text-2xl font-bold text-text-light dark:text-text-dark">{value}</Text>
        <Text className="text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark">{label}</Text>
      </View>
    </View>
  );
};

const DistributionBar = ({ label, count, total, color }: any) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <View className="flex-row items-center gap-4">
      <Text className="w-[60px] text-sm font-semibold text-textSecondary-light dark:text-textSecondary-dark">{label}</Text>
      <View className="flex-1 h-3 bg-border-light dark:bg-border-dark rounded-full overflow-hidden">
        <View
          style={{ width: `${percentage}%` as any, backgroundColor: color }}
          className="h-full rounded-full"
        />
      </View>
      <Text className="w-10 text-right text-sm font-bold text-text-light dark:text-text-dark">{count}</Text>
    </View>
  );
};

const FocusAreaCard = ({
  chapter,
  count,
}: {
  chapter: string;
  count: number;
}) => {
  return (
    <View className="flex-row items-center gap-3 p-3 rounded-xl bg-error/10">
      <View className="w-8 h-8 rounded-lg justify-center items-center bg-background-light dark:bg-background-dark">
        <Ionicons name="alert-circle" size={24} color="#EF4444" />
      </View>
      <View>
        <Text className="text-sm font-bold text-error">{chapter}</Text>
        <Text className="text-xs text-error">{count} Incorrect Answers</Text>
      </View>
    </View>
  );
};

const ActivityItem = ({ log, isLast }: { log: logDataInfo; isLast: boolean }) => {
  return (
    <View className={`flex-row gap-4 py-3 ${!isLast ? 'border-b border-border-light dark:border-border-dark' : ''}`}>
      <View
        className={`w-6 h-6 rounded-full justify-center items-center ${log.correct ? 'bg-success/10' : 'bg-error/10'}`}
      >
        <Ionicons
          name={log.correct ? "checkmark" : "close"}
          size={16}
          color={log.correct ? "#10B981" : "#EF4444"}
        />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-text-light dark:text-text-dark" numberOfLines={1}>
          {log.question}
        </Text>
        <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
          {new Date(log.timestamp).toLocaleDateString()} •{" "}
          <Text className="capitalize">{log.difficulty}</Text>
        </Text>
      </View>
    </View>
  );
};

export default AnalyticsDashboard;
