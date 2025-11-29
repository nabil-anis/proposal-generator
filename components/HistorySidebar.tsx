
import React from 'react';
import { Proposal } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: Proposal[];
  onSelect: (proposal: Proposal) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelect }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 left-0 bottom-0 w-80 md:w-96 
        bg-[#fafafa] dark:bg-[#1c1c1e]/95 backdrop-blur-xl
        border-r border-black/5 dark:border-white/10
        shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Header */}
        <div className="p-5 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-white/5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">History</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your past generated proposals.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center mt-10 text-gray-400 dark:text-zinc-600">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No history yet.</p>
              <p className="text-xs mt-1">Generate a proposal to see it here.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className="group p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                     {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                   </span>
                   <span className="text-[10px] text-gray-400">
                     {new Date(item.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-zinc-200 line-clamp-2 mb-2 leading-snug">
                  {item.job_description.substring(0, 100)}...
                </h4>
                <div className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-2 italic">
                   "{item.proposal_text.substring(0, 80)}..."
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
