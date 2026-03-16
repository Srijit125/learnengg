import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Course } from "../../../models/Course";
import { listCourses } from "../../../services/course.service";
import { useAuthStore } from "../../../store/auth.store";
import { useQuizStore } from "../../../store/quiz.store";

const QuizIndex = () => {
  const {
    selectedCourseId,
    currentMCQ,
    isLoading,
    difficulty,
    streak,
    score,
    totalQuestions,
    maxQuestions,
    isFinished,
    lastFeedback,
    selectCourse,
    fetchNextQuestion,
    submitAnswer,
    resetQuiz,
  } = useQuizStore();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [quizLength, setQuizLength] = useState(10);
  const quizLengthOptions = [10, 15, 20, 25, 30];

  useEffect(() => {
    if (!selectedCourseId) {
      loadCourses();
    }
    return () => resetQuiz();
  }, [selectedCourseId]);

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

  useEffect(() => {
    if (currentMCQ) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentMCQ]);

  const handleCourseSelect = (courseId: string) => {
    selectCourse(courseId, quizLength);
    fetchNextQuestion();
  };

  const handleAnswer = (index: number) => {
    if (lastFeedback) return;
    submitAnswer(user?.id || "anonymous", index);
  };

  const handleNext = () => {
    fadeAnim.setValue(0);
    fetchNextQuestion();
  };

  if (loadingCourses) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#4F46E5"} />
        <Text className="mt-4 text-textSecondary-light dark:text-textSecondary-dark text-sm font-medium">Fetching available courses...</Text>
      </View>
    );
  }

  if (!selectedCourseId) {
    return (
      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }} className="bg-background-light dark:bg-background-dark">
        <Text className="text-2xl font-bold mb-2 text-text-light dark:text-text-dark">Select a Course</Text>
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
                <Ionicons name="book-outline" size={32} color={isDark ? "#818cf8" : "#4F46E5"} />
              </View>
              <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-1">{course.course_name}</Text>
              <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold">{course.course_id}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-6 bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark items-center mb-5">
          <Text className="text-base font-bold text-text-light dark:text-text-dark mb-1">Quiz Depth</Text>
          <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-4">Choose question count</Text>
          <View className="flex-row gap-2.5">
            {quizLengthOptions.map((length) => (
              <TouchableOpacity
                key={length}
                className={`w-[50px] h-[50px] rounded-xl border-2 justify-center items-center ${quizLength === length
                    ? "border-primary bg-primary/10"
                    : "border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark"
                  }`}
                onPress={() => setQuizLength(length)}
              >
                <Text
                  className={`text-base font-semibold ${quizLength === length ? "text-primary dark:text-primary-light font-bold" : "text-textSecondary-light dark:text-textSecondary-dark"
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
  }

  if (isFinished) {
    const percentage = Math.round((score / maxQuestions) * 100);
    return (
      <View className="flex-1 justify-center items-center p-5 bg-background-light dark:bg-background-dark">
        <View className="bg-card-light dark:bg-card-dark rounded-3xl p-6 w-full items-center shadow-md border border-border-light dark:border-border-dark">
          <View className="w-[80px] h-[80px] rounded-[40px] bg-warning/10 dark:bg-warning/20 justify-center items-center mb-4">
            <Ionicons name="trophy" size={48} color={isDark ? "#fbbf24" : "#F59E0B"} />
          </View>
          <Text className="text-2xl font-bold mb-2 text-text-light dark:text-text-dark">Completed!</Text>
          <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-6">Session analysis completed</Text>

          <View className="flex-row justify-between w-full bg-background-light dark:bg-background-dark p-4 rounded-2xl mb-6 border border-border-light dark:border-border-dark">
            <View className="items-center">
              <Text className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-0.5">Correct</Text>
              <Text className="text-xl font-bold text-text-light dark:text-text-dark">{score}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-0.5">Total</Text>
              <Text className="text-xl font-bold text-text-light dark:text-text-dark">{maxQuestions}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-0.5">Accuracy</Text>
              <Text className="text-xl font-bold text-text-light dark:text-text-dark">{percentage}%</Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary py-3.5 px-8 rounded-xl mb-3 w-full"
            onPress={() => selectCourse(selectedCourseId || "")}
          >
            <Text className="text-white font-bold text-base text-center">Restart Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-transparent border-2 border-border-light dark:border-border-dark py-3.5 px-8 rounded-xl w-full"
            onPress={() => selectCourse("")}
          >
            <Text className="text-textSecondary-light dark:text-textSecondary-dark font-bold text-base text-center">Exit to Courses</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading && !currentMCQ) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#4F46E5"} />
      </View>
    );
  }

  if (!currentMCQ) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-background-light dark:bg-background-dark">
        <Text className="text-2xl font-bold mb-2 text-text-light dark:text-text-dark">No Question Available</Text>
        <TouchableOpacity
          className="bg-primary py-3.5 px-8 rounded-xl mb-3 w-full max-w-[300px]"
          onPress={() => fetchNextQuestion()}
        >
          <Text className="text-white font-bold text-base text-center">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-transparent border-2 border-border-light dark:border-border-dark py-3.5 px-8 rounded-xl w-full max-w-[300px]"
          onPress={() => selectCourse("")}
        >
          <Text className="text-textSecondary-light dark:text-textSecondary-dark font-bold text-base text-center">Back to Courses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const badgeColor =
    difficulty === "easy"
      ? "bg-success/20"
      : difficulty === "medium"
        ? "bg-warning/20"
        : "bg-error/20";

  return (
    <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }} className="bg-background-light dark:bg-background-dark">
      <View className="flex-row justify-between items-center mb-6 bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
        <View>
          <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-1 font-semibold">Difficulty</Text>
          <View className={`px-3 py-1 rounded-xl ${badgeColor}`}>
            <Text className="text-xs font-bold text-text-light dark:text-text-dark">{difficulty.toUpperCase()}</Text>
          </View>
        </View>
        <View className="flex-row">
          <View className="items-end ml-5">
            <Text className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark font-semibold">Score</Text>
            <Text className="text-base font-bold text-text-light dark:text-text-dark">
              {score}/{totalQuestions}
            </Text>
          </View>
          <View className="items-end ml-5">
            <Text className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark font-semibold">Streak</Text>
            <Text
              className={`text-base font-bold ${streak >= 0 ? "text-success" : "text-error"
                }`}
            >
              {Math.abs(streak)} {streak >= 0 ? "🔥" : "❄️"}
            </Text>
          </View>
        </View>
      </View>

      <Animated.View className="bg-card-light dark:bg-card-dark rounded-3xl p-6 shadow-md border border-border-light dark:border-border-dark" style={{ opacity: fadeAnim }}>
        <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-6 leading-7">
          {currentMCQ.Question}
        </Text>

        <View className="gap-3">
          {currentMCQ.Options.map((option, index) => {
            const isSelected = lastFeedback?.selectedIndex === index;
            const isCorrect = lastFeedback?.correctIndex === index;
            const showFeedback = lastFeedback !== null;

            let optionClass =
              "p-4.5 rounded-2xl border-2 border-border-light dark:border-border-dark flex-row justify-between items-center";
            let textClass = "text-base text-textSecondary-light dark:text-textSecondary-dark font-medium flex-1";

            if (showFeedback) {
              if (isCorrect) {
                optionClass = "p-4.5 rounded-2xl border-2 border-success bg-success flex-row justify-between items-center";
                textClass = "text-base text-white font-medium flex-1";
              } else if (isSelected) {
                optionClass = "p-4.5 rounded-2xl border-2 border-error bg-error flex-row justify-between items-center";
                textClass = "text-base text-white font-medium flex-1";
              }
            }

            return (
              <TouchableOpacity
                key={index}
                className={optionClass}
                onPress={() => handleAnswer(index)}
                disabled={showFeedback}
              >
                <Text className={textClass}>
                  {option}
                </Text>
                {showFeedback && isCorrect && (
                  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                )}
                {showFeedback && isSelected && !isCorrect && (
                  <Ionicons name="close-circle" size={24} color="#FFF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {lastFeedback && (
          <TouchableOpacity
            className="mt-8 bg-primary p-4.5 rounded-2xl flex-row justify-center items-center gap-2"
            onPress={handleNext}
          >
            <Text className="text-white text-base font-bold">Next Question</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </ScrollView>
  );
};

export default QuizIndex;
