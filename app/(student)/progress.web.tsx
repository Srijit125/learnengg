import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/auth.store";
import { getNoteStudyAnalysis, getUserLogs } from "@/services/analyticsService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ProgressRing from "@/components/Dashboard/ProgressRing";
import UnitProgressChart from "@/components/Dashboard/Charts/UnitProgressChart";
import { getHierarchicalStats } from "@/services/analyticsService";

const ProgressPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [noteAnalysis, setNoteAnalysis] = useState<any>(null);
  const [quizAnalytics, setQuizAnalytics] = useState<any>(null);
  const [hierarchicalStats, setHierarchicalStats] = useState<any[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notes, quiz, hStats] = await Promise.all([
        getNoteStudyAnalysis(user!.id),
        getUserLogs(user!.id),
        getHierarchicalStats(user!.id),
      ]);
      setNoteAnalysis(notes);
      setQuizAnalytics(quiz);
      setHierarchicalStats(hStats);
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (id: string) => {
    setExpandedCourses((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleUnit = (id: string) => {
    setExpandedUnits((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Analyzing your journey...</Text>
      </View>
    );
  }

  const overallCompletion = noteAnalysis?.overall_completion || 0;
  const quizAccuracy = quizAnalytics?.accuracy || 0;

  // Process data for Unit Progress
  const unitColors = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
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
          <Text style={styles.title}>Learning Progress</Text>
          <Text style={styles.subtitle}>
            Insights into your study habits and material completion
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <ProgressRing
            percentage={overallCompletion}
            size={160}
            strokeWidth={15}
            label="Notes Studied"
            color="#6366f1"
          />
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryText}>You have completed</Text>
            <Text style={styles.summaryValue}>{overallCompletion}%</Text>
            <Text style={styles.summarySubtext}>of the entire curriculum</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <ProgressRing
            percentage={quizAccuracy}
            size={160}
            strokeWidth={15}
            label="Quiz Accuracy"
            color="#10b981"
          />
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryText}>Your average accuracy</Text>
            <Text style={styles.summaryValue}>{quizAccuracy}%</Text>
            <Text style={styles.summarySubtext}>in recent quizzes</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainGrid}>
        <View style={styles.leftCol}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Curriculum Completion</Text>
            {noteAnalysis?.hierarchy?.length > 0 ? (
              noteAnalysis.hierarchy.map((course: any) => (
                <View key={course.courseId} style={styles.courseItem}>
                  <TouchableOpacity
                    onPress={() => toggleCourse(course.courseId)}
                    style={styles.courseHeader}
                  >
                    <View style={styles.courseTitleRow}>
                      <MaterialCommunityIcons
                        name={
                          expandedCourses.includes(course.courseId)
                            ? "chevron-down"
                            : "chevron-right"
                        }
                        size={24}
                        color="#64748b"
                      />
                      <Text style={styles.courseName}>{course.courseName}</Text>
                    </View>
                    <View style={styles.courseHeaderRight}>
                      <Text style={styles.coursePercent}>
                        {course.progress}%
                      </Text>
                      <View style={styles.miniBarContainer}>
                        <View
                          style={[
                            styles.miniBar,
                            { width: `${course.progress}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {expandedCourses.includes(course.courseId) && (
                    <View style={styles.unitList}>
                      {course.units.map((unit: any) => (
                        <View key={unit.unitId} style={styles.unitItem}>
                          <TouchableOpacity
                            onPress={() => toggleUnit(unit.unitId)}
                            style={styles.unitHeader}
                          >
                            <View style={styles.unitTitleRow}>
                              <MaterialCommunityIcons
                                name={
                                  expandedUnits.includes(unit.unitId)
                                    ? "minus"
                                    : "plus"
                                }
                                size={18}
                                color="#94a3b8"
                              />
                              <Text style={styles.unitTitle}>
                                {unit.unitTitle}
                              </Text>
                            </View>
                            <Text style={styles.unitPercent}>
                              {unit.progress}%
                            </Text>
                          </TouchableOpacity>

                          {expandedUnits.includes(unit.unitId) && (
                            <View style={styles.chapterList}>
                              {unit.chapters.map((chapter: any) => (
                                <View
                                  key={chapter.chapterId}
                                  style={styles.chapterItem}
                                >
                                  <Text style={styles.chapterTitle}>
                                    {chapter.chapterTitle}
                                  </Text>
                                  <View style={styles.chapterProgressRow}>
                                    <View style={styles.tinyBarContainer}>
                                      <View
                                        style={[
                                          styles.tinyBar,
                                          { width: `${chapter.progress}%` },
                                        ]}
                                      />
                                    </View>
                                    <Text style={styles.chapterPercent}>
                                      {chapter.progress}%
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No curriculum data available.
              </Text>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {noteAnalysis?.recent_activity?.length > 0 ? (
              noteAnalysis.recent_activity.map(
                (activity: any, index: number) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <MaterialCommunityIcons
                        name="book-open-outline"
                        size={20}
                        color="#6366f1"
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>
                        {activity.chapter_title || activity.chapter_id}
                      </Text>
                      <Text style={styles.activityMeta}>
                        {activity.course_name} •{" "}
                        {new Date(activity.timestamp).toLocaleDateString()} •{" "}
                        {Math.round(activity.progress * 100)}% studied
                      </Text>
                    </View>
                  </View>
                ),
              )
            ) : (
              <Text style={styles.emptyText}>No recent activity.</Text>
            )}
          </View>
        </View>

        <View style={styles.rightCol}>
          <UnitProgressChart data={unitProgressData} />

          <View style={styles.infoCard}>
            <LinearGradient
              colors={["#6366f1", "#4f46e5"]}
              style={styles.tipGradient}
            >
              <MaterialCommunityIcons
                name="lightbulb-on"
                size={24}
                color="#ffffff"
              />
              <View>
                <Text style={styles.tipTitle}>Learning Tip</Text>
                <Text style={styles.tipText}>
                  Try to maintain a steady reading pace. Students who read at
                  least 2 chapters daily have 30% higher quiz accuracy.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProgressPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    padding: 32,
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
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 32,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1e293b",
    marginVertical: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
  mainGrid: {
    flexDirection: "row",
    gap: 24,
  },
  leftCol: {
    flex: 1.5,
    gap: 24,
  },
  rightCol: {
    flex: 1,
    gap: 24,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 13,
    color: "#64748b",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 20,
  },
  infoCard: {
    borderRadius: 24,
    overflow: "hidden",
  },
  tipGradient: {
    padding: 24,
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    flexWrap: "wrap",
  },
  // Hierarchical Styles
  courseItem: {
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  courseTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  courseHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  coursePercent: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6366f1",
  },
  miniBarContainer: {
    width: 60,
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  miniBar: {
    height: "100%",
    backgroundColor: "#6366f1",
  },
  unitList: {
    padding: 8,
    backgroundColor: "#f1f5f9",
  },
  unitItem: {
    marginBottom: 8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
  },
  unitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  unitTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unitTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  unitPercent: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6366f1",
  },
  chapterList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  chapterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  chapterTitle: {
    fontSize: 13,
    color: "#64748b",
    flex: 1,
  },
  chapterProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 100,
    justifyContent: "flex-end",
  },
  tinyBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 2,
    overflow: "hidden",
  },
  tinyBar: {
    height: "100%",
    backgroundColor: "#10b981",
  },
  chapterPercent: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    width: 30,
    textAlign: "right",
  },
});
