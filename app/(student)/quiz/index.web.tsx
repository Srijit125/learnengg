import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useQuizStore } from "../../../store/quiz.store";
import { useAuthStore } from "../../../store/auth.store";
import { listCourses } from "../../../services/course.service";
import { Course } from "../../../models/Course";
import { Ionicons } from "@expo/vector-icons";
import { logStudyActivity } from "../../../services/analyticsService";

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
  const [quizLength, setQuizLength] = useState(25);
  const quizLengthOptions = [15, 20, 25, 30];

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

    // Log quiz session start
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Fetching available courses...</Text>
      </View>
    );
  }

  if (!selectedCourseId) {
    return (
      <View style={styles.webWrapper}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.mainContent}>
            <Text style={styles.title}>Select a Course</Text>
            <Text style={styles.subtitle}>
              Choose a content area to start your adaptive quiz session
            </Text>
            <View style={styles.courseGrid}>
              {courses?.map((course) => (
                <TouchableOpacity
                  key={course.course_id}
                  style={styles.courseCard}
                  onPress={() => handleCourseSelect(course.course_id)}
                >
                  <View style={styles.courseIcon}>
                    <Ionicons name="book-outline" size={32} color="#4F46E5" />
                  </View>
                  <Text style={styles.courseName}>{course.course_name}</Text>
                  <Text style={styles.courseIdText}>{course.course_id}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.lengthCard}>
              <Text style={styles.lengthTitle}>Quiz Depth</Text>
              <Text style={styles.lengthSubtitle}>
                How many questions would you like to tackle?
              </Text>
              <View style={styles.lengthOptions}>
                {quizLengthOptions.map((length) => (
                  <TouchableOpacity
                    key={length}
                    style={[
                      styles.lengthOption,
                      quizLength === length && styles.lengthOptionSelected,
                    ]}
                    onPress={() => setQuizLength(length)}
                  >
                    <Text
                      style={[
                        styles.lengthOptionText,
                        quizLength === length &&
                          styles.lengthOptionTextSelected,
                      ]}
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

    // Log quiz session end (we do this once when isFinished becomes true)
    // Using a useEffect below to ensure it only logs once

    return (
      <View style={styles.webWrapper}>
        <View style={styles.centered}>
          <View style={styles.resultCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="trophy" size={64} color="#F59E0B" />
            </View>
            <Text style={styles.title}>Quiz Completed!</Text>
            <Text style={styles.subtitle}>You've mastered the session</Text>

            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Correct</Text>
                <Text style={styles.resultValue}>{score}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total</Text>
                <Text style={styles.resultValue}>{maxQuestions}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Accuracy</Text>
                <Text style={styles.resultValue}>{percentage}%</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => selectCourse(selectedCourseId || "")}
            >
              <Text style={styles.buttonText}>Restart Same Course</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => selectCourse("")}
            >
              <Text style={styles.secondaryButtonText}>Back to Courses</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (isLoading && !currentMCQ) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!currentMCQ) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>No Question Available</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => fetchNextQuestion()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => selectCourse("")}
        >
          <Text style={styles.secondaryButtonText}>Back to Courses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.webWrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.label}>Difficulty</Text>
              <View style={[styles.badge, styles[`badge_${difficulty}`]]}>
                <Text style={styles.badgeText}>{difficulty.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Score</Text>
                <Text style={styles.statValue}>
                  {score}/{totalQuestions}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Streak</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: streak >= 0 ? "#10B981" : "#EF4444" },
                  ]}
                >
                  {Math.abs(streak)} {streak >= 0 ? "🔥" : "❄️"}
                </Text>
              </View>
            </View>
          </View>

          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <Text style={styles.question}>{currentMCQ.Question}</Text>

            <View style={styles.optionsContainer}>
              {currentMCQ.Options?.map((option, index) => {
                const isSelected = lastFeedback?.selectedIndex === index;
                const isCorrect = lastFeedback?.correctIndex === index;
                const showFeedback = lastFeedback !== null;

                let optionStyle: any = styles.option;
                if (showFeedback) {
                  if (isCorrect)
                    optionStyle = [styles.option, styles.optionCorrect];
                  else if (isSelected)
                    optionStyle = [styles.option, styles.optionWrong];
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={optionStyle}
                    onPress={() => handleAnswer(index)}
                    disabled={showFeedback}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        showFeedback &&
                          (isCorrect || isSelected) &&
                          styles.whiteText,
                      ]}
                    >
                      {option}
                    </Text>
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
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next Question</Text>
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

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },
  container: {
    padding: 24,
    width: "100%",
    maxWidth: 800,
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    paddingVertical: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: "#64748B",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    backgroundColor: "#FFF",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badge_easy: { backgroundColor: "#DCFCE7" },
  badge_medium: { backgroundColor: "#FEF9C3" },
  badge_hard: { backgroundColor: "#FEE2E2" },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  statsRow: {
    flexDirection: "row",
    gap: 32,
  },
  stat: {
    alignItems: "flex-end",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 32,
    padding: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  question: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 40,
    lineHeight: 40,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionCorrect: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  optionWrong: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  optionText: {
    fontSize: 18,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  whiteText: {
    color: "#FFF",
  },
  nextButton: {
    marginTop: 48,
    backgroundColor: "#4F46E5",
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 40,
  },
  courseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
  },
  courseCard: {
    width: "calc(50% - 12px)" as any,
    backgroundColor: "#FFF",
    padding: 32,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  courseIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  courseName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  courseIdText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  secondaryButtonText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 16,
  },
  lengthCard: {
    marginTop: 48,
    backgroundColor: "#FFF",
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
  },
  lengthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  lengthSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
  },
  lengthOptions: {
    flexDirection: "row",
    gap: 12,
  },
  lengthOption: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  lengthOptionSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#F0F4FF",
  },
  lengthOptionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
  },
  lengthOptionTextSelected: {
    color: "#4F46E5",
    fontWeight: "700",
  },
  resultCard: {
    backgroundColor: "#FFF",
    borderRadius: 32,
    padding: 48,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFBEB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  resultGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#F8FAFC",
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
  },
  resultItem: {
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },
});
