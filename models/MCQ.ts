export type MCQ = {
    mcqId?: string;
    Question: string;
    Options: string[];
    AnswerIndex: number;
    Difficulty: "Easy" | "Medium" | "Hard",
    KnowledgeId: string;
    Validated: boolean;
    ValidationReport?: any;
    Approved?: boolean; 
    Reference?: {
      Unit: string;
      Chapter: string;
      Section: string;
    };
    ChangeExplanation?: string;
}