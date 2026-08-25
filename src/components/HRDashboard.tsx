import React, { useState } from 'react';
import { EvaluationResult, Question, PositionQuestions } from '../types';
import { User, Briefcase, Mail, Phone, Calendar, Star, FileText, CheckCircle2, XCircle, Clock, Filter, Eye, Copy, Play, AlertTriangle, UserCheck } from 'lucide-react';

interface HRDashboardProps {
  evaluations: EvaluationResult[];
  questionsByPosition: PositionQuestions[];
  onUpdateStatus: (id: string, newStatus: 'Đã tuyển' | 'Không tuyển') => void;
  onBackToApp: () => void;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({
  evaluations,
  questionsByPosition,
  onUpdateStatus,
  onBackToApp,
}) => {
  const [filter, setFilter] = useState<'All' | 'Đang được xét duyệt' | 'Đã tuyển' | 'Không tuyển'>('All');
  const [selectedEval, setSelectedEval] = useState<EvaluationResult | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState<string | null>(null);

  // Filter candidates
  const filteredEvals = evaluations.filter((item) => {
    if (filter === 'All') return true;
    return item.status === filter;
  });

  const getAverageScore = (scores: Record<string, number>) => {
    const vals = Object.values(scores);
    if (vals.length === 0) return '0.0';
    return (vals.reduce((sum, score) => sum + score, 0) / vals.length).toFixed(1);
  };

  const handleRejectClick = (id: string) => {
    setShowRejectConfirm(id);
  };

  const handleRejectConfirm = () => {
    if (showRejectConfirm) {
      onUpdateStatus(showRejectConfirm, 'Không tuyển');
      // If modal detail view is open, update its state
      if (selectedEval && selectedEval.id === showRejectConfirm) {
        setSelectedEval({ ...selectedEval, status: 'Không tuyển' });
      }
      setShowRejectConfirm(null);
    }
  };

  const getStatusTag = (status: EvaluationResult['status']) => {
    switch (status) {
      case 'Đang được xét duyệt':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 rounded-full uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            Xét duyệt
          </span>
        );
      case 'Đã tuyển':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            Đã tuyển
          </span>
        );
      case 'Không tuyển':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black text-red-700 bg-red-50 border border-red-200 rounded-full uppercase tracking-wider">
            <XCircle className="h-3 w-3" />
            Từ chối
          </span>
        );
    }
  };

  const selectedQuestions = selectedEval
    ? questionsByPosition.find((q) => q.position === selectedEval.candidate.position)?.questions || []
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-800">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">HR Portal</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Duyệt hồ sơ & tuyển dụng</p>
          </div>
        </div>

        <button
          onClick={onBackToApp}
          className="h-12 px-5 bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs rounded-2xl cursor-pointer shadow-sm transition-all active:scale-97 select-none shrink-0"
        >
          Quay lại đánh giá
        </button>
      </div>

      {/* Reject confirmation modal */}
      {showRejectConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-650" />
            </div>
            <p className="text-xl font-bold text-center text-slate-900">Từ chối ứng viên này?</p>
            <p className="text-sm text-center text-slate-500 mt-2">Hành động này không thể hoàn tác.</p>
            
            <div className="flex flex-col gap-2.5 mt-6">
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="min-h-12 w-full rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-extrabold cursor-pointer"
              >
                Từ chối tuyển
              </button>
              <button
                type="button"
                onClick={() => setShowRejectConfirm(null)}
                className="min-h-12 w-full rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters header bar */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wide">
            <Filter className="h-4 w-4 text-slate-400" />
            Lọc ứng viên:
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'All', label: `Tất cả (${evaluations.length})` },
              { id: 'Đang được xét duyệt', label: `Xét duyệt (${evaluations.filter((e) => e.status === 'Đang được xét duyệt').length})` },
              { id: 'Đã tuyển', label: `Đã tuyển (${evaluations.filter((e) => e.status === 'Đã tuyển').length})` },
              { id: 'Không tuyển', label: `Từ chối (${evaluations.filter((e) => e.status === 'Không tuyển').length})` }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filter === opt.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Candidate cards list */}
      {filteredEvals.length === 0 ? (
        <div className="py-12 bg-white border border-slate-250 rounded-3xl text-center text-slate-400 italic text-sm">
          Không tìm thấy hồ sơ nào khớp bộ lọc.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvals.map((item) => {
            const avg = getAverageScore(item.scores);
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-350 transition-all hover:shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                        {item.candidate.firstName} {item.candidate.lastName}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {item.candidate.position}
                      </p>
                    </div>
                    {getStatusTag(item.status)}
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-slate-100 text-xs text-slate-500 font-semibold pt-3.5">
                    <span>Trạng thái phỏng vấn:</span>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-extrabold">
                      Interview completed
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1.5">
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1 font-mono">
                    Điểm: <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">{avg} / 5.0</span>
                  </span>

                  <button
                    onClick={() => setSelectedEval(item)}
                    className="h-11 px-4.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer active:scale-97 flex items-center gap-1 select-none shadow-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Xem phỏng vấn
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal Dialog */}
      {selectedEval && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div>
                <h2 className="font-black text-base">Hồ sơ tuyển dụng chi tiết</h2>
                <p className="text-[10px] text-indigo-300 font-bold uppercase mt-0.5">Hoàn tất ngày: {selectedEval.completedAt}</p>
              </div>
              <button
                onClick={() => setSelectedEval(null)}
                className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50 text-sm text-slate-700">
              
              {/* Profile Details Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2.5">
                  <User className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <span className="text-slate-450 font-semibold">Họ tên:</span>
                  <span className="font-extrabold text-slate-900">{selectedEval.candidate.firstName} {selectedEval.candidate.lastName}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <span className="text-slate-450 font-semibold">Vị trí ứng tuyển:</span>
                  <span className="font-bold text-slate-900">{selectedEval.candidate.position}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <span className="text-slate-450 font-semibold">Email:</span>
                  <span className="font-semibold text-slate-700">{selectedEval.candidate.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <span className="text-slate-450 font-semibold">Điện thoại:</span>
                  <span className="font-semibold text-slate-700">{selectedEval.candidate.phone}</span>
                </div>
              </div>

              {/* Likert Breakdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5">Bảng điểm đánh giá năng lực</h4>
                <div className="space-y-3">
                  {selectedQuestions.map((q, index) => {
                    const score = selectedEval.scores[q.id] || 0;
                    const emojis = ['😞', '😐', '🙂', '😊', '🤩'];
                    const emoji = score > 0 ? emojis[score - 1] : '❓';
                    const widthPercent = (score / 5) * 100;

                    return (
                      <div key={q.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{index + 1}. {q.text}</span>
                          <span className="font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-0.5">
                            {emoji} {score}/5
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-650 h-full rounded-full" style={{ width: `${widthPercent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recording & Transcript */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-xs">
                <h4 className="font-black text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <FileText className="h-4.5 w-4.5 text-indigo-600" />
                  Bản ghi phỏng vấn
                </h4>

                {selectedEval.audioUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold shrink-0">Ghi âm:</span>
                    <audio src={selectedEval.audioUrl} controls className="h-8 max-w-full" />
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl max-h-[140px] overflow-y-auto text-xs leading-relaxed whitespace-pre-wrap font-semibold text-slate-600">
                  {selectedEval.transcript || 'Không có dữ liệu transcript cuộc phỏng vấn.'}
                </div>
              </div>

            </div>

            {/* Decision panel inside Modal Footer */}
            <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Quyết định ứng viên</span>
              
              <div className="flex gap-2.5 w-full sm:w-auto">
                {selectedEval.status === 'Đang được xét duyệt' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRejectClick(selectedEval.id)}
                      className="flex-1 sm:flex-none h-12 px-6 bg-red-650 hover:bg-red-700 text-white text-xs font-black rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="h-4.5 w-4.5" />
                      Từ chối tuyển
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateStatus(selectedEval.id, 'Đã tuyển');
                        setSelectedEval({ ...selectedEval, status: 'Đã tuyển' });
                      }}
                      className="flex-1 sm:flex-none h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5" />
                      Đồng ý tuyển
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3.5">
                    <span className="text-xs font-bold text-slate-550">Kết quả duyệt:</span>
                    {getStatusTag(selectedEval.status)}
                    <button
                      type="button"
                      onClick={() => setSelectedEval(null)}
                      className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
