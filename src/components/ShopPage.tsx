import { BackButton } from './ui/BackButton';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Lock, Image as ImageIcon, Shirt, Castle, Gamepad2 } from 'lucide-react';
import { getQuavits, getRareQuavits, addQuavits, addRareQuavits } from '../utils/economy';
import { APP_ASSETS } from '../config/assets';

interface ShopPageProps {
  onBack: () => void;
}

type ShopCategory = 'borders' | 'backgrounds' | 'badges' | 'ultimates';

interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  price: number;
  currency: 'common' | 'rare';
  desc: string;
  available: boolean;
}

const SHOP_ITEMS: ShopItem[] = [
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
];

export default function ShopPage({ onBack }: ShopPageProps) {
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
  };

  const filteredItems = SHOP_ITEMS.filter(item => item.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans p-8 overflow-y-auto">
      <BackButton onClick={onBack} />
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          
          <h1 className="text-4xl font-black text-white tracking-widest uppercase flex items-center gap-4">
            <ShoppingCart className="w-10 h-10 text-emerald-400" />
            Musictopia Shop
          </h1>
          <div className="w-16 h-16" /> {/* Spacer */}
        </div>

        {/* Currency Displays */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8 w-full justify-center">
          <div className="bg-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md border-4 border-emerald-500/30 flex items-center gap-6 min-w-[300px]">
            <img src={APP_ASSETS.ui.quavits} alt="Quavits" className="w-14 h-14 object-contain drop-shadow-lg" />
            <div className="flex flex-col">
              <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Common</span>
              <span className="text-white text-4xl font-black">{quavits} <span className="text-emerald-400 text-2xl">Q</span></span>
            </div>
          </div>
          
          <div className="bg-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md border-4 border-sky-500/30 flex items-center gap-6 min-w-[300px]">
            <img src={APP_ASSETS.ui.rareQuavits} alt="Rare Quavits" className="w-14 h-14 object-contain drop-shadow-lg" />
            <div className="flex flex-col">
              <span className="text-sky-400 text-sm font-bold uppercase tracking-widest">Rare</span>
              <span className="text-white text-4xl font-black">{rareQuavits} <span className="text-sky-400 text-2xl">RQ</span></span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { id: 'borders', name: 'Borders', icon: ImageIcon },
            { id: 'backgrounds', name: 'Backgrounds', icon: Castle },
            { id: 'badges', name: 'Badges', icon: Shirt },
            { id: 'ultimates', name: 'Ultimates', icon: Gamepad2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ShopCategory)}
                className={`px-8 py-4 rounded-full font-black uppercase tracking-widest transition-all flex items-center gap-3 border-4 ${
                  isActive 
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(52,211,153,0.5)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-6 h-6" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
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
            if (!canAfford) btnText = `Not Enough ${isRare ? 'Rare ' : ''}Quavits`;

            return (
              <div 
                key={item.id} 
                className={`p-6 rounded-3xl border-4 flex flex-col justify-between transition-all bg-slate-800/80 hover:-translate-y-1 ${
                  isEquipped ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]' : 
                  (isRare ? 'border-sky-500/30 hover:border-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]' : 'border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]')
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="text-2xl font-black text-white">{item.name}</h3>
                    {!isOwned && (
                      <div className={`${isRare ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'} px-3 py-1.5 rounded-full font-black flex items-center gap-2 whitespace-nowrap`}>
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
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 ${
                    isEquipped ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-[0_4px_0_#b45309]' :
                    canAfford
                      ? (isOwned ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_4px_0_#4338ca]' :
                        (isRare 
                          ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-[0_4px_0_#0284c7] active:translate-y-1 active:shadow-none'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_0_#059669] active:translate-y-1 active:shadow-none'))
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {btnText}
                </button>
              </div>
            );
          })}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 font-bold text-xl uppercase tracking-widest">
              More items coming soon...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
