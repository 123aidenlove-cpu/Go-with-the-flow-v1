import React, { useState, useEffect } from 'react';
import { ArrowLeft, Music, Play, BookOpen, Star, Target } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface MusictopiaCastleProps {
  onBack: () => void;
}

export default function MusictopiaCastle({ onBack }: MusictopiaCastleProps) {
  const [repertoire, setRepertoire] = useState<any[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<any | null>(null);

  useEffect(() => {
    fetchStudentProfileAndRepertoire();
  }, []);

  const fetchStudentProfileAndRepertoire = async () => {
    // 1. Get current student profile to find their teacher
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('teacher_id')
        .eq('user_id', user.id)
        .single();
        
      if (profile && profile.teacher_id) {
        // 2. Fetch repertoire only from their teacher
        const { data, error } = await supabase
          .from('repertoire')
          .select('*')
          .eq('teacher_id', profile.teacher_id)
          .order('created_at', { ascending: false });
        
        if (data) {
          setRepertoire(data);
        }
      }
    }
  };

  const playRecording = (url: string) => {
    if (url) {
      const audio = new Audio(url);
      audio.play();
    }
  };

  return (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center overflow-hidden">
      {/* 16:9 Aspect Ratio Container for the Castle Interior */}
      <div 
        className="relative w-full max-w-[1920px] aspect-video shadow-2xl"
        style={{
          backgroundImage: "url('/MusictopiaCastleinsidebackground.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 bg-white/20 hover:bg-white/40 backdrop-blur-md p-4 rounded-full shadow-lg transition-all active:scale-95 group z-50 cursor-pointer"
        >
          <ArrowLeft className="w-8 h-8 text-white group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Music Stand Hitbox - Triggers Library */}
        <button 
          onClick={() => setShowLibrary(true)}
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 bg-amber-600/80 hover:bg-amber-500/90 text-white px-8 py-4 rounded-full shadow-[0_0_40px_rgba(217,119,6,0.5)] border-4 border-amber-300 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-3 animate-pulse"
        >
          <Music className="w-8 h-8" />
          <span className="font-black text-2xl tracking-widest uppercase text-shadow-md">My Repertoire</span>
        </button>

        {/* Repertoire Library Modal */}
        {showLibrary && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-40 flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-5xl h-[80%] rounded-[3rem] shadow-2xl border-8 border-amber-800 flex overflow-hidden relative">
              
              {/* Close Button */}
              <button 
                onClick={() => setShowLibrary(false)}
                className="absolute top-6 right-6 bg-slate-200 hover:bg-slate-300 p-3 rounded-full text-slate-600 transition-colors z-10"
              >
                <ArrowLeft className="w-6 h-6 rotate-180" />
              </button>

              {/* Left Side: Piece List */}
              <div className="w-1/3 bg-amber-50 border-r-2 border-amber-200 p-6 flex flex-col h-full overflow-y-auto">
                <h2 className="text-3xl font-black text-amber-900 mb-6 flex items-center gap-3 uppercase tracking-widest border-b-2 border-amber-200 pb-4">
                  <BookOpen className="w-8 h-8 text-amber-600" /> Library
                </h2>
                
                <div className="flex flex-col gap-3">
                  {repertoire.length === 0 ? (
                    <p className="text-amber-700/50 font-bold text-center mt-10">Your teacher hasn't assigned any pieces yet!</p>
                  ) : (
                    repertoire.map((piece) => (
                      <button 
                        key={piece.id}
                        onClick={() => setSelectedPiece(piece)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all ${selectedPiece?.id === piece.id ? 'bg-amber-600 border-amber-700 text-white shadow-md scale-105' : 'bg-white border-amber-200 text-amber-900 hover:border-amber-400 hover:bg-amber-100'}`}
                      >
                        <h3 className="font-black text-lg truncate">{piece.piece_name}</h3>
                        <p className={`text-sm font-bold opacity-80 truncate`}>{piece.composer}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Right Side: Piece Details */}
              <div className="w-2/3 bg-white p-10 flex flex-col h-full overflow-y-auto relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                {selectedPiece ? (
                  <div className="flex flex-col h-full animate-fade-in">
                    <h1 className="text-5xl font-black text-slate-800 mb-2">{selectedPiece.piece_name}</h1>
                    <h2 className="text-2xl font-bold text-slate-500 mb-8 border-b-2 border-slate-100 pb-6">{selectedPiece.composer}</h2>
                    
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      {/* Teacher Tips */}
                      <div className="bg-sky-50 p-6 rounded-3xl border-2 border-sky-100 relative">
                        <div className="absolute -top-4 -left-4 bg-sky-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                          <Star className="w-5 h-5 fill-current" />
                        </div>
                        <h3 className="font-black text-sky-900 mb-3 text-lg uppercase tracking-wider">Teacher's Tips</h3>
                        <p className="text-slate-700 font-medium whitespace-pre-wrap">{selectedPiece.tips || "No special instructions."}</p>
                      </div>

                      {/* Tricky Notes & Bars */}
                      <div className="bg-fuchsia-50 p-6 rounded-3xl border-2 border-fuchsia-100 relative">
                        <div className="absolute -top-4 -left-4 bg-fuchsia-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                          <Target className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-fuchsia-900 mb-3 text-lg uppercase tracking-wider">Target Focus</h3>
                        {selectedPiece.tricky_bars && (
                          <div className="mb-4">
                            <span className="font-bold text-fuchsia-800/60 uppercase text-xs">Tricky Bars:</span>
                            <p className="font-black text-slate-800 text-xl">{selectedPiece.tricky_bars}</p>
                          </div>
                        )}
                        {selectedPiece.tricky_notes && selectedPiece.tricky_notes.length > 0 && (
                          <div>
                            <span className="font-bold text-fuchsia-800/60 uppercase text-xs block mb-2">Target Notes:</span>
                            <div className="flex flex-wrap gap-2">
                              {selectedPiece.tricky_notes.map((note: string, idx: number) => (
                                <span key={idx} className="bg-fuchsia-200 text-fuchsia-800 font-black px-3 py-1 rounded-lg border border-fuchsia-300 shadow-sm">{note}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 flex gap-4 border-t-2 border-slate-100">
                      {selectedPiece.audio_url && (
                        <button 
                          onClick={() => playRecording(selectedPiece.audio_url)}
                          className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-colors border-2 border-emerald-300"
                        >
                          <Play className="w-6 h-6 fill-current" /> Listen to Reference
                        </button>
                      )}
                      <button 
                        onClick={() => alert(`Starting Flow Practice for ${selectedPiece.piece_name}! Note: This will be connected to the actual Flow Practice minigame logic.`)}
                        className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                      >
                        Start Practice
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <Music className="w-24 h-24 mb-4 opacity-50" />
                    <p className="font-black text-2xl uppercase tracking-widest">Select a piece</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
