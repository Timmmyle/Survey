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
  getYesNoAnswer,
} from '../../data/surveyData';
import { BarChart3, Users, FolderOpen, Headphones, X, RotateCcw, Play, CheckCircle2, ChevronRight, User, MessageSquare, Loader2, Download } from 'lucide-react';

const cleanAudioText = (text: string): string => {
  if (!text) return '';
  return text.replace(/\[Ghi âm:\s*(.*?)\]/g, '$1').trim();
};

export const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<BrandSurveySubmission[]>([]);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('All');
  const [selectedSubmission, setSelectedSubmission] = useState<BrandSurveySubmission | null>(null);
  const [reportTabMode, setReportTabMode] = useState<'all' | 'likert' | 'yesno'>('all');
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

    const yesCount = counts['4'] + counts['5'];
    const noCount = counts['1'] + counts['2'];
    const neutralCount = counts['3'];
    const yesNoStats = {
      yes: { count: yesCount, percent: totalCount > 0 ? Math.round((yesCount / totalCount) * 100) : 0 },
      no: { count: noCount, percent: totalCount > 0 ? Math.round((noCount / totalCount) * 100) : 0 },
      neutral: { count: neutralCount, percent: totalCount > 0 ? Math.round((neutralCount / totalCount) * 100) : 0 },
    };

    return { totalCount, percentages, yesNoStats };
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

      {/* Supabase SQL Migration Notice */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-emerald-950 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-emerald-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            Hướng dẫn xem cột Database `yes_no_answers` trên Supabase:
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
            SQL Migration
          </span>
        </div>
        <p className="text-[11px] text-emerald-800 leading-relaxed">
          Nếu trong <strong>Supabase Table Editor</strong> bạn chưa thấy cột <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-emerald-950">yes_no_answers</code>, hãy vào menu <strong>SQL Editor</strong> trên Supabase và dán lệnh sau để thêm cột vào bảng:
        </p>
        <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto select-all flex items-center justify-between">
          <code>ALTER TABLE lan_su_rong_submissions ADD COLUMN IF NOT EXISTS yes_no_answers JSONB DEFAULT '&#123;&#125;'::jsonb;</code>
        </div>
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

      {/* UNIFIED DASHBOARD REPORT SECTION */}
      <div className="space-y-6">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5.5 h-5.5 text-indigo-600 shrink-0" />
            <div>
              <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                Dashboard Thống Kê Gộp 2 Cột Database (Yes/No & Likert 1-5)
              </h2>
              <p className="text-[10.5px] text-slate-500 font-bold">
                Tất cả câu hỏi khảo sát dùng 2 tùy chọn Yes/No · Tự động đồng bộ và gộp kết quả 2 cột vào cùng 1 khung Dashboard
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full shrink-0">
            ✅ Đồng bộ 2 Cột DB
          </span>
        </div>

        {/* 1. MASTER UNIFIED SUMMARY TABLE (GỘP CẢ 2 CỘT DATABASE SIDE-BY-SIDE) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
              <h3 className="font-extrabold text-xs text-slate-950 uppercase tracking-wide">
                Bảng Thống Kê Tổng Hợp Gộp 2 Cột Database (`yes_no_answers` & `likert_answers`)
              </h3>
            </div>
            <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase">
              Tất cả câu hỏi khảo sát
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-wider">
                  <th className="p-3 w-16">Mã CH</th>
                  <th className="p-3">Nội dung câu hỏi</th>
                  <th className="p-3 text-center w-20">Tổng mẫu</th>
                  <th className="p-3 text-center w-40 text-emerald-900 bg-emerald-50/80 border-l border-r border-emerald-200/60">
                    🟢 Cột DB `yes_no_answers`
                  </th>
                  <th className="p-3 text-center w-40 text-indigo-900 bg-indigo-50/80 border-r border-indigo-200/60">
                    5️⃣ Cột DB `likert_answers`
                  </th>
                  <th className="p-3 text-center w-28">Đồng thuận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                {COMMON_LIKERT_QUESTIONS.map((q) => {
                  const { totalCount, percentages, yesNoStats } = getLikertPercentages(q.id);
                  const score5 = percentages['5'] || { count: 0, percent: 0 };
                  const score1 = percentages['1'] || { count: 0, percent: 0 };

                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-black text-indigo-700">{q.id}</td>
                      <td className="p-3 max-w-xs leading-relaxed text-slate-800 font-bold">{q.text}</td>
                      <td className="p-3 text-center font-mono font-bold">{totalCount}</td>
                      
                      {/* Cột DB yes_no_answers */}
                      <td className="p-3 text-center bg-emerald-50/30 border-l border-r border-emerald-150/50">
                        <div className="flex items-center justify-center gap-2 font-mono">
                          <span className="text-emerald-700 font-black">Yes: {yesNoStats.yes.percent}%</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-rose-700 font-black">No: {yesNoStats.no.percent}%</span>
                        </div>
                        <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                          ({yesNoStats.yes.count} Yes / {yesNoStats.no.count} No)
                        </span>
                      </td>

                      {/* Cột DB likert_answers */}
                      <td className="p-3 text-center bg-indigo-50/30 border-r border-indigo-150/50">
                        <div className="flex items-center justify-center gap-2 font-mono">
                          <span className="text-indigo-700 font-black">Score 5: {score5.percent}%</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-amber-700 font-black">Score 1: {score1.percent}%</span>
                        </div>
                        <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                          ({score5.count} Điểm 5 / {score1.count} Điểm 1)
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase inline-block ${
                          yesNoStats.yes.percent >= 70
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : yesNoStats.no.percent >= 50
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {yesNoStats.yes.percent >= 70 ? 'Đồng thuận cao' : yesNoStats.no.percent >= 50 ? 'Bất đồng' : 'Cân bằng'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. UNIFIED QUESTION DASHBOARD CARDS (GỘP HAI LOẠI ĐÁP ÁN CỦA 1 CÂU VÀO 1 DASHBOARD CARD) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-indigo-600"></span>
              <h3 className="font-extrabold text-sm text-slate-950 uppercase tracking-wide">
                Chi Tiết Từng Câu Hỏi - Gộp Kết Quả 2 Cột Vào Cùng 1 Khung Dashboard (Part A)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              C1 - C7 Khảo sát chung
            </span>
          </div>

          <div className="space-y-6">
            {COMMON_LIKERT_QUESTIONS.map((q) => {
              const { totalCount, percentages, yesNoStats } = getLikertPercentages(q.id);
              const score5 = percentages['5'] || { count: 0, percent: 0 };
              const score1 = percentages['1'] || { count: 0, percent: 0 };

              return (
                <div key={q.id} className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4.5 space-y-3.5">
                  {/* Card Question Header */}
                  <div className="flex justify-between items-start gap-3 border-b border-slate-200/60 pb-2.5">
                    <div>
                      <span className="font-mono font-black text-indigo-750 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded text-[10px]">
                        {q.id}
                      </span>
                      <p className="text-xs font-extrabold text-slate-900 mt-1 leading-relaxed">
                        {q.text}
                      </p>
                    </div>
                    <span className="text-[9.5px] font-extrabold font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
                      {totalCount} mẫu
                    </span>
                  </div>

                  {/* GỘP 2 CỘT DATABASE VÀO 1 DASHBOARD GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
                    
                    {/* CỘT 1: yes_no_answers */}
                    <div className="bg-white border border-emerald-200/90 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                          🟢 Cột DB `yes_no_answers`
                        </span>
                        <span className="text-[9px] font-mono font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Nhị phân
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-emerald-50/60 rounded-lg p-2 text-center">
                          <span className="text-[9px] font-black text-emerald-800 uppercase block">😊 Yes (Đồng ý)</span>
                          <span className="text-base font-black text-emerald-950 font-mono mt-0.5 block">{yesNoStats.yes.percent}%</span>
                          <span className="text-[8.5px] font-bold text-emerald-600 font-mono">({yesNoStats.yes.count} mẫu)</span>
                        </div>
                        <div className="bg-rose-50/60 rounded-lg p-2 text-center">
                          <span className="text-[9px] font-black text-rose-800 uppercase block">😞 No (Không đồng ý)</span>
                          <span className="text-base font-black text-rose-950 font-mono mt-0.5 block">{yesNoStats.no.percent}%</span>
                          <span className="text-[8.5px] font-bold text-rose-600 font-mono">({yesNoStats.no.count} mẫu)</span>
                        </div>
                      </div>
                    </div>

                    {/* CỘT 2: likert_answers */}
                    <div className="bg-white border border-indigo-200/90 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                        <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                          5️⃣ Cột DB `likert_answers`
                        </span>
                        <span className="text-[9px] font-mono font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          Điểm 1 & 5
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-indigo-50/60 rounded-lg p-2 text-center">
                          <span className="text-[9px] font-black text-indigo-800 uppercase block">Score 5 (Yes)</span>
                          <span className="text-base font-black text-indigo-950 font-mono mt-0.5 block">{score5.percent}%</span>
                          <span className="text-[8.5px] font-bold text-indigo-600 font-mono">({score5.count} mẫu)</span>
                        </div>
                        <div className="bg-slate-100/70 rounded-lg p-2 text-center">
                          <span className="text-[9px] font-black text-slate-700 uppercase block">Score 1 (No)</span>
                          <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">{score1.percent}%</span>
                          <span className="text-[8.5px] font-bold text-slate-500 font-mono">({score1.count} mẫu)</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. GROUP LIKERT QUESTIONS UNIFIED DASHBOARD CARDS (Part B) */}
        <div className="space-y-6">
          {SURVEY_GROUPS.map((gp) => {
            const gpQuestions = GROUP_LIKERT_QUESTIONS[gp.code] || [];
            return (
              <div key={gp.code} className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                    Khảo Sát Riêng Nhóm: {gp.name} ({gp.code})
                  </h3>
                </div>

                <div className="space-y-5">
                  {gpQuestions.map((q) => {
                    const { totalCount, percentages, yesNoStats } = getLikertPercentages(q.id, gp.code);
                    const score5 = percentages['5'] || { count: 0, percent: 0 };
                    const score1 = percentages['1'] || { count: 0, percent: 0 };

                    return (
                      <div key={q.id} className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-start gap-3 border-b border-slate-200/60 pb-2">
                          <p className="text-xs font-bold text-slate-800 leading-relaxed">{q.text}</p>
                          <span className="text-[9.5px] font-extrabold font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
                            {totalCount} mẫu
                          </span>
                        </div>

                        {q.type === 'likert' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
                            {/* CỘT 1: yes_no_answers */}
                            <div className="bg-white border border-emerald-200/90 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                                  🟢 Cột DB `yes_no_answers`
                                </span>
                                <span className="text-[9px] font-mono font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  Nhị phân
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-emerald-50/60 rounded-lg p-2 text-center">
                                  <span className="text-[9px] font-black text-emerald-800 uppercase block">😊 Yes (Đồng ý)</span>
                                  <span className="text-base font-black text-emerald-950 font-mono mt-0.5 block">{yesNoStats.yes.percent}%</span>
                                  <span className="text-[8.5px] font-bold text-emerald-600 font-mono">({yesNoStats.yes.count} mẫu)</span>
                                </div>
                                <div className="bg-rose-50/60 rounded-lg p-2 text-center">
                                  <span className="text-[9px] font-black text-rose-800 uppercase block">😞 No (Không đồng ý)</span>
                                  <span className="text-base font-black text-rose-950 font-mono mt-0.5 block">{yesNoStats.no.percent}%</span>
                                  <span className="text-[8.5px] font-bold text-rose-600 font-mono">({yesNoStats.no.count} mẫu)</span>
                                </div>
                              </div>
                            </div>

                            {/* CỘT 2: likert_answers */}
                            <div className="bg-white border border-indigo-200/90 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                                <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                                  5️⃣ Cột DB `likert_answers`
                                </span>
                                <span className="text-[9px] font-mono font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  Điểm 1 & 5
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-indigo-50/60 rounded-lg p-2 text-center">
                                  <span className="text-[9px] font-black text-indigo-800 uppercase block">Score 5 (Yes)</span>
                                  <span className="text-base font-black text-indigo-950 font-mono mt-0.5 block">{score5.percent}%</span>
                                  <span className="text-[8.5px] font-bold text-indigo-600 font-mono">({score5.count} mẫu)</span>
                                </div>
                                <div className="bg-slate-100/70 rounded-lg p-2 text-center">
                                  <span className="text-[9px] font-black text-slate-700 uppercase block">Score 1 (No)</span>
                                  <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">{score1.percent}%</span>
                                  <span className="text-[8.5px] font-bold text-slate-500 font-mono">({score1.count} mẫu)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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
                <div className="space-y-1.5">
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
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <span className="opacity-75">Cột DB Yes/No:</span>
                      <span className="font-mono font-black">
                        {sub.yesNoAnswers && Object.keys(sub.yesNoAnswers).length > 0
                          ? `✅ yes_no_answers (${Object.keys(sub.yesNoAnswers).length} đáp án)`
                          : '🟢 yes_no_answers (Đồng bộ)'}
                      </span>
                    </span>
                    <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <span className="opacity-75">Cột DB Likert:</span>
                      <span className="font-mono font-black">✅ likert_answers</span>
                    </span>
                  </div>
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
                  {selectedSubmission.participant.consentCamera && (
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] block">Đồng thuận camera:</span>
                      <span className="text-slate-900 font-extrabold">
                        {selectedSubmission.participant.consentCamera}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Common Likert answers */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 text-slate-700">
                <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">A. Khảo sát ý kiến chung</h4>
                <div className="space-y-3">
                  {COMMON_LIKERT_QUESTIONS.map((q) => {
                    const ans = selectedSubmission.likertAnswers[q.id];
                    const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === ans);
                    const yn = getYesNoAnswer(ans, 'vi');
                    return (
                      <div key={q.id} className="space-y-1">
                        <p className="font-extrabold text-slate-800">{q.text}</p>
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {/* Cột Data Likert */}
                          <span className="text-indigo-800 bg-indigo-50 border border-indigo-200 py-1 px-3 rounded-xl font-extrabold text-[11px] flex items-center gap-1">
                            <span className="text-[9px] font-black uppercase text-indigo-400">Data Likert:</span>
                            {ans === null || ans === undefined ? 'Không áp dụng' : `${opt?.emoji} ${opt?.label} (${ans}/5)`}
                          </span>

                          {/* Cột Đáp án Yes/No */}
                          {ans !== null && ans !== undefined && (
                            <span className={`py-1 px-3 rounded-xl font-extrabold text-[11px] flex items-center gap-1 border ${
                              yn.code === 'yes'
                                ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                : yn.code === 'no'
                                ? 'text-rose-800 bg-rose-50 border-rose-200'
                                : 'text-slate-700 bg-slate-100 border-slate-200'
                            }`}>
                              <span className="text-[9px] font-black uppercase opacity-60">Đáp án Yes/No:</span>
                              {yn.code === 'yes' ? '✅ Đồng ý (Yes)' : yn.code === 'no' ? '❌ Không đồng ý (No)' : '⚪ Trung lập (Neutral)'}
                            </span>
                          )}
                        </div>
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
                      const yn = getYesNoAnswer(ans, 'vi');
                      return (
                        <div key={q.id} className="space-y-1">
                          <p className="font-extrabold text-slate-800">{q.text}</p>
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {/* Cột Data Likert */}
                            <span className="text-indigo-800 bg-indigo-50 border border-indigo-200 py-1 px-3 rounded-xl font-extrabold text-[11px] flex items-center gap-1">
                              <span className="text-[9px] font-black uppercase text-indigo-400">Data Likert:</span>
                              {ans === null || ans === undefined ? 'Không áp dụng' : `${opt?.emoji} ${opt?.label} (${ans}/5)`}
                            </span>

                            {/* Cột Đáp án Yes/No */}
                            {ans !== null && ans !== undefined && (
                              <span className={`py-1 px-3 rounded-xl font-extrabold text-[11px] flex items-center gap-1 border ${
                                yn.code === 'yes'
                                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                  : yn.code === 'no'
                                  ? 'text-rose-800 bg-rose-50 border-rose-200'
                                  : 'text-slate-700 bg-slate-100 border-slate-200'
                              }`}>
                                <span className="text-[9px] font-black uppercase opacity-60">Đáp án Yes/No:</span>
                                {yn.code === 'yes' ? '✅ Đồng ý (Yes)' : yn.code === 'no' ? '❌ Không đồng ý (No)' : '⚪ Trung lập (Neutral)'}
                              </span>
                            )}
                          </div>
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
                                {item === 'Khác' && otherVal ? `Ý kiến khác: ${otherVal}` : item}
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
                             {ans?.text ? (
                               <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-1 space-y-1 w-fit max-w-xl">
                                 <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">
                                   [Chuyển file ghi âm/ ghi hình thành text]
                                 </span>
                                 <p className="text-xs text-slate-750 font-semibold leading-relaxed">
                                   {cleanAudioText(ans.text)}
                                 </p>
                               </div>
                             ) : (
                               <p className="text-slate-500 italic text-xs leading-relaxed">
                                 (Không có câu trả lời viết)
                               </p>
                             )}
                            {ans?.audioUrl && (
                              <div className="flex flex-col gap-2 pt-1 bg-slate-50 p-2.5 border border-slate-200 rounded-xl w-fit">
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                                  {ans.audioUrl.toLowerCase().includes('.webm') || ans.audioUrl.toLowerCase().includes('.mp4') || ans.audioUrl.startsWith('blob:') ? (
                                    <>📹 Bản ghi hình phỏng vấn:</>
                                  ) : (
                                    <><Headphones className="h-3.5 w-3.5" /> Bản ghi âm:</>
                                  )}
                                </span>
                                {ans.audioUrl.toLowerCase().includes('.webm') || ans.audioUrl.toLowerCase().includes('.mp4') || ans.audioUrl.startsWith('blob:') ? (
                                  <div className="flex flex-col gap-1.5">
                                    <video src={ans.audioUrl} controls playsInline className="h-32 rounded-lg bg-black" />
                                    <a
                                      href={ans.audioUrl}
                                      download={`interview_${selectedSubmission.participant.code}_${q.id}.webm`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md w-fit transition-all border border-indigo-150 cursor-pointer"
                                    >
                                      <Download className="h-3 w-3" /> Tải video về
                                    </a>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-1.5">
                                    <audio src={ans.audioUrl} controls className="h-7" />
                                    <a
                                      href={ans.audioUrl}
                                      download={`interview_${selectedSubmission.participant.code}_${q.id}.wav`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md w-fit transition-all border border-indigo-150 cursor-pointer"
                                    >
                                      <Download className="h-3 w-3" /> Tải ghi âm về
                                    </a>
                                  </div>
                                )}
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
