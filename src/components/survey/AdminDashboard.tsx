import React, { useState, useEffect } from 'react';
import { BrandSurveyService } from '../../services/surveyService';
import { BrandSurveySubmission, Participant } from '../../types';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import {
  THESIS_METADATA,
  SURVEY_GROUPS,
  LIKERT_SCALE_OPTIONS,
  COMMON_LIKERT_QUESTIONS,
  GROUP_LIKERT_QUESTIONS,
  INTERVIEW_QUESTIONS,
} from '../../data/surveyData';
import { BarChart3, Users, FolderOpen, Headphones, X, RotateCcw, Play, CheckCircle2, ChevronRight, User, MessageSquare, Loader2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<BrandSurveySubmission[]>([]);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('All');
  const [selectedSubmission, setSelectedSubmission] = useState<BrandSurveySubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load submissions asynchronously
  const loadSubmissionsData = async () => {
    setIsLoading(true);
    const data = await BrandSurveyService.getSubmissions();
    setSubmissions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSubmissionsData();

    // Listen for local changes (handy for Local Storage mode synchronisation across tabs)
    const handleStorageChange = () => {
      loadSubmissionsData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleResetData = async () => {
    if (window.confirm('Cảnh báo! Bạn có chắc muốn khôi phục cơ sở dữ liệu về mặc định?')) {
      await BrandSurveyService.resetSubmissions();
      await loadSubmissionsData();
      setSelectedSubmission(null);
    }
  };

  // Statistics
  const totalParticipants = submissions.length;

  const getGroupCount = (groupCode: string) => {
    return submissions.filter((s) => s.participant.groupCode === groupCode).length;
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (selectedGroupFilter === 'All') return true;
    return s.participant.groupCode === selectedGroupFilter;
  });



  // LIKERT MATH CALCULATORS
  const getLikertPercentages = (questionId: string, allowedGroup?: string) => {
    // If allowedGroup is set, only count submissions from that group
    const relevantSubs = submissions.filter((s) => {
      if (allowedGroup && s.participant.groupCode !== allowedGroup) return false;
      return s.likertAnswers[questionId] !== undefined;
    });

    const totalCount = relevantSubs.length;
    
    // Count frequencies for values 1, 2, 3, 4, 5, and N/A (null)
    const counts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, 'na': 0 };
    relevantSubs.forEach((s) => {
      const val = s.likertAnswers[questionId];
      if (val === null) {
        counts['na'] += 1;
      } else if (val >= 1 && val <= 5) {
        counts[String(val)] += 1;
      }
    });

    // Compute percentages
    const percentages: Record<string, { count: number; percent: number }> = {};
    Object.keys(counts).forEach((key) => {
      const count = counts[key];
      percentages[key] = {
        count,
        percent: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      };
    });

    return { totalCount, percentages };
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold text-slate-450 uppercase tracking-widest">Đang tải dữ liệu đám mây...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-800 pb-16 animate-in fade-in duration-200">
      
      {/* Title Header Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-lg font-black tracking-tight">Trang quản trị & Thống kê khảo sát</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider leading-none">
              {THESIS_METADATA.websiteTitle}
            </p>
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border leading-none shrink-0 ${
              isSupabaseConfigured()
                ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-450 border-amber-500/20'
            }`}>
              {isSupabaseConfigured() ? 'Supabase Cloud' : 'Local Storage'}
            </span>
          </div>
        </div>

        <button
          onClick={handleResetData}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-red-650 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-sm transition-all active:scale-97 select-none shrink-0"
        >
          <RotateCcw className="h-4 w-4" />
          Reset dữ liệu
        </button>
      </div>

      {/* KPI Stats widgets grid */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {/* Total stats */}
        <div className="col-span-2 bg-white border border-slate-200 p-4.5 rounded-2xl shadow-xs flex items-center gap-3.5 border-l-4 border-l-slate-900">
          <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 shrink-0">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Tổng số bài làm</span>
            <span className="text-3xl font-black text-slate-950 font-mono leading-none block mt-1">{totalParticipants}</span>
          </div>
        </div>

        {/* Individual group count boxes */}
        {SURVEY_GROUPS.map((gp) => {
          const count = getGroupCount(gp.code);
          return (
            <div key={gp.code} className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex flex-col justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">{gp.code}</span>
              <span className="text-xl font-black text-slate-900 mt-2 font-mono">{count}</span>
            </div>
          );
        })}
      </div>

      {/* CHART SECTION: COMMON LIKERT CHART + 5 GROUP LIKERT CHARTS */}
      <div className="space-y-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Biểu đồ phân phối ý kiến Likert</h2>
        
        {/* 1. Common Likert charts block (1 Common Likert Chart) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="inline-flex h-3 w-3 rounded-full bg-indigo-600"></span>
            <h3 className="font-extrabold text-sm text-slate-950 uppercase tracking-wide">
              I. Báo cáo khảo sát chung (Mẫu chung cho 5 nhóm)
            </h3>
          </div>

          <div className="space-y-5">
            {COMMON_LIKERT_QUESTIONS.map((q) => {
              const { totalCount, percentages } = getLikertPercentages(q.id);
              return (
                <div key={q.id} className="space-y-2 border-b border-slate-100/70 pb-5 last:border-0 last:pb-0">
                  <p className="text-xs font-extrabold text-slate-800 leading-relaxed">
                    {q.id.toUpperCase()}: {q.text}
                  </p>
                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">
                    (Số mẫu đã đánh giá: {totalCount})
                  </span>

                  {/* Horizontal HTML Bar chart stack */}
                  <div className="space-y-1.5 pt-2">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === val)!;
                      const stats = percentages[String(val)] || { count: 0, percent: 0 };
                      return (
                        <div key={val} className="flex items-center gap-2 text-xs">
                          <span className="w-14 text-[10px] text-slate-500 font-bold shrink-0 text-right leading-none">
                            {opt.emoji} {opt.label}
                          </span>
                          <div className="flex-1 bg-slate-100 h-6 rounded-md overflow-hidden relative">
                            <div
                              className="bg-indigo-600/90 h-full transition-all duration-300"
                              style={{ width: `${stats.percent}%` }}
                            />
                            <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[9px] font-black text-slate-700 font-mono">
                              {stats.percent}%
                            </span>
                          </div>
                          <span className="w-8 text-[9px] font-bold text-slate-400 font-mono shrink-0">
                            ({stats.count} bài)
                          </span>
                        </div>
                      );
                    })}

                    {/* N/A representation removed */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Group Likert charts block (5 Group Likert Charts) */}
        <div className="grid grid-cols-1 gap-6">
          {SURVEY_GROUPS.map((gp) => {
            const gpQuestions = GROUP_LIKERT_QUESTIONS[gp.code] || [];
            return (
              <div key={gp.code} className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                    II. Khảo sát riêng nhóm: {gp.name} ({gp.code})
                  </h3>
                </div>

                <div className="space-y-6">
                  {gpQuestions.map((q) => {
                    const { totalCount, percentages } = getLikertPercentages(q.id, gp.code);
                    return (
                      <div key={q.id} className="space-y-2 border-b border-slate-50 pb-5 last:border-0 last:pb-0">
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">
                          {q.id.toUpperCase()}: {q.text}
                        </p>
                        <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">
                          (Số bài làm của nhóm: {totalCount})
                        </span>

                        <div className="space-y-1.5 pt-2">
                          {[1, 2, 3, 4, 5].map((val) => {
                            const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === val)!;
                            const stats = percentages[String(val)] || { count: 0, percent: 0 };
                            return (
                              <div key={val} className="flex items-center gap-2 text-xs">
                                <span className="w-14 text-[10px] text-slate-500 font-bold shrink-0 text-right leading-none">
                                  {opt.emoji} {opt.label}
                                </span>
                                <div className="flex-1 bg-slate-100 h-6 rounded-md overflow-hidden relative">
                                  <div
                                    className="bg-amber-500 h-full transition-all duration-300"
                                    style={{ width: `${stats.percent}%` }}
                                  />
                                  <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[9px] font-black text-slate-800 font-mono">
                                    {stats.percent}%
                                  </span>
                                </div>
                                <span className="w-8 text-[9px] font-bold text-slate-400 font-mono shrink-0">
                                  ({stats.count} bài)
                                </span>
                              </div>
                            );
                          })}

                          {/* N/A representation removed */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUBMISSIONS LIST VIEWER LOG */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-wide">
            <FolderOpen className="h-4.5 w-4.5 text-slate-400" />
            Nhật ký phản hồi ({filteredSubmissions.length} bài)
          </div>

          {/* Group Filter Toggles */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedGroupFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                selectedGroupFilter === 'All'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              Tất cả
            </button>
            {SURVEY_GROUPS.map((g) => (
              <button
                key={g.code}
                onClick={() => setSelectedGroupFilter(g.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                  selectedGroupFilter === g.code
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'
                }`}
              >
                {g.code}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List Grid */}
        {filteredSubmissions.length === 0 ? (
          <div className="py-10 text-center text-slate-400 italic text-sm">
            Chưa có phản hồi nào phù hợp.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSubmissions.map((sub, idx) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-indigo-750 bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 rounded text-[10px]">
                      {sub.participant.code}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {sub.participant.fullName || '(Không ghi tên)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">
                    Hình thức: {sub.participant.participationForm} · {sub.participant.titleUnit || 'Chưa khai báo chức vụ'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-slate-400 font-bold font-mono text-[10px] shrink-0">
                  <span>{sub.submittedAt.split(' ')[0]}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL VIEWER OVERLAY */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center border-b border-slate-800 shrink-0">
              <div>
                <h3 className="font-extrabold text-base leading-tight">Chi tiết bài khảo sát</h3>
                <p className="text-[10px] text-indigo-300 font-black uppercase mt-0.5">
                  Mã: {selectedSubmission.participant.code} · Ngày nộp: {selectedSubmission.submittedAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            {/* Modal Body content scrollable */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50 text-xs">
              
              {/* Profile Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 text-slate-700">
                <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-450" />
                  Thông tin người tham gia
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 leading-relaxed">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] block">Mã ứng viên:</span>
                    <span className="text-slate-900 font-extrabold">{selectedSubmission.participant.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] block">Tên nhóm:</span>
                    <span className="text-slate-900 font-extrabold">
                      {SURVEY_GROUPS.find((g) => g.code === selectedSubmission.participant.groupCode)?.name}
                    </span>
                  </div>
                  {selectedSubmission.participant.fullName && (
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] block">Họ và tên:</span>
                      <span className="text-slate-900 font-extrabold">{selectedSubmission.participant.fullName}</span>
                    </div>
                  )}
                  {selectedSubmission.participant.titleUnit && (
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] block">Chức vụ / Đơn vị:</span>
                      <span className="text-slate-900 font-extrabold">{selectedSubmission.participant.titleUnit}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] block">Đồng thuận ghi âm:</span>
                    <span className="text-slate-900 font-extrabold">
                      {selectedSubmission.participant.consentRecord === true ? 'Có đồng ý ghi âm' : selectedSubmission.participant.consentRecord === false ? 'Không đồng ý ghi âm' : 'Không áp dụng'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Common Likert answers */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 text-slate-700">
                <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">A. Khảo sát ý kiến chung</h4>
                <div className="space-y-3">
                  {COMMON_LIKERT_QUESTIONS.map((q) => {
                    const ans = selectedSubmission.likertAnswers[q.id];
                    const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === ans);
                    return (
                      <div key={q.id} className="space-y-0.5">
                        <p className="font-extrabold text-slate-800">{q.text}</p>
                        <p className="text-indigo-700 bg-indigo-50 border border-indigo-150 py-1.5 px-3 rounded-xl w-fit flex items-center gap-1 font-black">
                          {ans === null ? 'Không áp dụng / Khác' : `${opt?.emoji} ${opt?.label} (${ans}/5)`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group Likert answers */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 text-slate-700">
                <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  B. Khảo sát riêng nhóm {selectedSubmission.participant.groupCode}
                </h4>
                <div className="space-y-3">
                  {(GROUP_LIKERT_QUESTIONS[selectedSubmission.participant.groupCode] || []).map((q) => {
                    const ans = selectedSubmission.likertAnswers[q.id];
                    
                    if (q.type === 'likert') {
                      const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === ans);
                      return (
                        <div key={q.id} className="space-y-0.5">
                          <p className="font-extrabold text-slate-800">{q.text}</p>
                          <p className="text-indigo-700 bg-indigo-50 border border-indigo-150 py-1.5 px-3 rounded-xl w-fit flex items-center gap-1 font-black">
                            {opt?.emoji} {opt?.label} ({ans}/5)
                          </p>
                        </div>
                      );
                    } else if (q.type === 'checkbox') {
                      const list = (ans as string[]) || [];
                      const otherVal = selectedSubmission.likertAnswers[q.id + '_other'] as string;
                      return (
                        <div key={q.id} className="space-y-1">
                          <p className="font-extrabold text-slate-800">{q.text}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {list.map((item) => (
                              <span key={item} className="text-amber-800 bg-amber-50 border border-amber-250 py-1 px-2.5 rounded-lg font-extrabold text-[10px]">
                                {item === 'Khác' && otherVal ? `Khác: ${otherVal}` : item}
                              </span>
                            ))}
                            {list.length === 0 && (
                              <span className="text-slate-400 italic font-semibold">(Không chọn lựa chọn nào)</span>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={q.id} className="space-y-1">
                          <p className="font-extrabold text-slate-850">{q.text}</p>
                          <p className="text-slate-600 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl font-semibold italic">
                            {ans ? `"${ans}"` : '(Trống)'}
                          </p>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>

              {/* Interview response (if any) */}
              {selectedSubmission.participant.groupCode !== 'KG-ĐT' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 text-slate-700">
                  <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <MessageSquare className="h-4.5 w-4.5 text-indigo-600" />
                    C. Ý kiến đóng góp phỏng vấn sâu
                  </h4>
                  <div className="space-y-4">
                    {(INTERVIEW_QUESTIONS[selectedSubmission.participant.groupCode] || []).map((q) => {
                      const ans = selectedSubmission.interviewAnswers[q.id];
                      return (
                        <div key={q.id} className="space-y-1.5">
                          <p className="font-bold text-slate-800">{q.text}</p>
                          <div className="pl-3.5 border-l-2 border-slate-200 space-y-2">
                            <p className="text-slate-600 italic font-semibold leading-relaxed">
                              {ans?.text ? `"${ans.text}"` : '(Không có câu trả lời viết)'}
                            </p>
                            {ans?.audioUrl && (
                              <div className="flex items-center gap-2 pt-1 bg-slate-50 p-2 border border-slate-200 rounded-xl w-fit">
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                                  <Headphones className="h-3.5 w-3.5" /> Bản ghi âm:
                                </span>
                                <audio src={ans.audioUrl} controls className="h-7" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-200 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
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
