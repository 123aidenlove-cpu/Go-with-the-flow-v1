import os
import re

components_dir = 'src/components'
files_to_check = [
    'PlacementQuiz.tsx', 'LessonOne.tsx', 'ConcertHall.tsx', 'PracticeHub.tsx', 
    'TeacherStudentProfile.tsx', 'TeacherLessonView.tsx', 'Pizzeria.tsx', 
    'GlobalLeaderboard.tsx', 'RocketReading.tsx', 'RhythmRapids.tsx', 
    'FingerFishing.tsx', 'SightReadSoaring.tsx', 'SoundSleuth.tsx', 
    'ScaleSandDunes.tsx', 'ListeningLagoon.tsx', 'ClefCliffs.tsx', 
    'ReferenceLibrary.tsx', 'AskAiden.tsx', 'ExpressionNinja.tsx', 
    'MatchIt.tsx', 'ParentDashboard.tsx', 'AccountPage.tsx', 
    'MusictopiaCastle.tsx', 'SettingsHub.tsx', 'LevelPage.tsx', 
    'ShopPage.tsx', 'TeacherDashboard.tsx', 'TeacherSyllabus.tsx'
]

for filename in files_to_check:
    filepath = os.path.join(components_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original_content = content
    
    # Check if file has onBack or onExit
    if 'onBack' not in content and 'onExit' not in content:
        continue

    # 1. Add import if not exists
    if 'BackButton' not in content:
        import_stmt = "import { BackButton } from './ui/BackButton';\n"
        imports = list(re.finditer(r'^import .*?;\n', content, re.MULTILINE))
        if imports:
            last_import = imports[-1]
            content = content[:last_import.end()] + import_stmt + content[last_import.end():]
        else:
            content = import_stmt + content

    # 2. Try to find existing back buttons and remove them
    content = re.sub(r'<button[^>]*onClick=\{on(Back|Exit)\}[^>]*>[\s\S]*?</button>', '', content)
    content = re.sub(r'<button[^>]*onClick=\{\(\) => on(Back|Exit)\(\)\}[^>]*>[\s\S]*?</button>', '', content)
    # Also handle some edge cases
    content = re.sub(r'<button[^>]*onClick=\{\(e\) => \{[^}]*onBack[^}]*\}\}[^>]*>[\s\S]*?</button>', '', content)

    # 3. Inject <BackButton onClick={onBack} /> right after the first `return (` inside the main component
    match = re.search(r'return\s*\(\s*(<[a-zA-Z0-9]+[^>]*>)', content)
    if match:
        prop_name = 'onExit' if ('onExit' in filename or 'TeacherLessonView' in filename) else 'onBack'
        back_btn_str = f'\n      <BackButton onClick={{{prop_name}}} />'
        content = content[:match.end(1)] + back_btn_str + content[match.end(1):]
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
