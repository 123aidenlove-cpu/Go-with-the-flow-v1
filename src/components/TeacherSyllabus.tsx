import { BackButton } from './ui/BackButton';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BookOpen, Plus, X, Music, Save, Trash2, ArrowLeft, Edit2, Mic, StopCircle, Video, Play } from 'lucide-react';

interface TeacherSyllabusProps {
  onBack: () => void;
}

export default function TeacherSyllabus({ onBack }: TeacherSyllabusProps) {
  const [repertoire, setRepertoire] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [teacherProfileId, setTeacherProfileId] = useState<string | null>(null);

  // Form state
  const [pieceName, setPieceName] = useState('');
  const [composer, setComposer] = useState('');
  const [tips, setTips] = useState('');
  const [trickyBars, setTrickyBars] = useState('');
  const [trickyNotes, setTrickyNotes] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).eq('role', 'teacher').single();
      if (profile) {
        setTeacherProfileId(profile.id);
        const { data: rep } = await supabase.from('repertoire').select('*').eq('teacher_id', profile.id).order('created_at', { ascending: false });
        if (rep) setRepertoire(rep);
      }
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setPieceName('');
    setComposer('');
    setTips('');
    setTrickyBars('');
    setTrickyNotes('');
    setAudioUrl('');
    setVideoUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (rep: any) => {
    setEditingId(rep.id);
    setPieceName(rep.piece_name);
    setComposer(rep.composer || '');
    setTips(rep.tips || '');
    setTrickyBars(rep.tricky_bars || '');
    setTrickyNotes(rep.tricky_notes ? rep.tricky_notes.join(', ') : '');
    setAudioUrl(rep.audio_url || '');
    setVideoUrl(rep.video_url || '');
    setIsModalOpen(true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Convert Blob to Base64 to store in text column (MVP only - use Storage buckets in Production)
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setAudioUrl(reader.result);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 89) { stopRecording(); return 90; }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSavePiece = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherProfileId) return;
    setSaving(true);

    const notesArray = trickyNotes.split(',').map(n => n.trim()).filter(n => n);

    const payload = {
      piece_name: pieceName,
      composer,
      tips,
      tricky_bars: trickyBars,
      tricky_notes: notesArray,
      audio_url: audioUrl,
      video_url: videoUrl,
      teacher_id: teacherProfileId
    };

    if (editingId) {
      const { data, error } = await supabase.from('repertoire').update(payload).eq('id', editingId).select().single();
      if (error) alert("Error updating: " + error.message);
      else if (data) {
        setRepertoire(repertoire.map(r => r.id === editingId ? data : r));
        setIsModalOpen(false);
      }
    } else {
      const { data, error } = await supabase.from('repertoire').insert([payload]).select().single();
      if (error) alert("Error adding piece: " + error.message);
      else if (data) {
        setRepertoire([data, ...repertoire]);
        setIsModalOpen(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this piece?')) {
      await supabase.from('repertoire').delete().eq('id', id);
      setRepertoire(repertoire.filter(r => r.id !== id));
    }
  };

  if (loading) {
    return <div className="h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-700">Loading Syllabus...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <BackButton onClick={onBack} />
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            
            <div>
              <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
                <BookOpen className="text-indigo-500" /> Master Syllabus
              </h1>
              <p className="text-slate-700 font-medium mt-1">Manage the repertoire available to your students</p>
            </div>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" /> Add New Piece
          </button>
        </div>

        {/* Repertoire Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repertoire.length === 0 && !isModalOpen && (
            <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
              <Music className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">Your Syllabus is Empty</h3>
              <p className="text-slate-700">Add some repertoire to start assigning it to your students!</p>
            </div>
          )}
          
          {repertoire.map(rep => (
            <div key={rep.id} className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-shadow relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(rep)} className="text-slate-400 hover:text-indigo-500">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(rep.id)} className="text-slate-400 hover:text-rose-500">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-1 pr-16 leading-tight">{rep.piece_name}</h3>
              <p className="text-indigo-600 font-bold mb-4">{rep.composer || 'Unknown Composer'}</p>
              
              <div className="space-y-3">
                {rep.tips && (
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 block mb-1">Pro Tips</span>
                    <p className="text-sm text-indigo-900 font-medium">{rep.tips}</p>
                  </div>
                )}
                {(rep.tricky_bars || (rep.tricky_notes && rep.tricky_notes.length > 0)) && (
                  <div className="bg-rose-50 rounded-xl p-3 flex flex-wrap gap-2">
                    {rep.tricky_bars && <span className="bg-rose-200 text-rose-800 text-xs px-2 py-1 rounded font-bold">Bars: {rep.tricky_bars}</span>}
                    {rep.tricky_notes && rep.tricky_notes.map((n: string, i: number) => (
                      <span key={i} className="bg-rose-200 text-rose-800 text-xs px-2 py-1 rounded font-bold">Note: {n}</span>
                    ))}
                  </div>
                )}
                {(rep.video_url || rep.audio_url) && (
                   <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                     {rep.video_url && <a href={rep.video_url} target="_blank" rel="noreferrer" className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"><Video className="w-3 h-3" /> Video</a>}
                     {rep.audio_url && <button onClick={() => { const audio = new Audio(rep.audio_url); audio.play(); }} className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"><Play className="w-3 h-3" /> Play Audio</button>}
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm pointer-events-none"></div>
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 p-8 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-700 hover:text-slate-600 bg-slate-100 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl font-black text-slate-800 mb-6">
              {editingId ? 'Edit Repertoire' : 'Add Repertoire'}
            </h2>
            
            <form onSubmit={handleSavePiece} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Piece Name *</label>
                  <input 
                    required
                    type="text"
                    value={pieceName}
                    onChange={e => setPieceName(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Composer</label>
                  <input 
                    type="text"
                    value={composer}
                    onChange={e => setComposer(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Teacher Tips</label>
                <textarea 
                  value={tips}
                  onChange={e => setTips(e.target.value)}
                  placeholder="e.g., Watch out for the staccatos in section B!"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:border-indigo-400 focus:outline-none min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Tricky Bars</label>
                  <input 
                    type="text"
                    value={trickyBars}
                    onChange={e => setTrickyBars(e.target.value)}
                    placeholder="e.g., 14-16"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Tricky Notes (comma separated)</label>
                  <input 
                    type="text"
                    value={trickyNotes}
                    onChange={e => setTrickyNotes(e.target.value)}
                    placeholder="e.g., F#, Bb"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Media Section */}
              <div className="border-t-2 border-slate-100 pt-5 mt-5">
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Video className="w-5 h-5 text-indigo-500"/> Reference Media</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Video Link (YouTube, etc.)</label>
                    <input 
                      type="url"
                      value={videoUrl}
                      onChange={e => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Or Record Audio (Up to 90s)</label>
                    <div className="flex items-center gap-4">
                      {!isRecording ? (
                        <button 
                          type="button"
                          onClick={startRecording}
                          className="flex items-center gap-2 bg-rose-100 text-rose-600 hover:bg-rose-200 px-4 py-3 rounded-xl font-bold transition-colors"
                        >
                          <Mic className="w-5 h-5" /> Start Recording
                        </button>
                      ) : (
                        <button 
                          type="button"
                          onClick={stopRecording}
                          className="flex items-center gap-2 bg-rose-600 text-white hover:bg-rose-700 px-4 py-3 rounded-xl font-bold transition-colors animate-pulse"
                        >
                          <StopCircle className="w-5 h-5" /> Stop ({90 - recordingTime}s remaining)
                        </button>
                      )}
                      
                      {audioUrl && !audioUrl.startsWith('http') && (
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                          <Play className="w-4 h-4" /> Audio ready to save
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-2">
                      *Note: In this MVP, audio is saved directly to Postgres. For production, recordings should be uploaded to a Supabase Storage Bucket.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                disabled={saving}
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg transition-transform hover:-translate-y-1 uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
              >
                {saving ? 'Saving...' : <><Save className="w-5 h-5" /> {editingId ? 'Save Changes' : 'Save to Syllabus'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
