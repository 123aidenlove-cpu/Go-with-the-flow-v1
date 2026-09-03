import os, re

files = ['AidenOnboarding.tsx', 'AccountPage.tsx', 'PlacementQuiz.tsx', 'ConcertHall.tsx', 'ParentDashboard.tsx', 'TeacherDashboard.tsx', 'TeacherSyllabus.tsx', 'ShopPage.tsx', 'LevelPage.tsx', 'SettingsHub.tsx']
for f in files:
    path = f'src/components/{f}'
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as file: content = file.read()
    
    # 1. Add overflow-y-auto to full screen containers
    content = re.sub(r'className="([^"]*(?:h-screen|inset-0)[^"]*)"', lambda m: m.group(0) if 'overflow-y-auto' in m.group(0) or 'overflow-hidden' in m.group(0) else f'className="{m.group(1)} overflow-y-auto"', content)
    
    # 2. In AidenOnboarding specifically, add max-h-[90vh] and overflow-y-auto to the modal card
    if f == 'AidenOnboarding.tsx':
        content = content.replace('max-w-lg overflow-hidden', 'max-w-lg max-h-[90vh] overflow-y-auto')
        
    with open(path, 'w', encoding='utf-8') as file: file.write(content)
    print(f"Updated {f}")
