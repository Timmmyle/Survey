import React from 'react';
import { Mic } from 'lucide-react';

interface ConsentScreenProps {
  onConsentDecision: (agreed: boolean) => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({
  onConsentDecision,
}) => {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 text-center max-w-sm mx-auto shadow-sm animate-in fade-in duration-200">
      
      {/* 🎙️ Emoji header */}
      <div className="text-5xl animate-pulse">🎙️</div>

      <div className="space-y-3">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
          Trước khi bắt đầu
        </h1>
        <p className="text-sm text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
          Một số câu trả lời của bạn có thể được ghi âm để phục vụ cho cuộc phỏng vấn.
        </p>
      </div>

      <p className="text-xs text-slate-400 font-semibold leading-relaxed px-2 bg-slate-50 py-3 rounded-2xl border border-slate-150">
        Nếu từ chối ghi âm, bạn vẫn có thể tiếp tục và nhập câu trả lời trực tiếp bằng bàn phím.
      </p>

      {/* Action controls */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={() => onConsentDecision(true)}
          className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl cursor-pointer transition-all active:scale-95 shadow-md"
        >
          Tôi đồng ý
        </button>

        <button
          type="button"
          onClick={() => onConsentDecision(false)}
          className="w-full h-13 bg-slate-100 hover:bg-slate-250 text-slate-700 font-extrabold text-sm rounded-2xl cursor-pointer transition-all active:scale-95 border border-slate-200"
        >
          Không đồng ý
        </button>
      </div>
    </div>
  );
};
