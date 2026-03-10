import HtmlRenderer from "@/components/HtmlRenderer";
import { logStudyActivity } from "@/services/analyticsService";
import {
  fetchCourseChapterNotes,
  fetchCourseStructure,
  updateNoteProgress,
} from "@/services/course.service";
import { useAuthStore } from "@/store/auth.store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CourseNotesPage() {
  const { courseId, chapterId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [structure, setStructure] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [chapterHtml, setChapterHtml] = useState<string>("");
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const { user } = useAuthStore();
  const [lastProgress, setLastProgress] = useState(0);

  useEffect(() => {
    setLastProgress(0);
  }, [selectedChapter]);

  useEffect(() => {
    if (courseId) {
      loadStructure();
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId && selectedChapter?.chapterId && user?.id) {
      loadChapterNotes(courseId as string, selectedChapter.chapterId);

      logStudyActivity({
        user_id: user.id,
        course_id: courseId as string,
        chapter_id: selectedChapter.chapterId,
        event_type: "chapter_opened",
        metadata: {
          chapter_title: selectedChapter.chapterTitle,
        },
      });

      return () => {
        logStudyActivity({
          user_id: user.id,
          course_id: courseId as string,
          chapter_id: selectedChapter.chapterId,
          event_type: "chapter_closed",
        });
      };
    }
  }, [selectedChapter, courseId, user?.id]);

  const loadStructure = async () => {
    try {
      setLoading(true);
      const data = await fetchCourseStructure(courseId as string);
      setStructure(data);

      if (chapterId) {
        let foundChapter = null;
        let unitToExpand = null;

        for (const unit of data.units || []) {
          const ch = unit.chapters?.find((c: any) => c.chapterId === chapterId);
          if (ch) {
            foundChapter = ch;
            unitToExpand = unit.unitId;
            break;
          }
        }

        if (foundChapter) {
          setSelectedChapter(foundChapter);
          setExpandedUnits(new Set([unitToExpand]));
          return;
        }
      }

      if (data.units?.length > 0 && data.units[0].chapters?.length > 0) {
        setSelectedChapter(data.units[0].chapters[0]);
        setExpandedUnits(new Set([data.units[0].unitId]));
      }
    } catch (error) {
      console.error("Error loading course structure:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChapterNotes = async (cId: string, chId: string) => {
    try {
      setLoadingNotes(true);
      const html = await fetchCourseChapterNotes(cId, chId);
      setChapterHtml(html);
    } catch (error) {
      console.error("Error loading chapter notes:", error);
      setChapterHtml(
        "<p>Error loading notes content. Please try again later.</p>",
      );
    } finally {
      setLoadingNotes(false);
    }
  };

  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const handleProgress = (progress: number) => {
    let finalProgress = Math.min(Math.max(progress, 0), 1);

    if (finalProgress >= 0.97) {
      finalProgress = 1;
    }

    if (
      (finalProgress === 1 && lastProgress < 1) ||
      finalProgress > lastProgress + 0.1 ||
      (finalProgress >= 0.95 && lastProgress < 0.95)
    ) {
      setLastProgress(finalProgress);
      if (user?.id && courseId && selectedChapter?.chapterId) {
        updateNoteProgress(
          user.id,
          courseId as string,
          selectedChapter.chapterId,
          finalProgress,
        );

        if (finalProgress === 1 && structure) {
          checkCourseCompletion();
        }
      }
    }
  };

  const checkCourseCompletion = async () => {
    if (!structure || !user?.id || !courseId) return;

    let allChaptersCompleted = true;
    for (const unit of structure.units || []) {
      for (const chapter of unit.chapters || []) {
        if (chapter.chapterId === selectedChapter.chapterId) continue;

        if (chapter.progress < 100 && chapter.progress !== 1) {
          allChaptersCompleted = false;
          break;
        }
      }
      if (!allChaptersCompleted) break;
    }

    if (allChaptersCompleted) {
      logStudyActivity({
        user_id: user.id,
        course_id: courseId as string,
        event_type: "course_completed",
        metadata: {
          course_name: structure.courseName,
        },
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: structure?.courseName,
        }}
      />
      <View className="flex-1">
        <LinearGradient
          colors={["#f8fafc", "#f1f5f9"]}
          className="flex-1"
        >
          <View className="px-6 pt-8 pb-5 bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark">
            <Text className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">
              {structure?.courseName || "Course Content"}
            </Text>
            <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">{courseId}</Text>
          </View>

          <View className="flex-1 flex-row">
            {/* Sidebar */}
            <View className="w-[300px] bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark p-4">
              <Text className="text-[11px] font-bold text-textSecondary-light dark:text-textSecondary-dark tracking-[1px] uppercase mb-4 px-2">
                Modules & Chapters
              </Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {structure?.units?.map((unit: any) => (
                  <View key={unit.unitId} className="mb-2">
                    <TouchableOpacity
                      className="flex-row items-center py-2.5 px-2 gap-2"
                      onPress={() => toggleUnit(unit.unitId)}
                    >
                      <MaterialCommunityIcons
                        name={
                          expandedUnits.has(unit.unitId)
                            ? "chevron-down"
                            : "chevron-right"
                        }
                        size={20}
                        color="#64748b"
                      />
                      <Text className="text-[13px] font-bold text-textSecondary-light dark:text-textSecondary-dark flex-1">
                        {unit.unitTitle}
                      </Text>
                    </TouchableOpacity>

                    {expandedUnits.has(unit.unitId) && (
                      <View className="ml-4 mt-1 gap-1">
                        {unit.chapters?.map((chapter: any) => {
                          const isActive = selectedChapter?.chapterId === chapter.chapterId;
                          return (
                            <TouchableOpacity
                              key={chapter.chapterId}
                              className={`flex-row items-center p-2.5 rounded-lg gap-2.5 ${isActive ? 'bg-[#f0f4ff]' : ''}`}
                              onPress={() => setSelectedChapter(chapter)}
                            >
                              <MaterialCommunityIcons
                                name="file-document-outline"
                                size={18}
                                color={isActive ? "#667eea" : "#94a3b8"}
                              />
                              <Text
                                className={`text-[13px] flex-1 ${isActive ? 'color-[#667eea] font-semibold' : 'text-textSecondary-light dark:text-textSecondary-dark font-medium'
                                  }`}
                              >
                                {chapter.chapterTitle}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Main Content Area */}
            <View className="flex-1">
              {selectedChapter ? (
                <ScrollView contentContainerStyle={{ padding: 32 }}>
                  <View className="bg-card-light dark:bg-card-dark rounded-[20px] p-8 shadow-sm shadow-black/5 align-center w-full min-h-[800px] border border-border-light dark:border-border-dark">
                    <View className="mb-6">
                      <Text className="text-xs font-bold color-[#667eea] uppercase tracking-[1px] mb-2">
                        Chapter
                      </Text>
                      <Text className="text-[32px] font-extrabold text-text-light dark:text-text-dark">
                        {selectedChapter.chapterTitle}
                      </Text>
                    </View>

                    <View className="h-[1px] bg-background-light dark:bg-background-dark mb-6" />

                    <View className="flex-1">
                      {loadingNotes ? (
                        <View className="flex-1 justify-center items-center py-[100px]">
                          <ActivityIndicator size="large" color="#667eea" />
                          <Text className="mt-4 text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">
                            Loading notes...
                          </Text>
                        </View>
                      ) : (
                        <View className="flex-1 h-[600px] rounded-xl overflow-hidden border border-border-light dark:border-border-dark">
                          <HtmlRenderer
                            html={chapterHtml}
                            onProgress={handleProgress}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </ScrollView>
              ) : (
                <View className="flex-1 justify-center items-center gap-4">
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={64}
                    color="#cbd5e1"
                  />
                  <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark font-medium">
                    Select a chapter to start learning
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}
