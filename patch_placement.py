import re

# 1. Update App.tsx onComplete
path_app = 'src/App.tsx'
with open(path_app, 'r', encoding='utf-8') as f:
    app_content = f.read()

if "import { addToInventory } from './utils/economy';" not in app_content:
    app_content = app_content.replace("import { PlacementQuiz } from './components/PlacementQuiz';", "import { PlacementQuiz } from './components/PlacementQuiz';\nimport { addToInventory } from './utils/economy';")

old_oncomplete = """          onComplete={(league, notes) => {
            console.log("Placement Complete:", league, notes);
            setScreen('map');
          }}"""
new_oncomplete = """          onComplete={(league, notes) => {
            console.log("Placement Complete:", league, notes);
            addToInventory('placement_done');
            setScreen('map');
          }}"""
app_content = app_content.replace(old_oncomplete, new_oncomplete)

with open(path_app, 'w', encoding='utf-8') as f:
    f.write(app_content)


# 2. Update ConcertHall.tsx inventory check
path_ch = 'src/components/ConcertHall.tsx'
with open(path_ch, 'r', encoding='utf-8') as f:
    ch_content = f.read()

old_check = """        // Enforce Placement Test on very first play
        if (!profile.inventory?.includes('placement_done')) {"""
new_check = """        // Enforce Placement Test on very first play
        const isPlacementDone = Array.isArray(profile.inventory) 
          ? profile.inventory.includes('placement_done') 
          : profile.inventory?.items?.includes('placement_done');
          
        if (!isPlacementDone) {"""

ch_content = ch_content.replace(old_check, new_check)

with open(path_ch, 'w', encoding='utf-8') as f:
    f.write(ch_content)

print("Patched placement quiz issue!")
