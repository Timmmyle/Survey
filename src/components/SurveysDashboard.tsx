import React, { useState } from 'react';
import { Survey, SurveyQuestion, SurveyResponse } from '../types';
import { SurveyService } from '../services/surveyService';
import { Plus, Edit3, Eye, Link, Trash2, Calendar, FileText, CheckCircle2, AlertCircle, Play, X, UserCheck, Share2, Clipboard, BarChart3, Settings } from 'lucide-react';

interface SurveysDashboardProps {
  surveys: Survey[];
  onEdit: (survey: Survey) => void;
  onPreview: (survey: Survey) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export const SurveysDashboard: React.FC<SurveysDashboardProps> = ({
  surveys,
  onEdit,
  onPreview,
  onCreate,
  onDelete,
}) => {
  const [selectedSurveyForResponses, setSelectedSurveyForResponses] = useState<Survey | null>(null);
  const [activeResponses, setActiveResponses] = useState<SurveyResponse[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<SurveyQuestion[]>([]);
  const [shareSurvey, setShareSurvey] = useState<Survey | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Calculate statistics
  const totalSurveys = surveys.length;
  const totalResponses = surveys.reduce((sum, s) => sum + SurveyService.getResponses(s.id).length, 0);
  const activeSurveys = surveys.filter((s) => s.status === 'Published').length;

  const handleOpenResponses = (surveyItem: Survey) => {
    const list = SurveyService.getResponses(surveyItem.id);
    const questions = SurveyService.getQuestions(surveyItem.id);
    setSelectedSurveyForResponses(surveyItem);
    setActiveResponses(list);
    setActiveQuestions(questions);
  };

  const handleCopyLink = (id: string) => {
    const shareableUrl = `${window.location.origin}/#/survey/${id}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-800">
      
      {/* Header bar */}
      <div className="flex justify-between items-center bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Khảo sát</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Danh sách quản trị viên</p>
          </div>
        </div>

        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 h-12 px-5 bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs rounded-2xl cursor-pointer shadow-sm transition-all active:scale-97 select-none shrink-0"
        >
          <Plus className="h-4 w-4" />
          Tạo khảo sát
        </button>
      </div>

      {/* Stats grids */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Khảo sát</span>
          <span className="text-3xl font-black text-slate-900 mt-1 font-mono">{totalSurveys}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs border-l-4 border-l-indigo-650 flex flex-col justify-center">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Phản hồi</span>
          <span className="text-3xl font-black text-indigo-700 mt-1 font-mono">{totalResponses}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs border-l-4 border-l-emerald-600 flex flex-col justify-center">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Đang chạy</span>
          <span className="text-3xl font-black text-emerald-650 mt-1 font-mono">{activeSurveys}</span>
        </div>
      </div>

      {/* Survey List Cards */}
      <div className="space-y-4">
        {surveys.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl py-12 text-center text-slate-400 italic text-sm">
            Chưa có cuộc khảo sát nào. Hãy tạo ngay khảo sát đầu tiên của bạn.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveys.map((surveyItem) => {
              const responsesCount = SurveyService.getResponses(surveyItem.id).length;
              const isPublished = surveyItem.status === 'Published';

              return (
                <div
                  key={surveyItem.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between gap-5 hover:border-slate-300 transition-all hover:shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wide">
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold font-mono">
                        <Calendar className="h-3.5 w-3.5" />
                        {surveyItem.createdAt.split(' ')[0]}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-lg leading-snug line-clamp-1">
                        {surveyItem.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {surveyItem.description || 'Không có mô tả chi tiết.'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
                    {/* Responses Count */}
                    <button
                      type="button"
                      onClick={() => handleOpenResponses(surveyItem)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      Phản hồi: <span className="font-black text-slate-800 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 ml-0.5">{responsesCount}</span>
                    </button>

                    {/* Action buttons list */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEdit(surveyItem)}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 cursor-pointer transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onPreview(surveyItem)}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 cursor-pointer transition-colors"
                        title="Xem trước"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {isPublished && (
                        <button
                          onClick={() => setShareSurvey(surveyItem)}
                          className="p-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-xl text-indigo-700 cursor-pointer transition-colors"
                          title="Chia sẻ link"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('Xóa khảo sát?\nHành động này không thể hoàn tác và sẽ xóa sạch mọi câu trả lời.')) {
                            onDelete(surveyItem.id);
                          }
                        }}
                        className="p-2 bg-slate-50 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-650 cursor-pointer transition-colors"
                        title="Xóa khảo sát"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Survey Modal Overlay */}
      {shareSurvey && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl overflow-hidden flex flex-col p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center text-slate-700">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-center gap-1.5">
              <Share2 className="h-4.5 w-4.5 text-indigo-650" />
              Chia sẻ khảo sát
            </h3>

            <div className="space-y-3 text-left">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Đường dẫn liên kết</span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl select-all break-all text-xs font-mono font-medium text-slate-600">
                {`${window.location.origin}/#/survey/${shareSurvey.id}`}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleCopyLink(shareSurvey.id)}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl cursor-pointer flex items-center justify-center gap-1.5 active:scale-97 select-none"
              >
                <Clipboard className="h-4.5 w-4.5" />
                {copiedText ? '✓ Đã sao chép link' : '📋 Sao chép link'}
              </button>

              <button
                type="button"
                onClick={() => setShareSurvey(null)}
                className="w-full h-12 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
              Người tham gia chỉ cần click vào link là có thể làm bài khảo sát ngay trên điện thoại di động mà không cần tạo tài khoản.
            </p>
          </div>
        </div>
      )}

      {/* Responses Modal Overlay */}
      {selectedSurveyForResponses && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base leading-tight">Phản hồi khảo sát</h3>
                <p className="text-xs text-indigo-300 font-semibold mt-0.5 line-clamp-1">{selectedSurveyForResponses.title}</p>
              </div>
              <button
                onClick={() => setSelectedSurveyForResponses(null)}
                className="text-slate-400 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50">
              {activeResponses.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic text-sm">
                  Chưa nhận được câu trả lời nào từ người tham gia.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeResponses.map((resp, idx) => (
                    <div
                      key={resp.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-slate-700"
                    >
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                        <span className="text-xs font-black text-indigo-800 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
                          Phản hồi #{idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">
                          {resp.submittedAt}
                        </span>
                      </div>

                      {/* Display questions and answers */}
                      <div className="space-y-3.5">
                        {activeQuestions.map((q, qIdx) => {
                          const ansVal = resp.answers[q.id];
                          const hasAnswered = ansVal !== undefined && ansVal !== null && ansVal !== '';
                          const isVoice = q.type === 'Voice Answer';

                          return (
                            <div key={q.id} className="text-xs space-y-1">
                              <p className="font-bold text-slate-800">
                                {qIdx + 1}. {q.title}
                              </p>

                              <div className="pl-3 border-l-2 border-slate-200 mt-1">
                                {isVoice ? (
                                  hasAnswered ? (
                                    typeof ansVal === 'string' && ansVal.startsWith('mock_audio') ? (
                                      // Render mockup audio bar requested: ▶ ━━━━━━━●━━━━ 00:18 / 00:42
                                      <div className="flex items-center gap-3 bg-slate-50 p-2 border border-slate-200 rounded-xl w-full max-w-sm mt-1">
                                        <Play className="h-4 w-4 text-indigo-650 shrink-0 fill-indigo-650" />
                                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full relative">
                                          <span className="absolute left-1/3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-indigo-600 border border-white rounded-full"></span>
                                        </div>
                                        <span className="text-[10px] text-slate-450 font-semibold font-mono shrink-0">00:18 / 00:42</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 pt-1">
                                        <audio src={ansVal} controls className="h-8 max-w-full" />
                                      </div>
                                    )
                                  ) : (
                                    <p className="text-slate-400 italic">Không trả lời</p>
                                  )
                                ) : hasAnswered ? (
                                  Array.isArray(ansVal) ? (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {ansVal.map((item, i) => (
                                        <span key={i} className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-[10px] font-extrabold text-slate-650">
                                          {item}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-slate-800 font-semibold whitespace-pre-wrap leading-relaxed">{String(ansVal)}</p>
                                  )
                                ) : (
                                  <p className="text-slate-400 italic">Không trả lời</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSurveyForResponses(null)}
                className="px-5 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
