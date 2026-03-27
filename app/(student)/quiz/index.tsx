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

const QuizSelection = () => {
  const router = useRouter();
  const { selectCourse, fetchNextQuestion, resetQuiz } = useQuizStore();

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
    router.push("/(student)/quiz/active");
  };

  if (loadingCourses) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#4F46E5"} />
        <Text className="mt-4 text-textSecondary-light dark:text-textSecondary-dark text-sm font-medium">
          Fetching available courses...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, flexGrow: 1 }}
      className="bg-background-light dark:bg-background-dark"
    >
      <Text className="text-2xl font-bold mb-2 text-text-light dark:text-text-dark">
        Select a Course
      </Text>
      <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-6">
        Choose a course to start your adaptive quiz session
      </Text>
      <View className="gap-4">
        {courses.map((course) => (
          <TouchableOpacity
            key={course.course_id}
            className="bg-card-light dark:bg-card-dark p-5 rounded-2xl shadow-sm flex-col items-start border border-border-light dark:border-border-dark"
            onPress={() => handleCourseSelect(course.course_id)}
          >
            <View className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 justify-center items-center mb-3">
              <Ionicons
                name="book-outline"
                size={32}
                color={isDark ? "#818cf8" : "#4F46E5"}
              />
            </View>
            <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-1">
              {course.course_name}
            </Text>
            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold">
              {course.course_id}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mt-6 bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark items-center mb-5">
        <Text className="text-base font-bold text-text-light dark:text-text-dark mb-1">
          Quiz Depth
        </Text>
        <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-4">
          Choose question count
        </Text>
        <View className="flex-row gap-2.5">
          {quizLengthOptions.map((length) => (
            <TouchableOpacity
              key={length}
              className={`w-[50px] h-[50px] rounded-xl border-2 justify-center items-center ${
                quizLength === length
                  ? "border-primary bg-primary/10"
                  : "border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark"
              }`}
              onPress={() => setQuizLength(length)}
            >
              <Text
                className={`text-base font-semibold ${
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
    </ScrollView>
  );
};

export default QuizSelection;
