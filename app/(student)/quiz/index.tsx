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
import { LinearGradient } from "expo-linear-gradient";

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
  const [quizLength, setQuizLength] = useState(25);
  const quizLengthOptions = [15, 20, 25, 30];

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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Fetching available courses...</Text>
      </View>
    );
  }

  if (!selectedCourseId) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Select a Course</Text>
        <Text style={styles.subtitle}>
          Choose a course to start your adaptive quiz session
        </Text>
        <View style={styles.courseGrid}>
          {courses.map((course) => (
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
          <Text style={styles.lengthSubtitle}>Choose question count</Text>
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
                    quizLength === length && styles.lengthOptionTextSelected,
                  ]}
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
      <View style={styles.centered}>
        <View style={styles.resultCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="trophy" size={48} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Completed!</Text>
          <Text style={styles.subtitle}>Session analysis completed</Text>

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
            <Text style={styles.buttonText}>Restart Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => selectCourse("")}
          >
            <Text style={styles.secondaryButtonText}>Exit to Courses</Text>
          </TouchableOpacity>
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
    <ScrollView contentContainerStyle={styles.container}>
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
          {currentMCQ.Options.map((option, index) => {
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
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next Question</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </ScrollView>
  );
};

export default QuizIndex;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8FAFC",
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badge_easy: { backgroundColor: "#DCFCE7" },
  badge_medium: { backgroundColor: "#FEF9C3" },
  badge_hard: { backgroundColor: "#FEE2E2" },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },
  statsRow: {
    flexDirection: "row",
  },
  stat: {
    alignItems: "flex-end",
    marginLeft: 20,
  },
  statLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  question: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    padding: 18,
    borderRadius: 16,
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
    fontSize: 16,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  whiteText: {
    color: "#FFF",
  },
  nextButton: {
    marginTop: 32,
    backgroundColor: "#4F46E5",
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
  },
  courseGrid: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  courseIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  courseIdText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  secondaryButtonText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 16,
  },
  lengthCard: {
    marginTop: 24,
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    marginBottom: 20,
  },
  lengthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  lengthSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 16,
  },
  lengthOptions: {
    flexDirection: "row",
    gap: 10,
  },
  lengthOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  lengthOptionTextSelected: {
    color: "#4F46E5",
    fontWeight: "700",
  },
  resultCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFBEB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  resultGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  resultItem: {
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
});
