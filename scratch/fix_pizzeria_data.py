import os

filepath = os.path.join(os.getcwd(), 'src', 'components', 'Pizzeria.tsx')

with open(filepath, 'r') as f:
    content = f.read()

# Replace generateOrder rhythms/features fetching logic
old_generate = """    const availableRhythms = RhythmsExpressions.filter((r: any) => parseInt(r.Level) <= selectedLevel && r.Category === 'Notes');
    if (availableRhythms.length > 0) {
      setTargetRhythm(availableRhythms[Math.floor(Math.random() * availableRhythms.length)]);
    } else {
      setTargetRhythm(null);
    }

    const availableDynamics = MusicalFeatures.filter((m: any) => parseInt(m.Level) <= selectedLevel && m.Category === 'Dynamics');
    const availableArticulations = MusicalFeatures.filter((m: any) => parseInt(m.Level) <= selectedLevel && m.Category === 'Articulations');"""

new_generate = """    let allAvailableRhythms: any[] = [];
    RhythmsExpressions.filter((l: any) => l.id <= selectedLevel).forEach((l: any) => {
      allAvailableRhythms = allAvailableRhythms.concat((l.introducedSymbols || []).filter((s: any) => s.Category === 'Notes'));
    });

    if (allAvailableRhythms.length > 0) {
      setTargetRhythm(allAvailableRhythms[Math.floor(Math.random() * allAvailableRhythms.length)]);
    } else {
      setTargetRhythm(null);
    }

    let allAvailableDynamics: any[] = [];
    let allAvailableArticulations: any[] = [];
    MusicalFeatures.filter((l: any) => l.id <= selectedLevel).forEach((l: any) => {
      allAvailableDynamics = allAvailableDynamics.concat((l.introducedSymbols || []).filter((s: any) => s.Category === 'Dynamics'));
      allAvailableArticulations = allAvailableArticulations.concat((l.introducedSymbols || []).filter((s: any) => s.Category === 'Articulations'));
    });
"""

content = content.replace(old_generate, new_generate)

# Replace 'features.push(availableDynamics...' with 'allAvailableDynamics...'
content = content.replace("features.push(availableDynamics", "features.push(allAvailableDynamics")
content = content.replace("features.push(availableArticulations", "features.push(allAvailableArticulations")

# Also need to fix the length checks
content = content.replace("if (availableDynamics.length > 0 && Math.random() > 0.3)", "if (allAvailableDynamics.length > 0 && Math.random() > 0.3)")
content = content.replace("if (availableArticulations.length > 0 && Math.random() > 0.4)", "if (allAvailableArticulations.length > 0 && Math.random() > 0.4)")


# Replace mapping inside the render method for Base (Rhythms)
old_base = """{RhythmsExpressions.filter((r: any) => parseInt(r.Level) <= (selectedLevel || 1) && r.Category === 'Notes').map((rhythm: any) => ("""
new_base = """{RhythmsExpressions.filter((l: any) => l.id <= (selectedLevel || 1)).flatMap((l: any) => l.introducedSymbols || []).filter((r: any) => r.Category === 'Notes').map((rhythm: any) => ("""
content = content.replace(old_base, new_base)

# Replace mapping for Toppings (Features)
old_toppings = """{MusicalFeatures.filter((m: any) => parseInt(m.Level) <= (selectedLevel || 1) && (m.Category === 'Dynamics' || m.Category === 'Articulations')).map((feature: any) => {"""
new_toppings = """{MusicalFeatures.filter((l: any) => l.id <= (selectedLevel || 1)).flatMap((l: any) => l.introducedSymbols || []).filter((m: any) => m.Category === 'Dynamics' || m.Category === 'Articulations').map((feature: any) => {"""
content = content.replace(old_toppings, new_toppings)


# Replace level string generation
old_level_strings = """      const levelRhythms = RhythmsExpressions.filter((r: any) => parseInt(r.Level) === levelId).map((r: any) => r.Name).join(', ');
      const levelExpressions = MusicalFeatures.filter((m: any) => parseInt(m.Level) === levelId).map((m: any) => m.Name).join(', ');"""
new_level_strings = """      const rhythmLevelObj = RhythmsExpressions.find((l: any) => l.id === levelId);
      const levelRhythms = (rhythmLevelObj?.introducedSymbols || []).filter((r: any) => r.Category === 'Notes').map((r: any) => r.Name).join(', ');
      const featuresLevelObj = MusicalFeatures.find((l: any) => l.id === levelId);
      const levelExpressions = (featuresLevelObj?.introducedSymbols || []).filter((m: any) => m.Category === 'Dynamics' || m.Category === 'Articulations').map((m: any) => m.Name).join(', ');"""
content = content.replace(old_level_strings, new_level_strings)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated Pizzeria.tsx variables")
