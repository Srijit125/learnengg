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
      <View className="flex-1 justify-center items-center p-5">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-[#64748B] text-sm font-medium">Fetching available courses...</Text>
      </View>
    );
  }

  if (!selectedCourseId) {
    return (
      <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: "#F8FAFC", flexGrow: 1 }}>
        <Text className="text-2xl font-bold mb-2 text-[#1E293B]">Select a Course</Text>
        <Text className="text-sm text-[#64748B] mb-6">
          Choose a course to start your adaptive quiz session
        </Text>
        <View className="gap-4">
          {courses.map((course) => (
            <TouchableOpacity
              key={course.course_id}
              className="bg-card-light dark:bg-card-dark p-5 rounded-2xl shadow-sm shadow-black/10 flex-col items-start border border-transparent"
              onPress={() => handleCourseSelect(course.course_id)}
            >
              <View className="w-14 h-14 rounded-xl bg-[#F0F4FF] justify-center items-center mb-3">
                <Ionicons name="book-outline" size={32} color="#4F46E5" />
              </View>
              <Text className="text-lg font-bold text-[#1E293B] mb-1">{course.course_name}</Text>
              <Text className="text-xs text-[#94A3B8] font-semibold">{course.course_id}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-6 bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-[#F1F5F9] items-center mb-5">
          <Text className="text-base font-bold text-[#1E293B] mb-1">Quiz Depth</Text>
          <Text className="text-xs text-[#64748B] mb-4">Choose question count</Text>
          <View className="flex-row gap-2.5">
            {quizLengthOptions.map((length) => (
              <TouchableOpacity
                key={length}
                className={`w-[50px] h-[50px] rounded-xl border-2 justify-center items-center ${quizLength === length
                    ? "border-[#4F46E5] bg-[#F0F4FF]"
                    : "border-[#F1F5F9] bg-card-light dark:bg-card-dark"
                  }`}
                onPress={() => setQuizLength(length)}
              >
                <Text
                  className={`text-base font-semibold ${quizLength === length ? "text-[#4F46E5] font-bold" : "text-[#64748B]"
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
      <View className="flex-1 justify-center items-center p-5 bg-[#F8FAFC]">
        <View className="bg-card-light dark:bg-card-dark rounded-3xl p-6 w-full items-center shadow-md shadow-black/10">
          <View className="w-[80px] h-[80px] rounded-[40px] bg-[#FFFBEB] justify-center items-center mb-4">
            <Ionicons name="trophy" size={48} color="#F59E0B" />
          </View>
          <Text className="text-2xl font-bold mb-2 text-[#1E293B]">Completed!</Text>
          <Text className="text-sm text-[#64748B] mb-6">Session analysis completed</Text>

          <View className="flex-row justify-between w-full bg-[#F8FAFC] p-4 rounded-2xl mb-6">
            <View className="items-center">
              <Text className="text-[10px] text-[#64748B] font-semibold mb-0.5">Correct</Text>
              <Text className="text-xl font-bold text-[#1E293B]">{score}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] text-[#64748B] font-semibold mb-0.5">Total</Text>
              <Text className="text-xl font-bold text-[#1E293B]">{maxQuestions}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] text-[#64748B] font-semibold mb-0.5">Accuracy</Text>
              <Text className="text-xl font-bold text-[#1E293B]">{percentage}%</Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#4F46E5] py-3.5 px-8 rounded-xl mb-3 w-full"
            onPress={() => selectCourse(selectedCourseId || "")}
          >
            <Text className="text-white font-bold text-base text-center">Restart Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-transparent border-2 border-[#E2E8F0] py-3.5 px-8 rounded-xl w-full"
            onPress={() => selectCourse("")}
          >
            <Text className="text-[#64748B] font-bold text-base text-center">Exit to Courses</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading && !currentMCQ) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!currentMCQ) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-[#F8FAFC]">
        <Text className="text-2xl font-bold mb-2 text-[#1E293B]">No Question Available</Text>
        <TouchableOpacity
          className="bg-[#4F46E5] py-3.5 px-8 rounded-xl mb-3 w-full max-w-[300px]"
          onPress={() => fetchNextQuestion()}
        >
          <Text className="text-white font-bold text-base text-center">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-transparent border-2 border-[#E2E8F0] py-3.5 px-8 rounded-xl w-full max-w-[300px]"
          onPress={() => selectCourse("")}
        >
          <Text className="text-[#64748B] font-bold text-base text-center">Back to Courses</Text>
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
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: "#F8FAFC", flexGrow: 1 }}>
      <View className="flex-row justify-between items-center mb-6 bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-sm shadow-black/10">
        <View>
          <Text className="text-xs text-[#64748B] mb-1 font-semibold">Difficulty</Text>
          <View className={`px-3 py-1 rounded-xl ${badgeColor}`}>
            <Text className="text-xs font-bold text-[#1E293B]">{difficulty.toUpperCase()}</Text>
          </View>
        </View>
        <View className="flex-row">
          <View className="items-end ml-5">
            <Text className="text-[10px] text-[#64748B] font-semibold">Score</Text>
            <Text className="text-base font-bold text-[#1E293B]">
              {score}/{totalQuestions}
            </Text>
          </View>
          <View className="items-end ml-5">
            <Text className="text-[10px] text-[#64748B] font-semibold">Streak</Text>
            <Text
              className={`text-base font-bold ${streak >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
                }`}
            >
              {Math.abs(streak)} {streak >= 0 ? "🔥" : "❄️"}
            </Text>
          </View>
        </View>
      </View>

      <Animated.View className="bg-card-light dark:bg-card-dark rounded-3xl p-6 shadow-md shadow-black/10" style={{ opacity: fadeAnim }}>
        <Text className="text-xl font-bold text-[#1E293B] mb-6 leading-7">
          {currentMCQ.Question}
        </Text>

        <View className="gap-3">
          {currentMCQ.Options.map((option, index) => {
            const isSelected = lastFeedback?.selectedIndex === index;
            const isCorrect = lastFeedback?.correctIndex === index;
            const showFeedback = lastFeedback !== null;

            let optionClass =
              "p-4.5 rounded-2xl border-2 border-[#F1F5F9] flex-row justify-between items-center";
            let textClass = "text-base text-textSecondary-light dark:text-textSecondary-dark font-medium flex-1";

            if (showFeedback) {
              if (isCorrect) {
                optionClass = "p-4.5 rounded-2xl border-2 border-[#10B981] bg-[#10B981] flex-row justify-between items-center";
                textClass = "text-base text-white font-medium flex-1";
              } else if (isSelected) {
                optionClass = "p-4.5 rounded-2xl border-2 border-[#EF4444] bg-[#EF4444] flex-row justify-between items-center";
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
            className="mt-8 bg-[#4F46E5] p-4.5 rounded-2xl flex-row justify-center items-center gap-2"
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
