import React from 'react';
import MusicalGlossary from '../MusicalGlossary';
import { AnimatePresence, motion } from 'motion/react';

interface NoteHelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'hub' | 'symbols' | 'notes';
}

export function NoteHelpOverlay({ isOpen, onClose, defaultView = 'notes' }: NoteHelpOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: '100%' }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: '100%' }} 
          className="fixed inset-0 z-[100] bg-white overflow-y-auto"
        >
          <MusicalGlossary onBack={onClose} defaultView={defaultView} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
