import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Music, ArrowRight, Shield, User } from 'lucide-react';
import { setQuavits, setRareQuavits, setXP, setInventory } from '../utils/economy';

interface LoginScreenProps {
  onLoginSuccess: (role: 'student' | 'teacher', profileId: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [instrument, setInstrument] = useState('Clarinet');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle Authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          // Fetch profile to get role and stats
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id);

          if (profiles && profiles.length > 0) {
            const isTeacher = profiles.some(p => p.role === 'teacher');
            if (isTeacher) {
              onLoginSuccess('teacher', profiles.find(p => p.role === 'teacher').id);
            } else {
              onLoginSuccess('student', profiles[0].id);
            }
          } else {
            // Profile is missing (signup was interrupted). Create it now!
            const newStudioCode = role === 'teacher' ? 'MT-' + Math.floor(1000 + Math.random() * 9000) : null;
            const { data: newProfile, error: profileError } = await supabase
              .from('profiles')
              .insert([
                { 
                  user_id: data.user.id, 
                  role: role === 'teacher' ? 'teacher' : 'parent', 
                  studio_code: newStudioCode 
                }
              ])
              .select()
              .single();
              
            if (profileError) {
              console.error("Error creating fallback profile:", profileError);
              onLoginSuccess(role, 'fallback-id'); // Absolute worst case
            } else if (newProfile) {
              onLoginSuccess(role, newProfile.id);
            }
          }
        }
      } else {
        // --- SIGN UP ---
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          // Create profile for new user
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                user_id: data.user.id, 
                role: role === 'teacher' ? 'teacher' : 'parent', // Root account is parent for household
                studio_code: role === 'teacher' ? 'MT-' + Math.floor(1000 + Math.random() * 9000) : null
              }
            ])
            .select()
            .single();

          if (profileError) throw profileError;
          
          if (newProfile) {
            alert(`Account created successfully! Welcome to Musictopia.`);
            onLoginSuccess(role, newProfile.id);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      
      let errorMsg = err.message || 'An error occurred during authentication.';
      
      if (errorMsg.toLowerCase().includes('invalid login credentials')) {
        errorMsg = "Account not found! If you don't have an account yet, please switch to Sign Up.";
      } else if (errorMsg.toLowerCase().includes('user already registered')) {
        errorMsg = "An account with this email already exists. Please log in instead.";
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/loading-screen.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {!showAuthModal ? (
        /* INITIAL SCREEN: Covers the bottom white music bar */
        <>
          <div className="absolute inset-0 z-0"></div>
          
          <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-12 flex flex-col items-center justify-center z-10 animate-fade-in pb-16">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-widest mb-8 text-center">Ready to play?</h2>
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
              <button 
                onClick={() => { setIsLogin(true); setShowAuthModal(true); }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-[0_6px_0_#4338ca] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                Log In
              </button>
              <button 
                onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-5 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-[0_6px_0_#047857] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                Sign Up
              </button>
            </div>
          </div>
        </>
      ) : (
        /* LOGIN MODAL */
        <>
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

          <div className="z-10 bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-4 border-white/50 w-full max-w-md flex flex-col items-center animate-fade-in relative">
            
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>

            <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg mb-6 border-4 border-white overflow-hidden bg-white mt-4">
              <img src="/images/musictopia-logo.jpg" alt="Musictopia Logo" className="w-full h-full object-cover" />
            </div>

            <h1 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-widest text-center">Musictopia</h1>
            <p className="text-slate-500 font-bold mb-8 text-center">
              {isLogin ? 'Welcome back! Log in to continue.' : 'Create your account to start playing!'}
            </p>

            {/* Role Selector */}
            <div className="flex w-full bg-slate-100 p-1 rounded-2xl mb-6 shadow-inner">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-3 font-black rounded-xl transition-all flex items-center justify-center gap-2 ${role === 'student' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <User className="w-5 h-5" /> Parent / Student
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 py-3 font-black rounded-xl transition-all flex items-center justify-center gap-2 ${role === 'teacher' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Shield className="w-5 h-5" /> Teacher
              </button>
            </div>

            {error && (
              <div className="w-full bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 border border-red-200 text-sm text-center shadow-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="w-full flex flex-col gap-4">

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl font-bold focus:outline-indigo-500 focus:bg-white transition-colors text-slate-900"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl font-bold focus:outline-indigo-500 focus:bg-white transition-colors text-slate-900"
                required
                minLength={6}
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-white text-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl mt-4 ${role === 'teacher' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              >
                {loading ? 'Processing...' : (isLogin ? 'Let\'s Go!' : 'Create Account')}
                <ArrowRight className="w-6 h-6" />
              </button>
            </form>

            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="mt-8 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
