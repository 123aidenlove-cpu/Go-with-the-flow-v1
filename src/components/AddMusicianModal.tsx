import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Save, ArrowRight } from 'lucide-react';

const AVATARS = [
  '0-avatars1.png', '0-avatars2.png', '0-baritonavatar.png', '0-bassguitavatar.png',
  '0-cellavatar.png', '0-clariavatar.png', '0-flutavatar.png', '0-guitaravatar.png',
  '0-oboeavatar.png', '0-pianavatar.png', '0-saxavatar.png', '0-trombonavatar.png',
  '0-trumpetavatar.png', '0-violinavatar.png', '0-voicefavatar.png'
];

const INSTRUMENTS = [
  'Clarinet', 'Flute', 'Alto Saxophone', 'Trumpet', 'Trombone', 'Violin', 
  'Piano', 'Voice', 'Guitar', 'Bass Guitar', 'Oboe', 'Baritone/Euphonium', 
  'Cello', 'Double Bass', 'Percussion'
];

interface AddMusicianModalProps {
  onClose: () => void;
  onSuccess: (profile: any) => void;
}

export const AddMusicianModal: React.FC<AddMusicianModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [instrument, setInstrument] = useState('Clarinet');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [studioCode, setStudioCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      let finalTeacherId = null;
      let finalStudioCode = null;

      if (studioCode.trim()) {
        const code = studioCode.trim().toUpperCase();
        const { data: teacherData, error: findError } = await supabase
          .from('profiles')
          .select('id')
          .eq('studio_code', code)
          .eq('role', 'teacher')
          .single();
          
        if (findError || !teacherData) {
          throw new Error("Invalid Studio Code. Please check and try again.");
        }
        finalTeacherId = teacherData.id;
        finalStudioCode = code;
      }

      // Create new student profile
      const { data, error: insertError } = await supabase.from('profiles').insert([{
        user_id: user.id,
        role: 'student',
        name,
        instrument,
        teacher_id: finalTeacherId,
        studio_code: finalStudioCode,
        avatar_data: { type: 'image', url: selectedAvatar },
        level: 1 // Default start level
      }]).select().single();

      if (insertError) throw insertError;
      
      onSuccess(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 sm:p-8 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl relative border-4 border-slate-200 p-8 my-8">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-4xl font-black text-slate-800 mb-8 uppercase tracking-widest text-center">Add New Musician</h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl font-bold mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-12">
          
          {/* Left Column: Form Details */}
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <label className="block text-slate-500 font-bold mb-2 uppercase tracking-wider text-sm">Musician Name</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="E.g., Sarah"
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-2 uppercase tracking-wider text-sm">Primary Instrument</label>
              <select 
                value={instrument}
                onChange={e => setInstrument(e.target.value)}
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-2 uppercase tracking-wider text-sm">Teacher Studio Code (Optional)</label>
              <input 
                type="text" 
                value={studioCode}
                onChange={e => setStudioCode(e.target.value)}
                placeholder="MT-1234"
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 uppercase transition-colors"
              />
            </div>
          </div>

          {/* Right Column: Avatar Grid */}
          <div className="flex-[1.5] bg-slate-50 rounded-2xl p-6 border-2 border-slate-100">
            <label className="block text-slate-500 font-bold mb-4 uppercase tracking-wider text-sm">Choose Your Avatar</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[300px] overflow-y-auto p-2">
              {AVATARS.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${selectedAvatar === avatar ? 'border-indigo-500 scale-105 shadow-lg' : 'border-transparent hover:border-indigo-300 hover:scale-105'}`}
                >
                  <img src={`/avatars/${avatar}`} alt="Avatar option" className="w-full h-full object-cover" />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-indigo-500/20"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

        </form>

        <div className="mt-12 flex justify-center">
          <button 
            onClick={handleSave}
            disabled={saving || !name}
            className="bg-indigo-600 text-white font-black px-12 py-4 rounded-full text-xl hover:bg-indigo-500 hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
          >
            {saving ? 'Creating...' : 'Create Musician'} <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
