
import React from 'react';

interface QuickControlsProps {
  onSelect: (text: string) => void;
}

const QuickControls: React.FC<QuickControlsProps> = ({ onSelect }) => {
  const options = [
    { label: "Short", value: "Keep it strictly under 100 words." },
    { label: "Casual", value: "Use a friendly, conversational tone." },
    { label: "Formal", value: "Maintain a strictly professional tone." },
    { label: "Urgent", value: "Emphasize ability to start immediately." },
    { label: "Question-heavy", value: "Focus heavily on strategic questions." },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 py-2 animate-fade-in-up">
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onSelect(opt.value)}
          className="px-3 py-1.5 text-[10px] md:text-xs font-medium rounded-full 
                     bg-black/5 dark:bg-white/5 text-gray-600 dark:text-zinc-400 
                     border border-transparent hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300
                     hover:bg-blue-50 dark:hover:bg-blue-900/20
                     transition-all active:scale-95"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default QuickControls;
