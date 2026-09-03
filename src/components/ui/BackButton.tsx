import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = "Back" }) => {
  return (
    <button 
      onClick={onClick}
      className="absolute top-6 left-6 z-[100] bg-slate-800/90 hover:bg-slate-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg backdrop-blur-md border border-white/10 group"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
      <span className="font-bold uppercase tracking-wider text-sm">{label}</span>
    </button>
  );
};
