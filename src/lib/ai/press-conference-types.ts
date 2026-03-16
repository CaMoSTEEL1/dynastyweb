export interface PressConfQuestion {
  reporterName: string;
  outlet: string;
  question: string;
  tone: "friendly" | "neutral" | "hostile" | "gotcha";
}

export interface ResponseOption {
  id: string;
  label: string;
  tone: "honest" | "deflect" | "coachspeak" | "fiery";
  text: string;
}

export interface PressConfExchange {
  question: PressConfQuestion;
  responseMode: "choice" | "text" | "voice";
  userAnswer: string;
  selectedTone: string;
  followUp: string | null;
  followUpAnswer: string | null;
}

export interface PressConfGrade {
  overall: string;
  composure: number;
  authenticity: number;
  deflectionSkill: number;
  headlineManagement: number;
  summary: string;
  bestMoment: string;
  worstMoment: string;
}

export interface PressConfSession {
  id: string;
  questions: PressConfQuestion[];
  exchanges: PressConfExchange[];
  grade: PressConfGrade | null;
  status: "setup" | "in_progress" | "grading" | "complete";
}
