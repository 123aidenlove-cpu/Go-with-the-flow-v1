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
  syncToSupabase('quavits_common', next);
  return next;
};

export const setQuavits = (amount: number): void => {
  localStorage.setItem('quavits', amount.toString());
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

export const getRareQuavits = (): number => {
  return parseInt(localStorage.getItem('rare_quavits') || '0', 10);
};

export const addRareQuavits = (amount: number): number => {
  const current = getRareQuavits();
  const next = current + amount;
  localStorage.setItem('rare_quavits', next.toString());
  syncToSupabase('quavits_rare', next);
  return next;
};

export const setRareQuavits = (amount: number): void => {
  localStorage.setItem('rare_quavits', amount.toString());
};

export const getInventory = (): string[] => {
  try {
    const inv = localStorage.getItem('inventory');
    return inv ? JSON.parse(inv) : [];
  } catch {
    return [];
  }
};

export const addToInventory = (item: string) => {
  const inv = getInventory();
  if (!inv.includes(item)) {
    inv.push(item);
    localStorage.setItem('inventory', JSON.stringify(inv));
    syncToSupabase('inventory', inv);
  }
};

export const setInventory = (items: string[]) => {
  localStorage.setItem('inventory', JSON.stringify(items));
};
