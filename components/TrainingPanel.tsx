
import React, { useState } from 'react';
import TextArea from './TextArea';
import { TrainingData, ApiConfig, AIProvider } from '../types';

interface TrainingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: TrainingData;
  onUpdate: (data: Partial<TrainingData>) => void;
  apiConfig: ApiConfig;
  onUpdateApiConfig: (config: ApiConfig) => void;
}

const TrainingPanel: React.FC<TrainingPanelProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  onUpdate, 
  apiConfig, 
  onUpdateApiConfig 
}) => {
  const [activeTab, setActiveTab] = useState<'training' | 'settings'>('training');
  const [newExample, setNewExample] = useState('');
  const [isAddingExample, setIsAddingExample] = useState(false);
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleAddExample = () => {
    if (newExample.trim()) {
      onUpdate({ examples: [...data.examples, newExample.trim()] });
      setNewExample('');
      setIsAddingExample(false);
    }
  };

  const handleRemoveExample = (index: number) => {
    const updated = [...data.examples];
    updated.splice(index, 1);
    onUpdate({ examples: updated });
  };

  const toggleLock = () => {
    onUpdate({ isLocked: !data.isLocked });
  };

  const providers: { id: AIProvider; name: string }[] = [
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'openai', name: 'OpenAI (GPT-4)' },
    { id: 'groq', name: 'Groq (Llama 3)' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="
        w-full max-w-2xl bg-[#fafafa] dark:bg-[#1c1c1e] 
        rounded-[24px] md:rounded-[32px] 
        shadow-2xl shadow-black/20 dark:shadow-black/60
        ring-1 ring-black/5 dark:ring-white/10
        relative z-10 flex flex-col 
        max-h-[85dvh] md:max-h-[90vh] 
        overflow-hidden
        animate-fade-in-up
      ">
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-white/5 backdrop-blur-md shrink-0">
          <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">JobGenie Studio</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">Customize logic & connections.</p>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all hover:rotate-90 duration-300"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-4 border-b border-black/5 dark:border-white/5 bg-gray-50/30 dark:bg-black/20 shrink-0">
           <button 
             onClick={() => setActiveTab('training')}
             className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'training' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
           >
             Training Data
           </button>
           <button 
             onClick={() => setActiveTab('settings')}
             className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
           >
             AI Settings
           </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto scrollbar-hide bg-gray-50/30 dark:bg-black/20 flex-1">
          
          {activeTab === 'training' ? (
            <div className="space-y-8">
               <div className="flex items-center justify-end">
                   {/* Lock Toggle moved here */}
                  <button 
                    onClick={toggleLock}
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95
                      ${data.isLocked 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' 
                        : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 border border-transparent hover:bg-gray-200'
                      }
                    `}
                  >
                    {data.isLocked ? (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Locked
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                        Unlocked
                      </>
                    )}
                  </button>
               </div>

              {/* Section 1: Custom Instructions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">System Instructions</h3>
                </div>
                <div className={`h-32 ml-8 glass-panel rounded-xl p-1 bg-white/40 dark:bg-black/20 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 ${data.isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
                  <TextArea 
                    placeholder="e.g. 'I am a video editor. Keep tone casual but professional.'"
                    value={data.customInstructions}
                    onChange={(e) => onUpdate({ customInstructions: e.target.value })}
                    className="text-base"
                    disabled={data.isLocked}
                  />
                </div>
              </div>

              {/* Section 2: Examples Library */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">2</div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Example Library</h3>
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">
                    {data.examples.length} Items
                  </span>
                </div>
                
                <div className="ml-8 space-y-3">
                  {data.examples.map((ex, idx) => (
                    <div key={idx} className="group relative glass-panel bg-white/60 dark:bg-zinc-800/40 p-4 rounded-xl border border-white/20 dark:border-white/5 shadow-sm">
                      <div className="pr-8 text-sm text-gray-700 dark:text-zinc-300 line-clamp-3 italic">"{ex}"</div>
                      {!data.isLocked && (
                        <button 
                          onClick={() => handleRemoveExample(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  ))}

                  {!data.isLocked && (
                    <div className="mt-2">
                      {!isAddingExample ? (
                        <button 
                          onClick={() => setIsAddingExample(true)}
                          className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Add Winning Proposal Example
                        </button>
                      ) : (
                        <div className="glass-panel p-2 rounded-xl bg-white dark:bg-zinc-800 animate-fade-in-up shadow-lg">
                          <div className="h-32 mb-2">
                            <TextArea
                              autoFocus
                              placeholder="Paste a full proposal text here..."
                              value={newExample}
                              onChange={(e) => setNewExample(e.target.value)}
                              className="text-base"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setIsAddingExample(false)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-zinc-400"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleAddExample}
                              disabled={!newExample.trim()}
                              className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 disabled:opacity-50"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Settings Tab */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Bring Your Own Key (BYOK)</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                  Your API keys are stored securely in your browser's local storage. They are never sent to our servers, only directly to the AI provider.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 ml-1">AI Provider</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {providers.map(p => (
                      <button
                        key={p.id}
                        onClick={() => onUpdateApiConfig({ ...apiConfig, provider: p.id })}
                        className={`
                          py-3 px-4 rounded-xl text-sm font-medium transition-all border
                          ${apiConfig.provider === p.id 
                            ? 'bg-white dark:bg-zinc-700 border-blue-500 text-blue-600 dark:text-blue-400 shadow-md ring-1 ring-blue-500' 
                            : 'bg-white/50 dark:bg-zinc-800/50 border-transparent text-gray-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'
                          }
                        `}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 ml-1">
                    {apiConfig.provider === 'gemini' ? 'Gemini API Key (Optional)' : 'API Key (Required)'}
                  </label>
                  <div className="relative">
                    <input 
                      type={showKey ? "text" : "password"}
                      value={apiConfig.apiKey}
                      onChange={(e) => onUpdateApiConfig({ ...apiConfig, apiKey: e.target.value })}
                      placeholder={apiConfig.provider === 'gemini' ? "Leave empty to use default (Free)" : "sk-..."}
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all text-sm font-mono"
                    />
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
                    >
                      {showKey ? (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {apiConfig.provider === 'gemini' && !apiConfig.apiKey && (
                    <p className="text-[10px] text-gray-400 ml-1">Using the app's built-in key.</p>
                  )}
                </div>
                
                <div className="space-y-2">
                   <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 ml-1">Custom Model (Optional)</label>
                   <input 
                      type="text"
                      value={apiConfig.model || ''}
                      onChange={(e) => onUpdateApiConfig({ ...apiConfig, model: e.target.value })}
                      placeholder={apiConfig.provider === 'openai' ? 'gpt-4o' : apiConfig.provider === 'groq' ? 'llama3-70b-8192' : 'gemini-2.5-flash'}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all text-sm font-mono"
                   />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95 hover:scale-105"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingPanel;
