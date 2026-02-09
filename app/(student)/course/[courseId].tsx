import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  fetchCourseStructure,
  fetchCourseChapterNotes,
} from "@/services/course.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import HtmlRenderer from "@/components/HtmlRenderer";

export default function CourseNotesPage() {
  const { courseId, chapterId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [structure, setStructure] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [chapterHtml, setChapterHtml] = useState<string>("");
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId) {
      loadStructure();
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId && selectedChapter?.chapterId) {
      loadChapterNotes(courseId as string, selectedChapter.chapterId);
    }
  }, [selectedChapter]);

  const loadStructure = async () => {
    try {
      setLoading(true);
      const data = await fetchCourseStructure(courseId as string);
      setStructure(data);

      if (chapterId) {
        // Find chapter and its unit
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

      // Default: Auto-select first chapter if available
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
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
      <View style={styles.container}>
        <LinearGradient
          colors={["#f8fafc", "#f1f5f9"]}
          style={styles.background}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {structure?.courseName || "Course Content"}
            </Text>
            <Text style={styles.subtitle}>{courseId}</Text>
          </View>

          <View style={styles.content}>
            {/* Sidebar */}
            <View style={styles.sidebar}>
              <Text style={styles.sidebarTitle}>Modules & Chapters</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {structure?.units?.map((unit: any) => (
                  <View key={unit.unitId} style={styles.unitContainer}>
                    <TouchableOpacity
                      style={styles.unitHeader}
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
                      <Text style={styles.unitTitle}>{unit.unitTitle}</Text>
                    </TouchableOpacity>

                    {expandedUnits.has(unit.unitId) && (
                      <View style={styles.chapterList}>
                        {unit.chapters?.map((chapter: any) => (
                          <TouchableOpacity
                            key={chapter.chapterId}
                            style={[
                              styles.chapterItem,
                              selectedChapter?.chapterId ===
                                chapter.chapterId && styles.chapterItemActive,
                            ]}
                            onPress={() => setSelectedChapter(chapter)}
                          >
                            <MaterialCommunityIcons
                              name="file-document-outline"
                              size={18}
                              color={
                                selectedChapter?.chapterId === chapter.chapterId
                                  ? "#667eea"
                                  : "#94a3b8"
                              }
                            />
                            <Text
                              style={[
                                styles.chapterName,
                                selectedChapter?.chapterId ===
                                  chapter.chapterId && styles.chapterNameActive,
                              ]}
                            >
                              {chapter.chapterTitle}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Main Content Area */}
            <View style={styles.mainContent}>
              {selectedChapter ? (
                <ScrollView contentContainerStyle={styles.notesContainer}>
                  <View style={styles.noteCard}>
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteChapterLabel}>Chapter</Text>
                      <Text style={styles.noteTitle}>
                        {selectedChapter.chapterTitle}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.noteBody}>
                      {loadingNotes ? (
                        <View style={styles.loaderContainer}>
                          <ActivityIndicator size="large" color="#667eea" />
                          <Text style={styles.loaderText}>
                            Loading notes...
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.webviewContainer}>
                          <HtmlRenderer html={chapterHtml} />
                        </View>
                      )}
                    </View>
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={64}
                    color="#cbd5e1"
                  />
                  <Text style={styles.emptyText}>
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
  subtitle: { fontSize: 14, color: "#94a3b8", fontWeight: "500" },
  content: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 300,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#f1f5f9",
    padding: 16,
  },
  sidebarTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  unitContainer: { marginBottom: 8 },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 8,
  },
  unitTitle: { fontSize: 13, fontWeight: "700", color: "#475569", flex: 1 },
  chapterList: { marginLeft: 16, marginTop: 4, gap: 4 },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  chapterItemActive: { backgroundColor: "#f0f4ff" },
  chapterName: { fontSize: 13, color: "#64748b", fontWeight: "500", flex: 1 },
  chapterNameActive: { color: "#667eea", fontWeight: "600" },
  mainContent: { flex: 1 },
  notesContainer: { padding: 32 },
  noteCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    // maxWidth: 900,
    alignSelf: "center",
    width: "100%",
    minHeight: 800,
  },
  noteHeader: { marginBottom: 24 },
  noteChapterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#667eea",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  noteTitle: { fontSize: 32, fontWeight: "800", color: "#1e293b" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginBottom: 24 },
  noteBody: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  webviewContainer: {
    flex: 1,
    height: 600,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: { fontSize: 16, color: "#94a3b8", fontWeight: "500" },
});
