import React from 'react';

interface LikertOption {
  value: number;
  emoji: string;
  label: string;
  colorClass: string;
  activeColorClass: string;
}

const LIKERT_OPTIONS: LikertOption[] = [
  { value: 1, emoji: '😞', label: 'Yếu', colorClass: 'hover:bg-red-50 text-red-500 border-red-200', activeColorClass: 'bg-red-500 text-white border-red-500 hover:bg-red-600 shadow-md shadow-red-100' },
  { value: 2, emoji: '😐', label: 'Tạm', colorClass: 'hover:bg-orange-50 text-orange-500 border-orange-200', activeColorClass: 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600 shadow-md shadow-orange-100' },
  { value: 3, emoji: '🙂', label: 'Trung bình', colorClass: 'hover:bg-amber-50 text-amber-600 border-amber-200', activeColorClass: 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600 shadow-md shadow-amber-100' },
  { value: 4, emoji: '😊', label: 'Tốt', colorClass: 'hover:bg-emerald-50 text-emerald-600 border-emerald-200', activeColorClass: 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100' },
  { value: 5, emoji: '🤩', label: 'Xuất sắc', colorClass: 'hover:bg-indigo-50 text-indigo-600 border-indigo-200', activeColorClass: 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100' },
];

interface LikertQuestionProps {
  id: string;
  text: string;
  index: number;
  currentScore?: number;
  onChange: (score: number) => void;
}

export const LikertQuestion: React.FC<LikertQuestionProps> = ({
  text,
  index,
  currentScore,
  onChange,
}) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <div className="flex gap-3 mb-4">
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold shrink-0">
          {index + 1}
        </span>
        <p className="text-slate-800 font-semibold text-sm leading-relaxed">{text}</p>
      </div>

      <div className="grid grid-cols-5 gap-2 max-w-xl">
        {LIKERT_OPTIONS.map((option) => {
          const isSelected = currentScore === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                isSelected
                  ? `${option.activeColorClass} transform -translate-y-0.5 scale-105 font-semibold`
                  : `bg-white border-slate-200 text-slate-500 ${option.colorClass}`
              }`}
            >
              <span className={`text-2xl mb-1 transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                {option.emoji}
              </span>
              <span className="text-[10px] md:text-xs tracking-tight">{option.label}</span>
              <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                {option.value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

