import React, { useState } from 'react';
import { Volume2, ArrowRight } from 'lucide-react';

interface InterviewWelcomeProps {
  title: string;
  description?: string;
  onStart: () => void;
  onReadAloud: (text: string) => void;
}

export const InterviewWelcome: React.FC<InterviewWelcomeProps> = ({
  title,
  description,
  onStart,
  onReadAloud,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleReadClick = () => {
    setIsPlaying(true);
    const welcomeSpeech = `Xin chào! Bạn sẽ tham gia một cuộc phỏng vấn ngắn. Khảo sát: ${title}. ${
      description ? description : ''
    } Thời gian dự kiến khoảng 5 phút. Hãy bấm nút bắt đầu để tiến hành cuộc phỏng vấn.`;
    
    onReadAloud(welcomeSpeech);
    
    setTimeout(() => {
      setIsPlaying(false);
    }, 12000);
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 text-center max-w-sm mx-auto shadow-sm animate-in fade-in duration-200">
      
      {/* 👋 Emoji header */}
      <div className="text-5xl animate-bounce">👋</div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
          Xin chào!
        </h1>
        <p className="text-base text-slate-500 font-semibold leading-relaxed">
          Bạn sẽ tham gia một cuộc phỏng vấn ngắn.
        </p>
      </div>

      {/* Details Box */}
      <div className="py-4 border-t border-b border-slate-100 space-y-2 text-slate-650">
        <p className="text-sm font-extrabold flex items-center justify-center gap-1.5 text-slate-700">
          <span>⏱ Khoảng 5 phút</span>
        </p>
        {description && (
          <p className="text-xs text-slate-450 leading-relaxed font-semibold max-w-xs mx-auto">
            Chủ đề: {description}
          </p>
        )}
      </div>

      {/* Navigation and Narration Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={handleReadClick}
          className={`w-full h-13 rounded-2xl border-2 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98 select-none ${
            isPlaying
              ? 'bg-amber-50 border-amber-500 text-amber-800 animate-pulse'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Volume2 className="h-5 w-5 text-slate-450" />
          {isPlaying ? 'Đang đọc hướng dẫn...' : '🔊 Nghe hướng dẫn'}
        </button>

        <button
          type="button"
          onClick={onStart}
          className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
        >
          Bắt đầu →
        </button>
      </div>

      <p className="text-[10px] text-slate-400 font-semibold">
        Không yêu cầu đăng ký tài khoản hay đăng nhập mật khẩu.
      </p>
    </div>
  );
};
