import { Course } from "@/models/Course";
import { listCourses } from "@/services/course.service";
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

const StudentCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await listCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
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
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1">
        <View className="px-6 pt-8 pb-5 bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark">
          <Text className="text-2xl font-bold text-text-light dark:text-text-dark mb-1">Explore Courses</Text>
          <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium">
            Select a course to continue learning
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <View className="flex-row flex-wrap gap-5">
            {courses.map((course) => (
              <TouchableOpacity
                key={course.course_id}
                className="w-[30%] bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-sm shadow-black/5 border border-border-light dark:border-border-dark"
                onPress={() =>
                  router.push(`/(student)/course/${course.course_id}`)
                }
                activeOpacity={0.8}
              >
                <View className="flex-row justify-between items-center mb-4">
                  <View className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 justify-center items-center">
                    <MaterialCommunityIcons
                      name="book-open-variant"
                      size={24}
                      color={isDark ? "#818cf8" : "#667eea"}
                    />
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={isDark ? "#64748b" : "#cbd5e1"}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-1">{course.course_name}</Text>
                  <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold">{course.course_id}</Text>
                </View>

                <View className="flex-row gap-4 pt-4 border-t border-border-light dark:border-border-dark">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialCommunityIcons
                      name="layers-outline"
                      size={14}
                      color={isDark ? "#94a3b8" : "#64748b"}
                    />
                    <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-medium">
                      {course.units || 0} Units
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <MaterialCommunityIcons
                      name="book-outline"
                      size={14}
                      color={isDark ? "#94a3b8" : "#64748b"}
                    />
                    <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-medium">
                      {course.chapters || 0} Chapters
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default StudentCoursesPage;
