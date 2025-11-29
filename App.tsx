
import React, { useState, useEffect, useRef } from 'react';
import TextArea from './components/TextArea';
import Button from './components/Button';
import OutputDisplay from './components/OutputDisplay';
import TrainingPanel from './components/TrainingPanel';
import AuthModal from './components/AuthModal';
import HistorySidebar from './components/HistorySidebar';
import QuickControls from './components/QuickControls';
import { generateProposal } from './services/geminiService';
import { AppState, TrainingData, ApiConfig, Proposal } from './types';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [summary, setSummary] = useState('');
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [extraInstructions, setExtraInstructions] = useState('');
  const [isExtraOpen, setIsExtraOpen] = useState(false);
  const [history, setHistory] = useState<Proposal[]>([]);
  
  // UX States
  const [loadingMessage, setLoadingMessage] = useState('Thinking...');
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');
  
  const outputRef = useRef<HTMLDivElement>(null);

  // API Config State (Local Only)
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jobGenie_apiConfig');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return { provider: 'gemini', apiKey: '' };
  });

  // Save API Config to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('jobGenie_apiConfig', JSON.stringify(apiConfig));
  }, [apiConfig]);

  // Initialize Training Data from LocalStorage
  const [trainingData, setTrainingData] = useState<TrainingData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trainingData');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.exampleProposal && !parsed.examples) {
            return {
              customInstructions: parsed.customInstructions || '',
              examples: [parsed.exampleProposal],
              isLocked: false
            };
          }
          return {
            customInstructions: parsed.customInstructions || '',
            examples: Array.isArray(parsed.examples) ? parsed.examples : [],
            isLocked: parsed.isLocked || false
          };
        } catch (e) {}
      }
    }
    return { customInstructions: '', examples: [], isLocked: false };
  });

  // Check User Session on Mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        loadDataFromSupabase(session.user.id);
        fetchHistory(session.user.id);
      } else {
        loadHistoryFromLocal();
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadDataFromSupabase(session.user.id);
        fetchHistory(session.user.id);
      } else {
        setHistory([]); // Clear sensitive history on logout, or load local guest history
        loadHistoryFromLocal();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadDataFromSupabase = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('training_data')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (data) {
        setTrainingData({
          customInstructions: data.custom_instructions || '',
          examples: data.examples || [],
          isLocked: data.is_locked || false
        });
        // Sync cloud data to local storage for offline backup/fast load
        localStorage.setItem('trainingData', JSON.stringify({
          customInstructions: data.custom_instructions || '',
          examples: data.examples || [],
          isLocked: data.is_locked || false
        }));
        
        // Sync API Config if exists
        if (data.api_config && Object.keys(data.api_config).length > 0) {
            setApiConfig(data.api_config);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const saveDataToSupabase = async (newData: TrainingData) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('training_data')
        .upsert({
          user_id: user.id,
          custom_instructions: newData.customInstructions,
          examples: newData.examples,
          is_locked: newData.isLocked,
          api_config: apiConfig, // Sync API config too
          updated_at: new Date().toISOString()
        });
        
      if (error) console.error('Error saving to cloud:', error);
    } catch (err) {
      console.error('Supabase error:', err);
    }
  };

  // HISTORY MANAGEMENT
  const fetchHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const loadHistoryFromLocal = () => {
    const local = localStorage.getItem('jobGenie_guestHistory');
    if (local) {
      try {
        setHistory(JSON.parse(local));
      } catch(e) {}
    }
  };

  const saveToHistory = async (input: string, output: string) => {
    const newEntry: Proposal = {
      id: crypto.randomUUID(),
      job_description: input,
      proposal_text: output,
      created_at: new Date().toISOString(),
      user_id: user?.id
    };

    // Update State
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);

    if (user) {
      // Save to Supabase
      try {
        await supabase.from('proposals').insert({
          user_id: user.id,
          job_description: input,
          proposal_text: output
        });
      } catch (err) {
        console.error("Error saving history to cloud:", err);
      }
    } else {
      // Save to LocalStorage (Guest)
      localStorage.setItem('jobGenie_guestHistory', JSON.stringify(updatedHistory));
    }
  };

  // Save Training Data (Local + Cloud)
  useEffect(() => {
    localStorage.setItem('trainingData', JSON.stringify(trainingData));
    if (user) {
      saveDataToSupabase(trainingData);
    }
  }, [trainingData, user, apiConfig]); // Added apiConfig dependency
  
  // Theme initialization logic
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) return 'dark';
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');

    if (theme === 'dark') {
      root.classList.add('dark');
      metaThemeColor?.setAttribute('content', '#09090b');
      metaColorScheme?.setAttribute('content', 'dark');
    } else {
      root.classList.remove('dark');
      metaThemeColor?.setAttribute('content', '#fafafa');
      metaColorScheme?.setAttribute('content', 'light');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleUpdateTraining = (newData: Partial<TrainingData>) => {
    setTrainingData(prev => ({ ...prev, ...newData }));
  };

  const handleQuickControl = (text: string) => {
    if (!extraInstructions.includes(text)) {
      const newValue = extraInstructions ? `${extraInstructions} ${text}` : text;
      setExtraInstructions(newValue);
    }
    // Auto-open to show the user it was added
    setIsExtraOpen(true);
  };

  const handleGenerate = async () => {
    if (!summary.trim()) return;
    
    setAppState(AppState.GENERATING);
    setGeneratedProposal('');
    setErrorMessage('');
    
    // Cycle loading messages to build trust ("Magic is invisible" fix)
    const steps = [
      "Analyzing Job Description...",
      "Consulting Training Data...", 
      "Drafting Strategy...",
      "Polishing..."
    ];
    let stepIndex = 0;
    setLoadingMessage(steps[0]);
    
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingMessage(steps[stepIndex]);
    }, 1500);

    try {
      // Pass apiConfig to the service
      const result = await generateProposal(summary, trainingData, extraInstructions, apiConfig);
      
      clearInterval(interval);
      setGeneratedProposal(result);
      setAppState(AppState.SUCCESS);
      setMobileTab('output'); // Auto switch to result on mobile
      
      // Save to History
      saveToHistory(summary, result);
      
    } catch (error: any) {
      clearInterval(interval);
      console.error(error);
      setAppState(AppState.ERROR);
      setErrorMessage(error.message || "Something went wrong. Please check your connection and API key.");
    }
  };

  const handleReset = () => {
    setGeneratedProposal('');
    setAppState(AppState.IDLE);
    setExtraInstructions(''); 
    setIsExtraOpen(false);
    setMobileTab('input');
    setErrorMessage('');
  };

  const handleHistorySelect = (proposal: Proposal) => {
    setSummary(proposal.job_description);
    setGeneratedProposal(proposal.proposal_text);
    setAppState(AppState.SUCCESS);
    setIsHistoryOpen(false);
    setMobileTab('output');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
    loadHistoryFromLocal(); // Revert to guest history
  };

  const isSuccess = appState === AppState.SUCCESS;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col relative overflow-hidden transition-colors duration-500 bg-zinc-50 dark:bg-[#09090b] font-sans selection:bg-blue-500/30">
      
      {/* Abstract Background Blobs */}
      <div className="fixed top-[-10%] left-[-20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gray-300/30 dark:bg-zinc-800/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-[-10%] right-[-20%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-zinc-300/30 dark:bg-zinc-700/10 rounded-full blur-[100px] md:blur-[140px] pointer-events-none transition-colors duration-500" />

      {/* Floating Glass Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pt-4 supports-[padding-top:env(safe-area-inset-top)]:pt-[calc(1rem+env(safe-area-inset-top))] pointer-events-none">
        <nav className="w-full max-w-4xl flex justify-between items-center px-5 py-3 
                        glass-panel rounded-full pointer-events-auto
                        shadow-lg shadow-black/5 dark:shadow-black/20 
                        ring-1 ring-black/5 dark:ring-white/10 
                        transition-all duration-500 ease-out">
          
          <div className="flex items-center gap-4">
             {/* Logo Section */}
             <div onClick={() => window.location.reload()} className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity cursor-pointer select-none">
                <div className="w-8 h-8 bg-gradient-to-br from-[#0071e3] to-[#42a1ff] rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-bold text-xs tracking-wider transform transition-transform hover:scale-110">
                  JG
                </div>
                <span className="font-semibold text-gray-800 dark:text-gray-200 tracking-tight text-sm md:text-base hidden xs:block">JobGenie</span>
             </div>

             {/* History Toggle */}
             <button
               onClick={() => setIsHistoryOpen(true)}
               className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-300 group active:scale-90 hover:scale-105 flex items-center gap-2 px-3"
             >
               <svg className="w-4 h-4 text-gray-600 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <span className="text-xs font-medium text-gray-600 dark:text-zinc-400 hidden sm:block">History</span>
             </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Training Button */}
            <button 
              onClick={() => setIsTrainingOpen(true)}
              className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-300 group active:scale-90 hover:scale-105 flex items-center gap-2 px-3"
              aria-label="Training Settings"
            >
              <svg className={`w-4 h-4 transition-colors ${trainingData.isLocked ? 'text-green-500' : 'text-gray-600 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {trainingData.isLocked ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                )}
              </svg>
              <span className={`text-xs font-medium hidden sm:block ${trainingData.isLocked ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-zinc-400'}`}>
                Studio
              </span>
            </button>

            {/* Auth Button */}
            <button
              onClick={() => user ? handleLogout() : setIsAuthOpen(true)}
              className={`
                p-2 px-3 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95
                ${user 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400' 
                  : 'bg-black/5 dark:bg-white/10 text-gray-600 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/20'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:block">
                {user ? 'Sign Out' : 'Sign In'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-300 group active:scale-90 hover:scale-105"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </div>

      <TrainingPanel 
        isOpen={isTrainingOpen} 
        onClose={() => setIsTrainingOpen(false)}
        data={trainingData}
        onUpdate={handleUpdateTraining}
        apiConfig={apiConfig}
        onUpdateApiConfig={setApiConfig}
      />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={() => {
           setIsAuthOpen(false);
        }}
      />

      <HistorySidebar 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
      />

      {/* Main Content */}
      <main className={`
        flex-1 flex flex-col w-full mx-auto px-2 md:px-6 z-10 
        pt-28 md:pt-36 pb-12 transition-all duration-500 ease-in-out
        ${isSuccess ? 'max-w-4xl justify-start' : 'max-w-4xl justify-center'}
      `}>
        
        {/* Intro Text (only when IDLE) */}
        {!isSuccess && (
          <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4 animate-fade-in-up px-2">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-zinc-400 drop-shadow-sm leading-[1.1]">
              Win more work.
            </h1>
            <p className="text-base md:text-xl text-gray-500 dark:text-zinc-400 max-w-[280px] md:max-w-lg mx-auto font-normal leading-relaxed">
              Paste the job description. We'll handle the persuasion.
            </p>
            
            {/* Hidden Feature Discovery - CTA for Studio */}
            <div className="pt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
               <button 
                 onClick={() => setIsTrainingOpen(true)}
                 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 text-xs md:text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-white/80 dark:hover:bg-white/10 hover:scale-105 transition-all shadow-sm"
               >
                 <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                 Want the AI to sound like you? <span className="text-blue-600 dark:text-blue-400 font-semibold">Customize Logic</span>
               </button>
            </div>
          </div>
        )}

        {/* Mobile Tab Switcher (Only Visible on Mobile when Success) */}
        {isSuccess && (
          <div className="md:hidden sticky top-24 z-40 w-full px-2 mb-4 animate-fade-in-up">
            <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-full p-1 flex shadow-lg border border-white/20 dark:border-white/10">
              <button 
                onClick={() => setMobileTab('input')} 
                className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${mobileTab === 'input' ? 'bg-[#0071e3] text-white shadow-md' : 'text-gray-500 dark:text-zinc-400'}`}
              >
                Input
              </button>
              <button 
                onClick={() => setMobileTab('output')} 
                className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${mobileTab === 'output' ? 'bg-[#0071e3] text-white shadow-md' : 'text-gray-500 dark:text-zinc-400'}`}
              >
                Result
              </button>
            </div>
          </div>
        )}

        <div className="w-full flex flex-col gap-6 items-center">
          
          {/* INPUT COLUMN */}
          <div className={`
             w-full transition-all duration-700 ease-spring
             ${isSuccess ? 'relative order-1' : 'relative z-10'}
             /* Mobile Tab Logic: Hide if success AND tab is output */
             ${isSuccess && mobileTab === 'output' ? 'hidden md:block' : 'block'}
          `}>
            {/* Input Card - Adaptive Bezel */}
            {/* On mobile, we collapse the padding and borders to maximize space */}
            <div className={`
              glass-panel transition-all duration-500
              ${isSuccess ? 'shadow-md md:shadow-lg' : 'shadow-xl shadow-black/5 dark:shadow-black/50'}
              
              /* Mobile: Simplified container */
              rounded-2xl border-0 p-0 bg-transparent backdrop-filter-none shadow-none

              /* Desktop: Premium Bezel */
              md:rounded-[32px] md:border md:border-white/20 md:dark:border-white/5 md:p-[1px] md:bg-white/40 md:backdrop-blur-xl md:shadow-2xl
            `}>
              
              {/* Inner Wrapper - Desktop Only */}
              <div className="
                 md:bg-white/40 md:dark:bg-[#1c1c1e]/50 md:rounded-[31px] md:p-1.5 md:backdrop-blur-[2px]
                 transition-all duration-500
              ">
                 {/* Input Surface */}
                 <div className={`
                    bg-white/60 dark:bg-black/80 
                    transition-colors duration-500 
                    border border-white/40 dark:border-white/10 shadow-sm
                    flex flex-col relative
                    
                    /* Mobile: Tighter padding, smaller radius */
                    rounded-2xl p-3

                    /* Desktop: Generous padding */
                    md:rounded-[28px] md:p-6
                 `}>
                    <div className={`transition-all duration-500 w-full ${isSuccess ? 'h-48 md:h-[40vh]' : 'h-48 md:h-64'}`}>
                      <TextArea
                        placeholder="Paste the job description here..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="text-base md:text-lg"
                      />
                      {/* Character Count - Absolute positioning inside text area wrapper */}
                      <div className="absolute bottom-28 md:bottom-32 right-3 md:right-6 pointer-events-none opacity-50 z-10">
                        <span className="text-[10px] md:text-xs text-gray-400 dark:text-zinc-500 font-medium tracking-wide uppercase bg-white/80 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full">
                           {summary.length > 0 ? `${summary.length} CHARS` : 'READY'}
                        </span>
                      </div>
                    </div>

                    {/* Controls Section */}
                    <div className="mt-auto">
                        {/* Quick Controls - Centered */}
                        <div className="mt-2 border-t border-black/5 dark:border-white/5 pt-3">
                            <QuickControls onSelect={handleQuickControl} />
                        </div>
                        
                        {/* Additional Instructions - Centered */}
                        <div className="px-1 mt-1">
                            <button 
                                onClick={() => setIsExtraOpen(!isExtraOpen)}
                                className="w-full flex items-center justify-center gap-2 py-2 text-[10px] md:text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors uppercase tracking-wide font-medium group"
                            >
                                <span>Additional Instructions</span>
                                <svg className={`w-3 h-3 transition-transform duration-300 ${isExtraOpen ? 'rotate-180' : ''} opacity-50 group-hover:opacity-100`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExtraOpen ? 'max-h-24 opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
                                <input 
                                type="text" 
                                value={extraInstructions}
                                onChange={(e) => setExtraInstructions(e.target.value)}
                                placeholder="e.g. Focus on my 5 years of experience..."
                                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-blue-500/50 rounded-lg px-4 py-2 text-sm text-center text-gray-800 dark:text-zinc-200 placeholder-gray-400 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Status Row - Centered (Character count moved, only clear button here if needed) */}
                        {summary.length > 0 && (
                            <div className="flex justify-center items-center py-2">
                                <button 
                                    onClick={() => setSummary('')} 
                                    className="text-[10px] md:text-xs text-gray-400 dark:text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-wider font-medium"
                                >
                                    Clear Input
                                </button>
                            </div>
                        )}

                        {/* Main Action Button */}
                        <Button 
                            onClick={handleGenerate} 
                            isLoading={appState === AppState.GENERATING}
                            loadingText={loadingMessage}
                            disabled={!summary.trim()}
                            className="w-full py-4 text-base font-semibold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 rounded-2xl md:text-lg mt-2"
                        >
                            {isSuccess ? 'Regenerate Proposal' : 'Generate Proposal'}
                        </Button>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Error Message */}
            {appState === AppState.ERROR && (
               <div className="mt-4 p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl border border-red-200/50 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-200 text-center text-sm font-medium animate-shake shadow-lg">
                  {errorMessage}
                  <button onClick={() => setAppState(AppState.IDLE)} className="ml-3 underline hover:text-red-800 dark:hover:text-white transition-colors">Try Again</button>
               </div>
            )}
          </div>

          {/* OUTPUT COLUMN */}
          {isSuccess && (
            <div 
              ref={outputRef} 
              className={`
                w-full relative z-20 animate-fade-in-up order-2 
                /* Mobile Tab Logic: Hide if success AND tab is input */
                ${isSuccess && mobileTab === 'input' ? 'hidden md:block' : 'block'}
              `}
            >
              <OutputDisplay 
                content={generatedProposal} 
                onClose={() => {
                   handleReset();
                }} 
              />
              <div className="mt-4 text-center md:hidden">
                <p className="text-xs text-gray-400">Use tabs above to edit input</p>
              </div>
            </div>
          )}
          
        </div>
      </main>

      {/* Footer - Adjusted to ensure no overlap */}
      <footer className="w-full py-6 text-center z-10 mt-auto relative">
        <p className="text-[10px] md:text-xs text-gray-400 dark:text-zinc-600 font-medium">Designed for professionals.</p>
        <span className="absolute right-4 bottom-2 text-gray-400 dark:text-zinc-600 text-[10px] md:text-xs italic">By nbl.</span>
      </footer>
    </div>
  );
};

export default App;
