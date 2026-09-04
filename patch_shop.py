import os, re

path = 'src/components/ShopPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Imports
content = content.replace("import { getQuavits, addQuavits, getRareQuavits, addRareQuavits } from '../utils/economy';", "import { getQuavits, addQuavits, getRareQuavits, addRareQuavits, getInventory, addToInventory, equipItem, Inventory } from '../utils/economy';")

# Define new categories
content = content.replace("type ShopCategory = 'avatars' | 'decor' | 'backdrops' | 'games';", "type ShopCategory = 'borders' | 'backgrounds' | 'badges' | 'ultimates';")

# Define new SHOP_ITEMS
new_items = """const SHOP_ITEMS: ShopItem[] = [
  // Borders
  { id: 'border_gold', category: 'borders', name: "Golden Glow", price: 500, currency: 'common', desc: "A radiant golden aura that surrounds your avatar.", available: true },
  { id: 'border_neon', category: 'borders', name: "Neon Cyber", price: 1000, currency: 'common', desc: "Pulsing neon blue and pink borders.", available: true },
  { id: 'border_fire', category: 'borders', name: "Blazing Fire", price: 2500, currency: 'common', desc: "Animated flames that dance around your profile.", available: true },
  { id: 'border_diamond', category: 'borders', name: "Diamond Crystal", price: 5, currency: 'rare', desc: "The ultimate flex. Shimmering diamond facets.", available: true },
  
  // Backgrounds
  { id: 'bg_stars', category: 'backgrounds', name: "Starry Night", price: 800, currency: 'common', desc: "A twinkling starry sky behind your avatar.", available: true },
  { id: 'bg_concert', category: 'backgrounds', name: "Concert Lights", price: 1200, currency: 'common', desc: "Bright stage lights pointing at you.", available: true },
  { id: 'bg_galaxy', category: 'backgrounds', name: "Deep Galaxy", price: 3, currency: 'rare', desc: "A mesmerizing view of deep space.", available: true },
  
  // Badges
  { id: 'badge_pro', category: 'badges', name: "Pro Musician", price: 200, currency: 'common', desc: "A sleek 'PRO' badge that floats next to you.", available: true },
  { id: 'badge_star', category: 'badges', name: "Shooting Star", price: 500, currency: 'common', desc: "An animated shooting star badge.", available: true },
  
  // Ultimates (3D avatars)
  { id: 'ult_maestro', category: 'ultimates', name: "The Maestro", price: 10000, currency: 'common', desc: "A fully 3D rendered Golden Owl with a tuxedo.", available: true },
  { id: 'ult_virtuoso', category: 'ultimates', name: "The Virtuoso", price: 20, currency: 'rare', desc: "An ultra-rare 3D crystalline avatar.", available: true },
];"""
content = re.sub(r'const SHOP_ITEMS: ShopItem\[\] = \[.*?\];', new_items, content, flags=re.DOTALL)

# Update ShopPage Component state
state_replace = """export default function ShopPage({ onBack }: ShopPageProps) {
  const [quavits, setQuavits] = useState(0);
  const [rareQuavits, setRareQuavits] = useState(0);
  const [inventory, setInventoryState] = useState<Inventory>({ items: [], equipped: { border: null, background: null, badge: null } });
  const [activeTab, setActiveTab] = useState<ShopCategory>('borders');

  useEffect(() => {
    setQuavits(getQuavits());
    setRareQuavits(getRareQuavits());
    setInventoryState(getInventory());
  }, []);

  const handlePurchaseOrEquip = (item: ShopItem) => {
    const isOwned = inventory.items.includes(item.id);
    
    if (isOwned) {
      // Equip logic
      let cat: keyof Inventory['equipped'] | null = null;
      if (item.category === 'borders') cat = 'border';
      if (item.category === 'backgrounds') cat = 'background';
      if (item.category === 'badges') cat = 'badge';
      
      if (cat) {
        if (inventory.equipped[cat] === item.id) {
          equipItem(cat, null); // Unequip
        } else {
          equipItem(cat, item.id);
        }
        setInventoryState(getInventory());
      }
      return;
    }

    // Purchase logic
    if (item.currency === 'common' && quavits >= item.price) {
      addQuavits(-item.price);
      addToInventory(item.id);
      setQuavits(getQuavits());
      setInventoryState(getInventory());
    } else if (item.currency === 'rare' && rareQuavits >= item.price) {
      addRareQuavits(-item.price);
      addToInventory(item.id);
      setRareQuavits(getRareQuavits());
      setInventoryState(getInventory());
    }
  };"""
content = re.sub(r'export default function ShopPage\(\{ onBack \}: ShopPageProps\) \{.*?\};\n\n  const filteredItems', state_replace + '\n\n  const filteredItems', content, flags=re.DOTALL)

# Fix Category Tabs
tabs_replace = """{ id: 'borders', name: 'Borders', icon: ImageIcon },
            { id: 'backgrounds', name: 'Backgrounds', icon: Castle },
            { id: 'badges', name: 'Badges', icon: Shirt },
            { id: 'ultimates', name: 'Ultimates', icon: Gamepad2 }"""
content = re.sub(r"\{\s*id: 'avatars'.*?icon: Gamepad2\s*\}", tabs_replace, content, flags=re.DOTALL)

# Fix items mapping
item_map_replace = """{filteredItems.map((item) => {
            const isRare = item.currency === 'rare';
            const iconSrc = isRare ? APP_ASSETS.ui.rareQuavits : APP_ASSETS.ui.quavits;
            const themeColor = isRare ? 'sky' : 'emerald';
            const isOwned = inventory.items.includes(item.id);
            
            let isEquipped = false;
            if (item.category === 'borders') isEquipped = inventory.equipped.border === item.id;
            if (item.category === 'backgrounds') isEquipped = inventory.equipped.background === item.id;
            if (item.category === 'badges') isEquipped = inventory.equipped.badge === item.id;
            
            const canAfford = isOwned || (isRare ? rareQuavits >= item.price : quavits >= item.price);
            
            let btnText = 'Purchase';
            if (isOwned) btnText = isEquipped ? 'Unequip' : 'Equip';
            if (!canAfford) btnText = Not Enough Quavits;

            return (
              <div 
                key={item.id} 
                className={p-6 rounded-3xl border-4 flex flex-col justify-between transition-all bg-slate-800/80 hover:-translate-y-1 }
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="text-2xl font-black text-white">{item.name}</h3>
                    {!isOwned && (
                      <div className={${isRare ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'} px-3 py-1.5 rounded-full font-black flex items-center gap-2 whitespace-nowrap}>
                        <img src={iconSrc} alt="Q" className="w-5 h-5" />
                        {item.price}
                      </div>
                    )}
                    {isOwned && (
                      <div className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full font-black text-sm uppercase tracking-widest">
                        Owned
                      </div>
                    )}
                  </div>
                  <p className="text-slate-400 font-medium text-lg mb-6">{item.desc}</p>
                </div>

                <button 
                  disabled={!canAfford}
                  onClick={() => handlePurchaseOrEquip(item)}
                  className={w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 }
                >
                  {btnText}
                </button>
              </div>
            );
          })}"""
content = re.sub(r'\{filteredItems\.map\(\(item\) => \{.*?\);\n          \}\)', item_map_replace, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ShopPage")
