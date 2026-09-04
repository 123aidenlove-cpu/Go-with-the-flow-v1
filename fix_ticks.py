import re

path = 'src/components/ShopPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix div className
content = re.sub(r'className=\{p-6 rounded-3xl border-4 flex flex-col justify-between transition-all bg-slate-800/80 hover:-translate-y-1 \}', 
                 r'className={p-6 rounded-3xl border-4 flex flex-col justify-between transition-all bg-slate-800/80 hover:-translate-y-1 }', content)

# Fix button className
content = re.sub(r'className=\{w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 \}',
                 r'className={w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 }', content)


# Fix the bg-sky-500/20 className as well
content = re.sub(r'className=\{ px-3 py-1\.5 rounded-full font-black flex items-center gap-2 whitespace-nowrap\}',
                 r'className={${isRare ? "bg-sky-500/20 text-sky-400" : "bg-emerald-500/20 text-emerald-400"} px-3 py-1.5 rounded-full font-black flex items-center gap-2 whitespace-nowrap}', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
