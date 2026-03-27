import { Ionicons } from "@expo/vector-icons";
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
import { Course } from "../../../models/Course";
import { listCourses } from "../../../services/course.service";
import { useQuizStore } from "../../../store/quiz.store";
import { useAuthStore } from "../../../store/auth.store";
import { logStudyActivity } from "../../../services/analyticsService";

const QuizSelectionWeb = () => {
  const router = useRouter();
  const { selectCourse, fetchNextQuestion, resetQuiz } = useQuizStore();
  const { user } = useAuthStore();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [quizLength, setQuizLength] = useState(10);
  const quizLengthOptions = [10, 15, 20, 25, 30];

  useEffect(() => {
    loadCourses();
    return () => resetQuiz();
  }, []);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const data = await listCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    selectCourse(courseId, quizLength);
    fetchNextQuestion();

    if (user?.id) {
      logStudyActivity({
        user_id: user.id,
        course_id: courseId,
        event_type: "quiz_started",
        metadata: {
          quiz_length: quizLength,
        },
      });
    }

    router.push("/(student)/quiz/active");
  };

  if (loadingCourses) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#4F46E5"} />
        <Text className="mt-4 text-textSecondary-light dark:text-textSecondary-dark text-base font-medium">
          Fetching available courses...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center">
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          width: "100%",
          maxWidth: 800,
          flexGrow: 1,
        }}
      >
        <View className="mt-12 bg-card-light dark:bg-card-dark p-8 rounded-3xl border border-border-light dark:border-border-dark items-center">
          <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-2">
            Quiz Depth
          </Text>
          <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-6">
            How many questions would you like to tackle?
          </Text>
          <View className="flex-row gap-3">
            {quizLengthOptions.map((length) => (
              <TouchableOpacity
                key={length}
                className={`w-[60px] h-[60px] rounded-2xl border-2 justify-center items-center ${
                  quizLength === length
                    ? "border-primary bg-primary/10"
                    : "border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark"
                }`}
                onPress={() => setQuizLength(length)}
              >
                <Text
                  className={`text-lg font-semibold ${
                    quizLength === length
                      ? "text-primary dark:text-primary-light font-bold"
                      : "text-textSecondary-light dark:text-textSecondary-dark"
                  }`}
                >
                  {length}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View className="flex-1 py-10">
          <Text className="text-[32px] font-bold mb-3 text-text-light dark:text-text-dark">
            Select a Course
          </Text>
          <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark mb-10">
            Choose a content area to start your adaptive quiz session
          </Text>
          <View className="flex-row flex-wrap gap-6">
            {courses?.map((course) => (
              <TouchableOpacity
                key={course.course_id}
                className="w-[calc(50%-12px)] bg-card-light dark:bg-card-dark p-8 rounded-3xl shadow-sm border border-border-light dark:border-border-dark"
                onPress={() => handleCourseSelect(course.course_id)}
              >
                <View className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 justify-center items-center mb-5">
                  <Ionicons
                    name="book-outline"
                    size={32}
                    color={isDark ? "#818cf8" : "#4F46E5"}
                  />
                </View>
                <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-2">
                  {course.course_name}
                </Text>
                <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark font-semibold">
                  {course.course_id}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default QuizSelectionWeb;
