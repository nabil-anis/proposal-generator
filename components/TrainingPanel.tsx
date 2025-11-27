
import React, { useState } from 'react';
import TextArea from './TextArea';
import { TrainingData } from '../types';

interface TrainingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: TrainingData;
  onUpdate: (data: Partial<TrainingData>) => void;
}

const TrainingPanel: React.FC<TrainingPanelProps> = ({ isOpen, onClose, data, onUpdate }) => {
  const [newExample, setNewExample] = useState('');
  const [isAddingExample, setIsAddingExample] = useState(false);

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
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Training Studio</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Teach the AI your unique style.</p>
            </div>
            
            {/* Lock Toggle */}
            <button 
              onClick={toggleLock}
              className={`
                ml-4 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95
                ${data.isLocked 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' 
                  : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 border border-transparent hover:bg-gray-200'
                }
              `}
              title={data.isLocked ? "Unlock to make changes" : "Lock settings to prevent changes"}
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

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all hover:rotate-90 duration-300"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-8 overflow-y-auto scrollbar-hide bg-gray-50/30 dark:bg-black/20">
          
          {/* Section 1: Custom Instructions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">System Instructions</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              Tell the AI about your specific skills, constraints, or tone requirements.
            </p>
            <div className={`h-32 ml-8 glass-panel rounded-xl p-1 bg-white/40 dark:bg-black/20 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 ${data.isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
              <TextArea 
                placeholder="e.g. 'I am a video editor using Premiere. Keep tone casual but professional. Never use the word 'synergy'.'"
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
                {data.examples.length} {data.examples.length === 1 ? 'Example' : 'Examples'}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              The more examples you provide, the better the AI can mimic your style.
            </p>
            
            <div className="ml-8 space-y-3">
              {/* Existing Examples List */}
              {data.examples.map((ex, idx) => (
                <div key={idx} className="group relative glass-panel bg-white/60 dark:bg-zinc-800/40 p-4 rounded-xl border border-white/20 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg shadow-sm">
                  <div className="pr-8 text-sm text-gray-700 dark:text-zinc-300 line-clamp-3 italic">
                    "{ex}"
                  </div>
                  {!data.isLocked && (
                    <button 
                      onClick={() => handleRemoveExample(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                      title="Remove example"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              ))}

              {/* Add New Example Input */}
              {!data.isLocked && (
                <div className="mt-2">
                  {!isAddingExample ? (
                    <button 
                      onClick={() => setIsAddingExample(true)}
                      className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-2 text-sm font-medium hover:scale-[1.01]"
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
                          className="text-base" // Prevent mobile zoom (16px)
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setIsAddingExample(false)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleAddExample}
                          disabled={!newExample.trim()}
                          className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 disabled:opacity-50 hover:shadow-md transition-all active:scale-95"
                        >
                          Add to Library
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {data.isLocked && (
                <div className="text-center py-4 text-xs text-gray-400 italic">
                  Unlock settings to add or remove examples.
                </div>
              )}
            </div>
          </div>
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
