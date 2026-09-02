import os

filepath = os.path.join(os.getcwd(), 'src', 'components', 'Pizzeria.tsx')
with open(filepath, 'r') as f:
    content = f.read()

# 1. Increase Finger Chart size
old_finger_chart = """        {/* 2. Sauce (Fingers) - Middle Column */}
        <div className="w-1/3 p-6 flex flex-col items-center mt-[12rem] overflow-y-auto hide-scrollbar z-10">
          <h3 className="text-2xl font-black text-slate-700 mb-6 text-center uppercase tracking-widest drop-shadow-sm">Sauce</h3>
          <div className="scale-[1.2] origin-top bg-white/60 p-6 rounded-3xl shadow-xl border-4 border-yellow-200">
            {getFingeringComponent(targetNote)}
          </div>
        </div>"""
new_finger_chart = """        {/* 2. Sauce (Fingers) - Middle Column */}
        <div className="w-1/3 p-6 flex flex-col items-center mt-[12rem] overflow-y-auto hide-scrollbar z-10">
          <h3 className="text-2xl font-black text-slate-700 mb-6 text-center uppercase tracking-widest drop-shadow-sm">Sauce</h3>
          <div className="scale-[1.6] origin-top bg-white/60 p-6 rounded-3xl shadow-xl border-4 border-yellow-200 mt-10">
            {getFingeringComponent(targetNote)}
          </div>
        </div>"""
content = content.replace(old_finger_chart, new_finger_chart)

# 2. Change Order Ticket Base text
old_ticket_base = """                 {targetRhythm && <li>Base: {targetRhythm.Name}</li>}"""
new_ticket_base = """                 {targetRhythm && <li>Base: {targetRhythm['Beats (4/4 time)']} {targetRhythm['Beats (4/4 time)'] === '1' ? 'beat' : 'beats'}</li>}"""
content = content.replace(old_ticket_base, new_ticket_base)

# 3. Add rhythm.Name below rhythm.Notation
old_rhythm_btn = """              <button
                key={rhythm.Name}
                onClick={() => setCurrentRhythm(rhythm.Name)}
                className={`flex items-center justify-center h-24 rounded-2xl text-6xl shadow-md transition-all border-4 ${currentRhythm === rhythm.Name ? 'bg-amber-100 border-amber-400 scale-105' : 'bg-white border-transparent hover:bg-slate-50'}`}
              >
                {rhythm.Notation}
              </button>"""
new_rhythm_btn = """              <button
                key={rhythm.Name}
                onClick={() => setCurrentRhythm(rhythm.Name)}
                className={`flex flex-col items-center justify-center h-32 rounded-2xl shadow-md transition-all border-4 ${currentRhythm === rhythm.Name ? 'bg-amber-100 border-amber-400 scale-105' : 'bg-white border-transparent hover:bg-slate-50'}`}
              >
                <span className="text-6xl mb-2">{rhythm.Notation}</span>
                <span className="text-xs font-bold truncate w-full text-center px-1">{rhythm.Name}</span>
              </button>"""
content = content.replace(old_rhythm_btn, new_rhythm_btn)

# 4. Remove feature.Name from Toppings and use DynamicScore
old_feature_btn = """              <button
                key={feature.Name}
                onClick={() => toggleFeature(feature.Name)}
                className={`flex flex-col items-center justify-center p-2 h-24 rounded-2xl shadow-md transition-all border-4 ${currentFeatures.has(feature.Name) ? 'bg-amber-100 border-amber-400 scale-105' : 'bg-white border-transparent hover:bg-slate-50'}`}
              >
                <span className="text-4xl font-black mb-2">{feature.Symbol}</span>
                <span className="text-xs font-bold truncate w-full text-center">{feature.Name}</span>
              </button>"""
new_feature_btn = """              <button
                key={feature.Name}
                onClick={() => toggleFeature(feature.Name)}
                className={`flex flex-col items-center justify-center p-2 h-32 rounded-2xl shadow-md transition-all border-4 overflow-hidden ${currentFeatures.has(feature.Name) ? 'bg-amber-100 border-amber-400 scale-105' : 'bg-white border-transparent hover:bg-slate-50'}`}
              >
                <div className="scale-75 pointer-events-none transform -translate-y-4">
                  <DynamicScore 
                    notes={[{ 
                      keys: ["g/4"], 
                      duration: "q", 
                      articulation: feature.Category === 'Articulations' ? feature.VexFlow_Hint : undefined,
                      dynamic: feature.Category === 'Dynamics' ? feature.VexFlow_Hint : undefined
                    }]} 
                    width={80} 
                    height={100} 
                  />
                </div>
              </button>"""
content = content.replace(old_feature_btn, new_feature_btn)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated Pizzeria.tsx successfully")
