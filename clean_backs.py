import os, re
files = ['PlacementQuiz.tsx', 'AccountPage.tsx', 'ConcertHall.tsx', 'SettingsHub.tsx', 'MusictopiaCastle.tsx', 'ShopPage.tsx', 'LevelPage.tsx', 'TeacherDashboard.tsx', 'TeacherSyllabus.tsx']
for f in files:
    path = f'src/components/{f}'
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as file: content = file.read()
    
    # Very specific regexes to remove the old custom back buttons in these 9 files
    content = re.sub(r'<button[^>]*onClick=\{onBack\}[^>]*>[\s\S]*?</button>', '', content)
    
    with open(path, 'w', encoding='utf-8') as file: file.write(content)
