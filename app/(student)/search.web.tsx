import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Course } from "@/models/Course";
import { logStudyActivity } from "@/services/analyticsService";
import { useAuthStore } from "@/store/auth.store";
import {
  listCourses,
  fetchCourseStructure,
  searchFAISS,
} from "@/services/course.service";

type SearchMode = "current" | "all";

const StudentSearch = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>("current");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseStructures, setCourseStructures] = useState<Record<string, any>>(
    {},
  );

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await listCourses();
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourseId(data[0].course_id);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const courseId = searchMode === "current" ? selectedCourseId : null;
      const data = await searchFAISS(query, courseId);
      // Backend returns top-K results, we take top 5 as requested
      setResults(data.slice(0, 5));

      // Pre-fetch course structure for results if not already available
      // This is needed for navigation links
      const missingCourseIds = Array.from(
        new Set(data.map((r: any) => r.course_id || selectedCourseId)),
      ).filter((id) => id && !courseStructures[id as string]);

      for (const id of missingCourseIds) {
        try {
          const struct = await fetchCourseStructure(id as string);
          setCourseStructures((prev) => ({ ...prev, [id as string]: struct }));
        } catch (err) {
          console.error(`Failed to fetch structure for ${id}:`, err);
        }
      }

      // Log search activity
      if (user?.id) {
        logStudyActivity({
          user_id: user.id,
          event_type: "search_performed",
          metadata: {
            query: query,
            mode: searchMode,
            course_id: searchMode === "current" ? selectedCourseId : "all",
            results_count: data.length,
          },
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const findChapterId = (courseId: string, chapterTitle: string) => {
    if (!chapterTitle) return null;
    const struct = courseStructures[courseId];
    if (!struct?.units) return null;

    const cleanTitle = chapterTitle.split("->")[0].trim().toLowerCase();
    for (const unit of struct.units) {
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

  const renderResult = (item: any, index: number) => {
    const courseId =
      item.course_id || item.metadata?.course_id || selectedCourseId;
    const courseName =
      item.course_name ||
      courses.find((c) => c.course_id === courseId)?.course_name ||
      "Unknown Course";

    const chapterName = item.chapter || item.metadata?.chapter || "General";
    const sectionName =
      item.section || item.metadata?.section || item.topic || "Snippet";
    const chId = findChapterId(courseId, chapterName);

    return (
      <View key={index} style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>{courseName}</Text>
          </View>
          <Text style={styles.chapterText}>{chapterName}</Text>
        </View>

        <Text style={styles.sectionText}>{sectionName}</Text>
        <Text style={styles.snippetText} numberOfLines={3}>
          {item.text || item.metadata?.text || ""}
        </Text>

        {chId && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() =>
              router.push(`/(student)/course/${courseId}?chapterId=${chId}`)
            }
          >
            <Text style={styles.linkButtonText}>Read Full Notes</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#667eea"
            />
          </TouchableOpacity>
        )}
      </View>
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
          <Text style={styles.title}>Semantic Search</Text>
          <Text style={styles.subtitle}>
            Find topics across your courses using AI
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#94a3b8"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="What are you looking for?"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
              />
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                searchMode === "current" && styles.toggleButtonActive,
              ]}
              onPress={() => setSearchMode("current")}
            >
              <Text
                style={[
                  styles.toggleText,
                  searchMode === "current" && styles.toggleTextActive,
                ]}
              >
                By Course
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                searchMode === "all" && styles.toggleButtonActive,
              ]}
              onPress={() => setSearchMode("all")}
            >
              <Text
                style={[
                  styles.toggleText,
                  searchMode === "all" && styles.toggleTextActive,
                ]}
              >
                All Courses
              </Text>
            </TouchableOpacity>
          </View>

          {searchMode === "current" && (
            <View style={styles.courseSelectContainer}>
              <Text style={styles.sectionLabel}>Select Course</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
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
                    onPress={() => setSelectedCourseId(course.course_id)}
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
            </View>
          )}

          <ScrollView
            style={styles.resultsContainer}
            contentContainerStyle={styles.resultsContent}
          >
            {results.length > 0 ? (
              <>
                <Text style={styles.resultsCount}>
                  Top {results.length} Results
                </Text>
                {results.map((item, index) => renderResult(item, index))}
              </>
            ) : query && !loading ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="text-search"
                  size={48}
                  color="#cbd5e1"
                />
                <Text style={styles.emptyStateText}>
                  No results found for "{query}"
                </Text>
              </View>
            ) : (
              <View style={styles.promoContainer}>
                <MaterialCommunityIcons
                  name="school-outline"
                  size={64}
                  color="#e2e8f0"
                />
                <Text style={styles.promoText}>
                  Search for topics, concepts, or snippets from your notes.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
};

export default StudentSearch;

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  content: { flex: 1, padding: 24 },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#1e293b",
  },
  searchButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
  },
  searchButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#ffffff",
  },
  toggleText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#667eea",
  },
  courseSelectContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 12,
  },
  coursesList: {
    gap: 10,
  },
  courseChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: 40,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  courseBadge: {
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  courseBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#667eea",
    textTransform: "uppercase",
  },
  chapterText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  sectionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  snippetText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 22,
    marginBottom: 16,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#f5f7ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  linkButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#667eea",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
  },
  promoContainer: {
    alignItems: "center",
    paddingVertical: 80,
    gap: 20,
  },
  promoText: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 24,
  },
});
