import { create } from "zustand";
import { MCQ } from "../models/MCQ";
import {
  submitAnswer as apiSubmitAnswer,
  fetchMCQ,
} from "../services/quiz.service";
import { Difficulty, calculateNextDifficulty } from "../utils/adaptiveEngine";

interface QuizState {
  selectedCourseId: string | null;
  currentMCQ: MCQ | null;
  usedQuestionIds: string[];
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
  quizId: string | null;
  highestStreak: number;
  results: {
    question: MCQ;
    selectedIndex: number;
    isCorrect: boolean;
    timeTaken: number;
  }[];

  // Actions
  selectCourse: (courseId: string, maxQuestions?: number) => void;
  fetchNextQuestion: () => Promise<void>;
  submitAnswer: (userId: string, selectedIndex: number, timeTaken: number) => Promise<void>;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  selectedCourseId: null,
  currentMCQ: null,
  usedQuestionIds: [],
  streak: 0,
  difficulty: "easy",
  isLoading: false,
  score: 0,
  totalQuestions: 0,
  maxQuestions: 25,
  isFinished: false,
  lastFeedback: null,
  quizId: null,
  highestStreak: 0,
  results: [],

  selectCourse: (courseId: string, maxQuestions: number = 25) => {
    set({
      selectedCourseId: courseId,
      usedQuestionIds: [],
      streak: 0,
      difficulty: "easy",
      score: 0,
      totalQuestions: 0,
      maxQuestions: maxQuestions,
      isFinished: false,
      lastFeedback: null,
      currentMCQ: null,
      quizId: Math.random().toString(36).substring(2, 11),
      highestStreak: 0,
      results: [],
    });
  },

  fetchNextQuestion: async () => {
    const { selectedCourseId, isFinished, difficulty, usedQuestionIds } = get();
    if (!selectedCourseId || isFinished) return;

    set({ isLoading: true });
    try {
      const data = await fetchMCQ(
        selectedCourseId,
        difficulty,
        usedQuestionIds,
      );
      const newQuestion = data.question;

      // Extract ID from machine learning object (it comes as ID or mcqId)
      const questionId = newQuestion.ID || newQuestion.mcqId;

      set((state) => ({
        currentMCQ: newQuestion,
        usedQuestionIds: questionId
          ? [...state.usedQuestionIds, questionId]
          : state.usedQuestionIds,
        difficulty: data.difficulty.toLowerCase() as any,
        isLoading: false,
        lastFeedback: null,
      }));
    } catch (error) {
      console.error("Error fetching MCQ:", error);
      set({ isLoading: false });
    }
  },

  submitAnswer: async (userId: string, selectedIndex: number, timeTaken: number) => {
    const {
      currentMCQ,
      streak,
      difficulty,
      score,
      totalQuestions,
      maxQuestions,
      selectedCourseId,
      highestStreak,
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

    const newHighestStreak = Math.max(highestStreak, newStreak > 0 ? newStreak : 0);

    set({
      lastFeedback: {
        isCorrect,
        correctIndex: currentMCQ.AnswerIndex,
        selectedIndex,
      },
      streak: shouldResetStreak ? 0 : newStreak,
      highestStreak: newHighestStreak,
      difficulty: nextDifficulty,
      score: isCorrect ? score + 1 : score,
      totalQuestions: newTotalQuestions,
      isFinished,
      results: [
        ...get().results,
        {
          question: currentMCQ,
          selectedIndex: selectedIndex,
          isCorrect,
          timeTaken,
        },
      ],
    });

    // Log answer to server
    try {
      await apiSubmitAnswer({
        user_id: userId,
        question: currentMCQ,
        selected_index: selectedIndex,
        course_id: selectedCourseId,
        quiz_id: get().quizId || "",
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  },

  resetQuiz: () => {
    set({
      selectedCourseId: null,
      currentMCQ: null,
      usedQuestionIds: [],
      streak: 0,
      difficulty: "easy",
      isLoading: false,
      score: 0,
      totalQuestions: 0,
      maxQuestions: 25,
      isFinished: false,
      lastFeedback: null,
      quizId: null,
      highestStreak: 0,
      results: [],
    });
  },
}));
