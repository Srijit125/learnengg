import { Course } from "@/models/Course";
import { logStudyActivity } from "@/services/analyticsService";
import {
  fetchCourseStructure,
  listCourses,
  searchFAISS,
} from "@/services/course.service";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SearchMode = "current" | "all";

const StudentSearch = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
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
      setResults(data.slice(0, 5));

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
      <View key={index} className="bg-card-light dark:bg-card-dark rounded-2xl p-5 mb-4 border border-border-light dark:border-border-dark shadow-sm">
        <View className="flex-row items-center gap-3 mb-3">
          <View className="bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-md">
            <Text className="text-[10px] font-bold text-primary dark:text-primary-light uppercase">{courseName}</Text>
          </View>
          <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-medium">{chapterName}</Text>
        </View>

        <Text className="text-base font-bold text-text-light dark:text-text-dark mb-2">{sectionName}</Text>
        <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark leading-relaxed mb-4" numberOfLines={3}>
          {item.text || item.metadata?.text || ""}
        </Text>

        {chId && (
          <TouchableOpacity
            className="flex-row items-center self-start bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-lg gap-1"
            onPress={() =>
              router.push(`/(student)/course/${courseId}?chapterId=${chId}`)
            }
          >
            <Text className="text-[13px] font-semibold text-primary dark:text-primary-light">Read Full Notes</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color={isDark ? "#818cf8" : "#667eea"}
            />
          </TouchableOpacity>
        )}
      </View>
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
        <View className="px-6 pt-8 pb-5 bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark">
          <Text className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">Semantic Search</Text>
          <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">
            Find topics across your courses using AI
          </Text>
        </View>

        <View className="flex-1 p-6">
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1 flex-row items-center bg-card-light dark:bg-card-dark rounded-xl border border-divider-light dark:border-divider-dark px-3">
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={isDark ? "#94a3b8" : "#64748b"}
                className="mr-2"
              />
              <TextInput
                className="flex-1 h-12 text-base text-text-light dark:text-text-dark"
                placeholder="What are you looking for?"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
              />
            </View>
            <TouchableOpacity
              className="bg-primary px-6 rounded-xl justify-center items-center h-12"
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-base font-semibold">Search</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row bg-[#e2e8f0] rounded-xl p-1 mb-5">
            <TouchableOpacity
              className={`flex-1 py-2.5 items-center rounded-lg ${searchMode === "current" ? "bg-card-light dark:bg-card-dark" : ""
                }`}
              onPress={() => setSearchMode("current")}
            >
              <Text
                className={`text-sm font-semibold ${searchMode === "current" ? "text-primary dark:text-primary-light" : "text-textSecondary-light dark:text-textSecondary-dark"
                  }`}
              >
                By Course
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2.5 items-center rounded-lg ${searchMode === "all" ? "bg-card-light dark:bg-card-dark" : ""
                }`}
              onPress={() => setSearchMode("all")}
            >
              <Text
                className={`text-sm font-semibold ${searchMode === "all" ? "text-primary dark:text-primary-light" : "text-textSecondary-light dark:text-textSecondary-dark"
                  }`}
              >
                All Courses
              </Text>
            </TouchableOpacity>
          </View>

          {searchMode === "current" && (
            <View className="mb-6">
              <Text className="text-sm font-bold text-textSecondary-light dark:text-textSecondary-dark mb-3">Select Course</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course.course_id}
                    className={`px-4 py-2 bg-card-light dark:bg-card-dark rounded-full border ${selectedCourseId === course.course_id
                        ? "bg-primary border-primary"
                        : "border-border-light dark:border-border-dark"
                      }`}
                    onPress={() => setSelectedCourseId(course.course_id)}
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
            </View>
          )}

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {results.length > 0 ? (
              <>
                <Text className="text-sm font-semibold text-textSecondary-light dark:text-textSecondary-dark mb-4">
                  Top {results.length} Results
                </Text>
                {results.map((item, index) => renderResult(item, index))}
              </>
            ) : query && !loading ? (
              <View className="items-center py-14 gap-3">
                <MaterialCommunityIcons
                  name="text-search"
                  size={48}
                  color={isDark ? "#475569" : "#cbd5e1"}
                />
                <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark text-center">
                  No results found for "{query}"
                </Text>
              </View>
            ) : (
              <View className="items-center py-20 gap-5">
                <MaterialCommunityIcons
                  name="school-outline"
                  size={64}
                  color={isDark ? "#334155" : "#e2e8f0"}
                />
                <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark text-center px-10 leading-6">
                  Search for topics, concepts, or snippets from your notes.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default StudentSearch;
