export interface KnowledgeBaseEntry {
  keywords: string[];
  answer: string;
}

export const KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  {
    keywords: ['squeak', 'squeaking', 'high pitched', 'squeaks'],
    answer: "Squeaking usually means your bottom lip is too loose or you are biting too hard on the reed. Try saying the letter 'M' to firm up your corners, support with your lower lip, and blow fast, warm air!",
  },
  {
    keywords: ['rest', 'squiggly line', 'squiggle', 'squiggly'],
    answer: "That squiggly line is a Quarter Rest! It means you need to be completely silent for one full beat. Rest and don't play anything during this beat!",
  },
  {
    keywords: ['breathe', 'breath', 'air', 'blowing', 'blow'],
    answer: "Always take a big, deep breath from your belly, not your shoulders! Imagine filling up a balloon inside your stomach, then push that fast, steady column of air through the clarinet.",
  },
  {
    keywords: ['e note', 'middle e', 'note e', 'how to play e'],
    answer: "Middle E sits on the bottom-most line of the treble stave. To play Middle E on the clarinet, place your thumb over the back hole and cover the top pointer hole with your left index finger!",
  },
  {
    keywords: ['d note', 'middle d', 'note d', 'how to play d'],
    answer: "Middle D is located in the space right below the treble stave. To play Middle D, cover the back thumb hole and the top two finger holes of your left hand!",
  },
  {
    keywords: ['c note', 'middle c', 'note c', 'how to play c'],
    answer: "Middle C is written below the stave on a ledger line. To play Middle C, cover the back thumb hole, all three finger holes on your left hand, and all three finger holes on your right hand!",
  },
];

export function generateAidenResponse(userQuery: string): string {
  const queryLower = userQuery.toLowerCase();
  
  for (const entry of KNOWLEDGE_BASE) {
    for (const keyword of entry.keywords) {
      if (queryLower.includes(keyword)) {
        return entry.answer;
      }
    }
  }

  return "Hmm, that is a great question! I am still learning, so you should definitely ask your teacher about that in your next lesson. Want to try a practice game in the meantime?";
}
