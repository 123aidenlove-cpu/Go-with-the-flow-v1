import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, User, Mail, Phone, Lock, ChevronRight, PlusCircle, ArrowLeft, Users, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AuthOnboardingProps {
  onComplete: () => void;
}

type Step = 'splash' | 'auth' | 'studio' | 'musician';

export default function AuthOnboarding({ onComplete }: AuthOnboardingProps) {
  const [step, setStep] = useState<Step>('splash');
  const [isLogin, setIsLogin] = useState(false);
  
  // Form Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');

  // Studio Data
  const [studioCode, setStudioCode] = useState('');
  const [teacherContact, setTeacherContact] = useState('');
  const [noTeacher, setNoTeacher] = useState(false);

  // Musicians Data
  const [musicians, setMusicians] = useState<any[]>([
    { nickname: '', instrument: 'Piano', beginner: true, avatar: '🦊' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuth = async () => {
    setIsSubmitting(true);
    try {
      // In a real flow, you would use supabase.auth.signUp or signInWithPassword here.
      // For this UI component, we'll mock the auth delay and move to the next step.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (role === 'teacher' || isLogin) {
        // Teachers don't need to join a studio or add children
        onComplete();
      } else {
        setStep('studio');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMusician = () => {
    setMusicians([...musicians, { nickname: '', instrument: 'Piano', beginner: true, avatar: '🦊' }]);
  };

  const handleUpdateMusician = (index: number, field: string, value: any) => {
    const newMusicians = [...musicians];
    newMusicians[index] = { ...newMusicians[index], [field]: value };
    setMusicians(newMusicians);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save to Supabase (Mocked for UI purposes until actual auth is hooked up)
      console.log('Saving Account:', { name, email, role, studioCode, musicians });
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: SPLASH */}
        {step === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="w-40 h-40 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-[3rem] rotate-12 flex items-center justify-center shadow-2xl mb-8">
              <Music className="w-20 h-20 text-white -rotate-12" />
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter">Musictopia</h1>
            <p className="text-xl text-sky-200 font-medium tracking-wide">Your epic musical journey begins here.</p>
            <button
              onClick={() => setStep('auth')}
              className="mt-8 px-12 py-5 bg-white text-indigo-900 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Start Your Adventure
            </button>
          </motion.div>
        )}

        {/* STEP 2: AUTH */}
        {step === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl"
          >
            <button onClick={() => setStep('splash')} className="mb-6 text-slate-700 hover:text-slate-700">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-black text-slate-800 mb-2">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
            <p className="text-slate-700 font-medium mb-8">
              {isLogin ? 'Sign in to continue your adventure.' : 'Set up your parent or teacher account.'}
            </p>

            {!isLogin && (
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                <button 
                  onClick={() => setRole('student')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'student' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-700'}`}
                >Parent / Student</button>
                <button 
                  onClick={() => setRole('teacher')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'teacher' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-700'}`}
                >Teacher</button>
              </div>
            )}

            <div className="space-y-4 mb-8">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 w-5 h-5" />
                  <input type="text" placeholder={role === 'student' ? "Parent's Name" : "Teacher's Name"} value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-800 focus:border-sky-500 outline-none transition-colors" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 w-5 h-5" />
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-800 focus:border-sky-500 outline-none transition-colors" />
              </div>
              {!isLogin && (
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 w-5 h-5" />
                  <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-800 focus:border-sky-500 outline-none transition-colors" />
                </div>
              )}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 w-5 h-5" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-800 focus:border-sky-500 outline-none transition-colors" />
              </div>
            </div>

            <button 
              onClick={handleAuth}
              disabled={isSubmitting}
              className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-2xl shadow-lg transition-transform hover:-translate-y-1 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Loading...' : (isLogin ? 'Sign In' : 'Continue')} <ChevronRight className="w-5 h-5" />
            </button>

            <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-slate-700 font-bold hover:text-sky-500 transition-colors">
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </motion.div>
        )}

        {/* STEP 3: STUDIO LINK */}
        {step === 'studio' && (
          <motion.div
            key="studio"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl"
          >
            <h2 className="text-3xl font-black text-slate-800 mb-2">Join a Studio</h2>
            <p className="text-slate-700 font-medium mb-8">
              Link your account with your teacher to receive quests, assignments, and track your progress.
            </p>

            <div className="space-y-6 mb-8">
              {!noTeacher ? (
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 w-5 h-5" />
                  <input type="text" placeholder="Enter Teacher Studio Code" value={studioCode} onChange={e => setStudioCode(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-12 pr-4 font-black text-xl text-center text-slate-800 focus:border-emerald-500 outline-none transition-colors tracking-widest uppercase" />
                </div>
              ) : (
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 w-5 h-5" />
                  <input type="text" placeholder="Teacher's Email or Phone" value={teacherContact} onChange={e => setTeacherContact(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-800 focus:border-sky-500 outline-none transition-colors" />
                  <p className="text-xs text-slate-700 mt-2 ml-2">We'll send them an invite to join Musictopia!</p>
                </div>
              )}

              <button 
                onClick={() => setNoTeacher(!noTeacher)}
                className="text-sky-500 font-bold hover:text-sky-600 text-sm"
              >
                {!noTeacher ? "My teacher doesn't use Musictopia yet" : "I have a Studio Code"}
              </button>
            </div>

            <button 
              onClick={() => setStep('musician')}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl shadow-lg transition-transform hover:-translate-y-1 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              Next Step <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* STEP 4: ADD MUSICIANS */}
        {step === 'musician' && (
          <motion.div
            key="musician"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-3xl font-black text-slate-800 mb-2">Add Musicians</h2>
            <p className="text-slate-700 font-medium mb-8">
              Create a profile for each child playing an instrument.
            </p>

            <div className="space-y-8 mb-8">
              {musicians.map((musician, index) => (
                <div key={index} className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 relative">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-500 text-white font-black rounded-full flex items-center justify-center border-4 border-white">
                    {index + 1}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nickname</label>
                      <input type="text" value={musician.nickname} onChange={e => handleUpdateMusician(index, 'nickname', e.target.value)} className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-800 focus:border-indigo-500 outline-none" placeholder="e.g. Alex" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Instrument</label>
                      <select value={musician.instrument} onChange={e => handleUpdateMusician(index, 'instrument', e.target.value)} className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-800 focus:border-indigo-500 outline-none">
                        <option>Piano</option>
                        <option>Violin</option>
                        <option>Clarinet</option>
                        <option>Flute</option>
                        <option>Trumpet</option>
                        <option>Voice</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Experience</label>
                      <div className="flex bg-slate-200 p-1 rounded-xl">
                        <button onClick={() => handleUpdateMusician(index, 'beginner', true)} className={`flex-1 py-2 rounded-lg font-bold text-sm ${musician.beginner ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-700'}`}>Beginner</button>
                        <button onClick={() => handleUpdateMusician(index, 'beginner', false)} className={`flex-1 py-2 rounded-lg font-bold text-sm ${!musician.beginner ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-700'}`}>Played Before</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Avatar</label>
                      <div className="flex gap-2 text-3xl">
                        {['🦊', '🐻', '🐼', '🦁', '🐸'].map(emoji => (
                          <button key={emoji} onClick={() => handleUpdateMusician(index, 'avatar', emoji)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${musician.avatar === emoji ? 'bg-indigo-100 border-2 border-indigo-500 scale-110' : 'hover:bg-slate-200 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleAddMusician} className="w-full py-4 border-4 border-dashed border-slate-200 text-slate-700 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-black rounded-2xl transition-all flex items-center justify-center gap-2 mb-8">
              <UserPlus className="w-5 h-5" /> Add Another Musician
            </button>

            <button 
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl shadow-[0_8px_20px_rgba(99,102,241,0.4)] transition-transform hover:-translate-y-1 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Creating Account...' : 'Finish Setup'} <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
