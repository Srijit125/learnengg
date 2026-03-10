import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Course } from "../../../models/Course";
import { logStudyActivity } from "../../../services/analyticsService";
import { listCourses } from "../../../services/course.service";
import { useAuthStore } from "../../../store/auth.store";
import { useQuizStore } from "../../../store/quiz.store";

const Quiz = () => {
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

  useEffect(() => {
    if (currentMCQ) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentMCQ]);

  useEffect(() => {
    if (isFinished && user?.id && selectedCourseId) {
      logStudyActivity({
        user_id: user.id,
        course_id: selectedCourseId,
        event_type: "quiz_finished",
        metadata: {
          score: score,
          max_questions: maxQuestions,
          accuracy: Math.round((score / maxQuestions) * 100),
        },
      });
    }
  }, [isFinished]);

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
      <View className="flex-1 justify-center items-center p-6">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-[#64748B] text-base font-medium">Fetching available courses...</Text>
      </View>
    );
  }

  if (!selectedCourseId) {
    return (
      <View className="flex-1 bg-[#F8FAFC] items-center">
        <ScrollView contentContainerStyle={{ padding: 24, width: "100%", maxWidth: 800, flexGrow: 1 }}>
          <View className="flex-1 py-10">
            <Text className="text-[32px] font-bold mb-3 text-[#1E293B]">Select a Course</Text>
            <Text className="text-base text-[#64748B] mb-10">
              Choose a content area to start your adaptive quiz session
            </Text>
            <View className="flex-row flex-wrap gap-6">
              {courses?.map((course) => (
                <TouchableOpacity
                  key={course.course_id}
                  className="w-[calc(50%-12px)] bg-card-light dark:bg-card-dark p-8 rounded-3xl shadow-sm shadow-black/5 border border-[#F1F5F9]"
                  onPress={() => handleCourseSelect(course.course_id)}
                >
                  <View className="w-16 h-16 rounded-2xl bg-[#F0F4FF] justify-center items-center mb-5">
                    <Ionicons name="book-outline" size={32} color="#4F46E5" />
                  </View>
                  <Text className="text-xl font-bold text-[#1E293B] mb-2">{course.course_name}</Text>
                  <Text className="text-sm text-[#94A3B8] font-semibold">{course.course_id}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-12 bg-card-light dark:bg-card-dark p-8 rounded-3xl border border-[#F1F5F9] items-center">
              <Text className="text-xl font-bold text-[#1E293B] mb-2">Quiz Depth</Text>
              <Text className="text-sm text-[#64748B] mb-6">
                How many questions would you like to tackle?
              </Text>
              <View className="flex-row gap-3">
                {quizLengthOptions.map((length) => (
                  <TouchableOpacity
                    key={length}
                    className={`w-[60px] h-[60px] rounded-2xl border-2 justify-center items-center ${quizLength === length
                        ? "border-[#4F46E5] bg-[#F0F4FF]"
                        : "border-[#F1F5F9] bg-card-light dark:bg-card-dark"
                      }`}
                    onPress={() => setQuizLength(length)}
                  >
                    <Text
                      className={`text-lg font-semibold ${quizLength === length ? "text-[#4F46E5] font-bold" : "text-[#64748B]"
                        }`}
                    >
                      {length}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / maxQuestions) * 100);

    return (
      <View className="flex-1 bg-[#F8FAFC] items-center justify-center p-6">
        <View className="bg-card-light dark:bg-card-dark rounded-[32px] p-12 w-full max-w-[500px] items-center shadow-lg shadow-black/10">
          <View className="w-[100px] h-[100px] rounded-[50px] bg-[#FFFBEB] justify-center items-center mb-6">
            <Ionicons name="trophy" size={64} color="#F59E0B" />
          </View>
          <Text className="text-[32px] font-bold mb-3 text-[#1E293B]">Quiz Completed!</Text>
          <Text className="text-base text-[#64748B] mb-10">You've mastered the session</Text>

          <View className="flex-row justify-between w-full bg-[#F8FAFC] p-6 rounded-2xl mb-8">
            <View className="items-center">
              <Text className="text-xs text-[#64748B] font-semibold mb-1">Correct</Text>
              <Text className="text-2xl font-bold text-[#1E293B]">{score}</Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-[#64748B] font-semibold mb-1">Total</Text>
              <Text className="text-2xl font-bold text-[#1E293B]">{maxQuestions}</Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-[#64748B] font-semibold mb-1">Accuracy</Text>
              <Text className="text-2xl font-bold text-[#1E293B]">{percentage}%</Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#4F46E5] px-8 py-4 rounded-xl mb-4 w-full"
            onPress={() => selectCourse(selectedCourseId || "")}
          >
            <Text className="text-white font-semibold text-base text-center">Restart Same Course</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-transparent border-2 border-[#E2E8F0] px-8 py-4 rounded-xl w-full"
            onPress={() => selectCourse("")}
          >
            <Text className="text-[#64748B] font-semibold text-base text-center">Back to Courses</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading && !currentMCQ) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!currentMCQ) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-[32px] font-bold mb-3 text-[#1E293B]">No Question Available</Text>
        <TouchableOpacity
          className="bg-[#4F46E5] px-8 py-4 rounded-xl mb-4"
          onPress={() => fetchNextQuestion()}
        >
          <Text className="text-white font-semibold text-base text-center">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-transparent border-2 border-[#E2E8F0] px-8 py-4 rounded-xl"
          onPress={() => selectCourse("")}
        >
          <Text className="text-[#64748B] font-semibold text-base text-center">Back to Courses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const badgeColor =
    difficulty === "easy"
      ? "bg-[#DCFCE7]"
      : difficulty === "medium"
        ? "bg-[#FEF9C3]"
        : "bg-[#FEE2E2]";

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center">
      <ScrollView contentContainerStyle={{ padding: 24, width: "100%", maxWidth: 800, flexGrow: 1 }}>
        <View className="flex-1 py-10">
          <View className="flex-row justify-between items-center mb-8 bg-card-light dark:bg-card-dark p-6 rounded-2xl shadow-sm shadow-black/10">
            <View>
              <Text className="text-sm text-[#64748B] mb-2 font-semibold">Difficulty</Text>
              <View className={`px-4 py-1.5 rounded-xl ${badgeColor}`}>
                <Text className="text-sm font-bold text-[#1E293B]">{difficulty.toUpperCase()}</Text>
              </View>
            </View>
            <View className="flex-row gap-8">
              <View className="items-end">
                <Text className="text-xs text-[#64748B] font-semibold mb-1">Score</Text>
                <Text className="text-xl font-bold text-[#1E293B]">
                  {score}/{totalQuestions}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-[#64748B] font-semibold mb-1">Streak</Text>
                <Text
                  className={`text-xl font-bold ${streak >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
                    }`}
                >
                  {Math.abs(streak)} {streak >= 0 ? "🔥" : "❄️"}
                </Text>
              </View>
            </View>
          </View>

          <Animated.View className="bg-card-light dark:bg-card-dark rounded-[32px] p-12 shadow-lg shadow-black/10" style={{ opacity: fadeAnim }}>
            <Text className="text-[28px] font-bold text-[#1E293B] mb-10 leading-10">
              {currentMCQ.Question}
            </Text>

            <View className="gap-4">
              {currentMCQ.Options?.map((option, index) => {
                const isSelected = lastFeedback?.selectedIndex === index;
                const isCorrect = lastFeedback?.correctIndex === index;
                const showFeedback = lastFeedback !== null;

                let optionClass =
                  "p-6 rounded-2xl border-2 border-[#F1F5F9] flex-row justify-between items-center";
                let textClass = "text-lg text-textSecondary-light dark:text-textSecondary-dark font-medium flex-1";

                if (showFeedback) {
                  if (isCorrect) {
                    optionClass = "p-6 rounded-2xl border-2 border-[#10B981] bg-[#10B981] flex-row justify-between items-center";
                    textClass = "text-lg text-white font-medium flex-1";
                  } else if (isSelected) {
                    optionClass = "p-6 rounded-2xl border-2 border-[#EF4444] bg-[#EF4444] flex-row justify-between items-center";
                    textClass = "text-lg text-white font-medium flex-1";
                  }
                }

                return (
                  <TouchableOpacity
                    key={index}
                    className={optionClass}
                    onPress={() => handleAnswer(index)}
                    disabled={showFeedback}
                  >
                    <Text className={textClass}>{option}</Text>
                    {showFeedback && (
                      <Ionicons
                        name={isCorrect ? "checkmark-circle" : "close-circle"}
                        size={24}
                        color="#FFF"
                        style={{ opacity: isCorrect || isSelected ? 1 : 0 }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {lastFeedback && (
              <TouchableOpacity
                className="mt-12 bg-[#4F46E5] p-5 rounded-2xl flex-row justify-center items-center gap-3"
                onPress={handleNext}
              >
                <Text className="text-white text-lg font-bold">Next Question</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Quiz;
