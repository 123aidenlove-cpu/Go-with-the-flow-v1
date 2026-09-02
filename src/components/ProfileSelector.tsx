import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, User, Music, Shield, ArrowRight, X, Mail } from 'lucide-react';
import { useInstrument } from '../contexts/InstrumentContext';
import { setQuavits, setRareQuavits, setXP, setInventory } from '../utils/economy';

interface Profile {
  id: string;
  name: string;
  instrument: string;
  avatar_data: any;
  quavits_common?: number;
  quavits_rare?: number;
  xp?: number;
  inventory?: string[];
}

const AVATARS = ['😎', '🤠', '👽', '🤖', '🦉', '🦊', '🐱', '🐶', '🦄', '🦖'];
const INSTRUMENTS = ['Clarinet', 'Flute', 'Alto Saxophone', 'Trumpet', 'Trombone', 'Violin', 'Piano', 'Voice'];

export const ProfileSelector = ({ onSelectProfile }: { onSelectProfile: () => void }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const { setInstrument } = useInstrument();
  
  // Add Musician Form State
  const [newName, setNewName] = useState('');
  const [newInstrument, setNewInstrument] = useState('Clarinet');
  const [newAvatar, setNewAvatar] = useState('😎');
  const [experience, setExperience] = useState<'beginner' | 'experienced'>('beginner');
  const [studioCode, setStudioCode] = useState('');
  const [noTeacher, setNoTeacher] = useState(false);
  const [teacherContact, setTeacherContact] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).eq('role', 'student');
      if (data) setProfiles(data);
    }
    setLoading(false);
  };

  const handleSelect = (profile: Profile) => {
    localStorage.setItem('activeProfileId', profile.id);
    setInstrument(profile.instrument as any);
    setQuavits(profile.quavits_common || 0);
    setRareQuavits(profile.quavits_rare || 0);
    setXP(profile.xp || 0);
    setInventory(profile.inventory || []);
    onSelectProfile();
  };

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    let finalTeacherId = null;
    let finalStudioCode = null;

    // Verify and Link Studio Code if provided
    if (studioCode.trim() && !noTeacher) {
      const code = studioCode.trim().toUpperCase();
      const { data: teacherData, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('studio_code', code)
        .eq('role', 'teacher')
        .single();
        
      if (findError || !teacherData) {
        alert("Invalid Studio Code. Please check and try again.");
        setSaving(false);
        return;
      }
      finalTeacherId = teacherData.id;
      finalStudioCode = code;
    }

    const { data, error } = await supabase.from('profiles').insert([{
      user_id: user.id,
      role: 'student',
      name: newName,
      instrument: newInstrument,
      teacher_id: finalTeacherId,
      studio_code: finalStudioCode,
      avatar_data: { 
        type: 'emoji', 
        emoji: newAvatar, 
        experience: experience,
        teacherContact: noTeacher ? teacherContact : null,
        x: 50, 
        y: 50 
      }
    }]).select().single();

    if (error) {
      console.error("Supabase insert error:", error);
      alert("Database Error: " + error.message);
      setSaving(false);
      return;
    }

    if (data) {
      setProfiles([...profiles, data]);
      setIsAdding(false);
      // Reset form
      setNewName('');
      setStudioCode('');
      setTeacherContact('');
      setNoTeacher(false);
    }
    setSaving(false);
  };

  if (loading) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 relative">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0 pointer-events-none"></div>
      <div className="z-10 relative bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-4 border-white/50 w-full max-w-4xl">
        <h1 className="text-4xl font-black text-slate-800 mb-8 text-center uppercase tracking-widest">
          Who is playing?
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {profiles.map(p => (
            <button 
              key={p.id} 
              onClick={() => handleSelect(p)}
              className="flex flex-col items-center gap-4 p-6 bg-slate-100 rounded-3xl hover:bg-indigo-50 border-4 border-transparent hover:border-indigo-400 transition-all hover:scale-105"
            >
              <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-5xl">
                {p.avatar_data?.emoji || (p.avatar_data?.type === 'conductor' ? '🎩' : '🦉')}
              </div>
              <div className="text-center">
                <h2 className="font-black text-xl text-slate-800 leading-tight">{p.name || 'Student'}</h2>
                <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest mt-1">{p.instrument}</p>
              </div>
            </button>
          ))}
          
          <button 
            onClick={() => setIsAdding(true)}
            className="flex flex-col items-center gap-4 p-6 bg-slate-100/50 rounded-3xl hover:bg-emerald-50 border-4 border-dashed border-slate-300 hover:border-emerald-400 transition-all hover:scale-105 justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
              <Plus className="w-10 h-10 text-slate-700" />
            </div>
            <h2 className="font-black text-xl text-slate-700 uppercase tracking-wider">Add Musician</h2>
          </button>
        </div>
      </div>

      {/* Add Musician Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAdding(false)}></div>
          <div className="bg-slate-50 rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto border-4 border-white">
            <button 
              onClick={() => setIsAdding(false)}
              className="absolute top-6 right-6 text-slate-700 hover:text-slate-600 bg-slate-200 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-8">
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-widest">Create Profile</h2>
              <p className="text-slate-700 font-bold mb-8">Set up your new musician\'s details.</p>

              <form onSubmit={handleAddProfile} className="flex flex-col gap-8">
                {/* Avatar Selection */}
                <div>
                  <label className="block text-slate-700 font-black uppercase tracking-wider text-sm mb-3">Choose Avatar</label>
                  <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                    {AVATARS.map(avatar => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setNewAvatar(avatar)}
                        className={`shrink-0 w-16 h-16 rounded-2xl text-4xl flex items-center justify-center transition-all ${newAvatar === avatar ? 'bg-indigo-100 border-4 border-indigo-500 shadow-md scale-110' : 'bg-white border-2 border-slate-200 hover:bg-slate-100'}`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nickname */}
                  <div>
                    <label className="block text-slate-700 font-black uppercase tracking-wider text-sm mb-2">Nickname</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Mozart" 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)} 
                      className="w-full p-4 rounded-xl border-2 border-slate-200 font-bold focus:border-indigo-500 outline-none"
                    />
                  </div>

                  {/* Instrument */}
                  <div>
                    <label className="block text-slate-700 font-black uppercase tracking-wider text-sm mb-2">Instrument</label>
                    <select 
                      value={newInstrument} 
                      onChange={e => setNewInstrument(e.target.value)} 
                      className="w-full p-4 rounded-xl border-2 border-slate-200 font-bold focus:border-indigo-500 outline-none bg-white"
                    >
                      {INSTRUMENTS.map(inst => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-slate-700 font-black uppercase tracking-wider text-sm mb-3">Experience</label>
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setExperience('beginner')}
                      className={`flex-1 p-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${experience === 'beginner' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-700'}`}
                    >
                      🌱 Beginner
                    </button>
                    <button 
                      type="button"
                      onClick={() => setExperience('experienced')}
                      className={`flex-1 p-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${experience === 'experienced' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-700'}`}
                    >
                      ⭐ Played Before
                    </button>
                  </div>
                </div>

                {/* Studio Code Linking */}
                <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100">
                  <h3 className="font-black text-indigo-900 uppercase tracking-widest mb-2">Join a Studio</h3>
                  
                  {!noTeacher ? (
                    <>
                      <p className="text-indigo-700/80 font-semibold text-sm mb-4">
                        Enter your teacher\'s 6-digit Studio Code if you have one.
                      </p>
                      <input 
                        type="text" 
                        placeholder="e.g. MT-1234"
                        value={studioCode} 
                        onChange={e => setStudioCode(e.target.value)} 
                        className="w-full p-4 rounded-xl border-2 border-indigo-200 font-black uppercase tracking-widest text-indigo-900 focus:border-indigo-500 outline-none bg-white mb-3"
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-indigo-700/80 font-semibold text-sm mb-4">
                        We\'ll send your teacher a request to use Musictopia in your lessons!
                      </p>
                      <div className="relative mb-3">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 w-5 h-5" />
                        <input 
                          type="text" 
                          placeholder="Teacher\'s Email or Phone"
                          value={teacherContact} 
                          onChange={e => setTeacherContact(e.target.value)} 
                          className="w-full p-4 pl-12 rounded-xl border-2 border-indigo-200 font-bold focus:border-indigo-500 outline-none bg-white"
                        />
                      </div>
                    </>
                  )}

                  <button 
                    type="button"
                    onClick={() => { setNoTeacher(!noTeacher); setStudioCode(''); setTeacherContact(''); }}
                    className="text-indigo-600 font-bold hover:text-indigo-700 text-sm transition-colors"
                  >
                    {!noTeacher ? "My teacher doesn't use Musictopia yet" : "I have a Studio Code"}
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full p-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg shadow-xl shadow-indigo-600/20 transition-transform active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
                >
                  {saving ? 'Creating...' : 'Create Musician'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
