const fs = require('fs');

const games = [
    { file: 'src/components/FingerFishing.tsx', title: 'Finger Fishing', scoreVar: 'score' },
    { file: 'src/components/RhythmRapids.tsx', title: 'Rhythm Rapids', scoreVar: 'correctAnswers' },
    { file: 'src/components/Pizzeria.tsx', title: 'Music Pizzeria', scoreVar: 'totalTips', completeVar: 'dayComplete' },
    { file: 'src/components/SightReadSoaring.tsx', title: 'Sight Read Soaring', scoreVar: 'score', completeVar: 'isComplete', noLevel: true }
];

for (const g of games) {
    if (!fs.existsSync(g.file)) {
        console.log("Missing " + g.file);
        continue;
    }
    let content = fs.readFileSync(g.file, 'utf8');
    
    // Add import
    if (!content.includes('saveGameScore')) {
        content = content.replace(/(import .*?;)/, "$1\nimport { saveGameScore } from '../utils/supabaseSync';");
    }

    if (!content.includes('useRef')) {
        content = content.replace(/import React(?:, \{ (.*?) \})? from 'react';/, (match, p1) => {
            if (p1) return `import React, { ${p1}, useRef, useEffect } from 'react';`;
            return `import React, { useRef, useEffect } from 'react';`;
        });
    }

    const compVar = g.completeVar || 'levelCleared';
    let levelDep = g.noLevel ? '1' : 'selectedLevel !== null ? selectedLevel : 1';
    let levelCheck = g.noLevel ? '' : ' && selectedLevel !== null';
    let depLevel = g.noLevel ? '' : 'selectedLevel, ';

    const effectCode = `
  const hasSavedScoreRef = useRef(false);
  useEffect(() => {
    ${g.noLevel ? '' : 'if (selectedLevel !== null) '}hasSavedScoreRef.current = false;
  }, [${g.noLevel ? '' : 'selectedLevel'}]);

  useEffect(() => {
    if ((gameOver || ${compVar})${levelCheck} && !hasSavedScoreRef.current) {
      saveGameScore('${g.title}', ${levelDep}, ${g.scoreVar}, 0);
      hasSavedScoreRef.current = true;
    }
  }, [gameOver, ${compVar}, ${depLevel}${g.scoreVar}]);
`;

    if (!content.includes('hasSavedScoreRef')) {
         content = content.replace(/(const \[gameOver.*?\] = useState.*?;\n)/, "$1" + effectCode);
    }
    
    fs.writeFileSync(g.file, content, 'utf8');
    console.log('Patched ' + g.title);
}
