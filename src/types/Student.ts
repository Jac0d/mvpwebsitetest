export interface Student {
  id: number;
  name: string;
  progress: {
    [key: string]: number | { 
      progress: number; 
      competent?: boolean;
      completionDate?: string; // ISO date string when progress reaches 100%
      competencyDate?: string; // ISO date string when marked competent
    };
  };
  userID: string;
  yearLevel: string;
} 