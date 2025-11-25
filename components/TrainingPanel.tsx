import React from 'react';
import TextArea from './TextArea';
import { TrainingData } from '../types';

interface TrainingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: TrainingData;
  onUpdate: (field: keyof TrainingData, value: string) => void;
}

const TrainingPanel: React.FC<TrainingPanelProps> = ({ isOpen, onClose, data, onUpdate }) => {
  if (!isOpen) return null;

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
        relative z-10 flex flex-col max-h-[90vh] overflow-hidden
        animate-fade-in-up
      ">
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-white/5 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Personalize AI</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Train the model to write like you.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto scrollbar-hide">
          
          {/* Section 1: Custom Instructions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Custom Instructions</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              Tell the AI about your specific skills, preferred tools, or rules you always follow.
            </p>
            <div className="h-32 ml-8 glass-panel rounded-xl p-1 bg-white/40 dark:bg-black/20">
              <TextArea 
                placeholder="e.g. 'I am a video editor using Premiere Pro. I always mention fast turnaround times. Never use the word 'synergy'.'"
                value={data.customInstructions}
                onChange={(e) => onUpdate('customInstructions', e.target.value)}
                className="text-base"
              />
            </div>
          </div>

          {/* Section 2: Reference Example */}
          <div className="space-y-3">
             <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">2</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Reference Proposal</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              Paste a winning proposal you've written before. The AI will mimic this tone and structure.
            </p>
            <div className="h-48 ml-8 glass-panel rounded-xl p-1 bg-white/40 dark:bg-black/20">
              <TextArea 
                placeholder="Paste a previous successful proposal here..."
                value={data.exampleProposal}
                onChange={(e) => onUpdate('exampleProposal', e.target.value)}
                className="text-base"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingPanel;