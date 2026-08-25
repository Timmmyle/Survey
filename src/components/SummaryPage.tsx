import React from 'react';
import { EvaluationResult, Question } from '../types';
import { User, Briefcase, Mail, Phone, Calendar, Star, FileText, CheckCircle, ArrowLeft, Download, Copy, Play } from 'lucide-react';

interface SummaryPageProps {
  evaluation: EvaluationResult;
  questions: Question[];
  onRestart: () => void;
}

export const SummaryPage: React.FC<SummaryPageProps> = ({
  evaluation,
  questions,
  onRestart,
}) => {
  const { candidate, scores, transcript, audioUrl, completedAt } = evaluation;

  // Calculate stats
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(scores).length;
  const averageScore =
    answeredQuestions > 0
      ? (Object.values(scores).reduce((sum, score) => sum + score, 0) / answeredQuestions).toFixed(1)
      : '0.0';

  const getScoreBadge = (avg: number) => {
    if (avg >= 4.5) return { text: 'Xuất sắc', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    if (avg >= 3.8) return { text: 'Tốt', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (avg >= 3.0) return { text: 'Khá', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { text: 'Cần cân nhắc', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const scoreBadge = getScoreBadge(parseFloat(averageScore));

  const copyToClipboard = () => {
    const textReport = `
BÁO CÁO ĐÁNH GIÁ PHỎNG VẤN ỨNG VIÊN
==================================
Họ tên: ${candidate.firstName} ${candidate.lastName}
Vị trí ứng tuyển: ${candidate.position}
Email: ${candidate.email}
Điện thoại: ${candidate.phone}
Ngày phỏng vấn: ${candidate.interviewDate || 'Chưa lên lịch'}
Thời gian hoàn tất đánh giá: ${completedAt}

ĐIỂM ĐÁNH GIÁ (Thang điểm 5):
Trung bình cộng: ${averageScore}/5.0 (${scoreBadge.text})
Chi tiết:
${questions
  .map(
    (q, idx) =>
      `${idx + 1}. ${q.text} -> ${scores[q.id] || 'N/A'}/5`
  )
  .join('\n')}

TRANSCRIPT PHỎNG VẤN:
${transcript || '(Không có dữ liệu transcript)'}
    `;

    navigator.clipboard.writeText(textReport.trim());
    alert('Đã sao chép báo cáo vào bộ nhớ tạm (Clipboard)!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Banner */}
      <div className="bg-emerald-600 text-white rounded-2xl p-6 md:p-8 flex items-center justify-between shadow-md border border-emerald-700">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle className="h-6 w-6 text-white" />
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Đánh giá hoàn tất!</h1>
          </div>
          <p className="text-emerald-50 text-sm md:text-base leading-relaxed">
            Dữ liệu đánh giá của ứng viên <strong className="underline">{candidate.firstName} {candidate.lastName}</strong> đã được tổng hợp thành công.
          </p>
        </div>
        <div className="hidden md:block bg-white/10 p-3 rounded-full border border-white/20">
          <CheckCircle className="h-10 w-10 text-emerald-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Summary scorecard */}
        <div className="md:col-span-1 space-y-6">
          {/* Average Rating Scorecard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Điểm đánh giá TB</span>
            <div className="relative flex items-center justify-center h-28 w-28 bg-indigo-50 text-indigo-700 rounded-full border-4 border-indigo-200 mb-3 shadow-inner">
              <span className="text-3xl font-black font-mono">{averageScore}</span>
              <span className="absolute bottom-4 text-[10px] font-bold text-indigo-400">/ 5.0</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreBadge.color}`}>
              {scoreBadge.text}
            </span>
          </div>

          {/* Quick info list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Thông tin liên hệ</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-slate-700 font-semibold">{candidate.position}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-slate-600 truncate" title={candidate.email}>{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-slate-600">{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-slate-600">
                  {candidate.interviewDate
                    ? new Date(candidate.interviewDate).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Details report */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Question Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Star className="h-4.5 w-4.5 text-indigo-600" />
              Chi tiết điểm số tiêu chí
            </h3>

            <div className="space-y-3.5">
              {questions.map((q, idx) => {
                const score = scores[q.id] || 0;
                // Emojis for display
                const emojis = ['😞', '😐', '🙂', '😊', '🤩'];
                const emoji = score > 0 ? emojis[score - 1] : '❓';
                const widthPercent = (score / 5) * 100;

                return (
                  <div key={q.id} className="space-y-1.5">
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                        {idx + 1}. {q.text}
                      </p>
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-sm shrink-0">
                        {emoji} {score}
                      </span>
                    </div>
                    {/* Bar graphic */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transcript display */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-indigo-600" />
                Bản ghi âm & Transcript phỏng vấn
              </h3>
              {audioUrl && (
                <div className="flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-300 px-2 py-0.5 rounded-sm text-slate-500">
                  <Play className="h-3 w-3 text-indigo-600" /> Có file âm thanh
                </div>
              )}
            </div>

            {audioUrl && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium shrink-0">Bản ghi:</span>
                <audio src={audioUrl} controls className="h-8 max-w-full" />
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl max-h-[220px] overflow-y-auto">
              {transcript ? (
                <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                  {transcript}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-2">
                  Không có nội dung transcript cuộc phỏng vấn được lưu lại.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-100 border border-slate-200 p-4 rounded-2xl">
        <button
          onClick={onRestart}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Đánh giá ứng viên mới
        </button>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={copyToClipboard}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            <Copy className="h-4 w-4 text-slate-500" />
            Copy Báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};

