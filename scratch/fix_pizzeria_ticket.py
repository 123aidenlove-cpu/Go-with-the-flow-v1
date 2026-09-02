import os

filepath = os.path.join(os.getcwd(), 'src', 'components', 'Pizzeria.tsx')
with open(filepath, 'r') as f:
    content = f.read()

old_ticket = """             <p className="text-xl leading-relaxed text-gray-800 font-semibold flex-1">
               {(() => {
                 if (!targetNote) return '...';
                 let text = targetRhythm ? `A ${targetRhythm['Beats (4/4 time)']} beat ${formatAccidentals(targetNote.label)}` : `A ${formatAccidentals(targetNote.label)}`;
                 if (targetFeatures.length > 0) {
                   const names = targetFeatures.map(f => f.Name);
                   text += ` played ${names.join(' and ')}`;
                 }
                 return text;
               })()}
             </p>"""

new_ticket = """             <div className="text-xl leading-relaxed text-gray-800 font-bold flex-1 flex flex-col justify-center">
               <ul className="list-disc pl-6 space-y-3">
                 {targetNote && <li>Note: {formatAccidentals(targetNote.label)}</li>}
                 {targetRhythm && <li>Base: <span className="text-2xl">{targetRhythm.Notation}</span></li>}
                 {targetFeatures.map((f, i) => (
                   <li key={`feature-${i}`}>Topping: <span className="text-2xl">{f.Symbol}</span></li>
                 ))}
               </ul>
             </div>"""

content = content.replace(old_ticket, new_ticket)

# Let's also check if there is a flatMap causing issues. Some older browsers/environments might have issues with flatMap. 
# We can replace flatMap with standard map and reduce just in case that's the cause of the white screen!
old_base_map = """{RhythmsExpressions.filter((l: any) => l.id <= (selectedLevel || 1)).flatMap((l: any) => l.introducedSymbols || []).filter((r: any) => r.Category === 'Notes').map((rhythm: any) => ("""
new_base_map = """{RhythmsExpressions.filter((l: any) => l.id <= (selectedLevel || 1)).reduce((acc: any[], l: any) => acc.concat(l.introducedSymbols || []), []).filter((r: any) => r.Category === 'Notes').map((rhythm: any) => ("""
content = content.replace(old_base_map, new_base_map)

old_toppings_map = """{MusicalFeatures.filter((l: any) => l.id <= (selectedLevel || 1)).flatMap((l: any) => l.introducedSymbols || []).filter((m: any) => m.Category === 'Dynamics' || m.Category === 'Articulations').map((feature: any) => {"""
new_toppings_map = """{MusicalFeatures.filter((l: any) => l.id <= (selectedLevel || 1)).reduce((acc: any[], l: any) => acc.concat(l.introducedSymbols || []), []).filter((m: any) => m.Category === 'Dynamics' || m.Category === 'Articulations').map((feature: any) => {"""
content = content.replace(old_toppings_map, new_toppings_map)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated Pizzeria.tsx with dot points and safer array methods")
