import os

filepath = os.path.join(os.getcwd(), 'src', 'components', 'ui', 'UniversalGameHomepage.tsx')
with open(filepath, 'r') as f:
    content = f.read()

old_pizzeria_details = """                  {/* MUSIC PIZZERIA DETAILS */}
                  {gameTitle === 'Music Pizzeria' && (
                    <div className="flex flex-col gap-3 mt-2 text-white drop-shadow-md">
                      {level.targetNotes && (
                        <div className="bg-black/30 rounded-xl p-3 border border-white/10 shadow-inner flex flex-col">
                          <span className="font-black text-lg text-white/80 uppercase mb-1 tracking-widest">Target Notes</span>
                          <span className="font-bold text-xl leading-tight">{level.targetNotes}</span>
                        </div>
                      )}
                      {level.targetRhythms && (
                        <div className="bg-black/30 rounded-xl p-3 border border-white/10 shadow-inner flex flex-col">
                          <span className="font-black text-lg text-white/80 uppercase mb-1 tracking-widest">Target Rhythms</span>
                          <span className="font-bold text-xl leading-tight">{level.targetRhythms}</span>
                        </div>
                      )}
                      {level.targetExpressions && (
                        <div className="bg-black/30 rounded-xl p-3 border border-white/10 shadow-inner flex flex-col">
                          <span className="font-black text-lg text-white/80 uppercase mb-1 tracking-widest">Target Expressions</span>
                          <span className="font-bold text-xl leading-tight">{level.targetExpressions}</span>
                        </div>
                      )}
                    </div>
                  )}"""

new_pizzeria_details = """                  {/* MUSIC PIZZERIA DETAILS */}
                  {gameTitle === 'Music Pizzeria' && (
                    <div className="flex flex-col gap-2 mt-2 text-white drop-shadow-md">
                      {level.targetNotes && (
                        <div className="bg-black/30 rounded-xl p-3 border border-white/10 shadow-inner flex flex-col items-center">
                          <span className="font-black text-sm text-white/80 uppercase tracking-widest mb-1">Target Notes</span>
                          <span className="font-bold text-2xl leading-tight">{level.targetNotes}</span>
                        </div>
                      )}
                      <div className="flex flex-row gap-2 w-full">
                        {level.targetRhythms && (
                          <div className="bg-black/30 rounded-xl py-3 px-1 border border-white/10 shadow-inner flex flex-col flex-1 items-center justify-center">
                            <span className="font-black text-[10px] text-white/80 uppercase tracking-widest mb-1">Base</span>
                            <span className="font-bold text-4xl leading-tight">{level.targetRhythms}</span>
                          </div>
                        )}
                        {level.targetExpressions && (
                          <div className="bg-black/30 rounded-xl py-3 px-1 border border-white/10 shadow-inner flex flex-col flex-1 items-center justify-center">
                            <span className="font-black text-[10px] text-white/80 uppercase tracking-widest mb-1">Toppings</span>
                            <span className="font-bold text-4xl leading-tight">{level.targetExpressions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}"""

content = content.replace(old_pizzeria_details, new_pizzeria_details)

# Fix the duplicate rhythm output for Music Pizzeria
old_rhythm_duplicate = """                  {level.targetRhythms && (
                    <div className="flex-shrink-0">
                      <p className="text-xs font-black uppercase opacity-60 mb-1">Rhythms</p>
                      <p className="font-bold text-lg">{level.targetRhythms}</p>
                    </div>
                  )}"""

new_rhythm_duplicate = """                  {level.targetRhythms && gameTitle !== 'Music Pizzeria' && (
                    <div className="flex-shrink-0">
                      <p className="text-xs font-black uppercase opacity-60 mb-1">Rhythms</p>
                      <p className="font-bold text-lg">{level.targetRhythms}</p>
                    </div>
                  )}"""

content = content.replace(old_rhythm_duplicate, new_rhythm_duplicate)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated UniversalGameHomepage.tsx successfully")
