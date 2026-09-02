import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Music, Shield, Settings, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { useInstrument } from '../contexts/InstrumentContext';
import { supabase } from '../lib/supabaseClient';

interface AccountPageProps {
  onBack: () => void;
  onNavigateToParentDashboard: () => void;
  onNavigateToTeacherDashboard: () => void;
  onNavigateToSettings: () => void;
}

export default function AccountPage({ onBack, onNavigateToParentDashboard, onNavigateToTeacherDashboard, onNavigateToSettings }: AccountPageProps) {
  const { instrument } = useInstrument();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [role, setRole] = useState<string>('student');
  const [studioCode, setStudioCode] = useState<string | null>(null);
  const [studioCodeInput, setStudioCodeInput] = useState('');
  const [linkingStatus, setLinkingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('id, teacher_id, role, studio_code')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setProfileId(data.id);
        setTeacherId(data.teacher_id);
        setRole(data.role || 'student');
        setStudioCode(data.studio_code);
      }
    }
  };

  const handleLinkStudio = async () => {
    if (!studioCodeInput.trim() || !profileId) return;
    setLinkingStatus('loading');
    
    try {
      // Find the teacher with this studio code
      const { data: teacherData, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('studio_code', studioCodeInput.trim().toUpperCase())
        .eq('role', 'teacher')
        .single();
        
      if (findError || !teacherData) {
        throw new Error("Invalid Studio Code.");
      }
      
      // Update the student's teacher_id and studio_code
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
           teacher_id: teacherData.id, 
           studio_code: studioCodeInput.trim().toUpperCase() 
        })
        .eq('id', profileId);
        
      if (updateError) throw updateError;
      
      setTeacherId(teacherData.id);
      setLinkingStatus('success');
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Failed to link studio.");
      setLinkingStatus('error');
    }
  };

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col font-sans">
      <div className="p-8 pb-0">
        <button 
          onClick={onBack}
          className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all w-fit"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Campus
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
        {/* Profile Card */}
        <div className="bg-slate-800 p-8 rounded-3xl w-full border border-slate-700 shadow-2xl flex flex-col sm:flex-row items-center gap-8 mb-12">
          <div className="w-32 h-32 bg-sky-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
            <User className="w-16 h-16 text-white" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-2">{role}</h1>
            {role === 'student' && <p className="text-slate-700 font-bold text-xl">Current Instrument: <span className="text-amber-400">{instrument}</span></p>}
          </div>
        </div>

        {/* Studio Code Linking */}
        <div className="bg-slate-800 p-8 rounded-3xl w-full border border-slate-700 shadow-2xl mb-12">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-sky-400" /> 
            {role === 'teacher' ? 'My Studio Code' : 'My Teacher\'s Studio'}
          </h2>
          
          {role === 'teacher' ? (
            <div className="bg-sky-900/40 border-2 border-sky-500/50 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sky-400 font-bold text-lg uppercase tracking-wide">Your Invite Code</p>
                <p className="text-sky-200/70 text-sm font-medium">Share this 6-digit code with your students so they can link to your studio!</p>
              </div>
              <div className="bg-slate-900 border-2 border-slate-700 px-8 py-4 rounded-2xl">
                <span className="text-4xl font-black tracking-widest text-white">{studioCode || 'MT-XXXX'}</span>
              </div>
            </div>
          ) : teacherId ? (
            <div className="bg-emerald-900/40 border-2 border-emerald-500/50 p-6 rounded-2xl flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-emerald-400 font-bold text-lg uppercase tracking-wide">Successfully Linked</p>
                <p className="text-emerald-200/70 text-sm font-medium">Your practice sessions are now connected to your teacher's studio.</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-slate-700 font-medium mb-4">Enter the 6-digit Studio Code provided by your teacher to link your accounts.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  value={studioCodeInput}
                  onChange={(e) => setStudioCodeInput(e.target.value)}
                  placeholder="e.g. MT-1234" 
                  className="bg-slate-900 border-2 border-slate-700 text-white p-4 rounded-2xl font-black text-xl uppercase tracking-widest focus:outline-sky-500 flex-1 text-center sm:text-left"
                />
                <button 
                  onClick={handleLinkStudio}
                  disabled={linkingStatus === 'loading' || !studioCodeInput}
                  className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all"
                >
                  {linkingStatus === 'loading' ? 'Linking...' : 'Connect'}
                </button>
              </div>
              {linkingStatus === 'error' && (
                <p className="text-red-400 font-bold mt-3 text-sm">{errorMessage}</p>
              )}
            </div>
          )}
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <button 
            onClick={onNavigateToSettings} // Instrument change is inside settings -> gameplay tab
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 shadow-lg group"
          >
            <div className="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <Music className="w-10 h-10" />
            </div>
            <span className="font-black text-xl uppercase tracking-widest text-center">Change Instrument</span>
          </button>

          <button 
            onClick={onNavigateToParentDashboard}
            className={`bg-purple-600 hover:bg-purple-500 text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 shadow-lg group ${role === 'teacher' ? '' : 'lg:col-span-1'}`}
          >
            <div className="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <Shield className="w-10 h-10" />
            </div>
            <span className="font-black text-xl uppercase tracking-widest text-center">Parent Dashboard</span>
          </button>

          {role === 'teacher' && (
            <button 
              onClick={onNavigateToTeacherDashboard}
              className="bg-sky-600 hover:bg-sky-500 text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 shadow-lg group"
            >
              <div className="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                <User className="w-10 h-10" />
              </div>
              <span className="font-black text-xl uppercase tracking-widest text-center">Teacher Dashboard</span>
            </button>
          )}

          <button 
            onClick={onNavigateToSettings}
            className={`bg-slate-700 hover:bg-slate-600 text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 shadow-lg group ${role === 'teacher' ? '' : 'lg:col-span-2'}`}
          >
            <div className="bg-white/20 p-4 rounded-2xl group-hover:rotate-90 transition-transform duration-500">
              <Settings className="w-10 h-10" />
            </div>
            <span className="font-black text-xl uppercase tracking-widest text-center">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
