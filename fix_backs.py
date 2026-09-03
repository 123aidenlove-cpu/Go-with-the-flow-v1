import os
import re

files = ['PlacementQuiz.tsx', 'AccountPage.tsx', 'ConcertHall.tsx', 'SettingsHub.tsx', 'MusictopiaCastle.tsx', 'ShopPage.tsx', 'LevelPage.tsx', 'TeacherDashboard.tsx', 'TeacherSyllabus.tsx']

for f in files:
    path = f'src/components/{f}'
    if not os.path.exists(path): continue
    
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
        
    if 'BackButton' not in content:
        content = f"import {{ BackButton }} from './ui/BackButton';\n" + content
        
        # We find the main return and inject it right after the first <div
        content = re.sub(r'(return\s*\(\s*<div[^>]*>)', r'\1\n      <BackButton onClick={onBack} />', content, count=1)
        
        with open(path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Updated {f}")
