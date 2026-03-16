import { Course } from "@/models/Course";
import {
  Recommendation,
  RecommendationPayload,
} from "@/models/Recommendations";
import { fetchCourseStructure, listCourses } from "@/services/course.service";
import {
  getAIRecommendations,
  getPersonalizedPlan,
  recommendWeakTopics,
} from "@/services/recommendation.service";
import { useAuthStore } from "@/store/auth.store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TabType = "overview" | "weak_topics" | "personalized_plan";

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

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await listCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoadingCourses(false);
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
        console.log(data);
        setWeakTopicsExtra(data);
      } else if (tab === "personalized_plan" && !personalizedPlan) {
        const data = await getPersonalizedPlan(user.id, payload);
        console.log(data);
        setPersonalizedPlan(data);
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
    } finally {
      setLoadingTabData(false);
    }
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
            <View className="absolute top-0 right-0 bg-success dark:bg-success-dark px-3 py-1.5 rounded-bl-xl z-20">
              <Text className="text-white text-xs font-bold uppercase">Day {item.day}</Text>
            </View>

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

  if (loadingCourses) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#667eea"} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1">
        <View className="px-6 pt-8 pb-3 bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark min-w-full">
          <Text className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">AI Recommendations</Text>
          <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">
            Personalized learning paths and suggestions
          </Text>
        </View>

        <View className="flex-1 px-6 pt-3 pb-0">
          <Text className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">Select a Course</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-grow-0 h-12 mb-2"
            contentContainerStyle={{ gap: 12, paddingBottom: 0 }}
          >
            {courses.map((course) => (
                <TouchableOpacity
                key={course.course_id}
                className={`px-4 py-2 bg-card-light dark:bg-card-dark rounded-full border mr-2.5 h-10 justify-center items-center ${selectedCourseId === course.course_id
                    ? "bg-primary border-primary"
                    : "border-border-light dark:border-border-dark"
                  }`}
                onPress={() => handleCourseSelect(course.course_id)}
              >
                <Text
                  className={`text-sm font-semibold ${selectedCourseId === course.course_id
                      ? "text-white"
                      : "text-textSecondary-light dark:text-textSecondary-dark"
                    }`}
                >
                  {course.course_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="h-[1px] bg-[#e2e8f0] mt-0 mb-2" />

          {selectedCourseId && recommendationData && (
            <View className="flex-row bg-background-light dark:bg-background-dark rounded-xl p-1 mb-4">
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
            </View>
          )}

          {loadingRecommendations ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#667eea"} />
              <Text className="mt-3 text-textSecondary-light dark:text-textSecondary-dark">Analyzing your progress...</Text>
            </View>
          ) : !selectedCourseId ? (
            <View className="items-center py-10 gap-3">
              <MaterialCommunityIcons
                name="school-outline"
                size={48}
                color="#cbd5e1"
              />
              <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark font-medium">
                Select a course to see AI recommendations
              </Text>
            </View>
          ) : !recommendationData ? (
            <View className="items-center py-10 gap-3">
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={48}
                color="#cbd5e1"
              />
              <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark font-medium">
                No recommendations found for this course yet.
              </Text>
            </View>
          ) : (
            <View className="flex-1">
              {activeTab === "overview" && renderOverview()}
              {activeTab === "weak_topics" && renderWeakTopicsDeepDive()}
              {activeTab === "personalized_plan" && renderPersonalizedPlan()}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default StudentRecommendationsPage;
