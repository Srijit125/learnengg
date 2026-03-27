import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ReviewModal from "../../../components/Quiz/ReviewModal";
import { useAuthStore } from "../../../store/auth.store";
import { useQuizStore } from "../../../store/quiz.store";

const ActiveQuiz = () => {
  const router = useRouter();
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
    quizId,
    results,
    highestStreak,
  } = useQuizStore();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showReview, setShowReview] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (!selectedCourseId) {
      router.replace("/(student)/quiz");
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (currentMCQ) {
      setStartTime(Date.now());
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentMCQ]);

  const handleAnswer = async (index: number) => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    await submitAnswer(user?.id || "anonymous", index, timeTaken);

    // Immediate transition for blind quiz
    fadeAnim.setValue(0);
    fetchNextQuestion();
  };

  const handleRestart = () => {
    selectCourse(selectedCourseId || "", maxQuestions);
    fetchNextQuestion();
  };

  const handleExit = () => {
    selectCourse("");
    router.replace("/(student)/quiz");
  };

  if (isLoading && !currentMCQ) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#4F46E5"} />
      </View>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / maxQuestions) * 100);
    return (
      <View className="flex-1 justify-center items-center p-5 bg-background-light dark:bg-background-dark">
        <View className="bg-card-light dark:bg-card-dark rounded-3xl p-6 w-full items-center shadow-md border border-border-light dark:border-border-dark">
          <View className="w-[80px] h-[80px] rounded-[40px] bg-warning/10 dark:bg-warning/20 justify-center items-center mb-4">
            <Ionicons
              name="trophy"
              size={48}
              color={isDark ? "#fbbf24" : "#F59E0B"}
            />
          </View>
          <Text className="text-2xl font-bold mb-2 text-text-light dark:text-text-dark">
            Completed!
          </Text>
          <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-6">
            Session analysis completed
          </Text>

          <View className="flex-row justify-between w-full bg-background-light dark:bg-background-dark p-4 rounded-2xl mb-6 border border-border-light dark:border-border-dark">
            <View className="items-center">
              <Text className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-0.5">
                Correct
              </Text>
              <Text className="text-xl font-bold text-text-light dark:text-text-dark">
                {score}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-0.5">
                Total
              </Text>
              <Text className="text-xl font-bold text-text-light dark:text-text-dark">
                {maxQuestions}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-0.5">
                Accuracy
              </Text>
              <Text className="text-xl font-bold text-text-light dark:text-text-dark">
                {percentage}%
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary py-3.5 px-8 rounded-xl mb-3 w-full"
            onPress={handleRestart}
          >
            <Text className="text-white font-bold text-base text-center">
              Restart Session
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-transparent border-2 border-border-light dark:border-border-dark py-3.5 px-8 rounded-xl w-full mb-3"
            onPress={() => setShowReview(true)}
          >
            <Text className="text-textSecondary-light dark:text-textSecondary-dark font-bold text-base text-center">
              Review Answers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-transparent border-2 border-border-light dark:border-border-dark py-3.5 px-8 rounded-xl w-full"
            onPress={handleExit}
          >
            <Text className="text-textSecondary-light dark:text-textSecondary-dark font-bold text-base text-center">
              Exit to Courses
            </Text>
          </TouchableOpacity>
        </View>

        <ReviewModal
          visible={showReview}
          onClose={() => setShowReview(false)}
          quizId={quizId || ""}
          results={results}
          highestStreak={highestStreak}
        />
      </View>
    );
  }

  if (!currentMCQ) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-background-light dark:bg-background-dark">
        <Text className="text-2xl font-bold mb-2 text-text-light dark:text-text-dark">
          No Question Available
        </Text>
        <TouchableOpacity
          className="bg-primary py-3.5 px-8 rounded-xl mb-3 w-full max-w-[300px]"
          onPress={() => fetchNextQuestion()}
        >
          <Text className="text-white font-bold text-base text-center">
            Retry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-transparent border-2 border-border-light dark:border-border-dark py-3.5 px-8 rounded-xl w-full max-w-[300px]"
          onPress={handleExit}
        >
          <Text className="text-textSecondary-light dark:text-textSecondary-dark font-bold text-base text-center">
            Back to Courses
          </Text>
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
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
      style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}
    >
      <View style={{ width: '100%', maxWidth: 500, padding: 20 }}>
        <View className="flex-row justify-between items-center mb-6 bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
          <View>
            <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-1 font-semibold">
              Difficulty
            </Text>
            <View className={`px-3 py-1 rounded-xl ${badgeColor}`}>
              <Text className="text-xs font-bold text-text-light dark:text-text-dark">
                {difficulty.toUpperCase()}
              </Text>
            </View>
          </View>
          <View className="flex-row">
            <View className="items-end ml-5">
              <Text className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark font-semibold">
                Progress
              </Text>
              <Text className="text-base font-bold text-text-light dark:text-text-dark">
                {totalQuestions + 1}/{maxQuestions}
              </Text>
            </View>
          </View>
        </View>

        <Animated.View
          className="bg-card-light dark:bg-card-dark rounded-3xl p-6 shadow-md border border-border-light dark:border-border-dark"
          style={{ opacity: fadeAnim }}
        >
          <Text className="text-xl font-bold text-text-light dark:text-text-dark mb-6 leading-7">
            {currentMCQ.Question}
          </Text>

          <View className="gap-3">
            {currentMCQ.Options.map((option, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  className="p-4.5 rounded-2xl border-2 border-border-light dark:border-border-dark flex-row justify-between items-center"
                  onPress={() => handleAnswer(index)}
                >
                  <Text className="text-base text-text-light dark:text-text-dark font-medium flex-1">{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

export default ActiveQuiz;
