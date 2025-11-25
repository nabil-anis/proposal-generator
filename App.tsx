
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
  
  // Initialize theme state. We check the DOM classList first to match the inline script in index.html,
  // preventing hydration mismatches.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) return 'dark';
      
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  // Handle theme changes: update DOM, localStorage, and meta theme-color for mobile
  useEffect(() => {
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (theme === 'dark') {
      root.classList.add('dark');
      metaThemeColor?.setAttribute('content', '#09090b');
    } else {
      root.classList.remove('dark');
      metaThemeColor?.setAttribute('content', '#fafafa'); // zinc-50
    }
    
    localStorage.setItem('theme', theme);
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
    <div className="min-h-[100dvh] w-full flex flex-col relative overflow-hidden transition-colors duration-500 bg-zinc-50 dark:bg-[#09090b] font-sans selection:bg-blue-500/30">
      
      {/* Abstract Background Blobs - Refined for mobile */}
      <div className="fixed top-[-10%] left-[-20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gray-300/30 dark:bg-zinc-800/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-[-10%] right-[-20%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-zinc-300/30 dark:bg-zinc-700/10 rounded-full blur-[100px] md:blur-[140px] pointer-events-none transition-colors duration-500" />

      {/* Floating Glass Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pt-4 supports-[padding-top:env(safe-area-inset-top)]:pt-[calc(1rem+env(safe-area-inset-top))] pointer-events-none">
        <nav className="w-full max-w-3xl flex justify-between items-center px-5 py-3 
                        glass-panel rounded-full pointer-events-auto
                        shadow-lg shadow-black/5 dark:shadow-black/20 
                        ring-1 ring-black/5 dark:ring-white/10 
                        transition-all duration-500 ease-out">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity cursor-default select-none">
             <div className="w-8 h-8 bg-gradient-to-br from-[#0071e3] to-[#42a1ff] rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-bold text-xs tracking-wider">
               UP
             </div>
             <span className="font-semibold text-gray-800 dark:text-gray-200 tracking-tight text-sm md:text-base">Proposal Gen</span>
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-300 group active:scale-90"
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
        </nav>
      </div>

      {/* Main Content */}
      <main className={`
        flex-1 flex flex-col items-center w-full max-w-4xl mx-auto px-4 md:px-6 z-10 
        pt-28 md:pt-36 pb-12 transition-all duration-500
        ${appState === AppState.SUCCESS ? 'justify-start' : 'justify-center'}
      `}>
        
        {/* Intro Text (only when IDLE) */}
        {appState === AppState.IDLE && (
          <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4 animate-fade-in-up px-2">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-zinc-400 drop-shadow-sm leading-[1.1]">
              Win more work.
            </h1>
            <p className="text-base md:text-xl text-gray-500 dark:text-zinc-400 max-w-[280px] md:max-w-lg mx-auto font-normal leading-relaxed">
              Paste the job description. We'll handle the persuasion.
            </p>
          </div>
        )}

        <div className="w-full relative">
          {/* Input Card */}
          <div className={`
            w-full transition-all duration-700 ease-spring
            ${appState === AppState.SUCCESS 
              ? 'absolute top-0 left-0 w-full opacity-0 pointer-events-none scale-95 z-0 translate-y-[-20px]' 
              : 'relative z-10 opacity-100 scale-100 translate-y-0'
            }
          `}>
            {/* Outer Bezel - Refined Polish */}
            <div className="glass-panel rounded-[24px] md:rounded-[32px] p-[1px] transition-all duration-500 shadow-xl shadow-black/5 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/5">
              
              {/* Inner Content - Screen Effect */}
              <div className="bg-white/40 dark:bg-[#1c1c1e]/50 rounded-[23px] md:rounded-[31px] p-1.5 backdrop-blur-[2px]">
                 {/* Input Surface */}
                 <div className="bg-white/60 dark:bg-black/80 rounded-[20px] md:rounded-[28px] p-4 md:p-6 transition-colors duration-500 border border-white/40 dark:border-white/10 shadow-sm">
                    <div className="h-48 md:h-64">
                      <TextArea
                        placeholder="Paste the job description here..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                      />
                    </div>
                    {/* Toolbar */}
                    <div className="flex justify-between items-center px-1 py-2 border-t border-black/5 dark:border-white/10 mt-2">
                      <span className="text-[10px] md:text-xs text-gray-400 dark:text-zinc-500 font-medium ml-1 md:ml-2 tracking-wide uppercase">
                        {summary.length > 0 ? `${summary.length} CHARS` : 'READY'}
                      </span>
                      <Button 
                        onClick={handleGenerate} 
                        isLoading={appState === AppState.GENERATING}
                        disabled={!summary.trim()}
                        className="scale-90 md:scale-100 origin-right"
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
              <div className="mt-8 md:mt-12 flex justify-center pb-8">
                 <button 
                  onClick={handleReset}
                  className="px-6 py-3 md:px-8 md:py-3 rounded-full bg-white/80 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 font-medium hover:scale-105 active:scale-95 transition-all duration-300 text-sm backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/30 border border-white/20 dark:border-white/10"
                 >
                   Create Another
                 </button>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {appState === AppState.ERROR && (
             <div className="absolute top-full left-0 w-full mt-4 md:mt-6 p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl border border-red-200/50 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-200 text-center text-sm font-medium animate-shake shadow-lg z-30">
                Something went wrong. Please check your connection.
                <button onClick={() => setAppState(AppState.IDLE)} className="ml-3 underline hover:text-red-800 dark:hover:text-white transition-colors">Try Again</button>
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
