import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'motion/react';

interface AudioTriggerProps {
  onTrigger: () => void;
  threshold?: number;
  label?: string;
}

export function AudioTrigger({ onTrigger, threshold = 15, label = "Listening for you to play..." }: AudioTriggerProps) {
  const [volume, setVolume] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (hasTriggered) return;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        let sustainedFrames = 0;

        const updateVolume = () => {
          if (hasTriggered) return;
          
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setVolume(avg);
          
          // Require a bit of sustained sound (e.g., 10 frames of audio)
          if (avg > threshold) {
            sustainedFrames++;
            if (sustainedFrames > 10) {
              setHasTriggered(true);
              onTrigger();
              return;
            }
          } else {
            sustainedFrames = 0;
          }

          requestRef.current = requestAnimationFrame(updateVolume);
        };
        
        updateVolume();
      } catch (err) {
        console.error("Could not init audio trigger", err);
      }
    };
    
    initAudio();
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [hasTriggered, onTrigger, threshold]);

  if (hasTriggered) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 w-full max-w-sm mx-auto">
        <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest">
          <Mic className="w-5 h-5" />
          <span>Heard you!</span>
        </div>
      </div>
    );
  }

  const percentage = Math.min(100, (volume / 80) * 100);

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-inner w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 text-amber-500 font-bold uppercase text-sm tracking-widest animate-pulse text-center leading-tight">
        <Mic className="w-5 h-5 flex-shrink-0" />
        <span>{label}</span>
      </div>
      <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden relative">
        <motion.div 
          className="h-full bg-amber-400 rounded-full"
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
        />
      </div>
    </div>
  );
}
