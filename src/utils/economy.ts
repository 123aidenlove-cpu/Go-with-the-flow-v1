import { supabase } from '../lib/supabaseClient';

const syncToSupabase = async (column: string, value: any) => {
  const activeId = localStorage.getItem('activeProfileId');
  if (activeId) {
    await supabase.from('profiles').update({ [column]: value }).eq('id', activeId);
  }
};

export const getQuavits = (): number => {
  return parseInt(localStorage.getItem('quavits') || '0', 10);
};

export const addQuavits = (amount: number): number => {
  const current = getQuavits();
  const next = current + amount;
  localStorage.setItem('quavits', next.toString());
  syncToSupabase('quavits', next); // Fixed column name
  return next;
};

export const setQuavits = (amount: number): void => {
  localStorage.setItem('quavits', amount.toString());
};

// Target: ~100 Quavits per minute of gameplay
export const calculateGameQuavits = (score: number, gameId: string): number => {
  if (gameId === 'rhythm-rapids') {
    // Rhythm Rapids max score is around 2500 for a 1-minute game.
    // 2500 / 25 = 100 quavits.
    return Math.floor(score / 25);
  }
  if (gameId === 'rocket-reading') {
    // Rocket reading is faster, max score around 1500 per min.
    return Math.floor(score / 15);
  }
  return Math.floor(score / 20); // Default fallback
};

export const getXP = (): number => {
  return parseInt(localStorage.getItem('xp') || '0', 10);
};

export const addXP = (amount: number): number => {
  const current = getXP();
  const next = current + amount;
  localStorage.setItem('xp', next.toString());
  syncToSupabase('xp', next);
  return next;
};

export const setXP = (amount: number): void => {
  localStorage.setItem('xp', amount.toString());
};

// Rare Quavits are stored inside the `stats` JSONB column
export const getRareQuavits = (): number => {
  return parseInt(localStorage.getItem('rare_quavits') || '0', 10);
};

export const addRareQuavits = async (amount: number) => {
  const current = getRareQuavits();
  const next = current + amount;
  localStorage.setItem('rare_quavits', next.toString());
  
  // Update stats JSONB in supabase safely
  const activeId = localStorage.getItem('activeProfileId');
  if (activeId) {
    const { data } = await supabase.from('profiles').select('stats').eq('id', activeId).single();
    const stats = data?.stats || {};
    stats.rare_quavits = next;
    await supabase.from('profiles').update({ stats }).eq('id', activeId);
  }
  return next;
};

export interface Inventory {
  items: string[];
  equipped: {
    border: string | null;
    background: string | null;
    badge: string | null;
  };
}

export const getInventory = (): Inventory => {
  try {
    const inv = localStorage.getItem('inventory');
    if (inv) {
      const parsed = JSON.parse(inv);
      // Migrate old string[] to new object structure
      if (Array.isArray(parsed)) {
        return { items: parsed, equipped: { border: null, background: null, badge: null } };
      }
      return parsed;
    }
    return { items: [], equipped: { border: null, background: null, badge: null } };
  } catch {
    return { items: [], equipped: { border: null, background: null, badge: null } };
  }
};

export const addToInventory = (item: string) => {
  const inv = getInventory();
  if (!inv.items.includes(item)) {
    inv.items.push(item);
    localStorage.setItem('inventory', JSON.stringify(inv));
    syncToSupabase('inventory', inv);
  }
};

export const equipItem = (category: keyof Inventory['equipped'], itemId: string | null) => {
  const inv = getInventory();
  inv.equipped[category] = itemId;
  localStorage.setItem('inventory', JSON.stringify(inv));
  syncToSupabase('inventory', inv);
};

export const setInventory = (inventory: Inventory) => {
  localStorage.setItem('inventory', JSON.stringify(inventory));
  syncToSupabase('inventory', inventory);
};
