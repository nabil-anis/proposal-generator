
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full h-full flex flex-col">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 pl-1">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full h-full p-2 bg-transparent
          text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400
          text-lg leading-relaxed
          border-0 outline-none ring-0 focus:ring-0
          resize-none selection:bg-blue-500/30
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default TextArea;
