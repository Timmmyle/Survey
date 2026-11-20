import React, { useState, useEffect } from 'react';
import { BrandSurveyService } from '../../services/surveyService';
import { BrandSurveyV2Service, V2Submission } from '../../services/surveyServiceV2';
import { BrandSurveySubmission } from '../../types';
import { isSupabaseConfigured, isSupabaseV2Configured } from '../../services/supabaseClient';
import { V2_PHIEU_CONFIGS } from '../../data/surveyData_v2';
import { SURVEY_GROUPS } from '../../data/surveyData';
import {
  BarChart3, Users, Database, Image as ImageIcon,
  RotateCcw, ChevronRight, X, Loader2, Download, Eye,
  Layers, CheckCircle2, AlertTriangle, MessageSquare
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { ImageUploadPanel } from '../admin/ImageUploadPanel';

export const AdminDashboardV2: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'v1' | 'v2' | 'images' | 'compare'>('v2');
  const [v1Subs, setV1Subs] = useState<BrandSurveySubmission[]>([]);
  const [v2Subs, setV2Subs] = useState<V2Submission[]>([]);
  const [selectedV2Sub, setSelectedV2Sub] = useState<V2Submission | null>(null);
  const [selectedV2GroupFilter, setSelectedV2GroupFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(false);
    try {
      const [v1, v2] = await Promise.all([
        BrandSurveyService.getSubmissions(),
        BrandSurveyV2Service.getSubmissions(),
      ]);
      setV1Subs(v1);
      setV2Subs(v2);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleResetV2 = () => {
    if (window.confirm('Cảnh báo! Bạn có chắc muốn xóa tất cả bài nộp Vòng 2 trên LocalStorage?')) {
      BrandSurveyV2Service.resetLocalSubmissions();
      loadData();
      setSelectedV2Sub(null);
    }
  };

  const filteredV2Subs = v2Subs.filter(s => {
    if (selectedV2GroupFilter === 'All') return true;
    return s.groupCode === selectedV2GroupFilter;
  });

  const getSemanticAvg = (questionId: string, groupCode?: string): { avg: string | null; count: number } => {
    const relevant = v2Subs.filter(s => {
      if (groupCode && s.groupCode !== groupCode) return false;
      const ans = s.semanticAnswers[questionId];
      return ans && ans.value !== null && ans.value !== undefined;
    });
    if (relevant.length === 0) return { avg: null, count: 0 };
    const sum = relevant.reduce((acc, s) => acc + (s.semanticAnswers[questionId].value || 0), 0);
    return { avg: (sum / relevant.length).toFixed(2), count: relevant.length };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-800 pb-20 animate-in fade-in duration-200">
      
      {/* Top Banner & Multi-DB Status Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-white shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shrink-0">
                <Database className="w-4.5 h-4.5" />
              </div>
              <h1 className="text-lg font-black tracking-tight">Hệ Thống Quản Trị Khảo Sát Đa Database</h1>
            </div>
            <p className="text-xs text-slate-400 font-semibold">
              Đề án Thạc sĩ Mỹ thuật ứng dụng · Liên đoàn Lân Sư Rồng Việt Nam
            </p>
          </div>

          {/* Database Health Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-semibold">
              <span className="text-slate-400">DB1 (Vòng 1):</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isSupabaseConfigured() ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {isSupabaseConfigured() ? 'Supabase' : 'Local'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-semibold">
              <span className="text-slate-400">DB2 (Vòng 2):</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isSupabaseV2Configured() ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseV2Configured() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {isSupabaseV2Configured() ? 'Supabase' : 'Local'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('v2')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'v2'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Vòng 2 — Kiểm chứng ({v2Subs.length})
          </button>

          <button
            onClick={() => setActiveTab('v1')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'v1'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Vòng 1 — Khảo sát ({v1Subs.length})
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'images'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Quản lý hình ảnh
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'compare'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            So sánh 2 Vòng
          </button>
        </div>
      </div>

      {/* TAB 1: VÒNG 1 (EMBEDDED) */}
      {activeTab === 'v1' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <span>Dữ liệu này được đọc trực tiếp từ Database Vòng 1 (Khảo sát nhu cầu ban đầu).</span>
            <span className="font-mono font-bold bg-indigo-100 px-2 py-0.5 rounded text-[10px]">
              {v1Subs.length} phiếu ghi nhận
            </span>
          </div>
          <AdminDashboard />
        </div>
      )}

      {/* TAB 2: VÒNG 2 (KIỂM CHỨNG) */}
      {activeTab === 'v2' && (
        <div className="space-y-6">
          {!isSupabaseV2Configured() && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-black">Database Supabase V2 chưa được kết nối</p>
                <p className="text-amber-800 font-medium">
                  Hệ thống đang lưu trữ bài nộp Vòng 2 trên <code className="bg-amber-100 px-1 py-0.5 rounded font-bold font-mono">LocalStorage</code>. Để kích hoạt Supabase V2, hãy điền <code className="bg-amber-100 px-1 py-0.5 rounded font-bold font-mono">VITE_SUPABASE_V2_URL</code> và <code className="bg-amber-100 px-1 py-0.5 rounded font-bold font-mono">VITE_SUPABASE_V2_ANON_KEY</code> vào file <code className="bg-amber-100 px-1 py-0.5 rounded font-bold font-mono">.env</code>.
                </p>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="col-span-2 bg-white border border-slate-200 p-4.5 rounded-2xl shadow-xs flex items-center gap-3.5 border-l-4 border-l-amber-500">
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700 shrink-0">
                <Users className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">
                  Tổng bài Vòng 2
                </span>
                <span className="text-3xl font-black text-slate-950 font-mono leading-none block mt-1">
                  {v2Subs.length}
                </span>
              </div>
            </div>

            {SURVEY_GROUPS.map(gp => {
              const count = v2Subs.filter(s => s.groupCode === gp.code).length;
              return (
                <div key={gp.code} className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex flex-col justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">{gp.code}</span>
                  <span className="text-xl font-black text-slate-900 mt-2 font-mono">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Semantic Scores Summary Per Phieu */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h2 className="font-extrabold text-sm text-slate-950 uppercase tracking-wide">
                  Điểm Đánh Giá Thang Đo 1-5 (Semantic Differential)
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                Thang 1 (Cực thấp) ➔ 5 (Cực cao)
              </span>
            </div>

            <div className="space-y-6">
              {V2_PHIEU_CONFIGS.map(phieu => {
                const subsInGroup = v2Subs.filter(s => s.groupCode === phieu.groupCode);
                return (
                  <div key={phieu.phieuId} className="border border-slate-150 rounded-2xl p-4.5 space-y-4 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                          {phieu.phieuId} · {phieu.groupCode}
                        </span>
                        <h3 className="font-extrabold text-xs text-slate-900 mt-1">{phieu.name}</h3>
                      </div>
                      <span className="text-[10px] font-bold font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-xl">
                        {subsInGroup.length} bài nộp
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {phieu.questions.filter(q => q.type === 'semantic').map(q => {
                        const { avg, count } = getSemanticAvg(q.id, phieu.groupCode);
                        const avgNum = avg ? parseFloat(avg) : 0;
                        const percent = (avgNum / 5) * 100;
                        return (
                          <div key={q.id} className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-start text-xs gap-3">
                              <p className="font-bold text-slate-800 leading-snug">{q.text}</p>
                              <div className="text-right shrink-0">
                                <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md ${
                                  avgNum >= 4 ? 'bg-emerald-100 text-emerald-800' : avgNum >= 3 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {avg ? `${avg} / 5` : 'N/A'}
                                </span>
                                <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                                  ({count} đánh giá)
                                </span>
                              </div>
                            </div>
                            
                            {/* Bar Visualizer */}
                            <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-400">
                              <span className="text-slate-500 font-semibold">{q.lowLabel || '1'}</span>
                              <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    avgNum >= 4 ? 'bg-emerald-500' : avgNum >= 3 ? 'bg-amber-500' : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-slate-500 font-semibold">{q.highLabel || '5'}</span>
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

          {/* Submissions List */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wide">
                <span>Nhật ký phản hồi Vòng 2 ({filteredV2Subs.length} bài)</span>
              </div>

              {/* Group Filters */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedV2GroupFilter('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                    selectedV2GroupFilter === 'All' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tất cả
                </button>
                {SURVEY_GROUPS.map(g => (
                  <button
                    key={g.code}
                    onClick={() => setSelectedV2GroupFilter(g.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                      selectedV2GroupFilter === g.code ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {g.code}
                  </button>
                ))}
              </div>
            </div>

            {filteredV2Subs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic text-xs">
                Chưa có bài phản hồi Vòng 2 nào phù hợp.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredV2Subs.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedV2Sub(sub)}
                    className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded text-[10px]">
                          {sub.participantCode}
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {sub.fullName || '(Ẩn danh)'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          · {sub.phieuId}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        {sub.titleUnit || 'Chưa cung cấp chức vụ'} · {sub.yearsExp || 'N/A kinh nghiệm'}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                          {Object.keys(sub.semanticAnswers || {}).length} câu đánh giá
                        </span>
                        {Object.keys(sub.interviewAnswers || {}).length > 0 && (
                          <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                            Phỏng vấn ngắn
                          </span>
                        )}
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
        </div>
      )}

      {/* TAB 3: QUẢN LÝ HÌNH ẢNH */}
      {activeTab === 'images' && (
        <div className="space-y-4">
          <ImageUploadPanel />
        </div>
      )}

      {/* TAB 4: SO SÁNH TỔNG HỢP */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Đối Sánh Khảo Sát Giữa 2 Vòng Nghiên Cứu
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Vòng 1 (Khảo sát nhu cầu) vs Vòng 2 (Kiểm chứng bộ nhận diện đề xuất)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vòng 1 Summary */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-xs text-indigo-900 uppercase">Vòng 1: Khảo sát nhu cầu</span>
                  <span className="font-mono font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full text-xs">
                    {v1Subs.length} bài
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {SURVEY_GROUPS.map(g => {
                    const c = v1Subs.filter(s => s.participant.groupCode === g.code).length;
                    return (
                      <div key={g.code} className="flex justify-between font-semibold text-slate-700">
                        <span>{g.code} - {g.name}</span>
                        <span className="font-mono font-bold text-slate-900">{c}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vòng 2 Summary */}
              <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                  <span className="font-extrabold text-xs text-amber-900 uppercase">Vòng 2: Kiểm chứng đề xuất</span>
                  <span className="font-mono font-black text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full text-xs">
                    {v2Subs.length} bài
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {SURVEY_GROUPS.map(g => {
                    const c = v2Subs.filter(s => s.groupCode === g.code).length;
                    return (
                      <div key={g.code} className="flex justify-between font-semibold text-slate-700">
                        <span>{g.code} - {g.name}</span>
                        <span className="font-mono font-bold text-slate-900">{c}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION DETAIL MODAL (V2) */}
      {selectedV2Sub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center border-b border-slate-800 shrink-0">
              <div>
                <h3 className="font-extrabold text-base leading-tight">Chi tiết bài đánh giá Vòng 2</h3>
                <p className="text-[10px] text-amber-400 font-mono font-black uppercase mt-0.5">
                  Mã: {selectedV2Sub.participantCode} · Nhóm: {selectedV2Sub.groupCode} · {selectedV2Sub.submittedAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedV2Sub(null)}
                className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50 text-xs">
              {/* Info Block */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2">Thông tin người đánh giá</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700 leading-relaxed font-semibold">
                  <div><span className="text-slate-400 text-[10px] uppercase font-bold block">Họ tên:</span> {selectedV2Sub.fullName || '(Ẩn danh)'}</div>
                  <div><span className="text-slate-400 text-[10px] uppercase font-bold block">Chức vụ / Học hàm:</span> {selectedV2Sub.titleUnit || 'N/A'}</div>
                  <div><span className="text-slate-400 text-[10px] uppercase font-bold block">Chuyên môn:</span> {selectedV2Sub.speciality || 'N/A'}</div>
                  <div><span className="text-slate-400 text-[10px] uppercase font-bold block">Kinh nghiệm:</span> {selectedV2Sub.yearsExp || 'N/A'}</div>
                </div>
              </div>

              {/* Semantic Answers */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2">Đánh giá tiêu chí</h4>
                <div className="space-y-3">
                  {Object.entries(selectedV2Sub.semanticAnswers).map(([qId, ans]) => (
                    <div key={qId} className="space-y-1 border-b border-slate-50 pb-2.5 last:border-0">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                          {qId}
                        </span>
                        <span className="font-black text-slate-900">
                          {ans.value === null ? 'Không đủ cơ sở' : `${ans.value} / 5`}
                        </span>
                      </div>
                      {ans.note && (
                        <p className="text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-150">
                          &ldquo;{ans.note}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Open Answers */}
              {Object.keys(selectedV2Sub.openAnswers || {}).length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2">Câu hỏi mở</h4>
                  {Object.entries(selectedV2Sub.openAnswers).map(([k, text]) => (
                    <div key={k} className="space-y-1">
                      <p className="text-slate-700 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Interview Answers */}
              {Object.keys(selectedV2Sub.interviewAnswers || {}).length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2">Phỏng vấn ngắn</h4>
                  {Object.entries(selectedV2Sub.interviewAnswers).map(([qId, ans]) => (
                    <div key={qId} className="space-y-2 border-b border-slate-100 pb-3 last:border-0">
                      <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                        {qId}
                      </span>
                      {ans.text && (
                        <p className="text-slate-700 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {ans.text}
                        </p>
                      )}
                      {ans.audioUrl && (
                        <audio src={ans.audioUrl} controls className="h-8 w-full" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
