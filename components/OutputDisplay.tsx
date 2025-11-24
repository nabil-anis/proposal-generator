
import React, { useState } from 'react';

interface OutputDisplayProps {
  content: string;
  onClose?: () => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="w-full glass-light dark:glass-dark rounded-[24px] overflow-hidden shadow-2xl animate-fade-in-up ring-1 ring-black/5 dark:ring-white/10 transition-all duration-500">
      {/* Header - Unified with body, no distinct border/bg for seamless look */}
      <div className="px-6 pt-5 pb-2 flex justify-between items-center relative z-20">
        {/* Authentic macOS Window Controls */}
        <div className="flex items-center gap-2 group">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] hover:bg-[#FF5F57]/80 transition-colors shadow-sm"
            aria-label="Close"
            title="Close"
          />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm"></div>
        </div>

        {/* Sleek Copy Button */}
        <button
          onClick={handleCopy}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-300 ease-out
            ${copied
              ? 'bg-green-500 text-white shadow-md shadow-green-500/20 scale-105'
              : 'bg-white/40 dark:bg-white/10 text-gray-600 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-white/20 hover:scale-105 hover:shadow-sm'
            }
          `}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="px-8 pb-10 pt-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
        <pre className="whitespace-pre-wrap font-sans text-[18px] leading-[1.7] text-[#1d1d1f] dark:text-zinc-200 tracking-[-0.01em] font-normal antialiased selection:bg-blue-500/20 dark:selection:bg-blue-400/30">
          {content}
        </pre>
      </div>
    </div>
  );
};

export default OutputDisplay;
