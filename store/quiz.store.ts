import { create } from "zustand";
import { MCQ } from "../models/MCQ";
import { Difficulty, calculateNextDifficulty } from "../utils/adaptiveEngine";
import {
  fetchMCQ,
  submitAnswer as apiSubmitAnswer,
} from "../services/quiz.service";

interface QuizState {
  selectedCourseId: string | null;
  currentMCQ: MCQ | null;
  streak: number;
  difficulty: Difficulty;
  isLoading: boolean;
  score: number;
  totalQuestions: number;
  maxQuestions: number;
  isFinished: boolean;
  lastFeedback: {
    isCorrect: boolean;
    correctIndex: number;
    selectedIndex: number;
  } | null;

  // Actions
  selectCourse: (courseId: string, maxQuestions?: number) => void;
  fetchNextQuestion: () => Promise<void>;
  submitAnswer: (userId: string, selectedIndex: number) => Promise<void>;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  selectedCourseId: null,
  currentMCQ: null,
  streak: 0,
  difficulty: "easy",
  isLoading: false,
  score: 0,
  totalQuestions: 0,
  maxQuestions: 25,
  isFinished: false,
  lastFeedback: null,

  selectCourse: (courseId: string, maxQuestions: number = 25) => {
    set({
      selectedCourseId: courseId,
      streak: 0,
      difficulty: "easy",
      score: 0,
      totalQuestions: 0,
      maxQuestions: maxQuestions,
      isFinished: false,
      lastFeedback: null,
      currentMCQ: null,
    });
  },

  fetchNextQuestion: async () => {
    const { selectedCourseId, isFinished, difficulty } = get();
    if (!selectedCourseId || isFinished) return;

    set({ isLoading: true });
    try {
      const data = await fetchMCQ(selectedCourseId, difficulty);
      set({
        currentMCQ: data.question,
        difficulty: data.difficulty.toLowerCase() as any,
        isLoading: false,
        lastFeedback: null,
      });
    } catch (error) {
      console.error("Error fetching MCQ:", error);
      set({ isLoading: false });
    }
  },

  submitAnswer: async (userId: string, selectedIndex: number) => {
    const {
      currentMCQ,
      streak,
      difficulty,
      score,
      totalQuestions,
      maxQuestions,
      selectedCourseId,
    } = get();
    if (!currentMCQ || !selectedCourseId) return;

    const isCorrect = selectedIndex === currentMCQ.AnswerIndex;
    const newStreak = isCorrect
      ? streak >= 0
        ? streak + 1
        : 1
      : streak <= 0
        ? streak - 1
        : -1;

    // Update adaptive logic
    const { nextDifficulty, shouldResetStreak } = calculateNextDifficulty(
      difficulty,
      newStreak,
    );

    const newTotalQuestions = totalQuestions + 1;
    const isFinished = newTotalQuestions >= maxQuestions;

    set({
      lastFeedback: {
        isCorrect,
        correctIndex: currentMCQ.AnswerIndex,
        selectedIndex,
      },
      streak: shouldResetStreak ? 0 : newStreak,
      difficulty: nextDifficulty,
      score: isCorrect ? score + 1 : score,
      totalQuestions: newTotalQuestions,
      isFinished,
    });

    // Log answer to server
    try {
      await apiSubmitAnswer({
        user_id: userId,
        question: currentMCQ,
        selected_index: selectedIndex,
        course_id: selectedCourseId,
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  },

  resetQuiz: () => {
    set({
      selectedCourseId: null,
      currentMCQ: null,
      streak: 0,
      difficulty: "easy",
      isLoading: false,
      score: 0,
      totalQuestions: 0,
      maxQuestions: 25,
      isFinished: false,
      lastFeedback: null,
    });
  },
}));
