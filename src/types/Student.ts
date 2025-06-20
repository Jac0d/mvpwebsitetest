export interface Student {
  id: number;
  name: string;
  progress: {
    [key: string]: number | { progress: number; competent?: boolean };
  };
  userID: string;
  yearLevel: string;
} 