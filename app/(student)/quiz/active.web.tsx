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
import { logStudyActivity } from "../../../services/analyticsService";
import { useAuthStore } from "../../../store/auth.store";
import { useQuizStore } from "../../../store/quiz.store";

const ActiveQuizWeb = () => {
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
      <View className="flex-1 justify-center items-center p-6 bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#4F46E5"} />
      </View>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / maxQuestions) * 100);

    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-6">
        <View className="bg-card-light dark:bg-card-dark rounded-[32px] p-12 w-full max-w-[500px] items-center shadow-lg border border-border-light dark:border-border-dark">
          <View className="w-[100px] h-[100px] rounded-[50px] bg-warning/10 dark:bg-warning/20 justify-center items-center mb-6">
            <Ionicons
              name="trophy"
              size={64}
              color={isDark ? "#fbbf24" : "#F59E0B"}
            />
          </View>
          <Text className="text-[32px] font-bold mb-3 text-text-light dark:text-text-dark">
            Quiz Completed!
          </Text>
          <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark mb-10">
            You've mastered the session
          </Text>

          <View className="flex-row justify-between w-full bg-background-light dark:bg-background-dark p-6 rounded-2xl mb-8 border border-border-light dark:border-border-dark">
            <View className="items-center">
              <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-1">
                Correct
              </Text>
              <Text className="text-2xl font-bold text-text-light dark:text-text-dark">
                {score}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-1">
                Total
              </Text>
              <Text className="text-2xl font-bold text-text-light dark:text-text-dark">
                {maxQuestions}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-1">
                Accuracy
              </Text>
              <Text className="text-2xl font-bold text-text-light dark:text-text-dark">
                {percentage}%
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary px-8 py-4 rounded-xl mb-4 w-full"
            onPress={handleRestart}
          >
            <Text className="text-white font-semibold text-base text-center">
              Restart Same Course
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-transparent border-2 border-border-light dark:border-border-dark px-8 py-4 rounded-xl w-full mb-4"
            onPress={() => setShowReview(true)}
          >
            <Text className="text-textSecondary-light dark:text-textSecondary-dark font-semibold text-base text-center">
              Review Answers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-transparent border-2 border-border-light dark:border-border-dark px-8 py-4 rounded-xl w-full"
            onPress={handleExit}
          >
            <Text className="text-textSecondary-light dark:text-textSecondary-dark font-semibold text-base text-center">
              Back to Courses
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
      <View className="flex-1 justify-center items-center p-6 bg-background-light dark:bg-background-dark">
        <Text className="text-[32px] font-bold mb-3 text-text-light dark:text-text-dark">
          No Question Available
        </Text>
        <TouchableOpacity
          className="bg-primary px-8 py-4 rounded-xl mb-4"
          onPress={() => fetchNextQuestion()}
        >
          <Text className="text-white font-semibold text-base text-center">
            Retry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-transparent border-2 border-border-light dark:border-border-dark px-8 py-4 rounded-xl"
          onPress={handleExit}
        >
          <Text className="text-textSecondary-light dark:text-textSecondary-dark font-semibold text-base text-center">
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
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-full max-w-[800px]">
            <View className="flex-row justify-between items-center mb-8 bg-card-light dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
              <View>
                <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mb-2 font-semibold">
                  Difficulty
                </Text>
                <View className={`px-4 py-1.5 rounded-xl ${badgeColor}`}>
                  <Text className="text-sm font-bold text-text-light dark:text-text-dark">
                    {difficulty.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-8">
                <View className="items-end">
                  <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold mb-1">
                    Progress
                  </Text>
                  <Text className="text-xl font-bold text-text-light dark:text-text-dark">
                    {totalQuestions + 1}/{maxQuestions}
                  </Text>
                </View>
              </View>
            </View>

            <Animated.View
              className="bg-card-light dark:bg-card-dark rounded-[32px] p-12 shadow-lg border border-border-light dark:border-border-dark"
              style={{ opacity: fadeAnim }}
            >
              <Text className="text-[28px] font-bold text-text-light dark:text-text-dark mb-10 leading-10">
                {currentMCQ.Question}
              </Text>

              <View className="gap-4">
                {currentMCQ.Options?.map((option, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      className="p-6 rounded-2xl border-2 border-border-light dark:border-border-dark flex-row justify-between items-center hover:border-primary"
                      onPress={() => handleAnswer(index)}
                    >
                      <Text className="text-lg text-text-light dark:text-text-dark font-medium flex-1">{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ActiveQuizWeb;
