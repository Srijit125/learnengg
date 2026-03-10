import XMLEditor from "@/components/XMLEditor";
import { Course } from "@/models/Course";
import { getCourseSummary, listCourses } from "@/services/course.service";
import {
  fetchCourseXML,
  saveCourseXML,
  validateXML,
} from "@/services/xml.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type Tab = "summary" | "xml";

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("summary");

  const [summary, setSummary] = useState<any>(null);
  const [xmlContent, setXmlContent] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseData(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await listCourses();
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourseId(data[0].course_id);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async (courseId: string) => {
    try {
      setFetchingData(true);
      const [summaryData, xmlData] = await Promise.all([
        getCourseSummary(courseId),
        fetchCourseXML(courseId),
      ]);
      setSummary(summaryData);
      setXmlContent(xmlData);
    } catch (error) {
      console.error("Error loading course data:", error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSaveXML = async () => {
    if (!selectedCourseId) return;
    try {
      setSaving(true);
      await saveCourseXML(selectedCourseId, xmlContent);
      alert("Success: XML saved successfully.");
    } catch (error) {
      console.error("Error saving XML:", error);
      alert("Error: Failed to save XML.");
    } finally {
      setSaving(false);
    }
  };

  const handleValidateXML = async () => {
    try {
      setValidating(true);
      const result = await validateXML(xmlContent);
      if (result.valid) {
        alert("Validation Success: XML is valid.");
      } else {
        alert(
          `Validation Error: ${result.message || "Invalid XML structure."}`,
        );
      }
    } catch (error) {
      console.error("Error validating XML:", error);
      alert("Error: Validation service unavailable.");
    } finally {
      setValidating(false);
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
    <View className="flex-1">
      <LinearGradient colors={["#f8fafc", "#f1f5f9"]} className="flex-1">
        <View className="px-6 pt-8 pb-5 bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark">
          <Text className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">Course Management</Text>
          <Text className="text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark">
            Configure course metadata and content
          </Text>
        </View>

        <View className="flex-1 flex-row">
          {/* Sidebar */}
          <View className="w-[260px] bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark p-4">
            <Text className="text-[11px] font-bold text-textSecondary-light dark:text-textSecondary-dark tracking-[1px] uppercase mb-4 px-2">Available Courses</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {courses.map((course) => {
                const isActive = selectedCourseId === course.course_id;
                return (
                  <TouchableOpacity
                    key={course.course_id}
                    className={`flex-row items-center p-3 rounded-lg gap-3 mb-1 ${isActive ? "bg-[#f0f4ff]" : ""}`}
                    onPress={() => setSelectedCourseId(course.course_id)}
                  >
                    <MaterialCommunityIcons
                      name="book-open-outline"
                      size={20}
                      color={
                        isActive ? "#667eea" : "#64748b"
                      }
                    />
                    <Text
                      className={`text-sm flex-1 ${isActive ? "color-[#667eea] font-semibold" : "text-textSecondary-light dark:text-textSecondary-dark font-medium"}`}
                    >
                      {course.course_name || course.course_id}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Main Area */}
          <View className="flex-1">
            {fetchingData ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#667eea" />
              </View>
            ) : selectedCourseId ? (
              <View className="flex-1">
                {/* Tabs */}
                <View className="flex-row px-6 bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark">
                  <TouchableOpacity
                    className={`flex-row items-center py-3.5 px-4 gap-2 border-b-2 ${activeTab === "summary" ? "border-[#667eea]" : "border-transparent"}`}
                    onPress={() => setActiveTab("summary")}
                  >
                    <MaterialCommunityIcons
                      name="text-box-outline"
                      size={18}
                      color={activeTab === "summary" ? "#667eea" : "#64748b"}
                    />
                    <Text
                      className={`text-sm font-semibold ${activeTab === "summary" ? "color-[#667eea]" : "text-textSecondary-light dark:text-textSecondary-dark"}`}
                    >
                      Summary
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-row items-center py-3.5 px-4 gap-2 border-b-2 ${activeTab === "xml" ? "border-[#667eea]" : "border-transparent"}`}
                    onPress={() => setActiveTab("xml")}
                  >
                    <MaterialCommunityIcons
                      name="xml"
                      size={18}
                      color={activeTab === "xml" ? "#667eea" : "#64748b"}
                    />
                    <Text
                      className={`text-sm font-semibold ${activeTab === "xml" ? "color-[#667eea]" : "text-textSecondary-light dark:text-textSecondary-dark"}`}
                    >
                      XML Editor
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <View className="flex-1">
                  {activeTab === "summary" ? (
                    <ScrollView contentContainerStyle={{ padding: 24 }}>
                      <View className="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-md shadow-[#000]/5 border border-divider-light dark:border-divider-dark">
                        <Text className="text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px] mb-2">Course ID</Text>
                        <Text className="text-base text-text-light dark:text-text-dark leading-6 mb-5">
                          {selectedCourseId}
                        </Text>

                        <View className="h-[1px] bg-background-light dark:bg-background-dark mb-5" />

                        <Text className="text-xs font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-[1px] mb-2">Course Name</Text>
                        <Text className="text-base text-text-light dark:text-text-dark leading-6 mb-5">
                          {summary?.course_name || "No description available."}
                        </Text>

                        <View className="h-[1px] bg-background-light dark:bg-background-dark mb-5" />

                        <View className="flex-row gap-8 flex-wrap">
                          <View className="flex-[1_1_25%] min-w-[120px]">
                            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-1">Units</Text>
                            <Text className="text-2xl font-bold color-[#667eea]">
                              {summary?.units || 0}
                            </Text>
                          </View>
                          <View className="flex-[1_1_25%] min-w-[120px]">
                            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-1">Chapters</Text>
                            <Text className="text-2xl font-bold color-[#667eea]">
                              {summary?.chapters || 0}
                            </Text>
                          </View>
                          <View className="flex-[1_1_25%] min-w-[120px]">
                            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-1">Glossary</Text>
                            <Text className="text-2xl font-bold color-[#667eea]">
                              {summary?.glossary_terms || 0}
                            </Text>
                          </View>
                          <View className="flex-[1_1_25%] min-w-[120px]">
                            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-1">
                              Solved Problems
                            </Text>
                            <Text className="text-2xl font-bold color-[#667eea]">
                              {summary?.solved_problems || 0}
                            </Text>
                          </View>
                          <View className="flex-[1_1_25%] min-w-[120px]">
                            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-1">Topics</Text>
                            <Text className="text-2xl font-bold color-[#667eea]">
                              {summary?.topics || 0}
                            </Text>
                          </View>
                          <View className="flex-[1_1_25%] min-w-[120px]">
                            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-1">Question Bank</Text>
                            <Text className="text-2xl font-bold color-[#667eea]">
                              {summary?.questions || 0}
                            </Text>
                          </View>
                          <View className="flex-[1_1_25%] min-w-[120px]">
                            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-1">Images</Text>
                            <Text className="text-2xl font-bold color-[#667eea]">
                              {summary?.images || 0}
                            </Text>
                          </View>
                          <View className="flex-[1_1_25%] min-w-[120px]">
                            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-1">Videos</Text>
                            <Text className="text-2xl font-bold color-[#667eea]">
                              {summary?.videos || 0}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  ) : (
                    <View className="flex-1 bg-card-light dark:bg-card-dark">
                      <View className="p-3 flex-row justify-end border-b border-border-light dark:border-border-dark">
                        <View className="flex-row gap-3">
                          <TouchableOpacity
                            className="flex-row items-center py-2 px-4 rounded-lg gap-2 bg-background-light dark:bg-background-dark"
                            onPress={handleValidateXML}
                            disabled={validating}
                          >
                            {validating ? (
                              <ActivityIndicator size="small" color="#64748b" />
                            ) : (
                              <MaterialCommunityIcons
                                name="check-decagram-outline"
                                size={18}
                                color="#64748b"
                              />
                            )}
                            <Text className="text-textSecondary-light dark:text-textSecondary-dark text-[13px] font-semibold">
                              Validate
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-row items-center py-2 px-4 rounded-lg gap-2 bg-[#667eea]"
                            onPress={handleSaveXML}
                            disabled={saving}
                          >
                            {saving ? (
                              <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                              <MaterialCommunityIcons
                                name="content-save-outline"
                                size={18}
                                color="#ffffff"
                              />
                            )}
                            <Text className="color-white text-[13px] font-semibold">
                              Save Changes
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <XMLEditor
                        xmlContent={xmlContent}
                        setXmlContent={setXmlContent}
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View className="flex-1 justify-center items-center gap-4">
                <MaterialCommunityIcons
                  name="book-search"
                  size={48}
                  color="#cbd5e1"
                />
                <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark font-medium">Select a course to manage</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
