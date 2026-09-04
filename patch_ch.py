import os, re

path = 'src/components/ConcertHall.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add getInventoryClasses helper outside the component
helper = """const getEquippedClasses = (inventory: any) => {
  let borderClass = "border-white/40";
  let bgClass = "bg-white/10";
  let shadowClass = "shadow-[0_20px_50px_rgba(0,0,0,0.5)]";

  if (inventory && typeof inventory === 'object' && inventory.equipped) {
    const { border, background } = inventory.equipped;
    
    if (border === 'border_gold') { borderClass = "border-amber-400"; shadowClass = "shadow-[0_0_30px_rgba(251,191,36,0.8)]"; }
    else if (border === 'border_neon') { borderClass = "border-sky-400"; shadowClass = "shadow-[0_0_30px_rgba(56,189,248,0.8)]"; }
    else if (border === 'border_fire') { borderClass = "border-rose-500 animate-pulse"; shadowClass = "shadow-[0_0_40px_rgba(244,63,94,0.9)]"; }
    else if (border === 'border_diamond') { borderClass = "border-cyan-300"; shadowClass = "shadow-[0_0_50px_rgba(103,232,249,1)]"; }

    if (background === 'bg_stars') bgClass = "bg-slate-900 bg-[url('/images/stars.png')] bg-cover";
    else if (background === 'bg_concert') bgClass = "bg-fuchsia-900";
    else if (background === 'bg_galaxy') bgClass = "bg-purple-900 animate-pulse";
  }
  
  return { borderClass, bgClass, shadowClass };
};

export default function ConcertHall"""

content = content.replace('export default function ConcertHall', helper)

# Update the rendering for Student/Parent View (p is the profile)
# Original: <div className="w-40 h-40 bg-white/10 backdrop-blur-md border-4 border-white/40 rounded-full flex items-center justify-center text-7xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:border-emerald-400 group-hover:bg-white/20 transition-all">
student_replace = """                 {/* Fixed avatar on stage, not draggable */}
                 <div className={w-40 h-40 backdrop-blur-md border-4 rounded-full flex items-center justify-center text-7xl transition-all relative    group-hover:scale-105}>
                   {p.inventory?.equipped?.badge && (
                     <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white z-20">?</div>
                   )}
                   {p.avatar_data?.url ? <img src={/avatars/} alt="avatar" className="w-full h-full object-cover rounded-full mix-blend-luminosity hover:mix-blend-normal transition-all" /> : (p.avatar_data?.emoji || '??')}
                 </div>"""
content = re.sub(r'\{/\* Fixed avatar on stage, not draggable \*/\}.*?</div>', student_replace, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ConcertHall")
