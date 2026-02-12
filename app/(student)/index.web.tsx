import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "../../store/auth.store";
import { getUserLogs, getUserLogsData } from "../../services/analyticsService";
import { analyticsInfo, logDataInfo } from "../../types/analyticsType";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load analytics.</Text>
      </View>
    );
  }

  const hasActivity = analytics.total_attempts > 0;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Performance Overview</Text>
            <Text style={styles.subtitle}>Track your progress and mastery</Text>
          </View>
          <TouchableOpacity
            style={styles.performanceButton}
            onPress={() => router.push("/(student)/performance")}
          >
            <Text style={styles.performanceButtonText}>
              View Detailed Insights
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
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

        {!hasActivity ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="bar-chart-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyStateTitle}>No activity yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start taking quizzes to see your analytics here!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.rowContainer}>
              <View style={[styles.section, styles.flexHalf]}>
                <Text style={styles.sectionTitle}>Difficulty Breakdown</Text>
                <View style={styles.distributionContainer}>
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

              <View style={[styles.section, styles.flexHalf]}>
                <Text style={styles.sectionTitle}>Focus Areas</Text>
                {weakConcepts.length > 0 ? (
                  <View style={styles.focusList}>
                    {weakConcepts.map((concept, index) => (
                      <FocusAreaCard
                        key={index}
                        chapter={concept.chapter}
                        count={concept.count}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>
                    Great job! No weak areas detected yet.
                  </Text>
                )}
              </View>
            </View>

            <View style={[styles.section, styles.marginTop]}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {logs.length > 0 ? (
                <View style={styles.activityList}>
                  {logs.slice(0, 5).map((log, index) => (
                    <ActivityItem key={index} log={log} />
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No recent activity.</Text>
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
    blue: { bg: "#EFF6FF", text: "#3B82F6" },
    green: { bg: "#ECFDF5", text: "#10B981" },
    teal: { bg: "#F0FDFA", text: "#14B8A6" },
    red: { bg: "#FEF2F2", text: "#EF4444" },
  };
  const theme = colorMap[color] || colorMap.blue;

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
        <Ionicons name={icon} size={24} color={theme.text} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
};

const DistributionBar = ({ label, count, total, color }: any) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.distributionRow}>
      <Text style={styles.distLabel}>{label}</Text>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${percentage}%` as any, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.distCount}>{count}</Text>
    </View>
  );
};

const FocusAreaCard = ({
  chapter,
  count,
}: {
  chapter: string;
  count: number;
}) => (
  <View style={styles.focusCard}>
    <View style={styles.focusIcon}>
      <Ionicons name="alert-circle" size={24} color="#F87171" />
    </View>
    <View>
      <Text style={styles.focusTitle}>{chapter}</Text>
      <Text style={styles.focusSubtitle}>{count} Incorrect Answers</Text>
    </View>
  </View>
);

const ActivityItem = ({ log }: { log: logDataInfo }) => (
  <View style={styles.activityItem}>
    <View
      style={[
        styles.activityIcon,
        { backgroundColor: log.correct ? "#ECFDF5" : "#FEF2F2" },
      ]}
    >
      <Ionicons
        name={log.correct ? "checkmark" : "close"}
        size={16}
        color={log.correct ? "#10B981" : "#EF4444"}
      />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityQuestion} numberOfLines={1}>
        {log.question}
      </Text>
      <Text style={styles.activityMeta}>
        {new Date(log.timestamp).toLocaleDateString()} •{" "}
        <Text style={{ textTransform: "capitalize" }}>{log.difficulty}</Text>
      </Text>
    </View>
  </View>
);

export default AnalyticsDashboard;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    // alignItems: "center",
  },
  container: {
    width: "100%",
    // maxWidth: 1000,
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  performanceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  performanceButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 48,
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#FFF",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#FFF",
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 24,
  },
  distributionContainer: {
    gap: 20,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  distLabel: {
    width: 60,
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  progressBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
  distCount: {
    width: 40,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  rowContainer: {
    flexDirection: "row",
    gap: 24,
    flexWrap: "wrap",
  },
  flexHalf: {
    flex: 1,
    minWidth: 300,
  },
  marginTop: {
    marginTop: 24,
  },
  focusList: {
    gap: 12,
  },
  focusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
  },
  focusIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#FFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  focusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
  },
  focusSubtitle: {
    fontSize: 12,
    color: "#B91C1C",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    fontStyle: "italic",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    backgroundColor: "#FFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  activityList: {
    gap: 0,
  },
  activityItem: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  activityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityQuestion: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 12,
    color: "#64748B",
  },
});
