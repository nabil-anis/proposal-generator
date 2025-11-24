
import React, { useState, useEffect } from 'react';
import TextArea from './components/TextArea';
import Button from './components/Button';
import OutputDisplay from './components/OutputDisplay';
import { generateProposal } from './services/geminiService';
import { AppState } from './types';

const App: React.FC = () => {
  const [summary, setSummary] = useState('');
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme based on system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Update DOM class for dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleGenerate = async () => {
    if (!summary.trim()) return;
    
    setAppState(AppState.GENERATING);
    setGeneratedProposal('');

    try {
      const result = await generateProposal(summary);
      setGeneratedProposal(result);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setGeneratedProposal('');
    setAppState(AppState.IDLE);
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden transition-colors duration-700 bg-zinc-50 dark:bg-[#09090b] font-sans">
      
      {/* Abstract Background Blobs - Charcoal/Monochrome Theme */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gray-300/30 dark:bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-700" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-zinc-300/30 dark:bg-zinc-700/10 rounded-full blur-[140px] pointer-events-none transition-colors duration-700" />

      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity cursor-default">
           <div className="w-9 h-9 bg-gradient-to-br from-[#0071e3] to-[#42a1ff] rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-bold text-sm">
             UP
           </div>
           <span className="font-semibold text-gray-800 dark:text-gray-200 tracking-tight text-lg">Proposal</span>
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-700 transition-all duration-300 backdrop-blur-md shadow-sm border border-black/5 dark:border-white/10 group"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
             <svg className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className={`
        flex-1 flex flex-col items-center w-full max-w-4xl mx-auto px-4 md:px-6 z-10 pb-20 transition-all duration-500
        ${appState === AppState.SUCCESS ? 'justify-start pt-8 md:pt-12' : 'justify-center'}
      `}>
        
        {/* Intro Text (only when IDLE) */}
        {appState === AppState.IDLE && (
          <div className="text-center mb-10 space-y-4 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-zinc-400 drop-shadow-sm">
              Win more work.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-zinc-400 max-w-lg mx-auto font-normal leading-relaxed">
              Paste the job description. We'll handle the persuasion.
            </p>
          </div>
        )}

        <div className="w-full relative">
          {/* Input Card */}
          {/* 
              Structure:
              If SUCCESS: absolute, opacity 0, pointer-events-none (to fade out while output takes flow)
              If IDLE/GENERATING: relative, opacity 100 (takes natural space)
          */}
          <div className={`
            w-full transition-all duration-700 ease-spring
            ${appState === AppState.SUCCESS 
              ? 'absolute top-0 left-0 w-full opacity-0 pointer-events-none scale-95 z-0 translate-y-[-20px]' 
              : 'relative z-10 opacity-100 scale-100 translate-y-0'
            }
          `}>
            {/* Outer Bezel - Refined Polish */}
            <div className="glass-light dark:glass-dark rounded-[32px] p-[2px] transition-all duration-500 shadow-2xl shadow-black/5 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/5">
              {/* Inner Content - Screen Effect */}
              <div className="bg-white/30 dark:bg-white/5 rounded-[30px] p-1 backdrop-blur-[2px]">
                 <div className="bg-white/30 dark:bg-black/60 rounded-[26px] p-6 transition-colors duration-500 border border-white/20 dark:border-white/5 shadow-inner">
                    <div className="h-48 md:h-64">
                      <TextArea
                        placeholder="Paste the job description here, along with any quick notes about your relevant experience..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center px-1 py-2 border-t border-black/5 dark:border-white/5 mt-2">
                      <span className="text-xs text-gray-400 dark:text-zinc-400 font-medium ml-2">
                        {summary.length > 0 ? `${summary.length} chars` : 'Ready'}
                      </span>
                      <Button 
                        onClick={handleGenerate} 
                        isLoading={appState === AppState.GENERATING}
                        disabled={!summary.trim()}
                      >
                        Generate
                      </Button>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Result Display - Takes Layout Flow when visible */}
          {appState === AppState.SUCCESS && (
            <div className="relative w-full z-20 animate-fade-in-up">
              <OutputDisplay 
                content={generatedProposal} 
                onClose={handleReset} 
              />
              <div className="mt-12 flex justify-center">
                 <button 
                  onClick={handleReset}
                  className="px-8 py-3 rounded-full bg-white/80 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 font-medium hover:scale-105 active:scale-95 transition-all duration-300 text-sm backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/30 border border-white/20 dark:border-white/10"
                 >
                   Create Another
                 </button>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {appState === AppState.ERROR && (
             <div className="absolute top-full left-0 w-full mt-6 p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl border border-red-200/50 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-200 text-center text-sm font-medium animate-shake shadow-lg z-30">
                Something went wrong. Please check your connection or API key.
                <button onClick={() => setAppState(AppState.IDLE)} className="ml-3 underline hover:text-red-800 dark:hover:text-white transition-colors">Try Again</button>
             </div>
          )}
        </div>
      </main>

      {/* Footer - Adjusted to ensure no overlap */}
      <footer className="w-full py-6 text-center z-10 mt-auto">
        <p className="text-xs text-gray-400 dark:text-zinc-600 font-medium">Designed for professionals.</p>
      </footer>
    </div>
  );
};

export default App;
