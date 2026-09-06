import re

# 1. Patch RhythmRapids.tsx
path = 'src/components/RhythmRapids.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a check to prevent undoing swaps resulting in the exact same sequence
fix = """                  if (sameDurationReplacements.length > 1) {
                      let newBlock = sameDurationReplacements[Math.floor(Math.random() * sameDurationReplacements.length)];
                      let escape = 0;
                      while (JSON.stringify(newBlock.notes) === JSON.stringify(blockToReplace.notes) && escape < 20) {
                          newBlock = sameDurationReplacements[Math.floor(Math.random() * sameDurationReplacements.length)];
                          escape++;
                      }
                      if (JSON.stringify(newBlock.notes) !== JSON.stringify(blockToReplace.notes)) {
                          wrongBlocks[idx1] = newBlock;
                          mutated = true;
                      }
                  }
              }
              
              if (JSON.stringify(wrongBlocks) === JSON.stringify(correctBlocks)) {
                  mutated = false;
              }
              
              if (!mutated) {"""

content = content.replace("""                  if (sameDurationReplacements.length > 1) {
                      let newBlock = sameDurationReplacements[Math.floor(Math.random() * sameDurationReplacements.length)];
                      let escape = 0;
                      while (JSON.stringify(newBlock.notes) === JSON.stringify(blockToReplace.notes) && escape < 20) {
                          newBlock = sameDurationReplacements[Math.floor(Math.random() * sameDurationReplacements.length)];
                          escape++;
                      }
                      if (JSON.stringify(newBlock.notes) !== JSON.stringify(blockToReplace.notes)) {
                          wrongBlocks[idx1] = newBlock;
                          mutated = true;
                      }
                  }
              }
              
              if (!mutated) {""", fix)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Patch Pizzeria.tsx
path2 = 'src/components/Pizzeria.tsx'
with open(path2, 'r', encoding='utf-8') as f:
    content2 = f.read()

# Make ticket text darker
content2 = content2.replace('text-xl leading-relaxed text-gray-800 font-bold', 'text-xl leading-relaxed text-slate-900 font-black')

# Format the toppings as a sublist
old_toppings = """                   {targetFeatures.map((f, i) => (
                     <li key={eature-}>Topping: {f.Name}</li>
                   ))}"""
new_toppings = """                   {targetFeatures.length > 0 && (
                     <li>
                       Toppings:
                       <ul className="list-[circle] pl-6 mt-1 space-y-1">
                         {targetFeatures.map((f, i) => (
                           <li key={eature-}>{f.Name}</li>
                         ))}
                       </ul>
                     </li>
                   )}"""
content2 = content2.replace(old_toppings, new_toppings)

# Make base buttons darker
content2 = content2.replace('text-xs font-bold truncate', 'text-sm font-black text-slate-900 truncate')
# In case there's another occurrence or exact match is tricky:
content2 = re.sub(r'text-xs font-bold truncate w-full text-center px-1', 'text-sm font-black text-slate-900 truncate w-full text-center px-1', content2)

with open(path2, 'w', encoding='utf-8') as f:
    f.write(content2)

print("Patched both files!")
