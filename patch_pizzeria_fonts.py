path = 'src/components/Pizzeria.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix rhythm notation text color
content = content.replace('<span className="text-6xl mb-2">{rhythm.Notation}</span>', '<span className="text-6xl mb-2 text-slate-900">{rhythm.Notation}</span>')

# Fix order ticket title text color
content = content.replace('<h2 className="text-xl font-bold border-b-2 border-dashed border-gray-300 pb-2 mb-4 text-center">', '<h2 className="text-xl font-black text-slate-900 border-b-4 border-dashed border-slate-300 pb-2 mb-4 text-center">')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed fonts in Pizzeria.tsx")
