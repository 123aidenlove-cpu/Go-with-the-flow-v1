import React from 'react';
import { APP_ASSETS } from '../../config/assets';

interface NoteHelpButtonProps {
  onClick: () => void;
  className?: string;
}

export function NoteHelpButton({ onClick, className = '' }: NoteHelpButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 hover:bg-slate-100/50 rounded-xl transition-all border-2 border-transparent hover:border-slate-300 shadow-sm flex items-center justify-center bg-white ${className}`}
      title="Musical Glossary"
    >
      <img src={APP_ASSETS.ui.noteHelp} alt="Note Help" className="w-10 h-10 object-contain" />
    </button>
  );
}
