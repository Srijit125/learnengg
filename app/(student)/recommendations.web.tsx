import ReviewModal, { QuizResult } from "@/components/Quiz/ReviewModal";
import CPIGauge from "@/components/Dashboard/Charts/CPIGauge";
import DonutChart from "@/components/Dashboard/Charts/DonutChart";
import { Course } from "@/models/Course";
import {
  Recommendation,
  RecommendationPayload,
} from "@/models/Recommendations";
import { getUserLogsData, getUserCPI, getUserCoreMetrics } from "@/services/analyticsService";
import { fetchCourseStructure, listCourses } from "@/services/course.service";
import {
  getAIRecommendations,
  getPersonalizedPlan,
  recommendWeakTopics,
} from "@/services/recommendation.service";
import { useAuthStore } from "@/store/auth.store";
import { logDataInfo } from "@/types/analyticsType";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

type TabType = "overview" | "weak_topics" | "personalized_plan" | "attempted_quizzes";

const StudentRecommendationsPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [recommendationData, setRecommendationData] =
    useState<Recommendation | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [weakTopicsExtra, setWeakTopicsExtra] = useState<any>(null);
  const [personalizedPlan, setPersonalizedPlan] = useState<any>(null);
  const [courseStructure, setCourseStructure] = useState<any>(null);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingTabData, setLoadingTabData] = useState(false);

  // Attempted Quizzes State
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedQuizResults, setSelectedQuizResults] = useState<QuizResult[]>([]);
  const [currentQuizId, setCurrentQuizId] = useState<string>("");
  const [selectedQuizStats, setSelectedQuizStats] = useState({
    highestStreak: 0,
  });

  // Overall Stats State
  const [cpi, setCpi] = useState<number | null>(null);
  const [coreMetrics, setCoreMetrics] = useState<any>(null);
  const [overallLogs, setOverallLogs] = useState<any[]>([]);
  const [loadingOverall, setLoadingOverall] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoadingCourses(true);
      setLoadingOverall(true);
      
      const coursesData = await listCourses();
      setCourses(coursesData);

      if (user?.id) {
        const [cpiData, metricsData, logsData] = await Promise.all([
          getUserCPI(user.id),
          getUserCoreMetrics(user.id),
          getUserLogsData(user.id)
        ]);
        setCpi(cpiData);
        setCoreMetrics(metricsData);
        setOverallLogs(logsData);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoadingCourses(false);
      setLoadingOverall(false);
    }
  };

  const handleCourseSelect = async (courseId: string) => {
    if (selectedCourseId === courseId) return;
    setSelectedCourseId(courseId);
    setActiveTab("overview");
    setRecommendationData(null);
    setWeakTopicsExtra(null);
    setPersonalizedPlan(null);
    setCourseStructure(null);

    if (!user?.id) return;

    try {
      setLoadingRecommendations(true);
      const data = await getAIRecommendations(user.id, courseId);
      setRecommendationData(data);
    } catch (error) {
      console.error("Error loading recommendations:", error);
      setRecommendationData(null);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchTabData = async (tab: TabType) => {
    if (!user?.id || !selectedCourseId || !recommendationData) return;

    const payload: RecommendationPayload = {
      course_id: selectedCourseId,
      user_id: user.id,
      weak_topics: recommendationData.weak_topics || [],
    };
    console.log(payload);
    setLoadingTabData(true);
    try {
      let currentStructure = courseStructure;
      if (!currentStructure) {
        currentStructure = await fetchCourseStructure(selectedCourseId);
        setCourseStructure(currentStructure);
      }

      if (tab === "weak_topics" && !weakTopicsExtra) {
        const data = await recommendWeakTopics(user.id, payload);
        setWeakTopicsExtra(data);
      } else if (tab === "personalized_plan" && !personalizedPlan) {
        const data = await getPersonalizedPlan(user.id, payload);
        setPersonalizedPlan(data);
      } else if (tab === "attempted_quizzes") {
        const logs = await getUserLogsData(user.id);
        const courseLogs = logs.filter(l => l.course_id === selectedCourseId || !l.course_id); // Fallback for legacy logs

        // Group by quiz_id
        const grouped: Record<string, logDataInfo[]> = {};
        courseLogs.forEach(log => {
          const qId = log.quiz_id || 'legacy-session';
          if (!grouped[qId]) grouped[qId] = [];
          grouped[qId].push(log);
        });

        const history = Object.entries(grouped).map(([quiz_id, attempts]) => {
          const correctCount = attempts.filter(a => a.correct).length;
          const accuracy = Math.round((correctCount / attempts.length) * 100);
          const timestamp = attempts[0].timestamp;

          return {
            quiz_id,
            timestamp,
            totalQuestions: attempts.length,
            correctCount,
            accuracy,
            attempts: attempts // Keep for review
          };
        }).filter(h => h.totalQuestions > 0).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setQuizHistory(history);
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
    } finally {
      setLoadingTabData(false);
    }
  };

  const handleReviewQuiz = (quiz: any) => {
    const results: QuizResult[] = quiz.attempts.map((a: logDataInfo) => ({
      question: a.question_data || {
        KnowledgeId: a.knowledgeId,
        Question: a.question,
        Options: [], // Fallback if no options are saved in logs
        AnswerIndex: a.user_answer, // Fallback
        Difficulty: a.difficulty === "easy" ? "Easy" : a.difficulty === "medium" ? "Medium" : "Hard",
        Reference: a.reference,
        Validated: true
      },
      selectedIndex: a.user_answer,
      isCorrect: a.correct,
      timeTaken: 0,
    }));

    setSelectedQuizResults(results);
    setCurrentQuizId(quiz.quiz_id);
    setSelectedQuizStats({
      highestStreak: 0, // Could be calculated if needed
    });
    setIsReviewModalVisible(true);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== "overview") {
      fetchTabData(tab);
    }
  };

  const renderStrongTopics = (topics: string[] | Record<string, string>) => {
    if (!topics) return null;
    if (Array.isArray(topics)) {
      return topics.map((topic, index) => (
        <View key={index} className="flex-row items-center gap-1.5 bg-success/10 dark:bg-success/20 px-3 py-2 rounded-xl border border-success/20">
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={14}
            color={isDark ? "#34d399" : "#15803d"}
          />
          <Text className="text-[13px] font-semibold text-success-dark dark:text-success-light">{topic}</Text>
        </View>
      ));
    }
    return Object.entries(topics).map(([key, value]) => (
      <View key={key} className="flex-row items-center gap-1.5 bg-success/10 dark:bg-success/20 px-3 py-2 rounded-xl border border-success/20">
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={14}
          color={isDark ? "#34d399" : "#15803d"}
        />
        <Text className="text-[13px] font-semibold text-success-dark dark:text-success-light">{value}</Text>
      </View>
    ));
  };

  const renderOverview = () => {
    if (!recommendationData) return null;
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mb-6">
          <Text className="text-base font-bold text-text-light dark:text-text-dark mb-3">Topics to Improve</Text>
          <View className="flex-row flex-wrap gap-2.5">
            {recommendationData.weak_topics?.map((topic, index) => (
              <View
                key={index}
                className="flex-row items-center gap-1.5 bg-warning/10 dark:bg-warning/20 px-3 py-2 rounded-xl border border-warning/20"
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={14}
                  color={isDark ? "#fbbf24" : "#b45309"}
                />
                <Text className="text-[13px] font-semibold text-warning-dark dark:text-warning-light">
                  {topic}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-base font-bold text-text-light dark:text-text-dark mb-3">Strong Topics</Text>
          <View className="flex-row flex-wrap gap-2.5">
            {renderStrongTopics(recommendationData.strong_topics)}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-base font-bold text-text-light dark:text-text-dark mb-3">Suggested Study Path</Text>
          <View className="pl-1">
            {recommendationData.study_order?.map((topic, index) => {
              const chId = findChapterId(topic);
              const isLast =
                index === (recommendationData.study_order?.length || 0) - 1;

              return (
                <View key={index} className="flex-row gap-4">
                  <View className="items-center w-8">
                    <View className="w-8 h-8 rounded-full justify-center items-center bg-primary z-10 shadow-sm shadow-primary/30">
                      <Text className="text-white text-sm font-bold">{index + 1}</Text>
                    </View>
                    {!isLast && <View className="w-[3px] flex-1 bg-[#e2e8f0] my-1" />}
                  </View>
                  <TouchableOpacity
                    className={`flex-1 flex-row items-center justify-between bg-card-light dark:bg-card-dark rounded-xl p-4 mb-5 border ${chId ? "border-primary/20 shadow-sm" : "border-divider-light dark:border-divider-dark"
                      }`}
                    onPress={() => {
                      if (chId) {
                        router.push(
                          `/(student)/course/${selectedCourseId}?chapterId=${chId}`,
                        );
                      }
                    }}
                    disabled={!chId}
                  >
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold text-text-light dark:text-text-dark mb-1">{topic}</Text>
                      {chId && (
                        <View className="flex-row items-center bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-md self-start gap-1">
                          <MaterialCommunityIcons
                            name="book-open-variant"
                            size={12}
                            color={isDark ? "#818cf8" : "#6366f1"}
                          />
                          <Text className="text-[10px] font-bold text-primary dark:text-primary-light uppercase">
                            Course Note
                          </Text>
                        </View>
                      )}
                    </View>
                    {chId && (
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color={isDark ? "#94a3b8" : "#cbd5e1"}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  };

  const findChapterId = (chapterTitle: string) => {
    if (!courseStructure?.units) return null;
    const cleanTitle = chapterTitle.split("->")[0].trim().toLowerCase();

    for (const unit of courseStructure.units) {
      const chapter = unit.chapters?.find(
        (c: any) =>
          c.chapterTitle.toLowerCase().trim() === cleanTitle ||
          c.chapterTitle.toLowerCase().trim() ===
          chapterTitle.toLowerCase().trim(),
      );
      if (chapter) return chapter.chapterId;
    }
    return null;
  };

  const renderWeakTopicsDeepDive = () => {
    if (loadingTabData)
      return <ActivityIndicator style={{ marginTop: 40 }} color={isDark ? "#818cf8" : "#667eea"} />;
    if (!weakTopicsExtra)
      return (
        <View className="items-center py-10 gap-3">
          <Text>No extra data available.</Text>
        </View>
      );

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {Object.entries(weakTopicsExtra).map(([topicName, snippets]: any) => (
          <View key={topicName} className="bg-card-light dark:bg-card-dark rounded-2xl p-6 mb-6 border border-divider-light dark:border-divider-dark shadow-sm">
            <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-5 pb-2 border-b-2 border-primary self-start">{topicName}</Text>
            {snippets.map((snippet: any, index: number) => {
              const chId = findChapterId(snippet.chapter);
              return (
                <View key={index} className="bg-background-light dark:bg-background-dark rounded-xl p-4 mb-4 border border-border-light dark:border-border-dark">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center gap-1.5">
                      <MaterialCommunityIcons
                        name="book-open-page-variant"
                        size={16}
                        color={isDark ? "#818cf8" : "#6366f1"}
                      />
                      <Text className="text-xs font-bold text-primary dark:text-primary-light tracking-wider uppercase">
                        {snippet.chapter}
                      </Text>
                    </View>
                    {chId && (
                      <TouchableOpacity
                        className="flex-row items-center bg-primary/10 dark:bg-primary/20 px-2.5 py-1.5 rounded-lg gap-1"
                        onPress={() =>
                          router.push(
                            `/(student)/course/${selectedCourseId}?chapterId=${chId}`,
                          )
                        }
                      >
                        <Text className="text-xs font-semibold text-primary dark:text-primary-light">
                          Read Notes
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={14}
                          color={isDark ? "#818cf8" : "#6366f1"}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text className="text-[15px] font-bold text-text-light dark:text-text-dark mb-2">{snippet.section}</Text>
                  <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark leading-relaxed">{snippet.text}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderPersonalizedPlan = () => {
    if (loadingTabData)
      return <ActivityIndicator style={{ marginTop: 40 }} color={isDark ? "#818cf8" : "#667eea"} />;
    if (!personalizedPlan)
      return (
        <View className="items-center py-10 gap-3">
          <Text>Plan not generated yet.</Text>
        </View>
      );

    const planItems = Array.isArray(personalizedPlan.plan)
      ? personalizedPlan.plan
      : null;

    if (!planItems) {
      return (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-divider-light dark:border-divider-dark border-l-6 border-l-success shadow-sm">
            <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-4">Your Personalized Roadmap</Text>
            {typeof personalizedPlan === "string" ? (
              <Text className="text-[15px] text-textSecondary-light dark:text-textSecondary-dark leading-relaxed">{personalizedPlan}</Text>
            ) : (
              <Text className="text-[15px] text-textSecondary-light dark:text-textSecondary-dark leading-relaxed">
                {personalizedPlan.text ||
                  JSON.stringify(personalizedPlan, null, 2)}
              </Text>
            )}
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex-row items-center gap-3 mb-5 px-1">
          <MaterialCommunityIcons
            name="calendar-check"
            size={24}
            color={isDark ? "#34d399" : "#10b981"}
          />
          <Text className="text-xl font-bold text-text-light dark:text-text-dark">Targeted Study Plan</Text>
        </View>

        {planItems.map((item: any, idx: number) => (
          <View key={idx} className="bg-card-light dark:bg-card-dark rounded-2xl p-5 mb-5 border border-divider-light dark:border-divider-dark overflow-hidden relative shadow-sm">
            <View className="mt-2 text-left">
              <Text className="text-xs font-semibold text-textSecondary-light dark:text-textSecondary-dark tracking-wider uppercase mb-1">Main Focus:</Text>
              <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-4">{item.focus_topic}</Text>

              {item.faiss_results && item.faiss_results.length > 0 && (
                <View className="bg-background-light dark:bg-background-dark rounded-xl p-3 mb-4">
                  <Text className="text-[13px] font-semibold text-textSecondary-light dark:text-textSecondary-dark mb-2">
                    Recommended Reading:
                  </Text>
                  {item.faiss_results.map((res: string, resIdx: number) => {
                    const chId = findChapterId(res);
                    return (
                      <TouchableOpacity
                        key={resIdx}
                        className="flex-row items-center bg-card-light dark:bg-card-dark p-2.5 rounded-lg mb-2 border border-border-light dark:border-border-dark gap-2.5"
                        onPress={() => {
                          if (chId) {
                            router.push(
                              `/(student)/course/${selectedCourseId}?chapterId=${chId}`,
                            );
                          }
                        }}
                      >
                        <MaterialCommunityIcons
                          name="book-open-variant"
                          size={16}
                          color={isDark ? "#818cf8" : "#6366f1"}
                        />
                        <Text className="flex-1 text-[13px] text-primary dark:text-primary-light font-medium" numberOfLines={1}>
                          {res}
                        </Text>
                        {chId && (
                          <MaterialCommunityIcons
                            name="chevron-right"
                            size={14}
                            color={isDark ? "#94a3b8" : "#cbd5e1"}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <View className="gap-2.5">
                <View className="flex-row items-center gap-2.5">
                  <MaterialCommunityIcons
                    name="checkbox-blank-circle-outline"
                    size={14}
                    color="#94a3b8"
                  />
                  <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark">Solve 5 practice MCQs</Text>
                </View>
                <View className="flex-row items-center gap-2.5">
                  <MaterialCommunityIcons
                    name="checkbox-blank-circle-outline"
                    size={14}
                    color="#94a3b8"
                  />
                  <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
                    Review previous errors
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        <View className="flex-row items-center bg-warning/10 dark:bg-warning/20 p-4 rounded-xl border border-warning/20 gap-3 mt-2 mb-6">
          <MaterialCommunityIcons
            name="lightbulb-on"
            size={20}
            color={isDark ? "#fbbf24" : "#f59e0b"}
          />
          <Text className="flex-1 text-[13px] text-warning-dark dark:text-warning-light leading-relaxed font-medium">
            Tip: Attempt an adaptive quiz after completing this 3-day plan!
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderAttemptedQuizzes = () => {
    if (loadingTabData)
      return <ActivityIndicator style={{ marginTop: 40 }} color={isDark ? "#818cf8" : "#667eea"} />;

    if (quizHistory.length === 0) {
      return (
        <View className="items-center py-10 gap-3">
          <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#cbd5e1" />
          <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark font-medium">
            No quizzes attempted for this course yet.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="gap-4">
          {quizHistory.map((quiz, index) => (
            <View
              key={quiz.quiz_id}
              className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-divider-light dark:border-divider-dark shadow-sm flex-row justify-between items-center"
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <MaterialCommunityIcons name="calendar" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
                  <Text className="text-sm font-bold text-text-light dark:text-text-dark">
                    {new Date(quiz.timestamp).toLocaleDateString()} at {new Date(quiz.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialCommunityIcons name="help-circle-outline" size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                    <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                      {quiz.totalQuestions} Questions
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={14}
                      color={quiz.accuracy >= 70 ? "#10b981" : quiz.accuracy >= 40 ? "#f59e0b" : "#ef4444"}
                    />
                    <Text className={`text-xs font-bold ${quiz.accuracy >= 70 ? "text-success" : quiz.accuracy >= 40 ? "text-warning" : "text-error"}`}>
                      {quiz.accuracy}% Accuracy
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                className="bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-xl flex-row items-center gap-2"
                onPress={() => handleReviewQuiz(quiz)}
              >
                <Text className="text-sm font-bold text-primary dark:text-primary-light">Review</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={isDark ? "#818cf8" : "#6366f1"} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderOverallDashboard = () => {
    if (loadingOverall) return null;

    const overallAccuracy = overallLogs.length > 0
      ? Math.round((overallLogs.filter(l => l.correct).length / overallLogs.length) * 100)
      : 0;

    return (
      <View className="mb-10">
        <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-4 px-1">Overall Dashboard</Text>
        
        <View className="flex-row gap-6">
          {/* Left Column: CPI Gauge */}
          <View className="flex-1">
            <CPIGauge value={cpi || 0} />
          </View>
          
          {/* Middle Column: Core Metrics */}
          <View className="flex-1 justify-between">
            <View className="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-sm border border-divider-light dark:border-divider-dark flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-success/10 dark:bg-success/20 items-center justify-center">
                  <MaterialCommunityIcons name="target-account" size={20} color={isDark ? "#34d399" : "#10b981"} />
                </View>
                <View>
                  <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-bold uppercase">Accuracy</Text>
                  <Text className="text-lg font-extrabold text-text-light dark:text-text-dark">{Math.round(coreMetrics?.accuracy || overallAccuracy)}%</Text>
                </View>
              </View>
            </View>

            <View className="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-sm border border-divider-light dark:border-divider-dark flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-warning/10 dark:bg-warning/20 items-center justify-center">
                  <MaterialCommunityIcons name="speedometer" size={20} color={isDark ? "#fbbf24" : "#f59e0b"} />
                </View>
                <View>
                  <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-bold uppercase">Speed Score</Text>
                  <Text className="text-lg font-extrabold text-text-light dark:text-text-dark">{Math.round(coreMetrics?.speed_score || 0)}</Text>
                </View>
              </View>
            </View>

            <View className="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-sm border border-divider-light dark:border-divider-dark flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 items-center justify-center">
                  <MaterialCommunityIcons name="trending-up" size={20} color={isDark ? "#818cf8" : "#6366f1"} />
                </View>
                <View>
                  <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-bold uppercase">Improvement</Text>
                  <Text className="text-lg font-extrabold text-text-light dark:text-text-dark">{Math.round(coreMetrics?.improvement || 0)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Column: Key Stats */}
          <View className="flex-1 justify-between">
            <View className="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-sm border border-divider-light dark:border-divider-dark items-center justify-center flex-1 mb-3">
              <Text className="text-3xl font-black text-primary dark:text-primary-light mb-1">{overallLogs.length}</Text>
              <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-bold uppercase text-center">Total Questions Attempted</Text>
            </View>
            
            <View className="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-sm border border-divider-light dark:border-divider-dark items-center justify-center flex-1">
               <Text className="text-3xl font-black text-success dark:text-success-light mb-1">
                 {new Set(overallLogs.map(l => new Date(l.timestamp).toDateString())).size}
               </Text>
               <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-bold uppercase text-center">Active Learning Days</Text>
            </View>
          </View>

        </View>
      </View>
    );
  };

  if (loadingCourses || loadingOverall) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#667eea"} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1">
        <View className="px-6 pt-8 pb-3 bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark min-w-full z-10">
          <Text className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">AI Recommendations</Text>
          <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">
            Personalized learning paths and performance breakdown
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
          
          {renderOverallDashboard()}
          
          <View className="bg-card-light dark:bg-card-dark rounded-3xl p-6 shadow-sm border border-divider-light dark:border-divider-dark">
            <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-4">Course Details</Text>
            <Text className="text-sm font-semibold text-textSecondary-light dark:text-textSecondary-dark mb-3">Select a Course to see deep dive recommendations</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-grow-0 mb-5"
              contentContainerStyle={{ gap: 10 }}
            >
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.course_id}
                  className={`px-5 py-2.5 rounded-full border justify-center items-center ${selectedCourseId === course.course_id
                    ? "bg-primary border-primary shadow-sm shadow-primary/30"
                    : "bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark"
                    }`}
                  onPress={() => handleCourseSelect(course.course_id)}
                >
                  <Text
                    className={`text-sm font-bold ${selectedCourseId === course.course_id
                      ? "text-white"
                      : "text-textSecondary-light dark:text-textSecondary-dark"
                      }`}
                  >
                    {course.course_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="h-[1px] bg-border-light dark:bg-border-dark mb-6" />

            {selectedCourseId && recommendationData && (
              <View className="flex-row bg-background-light dark:bg-background-dark rounded-xl p-1 mb-5 border border-border-light dark:border-border-dark">
              <TouchableOpacity
                className={`flex-[2] py-2.5 items-center rounded-lg ${activeTab === "overview" ? "bg-card-light dark:bg-card-dark shadow-sm" : ""
                  }`}
                onPress={() => handleTabChange("overview")}
              >
                <Text
                  className={`text-sm font-semibold ${activeTab === "overview" ? "text-primary dark:text-primary-light" : "text-textSecondary-light dark:text-textSecondary-dark"
                    }`}
                >
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-[2] py-2.5 items-center rounded-lg ${activeTab === "weak_topics" ? "bg-card-light dark:bg-card-dark shadow-sm" : ""
                  }`}
                onPress={() => handleTabChange("weak_topics")}
              >
                <Text
                  className={`text-sm font-semibold ${activeTab === "weak_topics" ? "text-primary dark:text-primary-light" : "text-textSecondary-light dark:text-textSecondary-dark"
                    }`}
                >
                  Weak Topics
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-[2] py-2.5 items-center rounded-lg ${activeTab === "personalized_plan" ? "bg-card-light dark:bg-card-dark shadow-sm" : ""
                  }`}
                onPress={() => handleTabChange("personalized_plan")}
              >
                <Text
                  className={`text-sm font-semibold ${activeTab === "personalized_plan" ? "text-primary dark:text-primary-light" : "text-textSecondary-light dark:text-textSecondary-dark"
                    }`}
                >
                  Suggested Plan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-[2] py-2.5 items-center rounded-lg ${activeTab === "attempted_quizzes" ? "bg-card-light dark:bg-card-dark shadow-sm" : ""
                  }`}
                onPress={() => handleTabChange("attempted_quizzes")}
              >
                <Text
                  className={`text-sm font-semibold ${activeTab === "attempted_quizzes" ? "text-primary dark:text-primary-light" : "text-textSecondary-light dark:text-textSecondary-dark"
                    }`}
                >
                  Attempted Quizzes
                </Text>
              </TouchableOpacity>
            </View>
          )}

            {loadingRecommendations ? (
              <View className="py-16 items-center">
                <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#667eea"} />
                <Text className="mt-4 text-[15px] font-medium text-textSecondary-light dark:text-textSecondary-dark">AI is analyzing your course progress...</Text>
              </View>
            ) : !selectedCourseId ? (
              <View className="py-12 items-center gap-4">
                <View className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-2">
                  <MaterialCommunityIcons name="book-open-page-variant-outline" size={40} color={isDark ? "#818cf8" : "#6366f1"} />
                </View>
                <Text className="text-lg font-bold text-text-light dark:text-text-dark">No Course Selected</Text>
                <Text className="text-[15px] text-textSecondary-light dark:text-textSecondary-dark text-center px-10">
                  Select a course above to view AI-generated weak topics, personalized study plans, and history.
                </Text>
              </View>
            ) : !recommendationData ? (
              <View className="py-12 items-center gap-4">
                <View className="w-20 h-20 rounded-full bg-warning/10 dark:bg-warning/20 items-center justify-center mb-2">
                  <MaterialCommunityIcons name="alert-circle-outline" size={40} color={isDark ? "#fbbf24" : "#f59e0b"} />
                </View>
                <Text className="text-lg font-bold text-text-light dark:text-text-dark">Not Enough Data</Text>
                <Text className="text-[15px] text-textSecondary-light dark:text-textSecondary-dark text-center px-10">
                  We need more quiz attempts in this course to generate accurate AI recommendations.
                </Text>
              </View>
            ) : (
              <View className="flex-1 mt-2">
                {activeTab === "overview" && renderOverview()}
                {activeTab === "weak_topics" && renderWeakTopicsDeepDive()}
                {activeTab === "personalized_plan" && renderPersonalizedPlan()}
                {activeTab === "attempted_quizzes" && renderAttemptedQuizzes()}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <ReviewModal
        visible={isReviewModalVisible}
        onClose={() => setIsReviewModalVisible(false)}
        quizId={currentQuizId}
        results={selectedQuizResults}
        highestStreak={selectedQuizStats.highestStreak}
      />
    </View>
  );
};

export default StudentRecommendationsPage;
