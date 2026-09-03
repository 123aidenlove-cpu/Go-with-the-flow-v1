import { BackButton } from './ui/BackButton';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Lock, Image as ImageIcon, Shirt, Castle, Gamepad2 } from 'lucide-react';
import { getQuavits, getRareQuavits, addQuavits, addRareQuavits } from '../utils/economy';
import { APP_ASSETS } from '../config/assets';

interface ShopPageProps {
  onBack: () => void;
}

type ShopCategory = 'avatars' | 'decor' | 'backdrops' | 'games';

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
  // Avatars
  { id: 'av_wood', category: 'avatars', name: "Wood Character Variant", price: 100, currency: 'common', desc: "A sleek wooden finish for your avatar.", available: true },
  { id: 'av_silver', category: 'avatars', name: "Silver Character Variant", price: 500, currency: 'common', desc: "A shiny silver variant for your avatar.", available: true },
  { id: 'av_gold', category: 'avatars', name: "Gold Character Variant", price: 3, currency: 'rare', desc: "The ultimate gold edition of your avatar.", available: true },
  
  // Castle Decor
  { id: 'dec_statue', category: 'decor', name: "Bronze Musician Statue", price: 200, currency: 'common', desc: "Place a beautiful statue in your castle.", available: true },
  { id: 'dec_carpet', category: 'decor', name: "Royal Red Carpet", price: 150, currency: 'common', desc: "Roll out the red carpet in your main hall.", available: true },
  { id: 'dec_chandelier', category: 'decor', name: "Crystal Chandelier", price: 2, currency: 'rare', desc: "A dazzling chandelier for the ceiling.", available: true },
  
  // Castle Backdrops
  { id: 'bg_night', category: 'backdrops', name: "Starry Night Sky", price: 300, currency: 'common', desc: "Change the view outside your castle to night.", available: true },
  { id: 'bg_sunset', category: 'backdrops', name: "Sunset Horizon", price: 400, currency: 'common', desc: "A beautiful sunset view.", available: true },
  { id: 'bg_galaxy', category: 'backdrops', name: "Cosmic Galaxy View", price: 4, currency: 'rare', desc: "A mesmerizing view of deep space.", available: true },
  
  // Game Unlocks
  { id: 'game_ninja', category: 'games', name: "Expression Ninja", price: 5, currency: 'rare', desc: "Unlock the ultimate dynamic expression game.", available: true },
  { id: 'game_dunes', category: 'games', name: "Scale Sand Dunes", price: 5, currency: 'rare', desc: "Unlock the desert scale climbing adventure.", available: true },
];

export default function ShopPage({ onBack }: ShopPageProps) {
  const [quavits, setQuavits] = useState(0);
  const [rareQuavits, setRareQuavits] = useState(0);
  const [activeTab, setActiveTab] = useState<ShopCategory>('avatars');

  useEffect(() => {
    setQuavits(getQuavits());
    setRareQuavits(getRareQuavits());
  }, []);

  const handlePurchase = (item: ShopItem) => {
    if (item.currency === 'common' && quavits >= item.price) {
      addQuavits(-item.price);
      setQuavits(getQuavits());
      alert(`Purchased ${item.name}!`);
    } else if (item.currency === 'rare' && rareQuavits >= item.price) {
      addRareQuavits(-item.price);
      setRareQuavits(getRareQuavits());
      alert(`Purchased ${item.name}!`);
    }
  };

  const filteredItems = SHOP_ITEMS.filter(item => item.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans p-8">
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
            { id: 'avatars', name: 'Avatars', icon: Shirt },
            { id: 'decor', name: 'Castle Decor', icon: Castle },
            { id: 'backdrops', name: 'Backdrops', icon: ImageIcon },
            { id: 'games', name: 'Game Unlocks', icon: Gamepad2 }
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
            const canAfford = isRare ? rareQuavits >= item.price : quavits >= item.price;
            
            return (
              <div 
                key={item.id} 
                className={`p-6 rounded-3xl border-4 flex flex-col justify-between transition-all bg-slate-800/80 hover:-translate-y-1 ${
                  isRare ? 'border-sky-500/30 hover:border-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]' : 'border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="text-2xl font-black text-white">{item.name}</h3>
                    <div className={`${isRare ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'} px-3 py-1.5 rounded-full font-black flex items-center gap-2 whitespace-nowrap`}>
                      <img src={iconSrc} alt="Q" className="w-5 h-5" />
                      {item.price}
                    </div>
                  </div>
                  <p className="text-slate-400 font-medium text-lg mb-6">{item.desc}</p>
                </div>

                <button 
                  disabled={!canAfford}
                  onClick={() => handlePurchase(item)}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 ${
                    canAfford
                      ? isRare 
                        ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-[0_4px_0_#0284c7] active:translate-y-1 active:shadow-none'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_0_#059669] active:translate-y-1 active:shadow-none'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Purchase' : `Not Enough ${isRare ? 'Rare ' : ''}Quavits`}
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
