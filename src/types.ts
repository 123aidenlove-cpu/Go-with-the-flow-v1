export interface Song {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  stars: number;
  unlocked: boolean;
  notes: string[]; // e.g. ['E', 'D', 'C', 'D', 'E', 'E', 'E']
  rhythms: string[]; // e.g. ['Minim', 'Crotchet', 'Crotchet']
}

export type Screen = 
  | 'map'
  | 'concert-hall'
  | 'pizzeria'
  | 'rocket-reading'
  | 'rhythm-rapids'
  | 'finger-fishing'
  | 'sight-read-soaring'
  | 'lesson-one'
  | 'reference-library'
  | 'ask-aiden'
  | 'daily-challenge'
  | 'parent-dashboard';

export interface GameProgress {
  pizzeriaLevel: number;
  rocketLevel: number;
  rapidsLevel: number;
  fishingLevel: number;
  soaringLevel: number;
  lessonStep: number; // current step in Lesson 1 (1 to 4)
  completedLessons: string[];
  repertoireStars: Record<string, number>;
}
