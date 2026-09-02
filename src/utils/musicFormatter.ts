export const formatAccidentals = (text: string) => {
  if (!text) return text;
  // Replace '#' with '♯' globally
  let formatted = text.replace(/#/g, '♯');
  // Replace 'b' with '♭' only when it immediately follows a musical note letter A-G
  formatted = formatted.replace(/([A-G])b/g, '$1♭');
  return formatted;
};

export const formatVexFlowKey = (writtenNote: string, clef?: string) => {
  if (!writtenNote) return 'g/4';
  
  const match = writtenNote.match(/([a-gA-G][#b]?)([0-9]?)/);
  if (match) {
    let note = match[1].toLowerCase();
    let octaveStr = match[2];
    let octave = octaveStr ? parseInt(octaveStr, 10) : 4;
    
    if (clef === 'treble8vb' && !isNaN(octave)) {
      octave += 1;
    }
    
    return `${note}/${octave}`;
  }
  
  return `${writtenNote.toLowerCase()}/4`;
};
