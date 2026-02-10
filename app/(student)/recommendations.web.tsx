import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Course } from "@/models/Course";
import {
  Recommendation,
  RecommendationPayload,
} from "@/models/Recommendations";
import { listCourses, fetchCourseStructure } from "@/services/course.service";
import {
  getAIRecommendations,
  recommendWeakTopics,
  getPersonalizedPlan,
} from "@/services/recommendation.service";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type TabType = "overview" | "weak_topics" | "personalized_plan";

const StudentRecommendationsPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
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

    // Create payload from overview data
    const payload: RecommendationPayload = {
      course_id: selectedCourseId,
      user_id: user.id,
      weak_topics: recommendationData.weak_topics || [],
    };
    console.log(payload);
    setLoadingTabData(true);
    try {
      // Fetch course structure if not available (needed for mapping titles to IDs)
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
        <View key={index} style={styles.topicBadge}>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={14}
            color="#15803d"
          />
          <Text style={styles.topicText}>{topic}</Text>
        </View>
      ));
    }
    return Object.entries(topics).map(([key, value]) => (
      <View key={key} style={styles.topicBadge}>
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={14}
          color="#15803d"
        />
        <Text style={styles.topicText}>{value}</Text>
      </View>
    ));
  };

  const renderOverview = () => {
    if (!recommendationData) return null;
    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        {/* AI Summary Section */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="robot-happy-outline"
              size={24}
              color="#667eea"
            />
            <Text style={styles.cardTitle}>AI Insight</Text>
          </View>
          <Text style={styles.summaryText}>
            {recommendationData.recommendation_text}
          </Text>
        </View>

        {/* Weak Topics Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Topics to Improve</Text>
          <View style={styles.topicsGrid}>
            {recommendationData.weak_topics?.map((topic, index) => (
              <View
                key={index}
                style={[styles.topicBadge, styles.topicBadgeWarning]}
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={14}
                  color="#b45309"
                />
                <Text style={[styles.topicText, styles.topicTextWarning]}>
                  {topic}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Strong Topics Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Strong Topics</Text>
          <View style={styles.topicsGrid}>
            {renderStrongTopics(recommendationData.strong_topics)}
          </View>
        </View>

        {/* Suggested Study Path Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Suggested Study Path</Text>
          <View style={styles.roadmapContainer}>
            {recommendationData.study_order?.map((topic, index) => {
              const chId = findChapterId(topic);
              const isLast =
                index === (recommendationData.study_order?.length || 0) - 1;

              return (
                <View key={index} style={styles.roadmapStep}>
                  <View style={styles.roadmapIndicator}>
                    <View style={styles.roadmapCircle}>
                      <Text style={styles.roadmapNumber}>{index + 1}</Text>
                    </View>
                    {!isLast && <View style={styles.roadmapLine} />}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.roadmapCard,
                      chId && styles.roadmapCardInteractive,
                    ]}
                    onPress={() => {
                      if (chId) {
                        router.push(
                          `/(student)/course/${selectedCourseId}?chapterId=${chId}`,
                        );
                      }
                    }}
                    disabled={!chId}
                  >
                    <View style={styles.roadmapCardContent}>
                      <Text style={styles.roadmapTopic}>{topic}</Text>
                      {chId && (
                        <View style={styles.roadmapBadge}>
                          <MaterialCommunityIcons
                            name="book-open-variant"
                            size={12}
                            color="#6366f1"
                          />
                          <Text style={styles.roadmapBadgeText}>
                            Course Note
                          </Text>
                        </View>
                      )}
                    </View>
                    {chId && (
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color="#cbd5e1"
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
    // Handle "Chapter Title -> Section Title" format
    const cleanTitle = chapterTitle.split("->")[0].trim().toLowerCase();

    for (const unit of courseStructure.units) {
      const chapter = unit.chapters?.find(
        (c: any) =>
          c.chapterTitle.toLowerCase().trim() === cleanTitle ||
          // Fallback check if the input already contains only the title
          c.chapterTitle.toLowerCase().trim() ===
            chapterTitle.toLowerCase().trim(),
      );
      if (chapter) return chapter.chapterId;
    }
    return null;
  };

  const renderWeakTopicsDeepDive = () => {
    if (loadingTabData)
      return <ActivityIndicator style={{ marginTop: 40 }} color="#667eea" />;
    if (!weakTopicsExtra)
      return (
        <View style={styles.emptyState}>
          <Text>No extra data available.</Text>
        </View>
      );

    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        {Object.entries(weakTopicsExtra).map(([topicName, snippets]: any) => (
          <View key={topicName} style={styles.topicDeepDiveCard}>
            <Text style={styles.topicDeepDiveTitle}>{topicName}</Text>
            {snippets.map((snippet: any, index: number) => {
              const chId = findChapterId(snippet.chapter);
              return (
                <View key={index} style={styles.snippetContainer}>
                  <View style={styles.snippetHeader}>
                    <View style={styles.snippetMeta}>
                      <MaterialCommunityIcons
                        name="book-open-page-variant"
                        size={16}
                        color="#6366f1"
                      />
                      <Text style={styles.snippetChapter}>
                        {snippet.chapter}
                      </Text>
                    </View>
                    {chId && (
                      <TouchableOpacity
                        style={styles.readNotesButton}
                        onPress={() =>
                          router.push(
                            `/(student)/course/${selectedCourseId}?chapterId=${chId}`,
                          )
                        }
                      >
                        <Text style={styles.readNotesButtonText}>
                          Read Notes
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={14}
                          color="#6366f1"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.snippetSection}>{snippet.section}</Text>
                  <Text style={styles.snippetText}>{snippet.text}</Text>
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
      return <ActivityIndicator style={{ marginTop: 40 }} color="#667eea" />;
    if (!personalizedPlan)
      return (
        <View style={styles.emptyState}>
          <Text>Plan not generated yet.</Text>
        </View>
      );

    const planItems = Array.isArray(personalizedPlan.plan)
      ? personalizedPlan.plan
      : null;

    if (!planItems) {
      return (
        <ScrollView contentContainerStyle={styles.tabContent}>
          <View style={[styles.detailCard, { borderLeftColor: "#10b981" }]}>
            <Text style={styles.detailTitle}>Your Personalized Roadmap</Text>
            {typeof personalizedPlan === "string" ? (
              <Text style={styles.detailText}>{personalizedPlan}</Text>
            ) : (
              <Text style={styles.detailText}>
                {personalizedPlan.text ||
                  JSON.stringify(personalizedPlan, null, 2)}
              </Text>
            )}
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        <View style={styles.planHeader}>
          <MaterialCommunityIcons
            name="calendar-check"
            size={24}
            color="#10b981"
          />
          <Text style={styles.planHeaderTitle}>Targeted Study Plan</Text>
        </View>

        {planItems.map((item: any, idx: number) => (
          <View key={idx} style={styles.planCard}>
            <View style={styles.planDayBadge}>
              <Text style={styles.planDayText}>Day {item.day}</Text>
            </View>

            <View style={styles.planContent}>
              <Text style={styles.planFocusLabel}>Main Focus:</Text>
              <Text style={styles.planFocusTopic}>{item.focus_topic}</Text>

              {item.faiss_results && item.faiss_results.length > 0 && (
                <View style={styles.planResources}>
                  <Text style={styles.planResourcesLabel}>
                    Recommended Reading:
                  </Text>
                  {item.faiss_results.map((res: string, resIdx: number) => {
                    const chId = findChapterId(res);
                    return (
                      <TouchableOpacity
                        key={resIdx}
                        style={styles.planResourceLink}
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
                          color="#6366f1"
                        />
                        <Text style={styles.planResourceText} numberOfLines={1}>
                          {res}
                        </Text>
                        {chId && (
                          <MaterialCommunityIcons
                            name="chevron-right"
                            size={14}
                            color="#cbd5e1"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <View style={styles.planTasks}>
                <View style={styles.planTaskItem}>
                  <MaterialCommunityIcons
                    name="checkbox-blank-circle-outline"
                    size={14}
                    color="#94a3b8"
                  />
                  <Text style={styles.planTaskText}>Solve 5 practice MCQs</Text>
                </View>
                <View style={styles.planTaskItem}>
                  <MaterialCommunityIcons
                    name="checkbox-blank-circle-outline"
                    size={14}
                    color="#94a3b8"
                  />
                  <Text style={styles.planTaskText}>
                    Review previous errors
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.planFooter}>
          <MaterialCommunityIcons
            name="lightbulb-on"
            size={20}
            color="#f59e0b"
          />
          <Text style={styles.planFooterText}>
            Tip: Attempt an adaptive quiz after completing this 3-day plan!
          </Text>
        </View>
      </ScrollView>
    );
  };

  if (loadingCourses) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#f8fafc", "#f1f5f9"]} style={styles.background}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Recommendations</Text>
          <Text style={styles.subtitle}>
            Personalized learning paths and suggestions
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Select a Course</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.coursesScrollView}
            contentContainerStyle={styles.coursesList}
          >
            {courses.map((course) => (
              <TouchableOpacity
                key={course.course_id}
                style={[
                  styles.courseChip,
                  selectedCourseId === course.course_id &&
                    styles.courseChipSelected,
                ]}
                onPress={() => handleCourseSelect(course.course_id)}
              >
                <Text
                  style={[
                    styles.courseChipText,
                    selectedCourseId === course.course_id &&
                      styles.courseChipTextSelected,
                  ]}
                >
                  {course.course_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          {selectedCourseId && recommendationData && (
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "overview" && styles.activeTab,
                ]}
                onPress={() => handleTabChange("overview")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "overview" && styles.activeTabText,
                  ]}
                >
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "weak_topics" && styles.activeTab,
                ]}
                onPress={() => handleTabChange("weak_topics")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "weak_topics" && styles.activeTabText,
                  ]}
                >
                  Weak Topics
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "personalized_plan" && styles.activeTab,
                ]}
                onPress={() => handleTabChange("personalized_plan")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "personalized_plan" && styles.activeTabText,
                  ]}
                >
                  Suggested Plan
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {loadingRecommendations ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Analyzing your progress...</Text>
            </View>
          ) : !selectedCourseId ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="school-outline"
                size={48}
                color="#cbd5e1"
              />
              <Text style={styles.emptyStateText}>
                Select a course to see AI recommendations
              </Text>
            </View>
          ) : !recommendationData ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={48}
                color="#cbd5e1"
              />
              <Text style={styles.emptyStateText}>
                No recommendations found for this course yet.
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              {activeTab === "overview" && renderOverview()}
              {activeTab === "weak_topics" && renderWeakTopicsDeepDive()}
              {activeTab === "personalized_plan" && renderPersonalizedPlan()}
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default StudentRecommendationsPage;

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  content: { flex: 1, padding: 24, paddingTop: 12, paddingBottom: 0 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 0,
  },
  coursesScrollView: {
    flexGrow: 0,
    height: 48,
    marginBottom: 8,
  },
  coursesList: {
    gap: 12,
    paddingBottom: 0,
  },
  courseChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 10,
    height: 40,
    justifyContent: "center",
  },
  courseChipSelected: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  courseChipText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  courseChipTextSelected: {
    color: "#ffffff",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginTop: 0,
    marginBottom: 8,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 2,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  activeTabText: {
    color: "#667eea",
  },
  tabContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#bae6fd",
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0369a1",
  },
  summaryText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  topicsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  topicBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  topicBadgeWarning: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  topicText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#15803d",
  },
  topicTextWarning: {
    color: "#b45309",
  },
  roadmapContainer: {
    paddingLeft: 4,
  },
  roadmapStep: {
    flexDirection: "row",
    gap: 16,
  },
  roadmapIndicator: {
    alignItems: "center",
    width: 32,
  },
  roadmapCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  roadmapNumber: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  roadmapLine: {
    width: 3,
    flex: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 4,
  },
  roadmapCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roadmapCardInteractive: {
    borderColor: "#e0e7ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roadmapCardContent: {
    flex: 1,
  },
  roadmapTopic: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  roadmapBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    gap: 4,
  },
  roadmapBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6366f1",
    textTransform: "uppercase",
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderLeftWidth: 6,
    borderLeftColor: "#667eea",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  detailText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
  },
  topicDeepDiveCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  topicDeepDiveTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#667eea",
    paddingBottom: 8,
    alignSelf: "flex-start",
  },
  snippetContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  snippetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  snippetMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  snippetChapter: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  readNotesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  readNotesButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366f1",
  },
  snippetSection: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  snippetText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  planHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  planCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    position: "relative",
    overflow: "hidden",
  },
  planDayBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  planDayText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  planContent: {
    marginTop: 8,
  },
  planFocusLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  planFocusTopic: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  planResources: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  planResourcesLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  planResourceLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    gap: 10,
  },
  planResourceText: {
    flex: 1,
    fontSize: 13,
    color: "#6366f1",
    fontWeight: "500",
  },
  planTasks: {
    gap: 10,
  },
  planTaskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  planTaskText: {
    fontSize: 14,
    color: "#475569",
  },
  planFooter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fef3c7",
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  planFooterText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
    fontWeight: "500",
  },
});
