import React, { useEffect, useRef } from 'react';
import VexFlow from 'vexflow';

export interface VexNoteDef {
  keys: string[];       // e.g., ["c/4"] or ["c#/4", "e/4", "g/4"]
  duration: string;     // e.g., "q", "h", "w", "qr"
  color?: string;
  label?: string;       // Hex color or standard CSS color to paint this note
  articulation?: string;
  dynamic?: string;
  isBarline?: boolean;
  isTriplet?: boolean;
  tieStart?: boolean;
  tieStop?: boolean;
}

interface DynamicScoreProps {
  notes: VexNoteDef[];
  width?: number;
  height?: number;
  clef?: 'treble' | 'bass' | 'alto' | 'tenor' | 'percussion' | 'none' | 'treble8vb';
  timeSignature?: string; // e.g. "4/4"
  keySignature?: string; // e.g. "A"
  hideStave?: boolean;
  hideNote?: boolean;
  onNoteClick?: (index: number) => void;
}

export const DynamicScore: React.FC<DynamicScoreProps> = ({
  notes,
  width = 400,
  height = 150,
  clef = 'treble',
  timeSignature,
  keySignature,
  hideStave = false,
  hideNote = false,
  onNoteClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    let isCancelled = false;

    // Clear previous renders (React Strict Mode safety)
    containerRef.current.innerHTML = '';

    // Initialize VexFlow 5 with fonts
    VexFlow.loadFonts("Bravura", "Academico").then(() => {
      if (isCancelled) return;
      
      VexFlow.setFonts("Bravura", "Academico");
        
        const factory = new VexFlow.Factory({
          renderer: {
            elementId: containerRef.current as unknown as string,
            width: width,
            height: height,
          },
        });

        const system = factory.System({ width: width - 20 });

      // Build VexFlow Notes
      const vfNotes = notes.map((noteDef, noteIndex) => {
        // Parse accidentals from the keys (e.g. c#/4 -> note: c/4, acc: #)
        const parsedKeys = noteDef.keys.map(key => {
          // A very simple regex to extract sharp, flat, natural
          const match = key.match(/^([a-g])([#b]n?)?\/(\d)$/i);
          if (match) {
            const letter = match[1];
            const acc = match[2]; // #, b, bb, n
            const oct = match[3];
            return { rawKey: key, cleanKey: `${letter}/${oct}`, accidental: acc };
          }
          return { rawKey: key, cleanKey: key, accidental: null };
        });

        try {
          // Calculate custom stem direction
          let forcedStemDirection = undefined;
          if (clef === 'percussion') {
             forcedStemDirection = 1; // Force stems UP for percussion clef
          } else if (parsedKeys.length === 1) {
             const oct = parseInt(parsedKeys[0].cleanKey.split('/')[1] || '4', 10);
             const letter = parsedKeys[0].cleanKey.split('/')[0].toLowerCase();
             
             if (oct > 4) {
                forcedStemDirection = -1;
             } else if (oct < 4) {
                forcedStemDirection = 1;
             } else {
                if (letter === 'b') forcedStemDirection = -1;
                else forcedStemDirection = 1;
             }
          }

          if (noteDef.isBarline) {
             return factory.BarNote({ type: 'single' });
          }

          // Create the StaveNote
          const staveNote = factory.StaveNote({
            keys: parsedKeys.map(k => k.cleanKey),
            duration: noteDef.duration,
            clef: clef === 'none' ? 'treble' : clef,
          });
          
          if (forcedStemDirection !== undefined) {
             staveNote.setStemDirection(forcedStemDirection);
          }
          
          if (noteDef.isTriplet) {
             // Tell VexFlow math that these 3 notes take the space of 2, so auto-beaming doesn't throw errors!
             staveNote.applyTickMultiplier(2, 3);
          }

          // Apply accidentals
          parsedKeys.forEach((k, idx) => {
            if (k.accidental) {
              let skipAccidental = false;
              if (keySignature === 'A' && k.accidental === '#') {
                const noteLetter = k.cleanKey[0].toLowerCase();
                if (['f', 'c', 'g'].includes(noteLetter)) {
                  skipAccidental = true;
                }
              }
              if (!skipAccidental) {
                staveNote.addModifier(factory.Accidental({ type: k.accidental }), idx);
              }
            }
          });
          
          // Apply dot
          if (noteDef.duration.includes('d')) {
             staveNote.addModifier(new VexFlow.Dot(), 0);
          }
          // Apply color styling if provided
          if (hideNote) {
            staveNote.setStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' });
            staveNote.setLedgerLineStyle({ strokeStyle: 'transparent', lineWidth: 0 });
            staveNote.setFlagStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' });
            if (staveNote.getStem()) {
              staveNote.getStem()!.setStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' });
            }
          } else if (noteDef.color) {
            staveNote.setStyle({ fillStyle: noteDef.color, strokeStyle: noteDef.color });
          }

          // Apply articulation
          if (noteDef.articulation) {
            let artType = noteDef.articulation;
            if (artType === 'upbow') artType = 'a|';
            if (artType === 'downbow') artType = 'am';
            try {
              const art = factory.Articulation({ type: artType, position: 'above' });
              // Force style so it doesn't inherit transparent from parent note
              art.setStyle({ fillStyle: 'black', strokeStyle: 'black', lineWidth: 1.5 });
              staveNote.addModifier(art, 0);
            } catch (e) {
              console.warn("Invalid articulation:", artType);
            }
          }
          
          // Apply dynamic
          if (noteDef.dynamic) {
            const ann = factory.Annotation({ text: noteDef.dynamic })
                .setFont("serif", 20, "bold italic")
                .setVerticalJustification(VexFlow.Annotation.VerticalJustify.BOTTOM);
            ann.setStyle({ fillStyle: 'black', strokeStyle: 'black', lineWidth: 1.5 });
            staveNote.addModifier(ann, 0);
          }

          if (noteDef.label) {
            staveNote.addModifier(
              factory.Annotation({ text: noteDef.label })
                .setFont("Arial", 12, "bold")
                .setVerticalJustification(VexFlow.Annotation.VerticalJustify.BOTTOM),
              0
            );
          }

          return staveNote;

        } catch (e) {
          console.error("VexFlow Error:", e, noteDef);
          return null;
        }
      }).filter((n): n is any => n !== null);

      // Handle Tuplets
      let currentTriplet: any[] = [];
      vfNotes.forEach((n: any, idx: number) => {
         const noteDef = notes[idx];
         if (noteDef && noteDef.isTriplet && !noteDef.isBarline) {
            currentTriplet.push(n);
            if (currentTriplet.length === 3) {
               factory.Tuplet({ notes: currentTriplet, options: { bracketed: true } });
               currentTriplet = [];
            }
         }
      });
      
      // Handle Ties
      let currentTieStart: any = null;
      vfNotes.forEach((n: any, idx: number) => {
         const noteDef = notes[idx];
         if (noteDef && noteDef.tieStart) {
            currentTieStart = n;
         }
         if (noteDef && noteDef.tieStop && currentTieStart) {
            factory.StaveTie({ from: currentTieStart, to: n });
            currentTieStart = null;
         }
      });

      const voice = factory.Voice();
      // Allow any number of beats (don't strictly enforce time signature for minigames)
      voice.setStrict(false);
      
      if (vfNotes.length > 0) {
        voice.addTickables(vfNotes);
      }

      // Format and setup Stave
      const stave = system.addStave({
        voices: [voice],
      });
      
      
        if (clef === 'percussion') {
          stave.setConfigForLines([{visible:false},{visible:false},{visible:true},{visible:false},{visible:false}]);
        }
        
        if (hideStave) {
        stave.setConfigForLines([{visible:false},{visible:false},{visible:false},{visible:false},{visible:false}]);
        stave.setEndBarType(VexFlow.Barline.type.NONE);
        stave.setBegBarType(VexFlow.Barline.type.NONE);
      }
      
      if (clef !== 'none' && !hideStave) {
        if (clef === 'treble8vb') {
          stave.addClef('treble');
        } else {
          stave.addClef(clef);
        }
      }
      if (timeSignature && !hideStave) {
        stave.addTimeSignature(timeSignature);
      }
      if (keySignature && !hideStave) {
        stave.addKeySignature(keySignature);
      }

      // Custom robust auto-beamer based on beat boundaries
      try {
        const beatBoundary = (timeSignature === '6/8') ? 1.5 : 1.0;
        let currentBeamGroup: any[] = [];
        let currentBeats = 0;
        
        vfNotes.forEach((vfNote: any, idx: number) => {
           const noteDef = notes[idx];
           
           if (noteDef.isBarline) {
             if (currentBeamGroup.length >= 2) {
                factory.Beam({ notes: currentBeamGroup });
             }
             currentBeamGroup = [];
             return;
           }
           
           let beats = 1;
           const dur = noteDef.duration.replace('r', '');
           if (dur === 'w') beats = 4;
           else if (dur === 'h') beats = 2;
           else if (dur === 'hd') beats = 3;
           else if (dur === 'q') beats = 1;
           else if (dur === 'qd') beats = 1.5;
           else if (dur === '8') beats = 0.5;
           else if (dur === '8d') beats = 0.75;
           else if (dur === '16') beats = 0.25;
           
           if (noteDef.isTriplet) beats *= (2.0 / 3.0);
           
           const isRest = noteDef.duration.includes('r');
           const isBeamable = !isRest && beats < 1.0;
           
           const eps = 0.001;
           const isAtBoundary = Math.abs((currentBeats % beatBoundary)) < eps || Math.abs((currentBeats % beatBoundary) - beatBoundary) < eps;
           
           if (isAtBoundary && currentBeats > eps) {
              if (currentBeamGroup.length >= 2) {
                 factory.Beam({ notes: currentBeamGroup });
              }
              currentBeamGroup = [];
           }
           
           if (isBeamable) {
              currentBeamGroup.push(vfNote);
           } else {
              if (currentBeamGroup.length >= 2) {
                 factory.Beam({ notes: currentBeamGroup });
              }
              currentBeamGroup = [];
           }
           
           currentBeats += beats;
        });
        
        if (currentBeamGroup.length >= 2) {
           factory.Beam({ notes: currentBeamGroup });
        }
      } catch (e) {
        console.error("Custom auto-beamer failed:", e);
      }

      // Draw the beautiful music!
      factory.draw();
      
      // We no longer manually call beam.draw(), VexFlow's factory handles it!

      // Interactivity: Attach click listeners to the SVGs
      vfNotes.forEach((vfNote, index) => {
        const svg = vfNote.getSVGElement();
        if (svg) {
          svg.classList.add('vf-interactive-note');
          // We can use generic CSS for pointer-cursor on interactive notes
          svg.style.cursor = onNoteClick ? 'pointer' : 'default';
          
          if (onNoteClick) {
            svg.addEventListener('click', () => onNoteClick(index), false);
          }
        }
      });

    }); // end of VexFlow.loadFonts().then()

    // Cleanup listeners
    return () => {
      isCancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [notes, width, height, clef, timeSignature, keySignature, onNoteClick]);

  return (
    <div 
      ref={containerRef} 
      className="flex items-center justify-center pointer-events-auto"
    />
  );
};
