import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';
import { motion } from 'motion/react';

export function VolumeVisualizer() {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
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
        
        const updateVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setVolume(avg);
          requestRef.current = requestAnimationFrame(updateVolume);
        };
        
        updateVolume();
      } catch (err) {
        console.error("Could not init volume visualizer", err);
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
  }, []);

  const percentage = Math.min(100, (volume / 80) * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-xs tracking-widest">
        <Mic className={`w-4 h-4 ${volume > 5 ? 'text-emerald-500' : 'text-slate-400'}`} />
        <span>Mic Active</span>
      </div>
      <div className="w-64 h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative shadow-inner">
        <motion.div 
          className="h-full bg-emerald-500 rounded-full"
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
        />
      </div>
    </div>
  );
}
