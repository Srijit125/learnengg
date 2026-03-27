import { MCQ } from "../models/MCQ";

export interface analyticsInfo {
  total_attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  timeline: analyicsTimeline[];
  difficulty_distribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  difficulty_accuracy: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface analyicsTimeline {
  index: number;
  difficulty: string;
  correct: boolean;
}

export interface logDataInfo {
    user_id: string;
    correct:boolean;
    difficulty: "easy" | "medium" | "hard";
    knowledgeId:string;
    question: string;
    timestamp: string;
    user_answer: number;
    quiz_id?: string;
    course_id?: string;
    question_data?: MCQ;
    reference: {
        Unit: string;
        Chapter: string;
        Section: string;
    }
}