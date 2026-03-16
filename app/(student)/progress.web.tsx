import UnitProgressChart from "@/components/Dashboard/Charts/UnitProgressChart";
import ProgressRing from "@/components/Dashboard/ProgressRing";
import { getHierarchicalStats, getNoteStudyAnalysis, getUserActivityLogs, getUserLogs } from "@/services/analyticsService";
import { useAuthStore } from "@/store/auth.store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProgressPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [noteAnalysis, setNoteAnalysis] = useState<any>(null);
  const [quizAnalytics, setQuizAnalytics] = useState<any>(null);
  const [hierarchicalStats, setHierarchicalStats] = useState<any[]>([]);
  const [studyActivity, setStudyActivity] = useState<any[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notes, quiz, hStats, activity] = await Promise.all([
        getNoteStudyAnalysis(user!.id),
        getUserLogs(user!.id),
        getHierarchicalStats(user!.id),
        getUserActivityLogs(user!.id),
      ]);
      setNoteAnalysis(notes);
      setQuizAnalytics(quiz);
      setHierarchicalStats(hStats);
      setStudyActivity(activity);
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
      <View className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#6366f1"} />
        <Text className="mt-4 text-textSecondary-light dark:text-textSecondary-dark text-base font-medium">Analyzing your journey...</Text>
      </View>
    );
  }

  const overallCompletion = noteAnalysis?.overall_completion || 0;
  const quizAccuracy = quizAnalytics?.accuracy || 0;

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
      className="flex-1 bg-background-light dark:bg-background-dark"
      contentContainerStyle={{ padding: 32 }}
    >
      <View className="mb-8">
        <View>
          <Text className="text-3xl font-extrabold text-text-light dark:text-text-dark mb-1">Learning Progress</Text>
          <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark font-medium">
            Insights into your study habits and material completion
          </Text>
        </View>
      </View>

      <View className="flex-row gap-6 mb-8">
        <View className="flex-1 bg-card-light dark:bg-card-dark rounded-3xl p-6 flex-row items-center gap-8 shadow-sm">
          <ProgressRing
            percentage={overallCompletion}
            size={160}
            strokeWidth={15}
            label="Notes Studied"
            color={isDark ? "#818cf8" : "#6366f1"}
          />
          <View className="flex-1">
            <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-semibold">You have completed</Text>
            <Text className="text-4xl font-extrabold text-text-light dark:text-text-dark my-1">{overallCompletion}%</Text>
            <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">of the entire curriculum</Text>
          </View>
        </View>

        <View className="flex-1 bg-card-light dark:bg-card-dark rounded-3xl p-6 flex-row items-center gap-8 shadow-sm">
          <ProgressRing
            percentage={quizAccuracy}
            size={160}
            strokeWidth={15}
            label="Quiz Accuracy"
            color={isDark ? "#34d399" : "#10b981"}
          />
          <View className="flex-1">
            <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-semibold">Your average accuracy</Text>
            <Text className="text-4xl font-extrabold text-text-light dark:text-text-dark my-1">{quizAccuracy}%</Text>
            <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">in recent quizzes</Text>
          </View>
        </View>
      </View>

      <View className="flex-row gap-6">
        <View className="flex-[1.5] gap-6">
          <View className="bg-card-light dark:bg-card-dark rounded-3xl p-6 shadow-sm">
            <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-5">Curriculum Completion</Text>
            {noteAnalysis?.hierarchy?.length > 0 ? (
              noteAnalysis.hierarchy.map((course: any) => (
                <View key={course.courseId} className="mb-4 bg-background-light dark:bg-background-dark rounded-2xl overflow-hidden border border-divider-light dark:border-divider-dark">
                  <TouchableOpacity
                    onPress={() => toggleCourse(course.courseId)}
                    className="flex-row justify-between items-center p-4 bg-card-light dark:bg-card-dark"
                  >
                    <View className="flex-row items-center gap-2 flex-1">
                      <MaterialCommunityIcons
                        name={
                          expandedCourses.includes(course.courseId)
                            ? "chevron-down"
                            : "chevron-right"
                        }
                        size={24}
                        color={isDark ? "#94a3b8" : "#64748b"}
                      />
                      <Text className="text-base font-bold text-text-light dark:text-text-dark">{course.courseName}</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <Text className="text-[15px] font-extrabold text-primary dark:text-primary-light">
                        {course.progress}%
                      </Text>
                      <View className="w-[60px] h-1.5 bg-border-light dark:bg-border-dark rounded overflow-hidden">
                        <View
                          className="h-full bg-primary"
                          style={{ width: `${course.progress}%` }}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {expandedCourses.includes(course.courseId) && (
                    <View className="p-2 bg-background-light dark:bg-background-dark">
                      {course.units.map((unit: any) => (
                        <View key={unit.unitId} className="mb-2 bg-card-light dark:bg-card-dark rounded-xl overflow-hidden">
                          <TouchableOpacity
                            onPress={() => toggleUnit(unit.unitId)}
                            className="flex-row justify-between items-center p-3"
                          >
                            <View className="flex-row items-center gap-2">
                              <MaterialCommunityIcons
                                name={
                                  expandedUnits.includes(unit.unitId)
                                    ? "minus"
                                    : "plus"
                                }
                                size={18}
                                color={isDark ? "#64748b" : "#94a3b8"}
                              />
                              <Text className="text-sm font-semibold text-textSecondary-light dark:text-textSecondary-dark">
                                {unit.unitTitle}
                              </Text>
                            </View>
                            <Text className="text-[13px] font-bold text-primary dark:text-primary-light">
                                {unit.progress}%
                              </Text>
                          </TouchableOpacity>

                          {expandedUnits.includes(unit.unitId) && (
                            <View className="px-3 pb-3 gap-2">
                              {unit.chapters.map((chapter: any) => (
                                <View
                                  key={chapter.chapterId}
                                  className="flex-row justify-between items-center py-2 border-t border-border-light dark:border-border-dark"
                                >
                                  <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark flex-1">
                                    {chapter.chapterTitle}
                                  </Text>
                                  <View className="flex-row items-center gap-2 w-[100px] justify-end">
                                    <View className="flex-1 h-1 bg-border-light dark:bg-border-dark rounded overflow-hidden">
                                      <View
                                        className="h-full bg-success"
                                        style={{ width: `${chapter.progress}%` }}
                                      />
                                    </View>
                                    <Text className="text-[11px] font-semibold text-textSecondary-light dark:text-textSecondary-dark w-[30px] text-right">
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
              <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark italic text-center my-5">
                No curriculum data available.
              </Text>
            )}
          </View>

          <View className="bg-card-light dark:bg-card-dark rounded-3xl p-6 shadow-sm">
            <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-5">Recent Activity</Text>
            {studyActivity?.length > 0 ? (
              [...studyActivity]
                .reverse()
                .slice(0, 5)
                .map((activity: any, index: number) => {
                  const getEventLabel = (type: string) => {
                    switch (type) {
                      case "chapter_opened":
                        return "Started reading";
                      case "chapter_closed":
                        return "Finished reading";
                      case "search_performed":
                        return "Searched for context";
                      case "quiz_started":
                        return "Started a quiz";
                      case "quiz_finished":
                        return "Completed a quiz";
                      case "course_completed":
                        return "Course Completed!";
                      default:
                        return type.replace("_", " ");
                    }
                  };

                  const getEventIcon = (type: string) => {
                    switch (type) {
                      case "search_performed":
                        return "magnify";
                      case "quiz_started":
                      case "quiz_finished":
                        return "help-circle-outline";
                      case "course_completed":
                        return "trophy-outline";
                      default:
                        return "book-open-outline";
                    }
                  };

                  return (
                    <View key={index} className="flex-row items-center gap-4 py-3 border-b border-border-light dark:border-border-dark">
                      <View
                        className="w-10 h-10 rounded-xl justify-center items-center"
                        style={{
                          backgroundColor:
                            activity.event_type === "course_completed"
                              ? (isDark ? "#451a03" : "#fef3c7")
                              : (isDark ? "#1e1b4b" : "#f0f4ff"),
                        }}
                      >
                        <MaterialCommunityIcons
                          name={getEventIcon(activity.event_type)}
                          size={20}
                          color={
                            activity.event_type === "course_completed"
                              ? (isDark ? "#f59e0b" : "#d97706")
                              : (isDark ? "#818cf8" : "#6366f1")
                          }
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[15px] font-semibold text-text-light dark:text-text-dark mb-0.5">
                          {getEventLabel(activity.event_type)}:{" "}
                          {activity.metadata?.query ||
                            activity.chapter_id ||
                            activity.course_id ||
                            "Study Session"}
                        </Text>
                        <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark">
                          {activity.metadata?.results_count !== undefined
                            ? `${activity.metadata.results_count} results found • `
                            : ""}
                          {activity.metadata?.score !== undefined
                            ? `Score: ${activity.metadata.score}/${activity.metadata.max_questions} • `
                            : ""}
                          {new Date(activity.timestamp).toLocaleDateString()} at{" "}
                          {new Date(activity.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>
                  );
                })
            ) : (
              <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark italic text-center my-5">No recent activity.</Text>
            )}
          </View>
        </View>

        <View className="flex-1 gap-6">
          <UnitProgressChart data={unitProgressData} />

          <View className="rounded-3xl overflow-hidden">
            <LinearGradient
              colors={["#6366f1", "#4f46e5"]}
              className="p-6 flex-row gap-4 items-start flex-wrap"
            >
              <MaterialCommunityIcons
                name="lightbulb-on"
                size={24}
                color="#ffffff"
              />
              <View className="flex-1">
                <Text className="text-lg font-bold text-white mb-1">Learning Tip</Text>
                <Text className="text-sm text-white/90 leading-5">
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
