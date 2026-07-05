export interface LearningNode {
  id: string; // e.g., "Middle E"
  noteName: string; // "E"
  title: string; // e.g., "Middle E Mastery"
  description: string;
  themeColor: string; // Tailwind class
  stages: {
    id: string; // 'Theory' | 'Fingering' | 'Recognition' | 'Rhythm' | 'SightReading' | 'MasteryTest'
    title: string;
    description: string;
    gameId: string; // Identifier for routing/components
  }[];
}

export const CURRICULUM_PIPELINE: LearningNode[] = [
  {
    id: 'Middle E',
    noteName: 'E',
    title: 'Middle E Mastery',
    description: 'Learn to read, identify, and play your very first note: Middle E!',
    themeColor: 'bg-emerald-500',
    stages: [
      {
        id: 'Theory',
        title: 'Theory',
        description: 'Meet the note Middle E on the musical stave.',
        gameId: 'Theory',
      },
      {
        id: 'Fingering',
        title: 'Fingering',
        description: 'Learn the clarinet fingering for Middle E in the Pizzeria!',
        gameId: 'Pizzeria',
      },
      {
        id: 'Recognition',
        title: 'Recognition',
        description: 'Identify Middle E in our high-speed Finger Fishing game!',
        gameId: 'FingerFishing',
      },
      {
        id: 'Rhythm',
        title: 'Rhythm',
        description: 'Tap along to the beat with Middle E in Rhythm Rapids!',
        gameId: 'RhythmRapids',
      },
      {
        id: 'SightReading',
        title: 'Sight Reading',
        description: 'Fly high and read E notes in real-time with Sight Read Soaring!',
        gameId: 'SightReadSoaring',
      },
      {
        id: 'MasteryTest',
        title: 'Mastery Test',
        description: 'Perform a live concert in the elegant Concert Hall!',
        gameId: 'ConcertHall',
      },
    ],
  },
  {
    id: 'Middle D',
    noteName: 'D',
    title: 'Middle D Mastery',
    description: 'Advance your clarinet skills by adding Middle D to your repertoire!',
    themeColor: 'bg-indigo-500',
    stages: [
      {
        id: 'Theory',
        title: 'Theory',
        description: 'See how Middle D sits on the stave.',
        gameId: 'Theory',
      },
      {
        id: 'Fingering',
        title: 'Fingering',
        description: 'Practice the fingering for D in the Pizzeria!',
        gameId: 'Pizzeria',
      },
      {
        id: 'Recognition',
        title: 'Recognition',
        description: 'Reel in the Middle D notes in Finger Fishing!',
        gameId: 'FingerFishing',
      },
      {
        id: 'Rhythm',
        title: 'Rhythm',
        description: 'Master Middle D rhythm exercises in Rhythm Rapids!',
        gameId: 'RhythmRapids',
      },
      {
        id: 'SightReading',
        title: 'Sight Reading',
        description: 'Soar through the skies reading D and E together!',
        gameId: 'SightReadSoaring',
      },
      {
        id: 'MasteryTest',
        title: 'Mastery Test',
        description: 'Play a dual-note live performance in the Concert Hall!',
        gameId: 'ConcertHall',
      },
    ],
  },
  {
    id: 'Middle C',
    noteName: 'C',
    title: 'Middle C Mastery',
    description: 'Unlock Middle C and complete the core triad of beginner clarinet notes!',
    themeColor: 'bg-amber-500',
    stages: [
      {
        id: 'Theory',
        title: 'Theory',
        description: 'Discover the ledger line note Middle C.',
        gameId: 'Theory',
      },
      {
        id: 'Fingering',
        title: 'Fingering',
        description: 'Learn how to cover all holes for Middle C in the Pizzeria!',
        gameId: 'Pizzeria',
      },
      {
        id: 'Recognition',
        title: 'Recognition',
        description: 'Quickly distinguish C, D, and E in Finger Fishing!',
        gameId: 'FingerFishing',
      },
      {
        id: 'Rhythm',
        title: 'Rhythm',
        description: 'Tap complex rhythmic patterns with C, D, and E in Rhythm Rapids!',
        gameId: 'RhythmRapids',
      },
      {
        id: 'SightReading',
        title: 'Sight Reading',
        description: 'Unleash your full sight reading power with three notes!',
        gameId: 'SightReadSoaring',
      },
      {
        id: 'MasteryTest',
        title: 'Mastery Test',
        description: 'Perform a magnificent live recital in the Concert Hall!',
        gameId: 'ConcertHall',
      },
    ],
  },
];
