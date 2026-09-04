import os, re

path = 'src/components/RhythmRapids.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
if 'calculateGameQuavits' not in content:
    content = content.replace("import { getXP, addXP } from '../utils/economy';", "import { getXP, addXP, addQuavits, calculateGameQuavits } from '../utils/economy';")

# 2. Add States
if 'const [score, setScore]' not in content:
    content = content.replace("const [gameOver, setGameOver] = useState(false);", 
        "const [gameOver, setGameOver] = useState(false);\n  const [score, setScore] = useState(0);\n  const [combo, setCombo] = useState(0);\n  const [showComboAlert, setShowComboAlert] = useState(false);\n  const [earnedQuavits, setEarnedQuavits] = useState(0);")

# 3. Replace handleChoice
handle_choice_regex = r"const handleChoice = \(side: 'left' \| 'right'\) => \{[\s\S]*?\n  \};\n\n  // Convert"
new_handle_choice = """const handleChoice = (side: 'left' | 'right') => {
    if (feedback !== null || !challenge) return;
    
    if (side === challenge.correctSide) {
      setFeedback('correct');
      addXP(10);
      
      const newCombo = combo + 1;
      setCombo(newCombo);
      const pointsEarned = 100 * (1 + (newCombo * 0.1));
      const newScore = score + pointsEarned;
      setScore(newScore);
      
      if (newCombo >= 5 && newCombo % 5 === 0) {
         setShowComboAlert(true);
         setTimeout(() => setShowComboAlert(false), 2000);
      }

      setTimeout(() => {
        setFeedback(null);
        const newAnswers = correctAnswers + 1;
        setCorrectAnswers(newAnswers);
        
        if (newAnswers > 0 && newAnswers % 5 === 0) {
          setLives(prev => Math.min(3, prev + 1));
        }
        
        if (newAnswers >= 15) {
          const quavits = calculateGameQuavits(newScore, 'rhythm-rapids');
          addQuavits(quavits);
          setEarnedQuavits(quavits);
          setLevelComplete(true);
          if (onChallengeComplete && isDailyChallenge) onChallengeComplete(15);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setCombo(0);
      
      setTimeout(() => {
        setFeedback(null);
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) {
          const quavits = calculateGameQuavits(score, 'rhythm-rapids');
          addQuavits(quavits);
          setEarnedQuavits(quavits);
          setGameOver(true);
        } else {
          if (selectedLevel) generateChallenge(selectedLevel);
        }
      }, 2500);
    }
  };

  // Convert"""

content = re.sub(handle_choice_regex, new_handle_choice, content)

# 4. Reset states on restart
content = content.replace("setGameOver(false);", "setGameOver(false);\n    setScore(0);\n    setCombo(0);\n    setEarnedQuavits(0);")

# 5. Add Quavits to GameOver and LevelComplete screens
# Game Over
game_over_replace = """<h2 className="text-5xl font-black text-slate-800 mb-4">Canoe Sank!</h2>
              <p className="text-xl text-slate-600 mb-8 font-bold">You lost all your lives. Try again!</p>
              
              <div className="bg-slate-100 p-6 rounded-2xl mb-8 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xl font-bold text-slate-700">
                  <span>Score:</span>
                  <span>{Math.floor(score)}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black text-emerald-500">
                  <span>Quavits Earned:</span>
                  <span>+{earnedQuavits}</span>
                </div>
              </div>"""
content = re.sub(r'<h2 className="text-5xl font-black text-slate-800 mb-4">Canoe Sank!</h2>\s*<p className="text-xl text-slate-600 mb-8 font-bold">You lost all your lives\. Try again!</p>', game_over_replace, content)

# Level Complete
level_complete_replace = """<h2 className="text-5xl font-black text-slate-800 mb-4">Level Complete!</h2>
              <p className="text-xl text-slate-600 mb-8 font-bold">You successfully navigated the rapids!</p>
              
              <div className="bg-sky-50 p-6 rounded-2xl mb-8 flex flex-col gap-2 border-2 border-sky-100">
                <div className="flex justify-between items-center text-xl font-bold text-sky-700">
                  <span>Score:</span>
                  <span>{Math.floor(score)}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black text-emerald-500">
                  <span>Quavits Earned:</span>
                  <span>+{earnedQuavits}</span>
                </div>
              </div>"""
content = re.sub(r'<h2 className="text-5xl font-black text-slate-800 mb-4">Level Complete!</h2>\s*<p className="text-xl text-slate-600 mb-8 font-bold">You successfully navigated the rapids!</p>', level_complete_replace, content)

# 6. Add Combo Alert in the UI
combo_alert_ui = """{/* Combo Alert */}
        <AnimatePresence>
          {showComboAlert && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 50, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 1.2, opacity: 0, y: -50 }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
              <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 via-red-500 to-yellow-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] italic tracking-tighter">
                {combo} IN A ROW! ??
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Top HUD */}"""
content = content.replace("{/* Top HUD */}", combo_alert_ui)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated RhythmRapids")
