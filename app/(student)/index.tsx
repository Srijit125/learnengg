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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      <Text style={styles.subtitle}>Keep pushing forward!</Text>

      <View style={styles.statsGrid}>
        <StatCardMobile
          label="Total Questions"
          value={analytics.total_attempts}
          icon="albums"
          colors={["#3B82F6", "#2563EB"]}
        />
        <StatCardMobile
          label="Accuracy"
          value={`${analytics.accuracy}%`}
          icon="trending-up"
          colors={["#10B981", "#059669"]}
        />
      </View>

      <View style={styles.statsGrid}>
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
        <View style={styles.emptyStateContainer}>
          <Ionicons name="bar-chart-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyStateTitle}>No activity yet</Text>
          <Text style={styles.emptyText}>
            Start taking quizzes to populate your dashboard!
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Difficulty Breakdown</Text>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Focus Areas</Text>
            {weakConcepts.length > 0 ? (
              <View style={styles.focusList}>
                {weakConcepts.map((concept, index) => (
                  <View key={index} style={styles.focusCard}>
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.focusTitle}>{concept.chapter}</Text>
                      <Text style={styles.focusSubtitle}>
                        {concept.count} Incorrect
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No weak areas identified!</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {logs.length > 0 ? (
              <View style={styles.activityList}>
                {logs.slice(0, 5).map((log, index) => (
                  <View key={index} style={styles.activityItem}>
                    <Ionicons
                      name={log.correct ? "checkmark-circle" : "close-circle"}
                      size={20}
                      color={log.correct ? "#10B981" : "#EF4444"}
                    />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityQuestion} numberOfLines={1}>
                        {log.question}
                      </Text>
                      <Text style={styles.activityMeta}>
                        {new Date(log.timestamp).toLocaleDateString()} •{" "}
                        {log.difficulty}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No recent activity.</Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const StatCardMobile = ({ label, value, icon, colors }: any) => {
  return (
    <LinearGradient colors={colors} style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#FFF" />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </LinearGradient>
  );
};

const DistributionBarMobile = ({ label, count, total, color }: any) => {
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

export default AnalyticsMobile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8FAFC",
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 24,
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
    gap: 16,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    flexDirection: "column",
    justifyContent: "space-between",
    height: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  distLabel: {
    width: 50,
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  progressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  distCount: {
    width: 30,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },
  focusList: {
    gap: 8,
  },
  focusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
  },
  focusTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  focusSubtitle: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    fontStyle: "italic",
    textAlign: "center",
    padding: 8,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginTop: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 12,
    marginBottom: 4,
  },
  activityList: {
    gap: 0,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  activityContent: {
    flex: 1,
  },
  activityQuestion: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 11,
    color: "#64748B",
  },
});
