import React, { useState, useEffect } from 'react';
import { Survey, SurveyQuestion, QuestionType } from '../types';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Eye, Copy, Type, AlignLeft,
  CircleDot, CheckSquare, Star, ThumbsUp, Mic, Rocket, X, Check,
  AlertTriangle, Info, WifiOff, CheckCircle2, XCircle, FileText, Settings
} from 'lucide-react';
import { SurveyService } from '../services/surveyService';

interface SurveyCreatorProps {
  initialSurvey?: Survey;
  initialQuestions?: SurveyQuestion[];
  onSave: (survey: Survey, questions: SurveyQuestion[]) => void;
  onCancel: () => void;
}

type UILocalType = 'short' | 'long' | 'single' | 'multi' | 'rating' | 'yesno' | 'voice';

const TYPE_METADATA: { id: UILocalType; dbType: QuestionType; label: string; icon: typeof Type; color: string; bg: string }[] = [
  { id: 'short', dbType: 'Short Text', label: 'Trả lời ngắn', icon: Type, color: 'text-blue-700', bg: 'bg-blue-50' },
  { id: 'long', dbType: 'Long Text', label: 'Trả lời dài', icon: AlignLeft, color: 'text-purple-700', bg: 'bg-purple-50' },
  { id: 'single', dbType: 'Single Choice', label: 'Chọn 1 đáp án', icon: CircleDot, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { id: 'multi', dbType: 'Multiple Choice', label: 'Chọn nhiều đáp án', icon: CheckSquare, color: 'text-sky-700', bg: 'bg-sky-50' },
  { id: 'rating', dbType: 'Rating / Scale', label: 'Đánh giá sao', icon: Star, color: 'text-amber-700', bg: 'bg-amber-50' },
  { id: 'yesno', dbType: 'Yes / No', label: 'Có / Không', icon: ThumbsUp, color: 'text-rose-700', bg: 'bg-rose-50' },
  { id: 'voice', dbType: 'Voice Answer', label: 'Trả lời giọng nói', icon: Mic, color: 'text-red-700', bg: 'bg-red-50' },
];

const dbToUiType = (dbType: QuestionType): UILocalType => {
  const match = TYPE_METADATA.find((m) => m.dbType === dbType);
  return match ? match.id : 'short';
};

const uiToDbType = (uiType: UILocalType): QuestionType => {
  const match = TYPE_METADATA.find((m) => m.id === uiType);
  return match ? match.dbType : 'Short Text';
};

// Toast configurations
type ToastKind = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const TOAST_STYLE: Record<ToastKind, { icon: typeof CheckCircle2; text: string; bg: string; label: string }> = {
  success: { icon: CheckCircle2, text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Thành công' },
  error: { icon: XCircle, text: 'text-red-700', bg: 'bg-red-50', label: 'Lỗi' },
  warning: { icon: AlertTriangle, text: 'text-amber-700', bg: 'bg-amber-50', label: 'Cảnh báo' },
  info: { icon: Info, text: 'text-sky-700', bg: 'bg-sky-50', label: 'Thông tin' },
};

export const SurveyCreator: React.FC<SurveyCreatorProps> = ({
  initialSurvey,
  initialQuestions = [],
  onSave,
  onCancel,
}) => {
  // Survey Meta States
  const [survey, setSurvey] = useState<Survey>(
    initialSurvey || {
      id: `survey-${Date.now()}`,
      title: 'Khảo sát phỏng vấn mới',
      description: 'Mô tả chi tiết khảo sát của bạn...',
      status: 'Draft',
      createdAt: new Date().toLocaleString('vi-VN'),
      updatedAt: new Date().toLocaleString('vi-VN'),
    }
  );

  // Questions state
  const [questions, setQuestions] = useState<SurveyQuestion[]>(
    initialQuestions.sort((a, b) => a.order - b.order)
  );

  // UI Interactive States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSavedSnackbar, setIsSavedSnackbar] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load Network Status listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const pushToast = (kind: ToastKind, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const flashAutoSaved = () => {
    setIsSavedSnackbar(true);
    setTimeout(() => setIsSavedSnackbar(false), 1500);
  };

  // Re-ordering questions
  const moveQuestion = (id: string, dir: -1 | 1) => {
    const i = questions.findIndex((q) => q.id === id);
    const j = i + dir;
    if (j < 0 || j >= questions.length) return;
    
    const copy = [...questions];
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;

    // Reset order indices
    const updated = copy.map((q, idx) => ({ ...q, order: idx + 1 }));
    setQuestions(updated);
    flashAutoSaved();
  };

  // Add question
  const addQuestion = (uiType: UILocalType) => {
    const dbType = uiToDbType(uiType);
    const id = `q-${Date.now()}`;
    const newQuestion: SurveyQuestion = {
      id,
      surveyId: survey.id,
      type: dbType,
      title: 'Nhập nội dung câu hỏi...',
      description: '',
      required: true,
      options: (dbType === 'Single Choice' || dbType === 'Multiple Choice') ? ['Lựa chọn 1', 'Lựa chọn 2'] : undefined,
      order: questions.length + 1,
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setPicking(false);
    setEditingId(id);
    flashAutoSaved();
  };

  // Delete question
  const handleDeleteConfirm = () => {
    if (deleteId) {
      const filtered = questions.filter((q) => q.id !== deleteId);
      const reordered = filtered.map((q, idx) => ({ ...q, order: idx + 1 }));
      setQuestions(reordered);
      pushToast('success', 'Đã xóa câu hỏi khỏi khảo sát.');
      setDeleteId(null);
      flashAutoSaved();
    }
  };

  // Update specific question field
  const handleFieldChange = (id: string, field: keyof SurveyQuestion, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  // Options CRUD for Choice types
  const handleAddOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const opts = q.options ? [...q.options] : [];
          opts.push(`Lựa chọn ${opts.length + 1}`);
          return { ...q, options: opts };
        }
        return q;
      })
    );
    flashAutoSaved();
  };

  const handleDeleteOption = (questionId: string, index: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options) {
          return { ...q, options: q.options.filter((_, idx) => idx !== index) };
        }
        return q;
      })
    );
    flashAutoSaved();
  };

  const handleOptionTextChange = (questionId: string, index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options) {
          const opts = [...q.options];
          opts[index] = value;
          return { ...q, options: opts };
        }
        return q;
      })
    );
  };

  const handleSave = () => {
    if (!survey.title.trim()) {
      pushToast('error', 'Tiêu đề khảo sát không được để trống.');
      return;
    }

    const unfilled = questions.find((q) => !q.title.trim() || q.title === 'Nhập nội dung câu hỏi...');
    if (unfilled) {
      pushToast('warning', 'Vui lòng hoàn thành tiêu đề cho toàn bộ các câu hỏi.');
      setEditingId(unfilled.id);
      return;
    }

    onSave(survey, questions);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/#/survey/${survey.id}`;
    navigator.clipboard.writeText(link);
    pushToast('success', 'Đã sao chép liên kết khảo sát vào clipboard.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center text-slate-800">
      <div className="w-full max-w-md pb-28 relative">
        
        {/* Toast Stack */}
        <div className="fixed top-4 inset-x-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
          {toasts.map((t) => {
            const s = TOAST_STYLE[t.kind];
            const Icon = s.icon;
            return (
              <div
                key={t.id}
                className="w-full max-w-sm flex items-start gap-3 rounded-2xl bg-white border border-slate-200 shadow-lg p-4 pointer-events-auto"
              >
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${s.bg}`}>
                  <Icon className={`w-5 h-5 ${s.text}`} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-bold text-slate-900">{s.label}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{t.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                  className="w-9 h-9 shrink-0 flex items-center justify-center text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Auto-save snackbar */}
        {isSavedSnackbar && (
          <div className="fixed bottom-20 inset-x-0 z-40 flex justify-center px-4">
            <div className="flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Đã lưu tự động
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-650" />
              </div>
              <p className="text-xl font-bold text-center text-slate-900">Xóa câu hỏi này?</p>
              <p className="text-sm text-center text-slate-500 mt-2">Bạn không thể khôi phục lại câu hỏi sau khi xóa.</p>
              <div className="flex flex-col gap-2.5 mt-6">
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="min-h-12 w-full rounded-xl bg-red-650 text-white text-sm font-extrabold cursor-pointer"
                >
                  Xoá câu hỏi
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="min-h-12 w-full rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white cursor-pointer"
                >
                  Giữ lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header toolbar */}
        <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-xs px-4 pt-5 pb-3 flex justify-between items-center border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-lg font-black text-slate-900">Quản lý khảo sát</h1>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-slate-450 hover:text-slate-700 bg-slate-200/50 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
        </div>

        {/* Form Body content */}
        <div className="px-4 space-y-4">
          {/* Offline Banner */}
          {!isOnline && (
            <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-300 px-4 py-3">
              <WifiOff className="w-5 h-5 text-amber-700 shrink-0" />
              <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                Mất kết nối mạng — câu trả lời của bạn vẫn được lưu giữ an toàn trên máy.
              </p>
            </div>
          )}

          {/* Card Meta details */}
          <div className="rounded-3xl bg-white shadow-xs border border-slate-200 p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tên khảo sát</label>
              <input
                value={survey.title}
                onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                onBlur={flashAutoSaved}
                placeholder="Nhập tên cuộc khảo sát..."
                className="min-h-12 w-full rounded-2xl border border-slate-250 px-4 text-base font-extrabold text-slate-900 outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Mô tả chi tiết</label>
              <textarea
                value={survey.description}
                onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                onBlur={flashAutoSaved}
                rows={2}
                placeholder="Lời dẫn đầu giới thiệu khảo sát..."
                className="w-full rounded-2xl border border-slate-250 p-4 text-sm font-semibold text-slate-700 outline-none focus:border-slate-850 resize-none leading-relaxed"
              />
            </div>

            {/* Switch Published state */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-150">
              <div>
                <p className="font-extrabold text-slate-900 text-sm">
                  {survey.status === 'Published' ? 'Đang xuất bản' : 'Bản nháp'}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {survey.status === 'Published' ? 'Mọi người có thể điền trả lời' : 'Chỉ quản trị viên nhìn thấy'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newStatus = survey.status === 'Published' ? 'Draft' : 'Published';
                  setSurvey({ ...survey, status: newStatus });
                  pushToast(
                    newStatus === 'Published' ? 'success' : 'warning',
                    newStatus === 'Published' ? 'Khảo sát đã xuất bản công khai!' : 'Khảo sát hạ xuống bản nháp.'
                  );
                }}
                className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
                  survey.status === 'Published' ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                    survey.status === 'Published' ? 'left-7.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Copy / Preview toolbar */}
            <div className="flex gap-3 border-t border-slate-100 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="min-h-12 flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 font-extrabold text-xs text-slate-900 cursor-pointer"
              >
                <Eye className="w-4.5 h-4.5" /> Xem trước
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="min-h-12 flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 font-extrabold text-xs text-slate-900 cursor-pointer"
              >
                <Copy className="w-4.5 h-4.5" /> Sao chép link
              </button>
            </div>
          </div>

          {/* Questions list */}
          <div className="flex justify-between items-center px-1 pt-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Danh sách câu hỏi ({questions.length})
            </h2>
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm nhanh
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {questions.map((q, idx) => {
              const uitype = dbToUiType(q.type);
              const meta = TYPE_METADATA.find((m) => m.id === uitype)!;
              const Icon = meta.icon;
              const editing = editingId === q.id;

              return (
                <div key={q.id} className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
                  <div className="flex items-start gap-3.5 p-4 md:p-5">
                    {/* Visual icon badge */}
                    <div className={`w-11 h-11 shrink-0 rounded-2xl ${meta.bg} flex items-center justify-center`}>
                      <Icon className={`w-5.5 h-5.5 ${meta.color}`} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">
                        Câu {idx + 1} · {meta.label}
                      </p>

                      {editing ? (
                        <div className="space-y-3">
                          <input
                            autoFocus
                            value={q.title}
                            onChange={(e) => handleFieldChange(q.id, 'title', e.target.value)}
                            onBlur={() => {
                              setEditingId(null);
                              flashAutoSaved();
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                            className="w-full text-base font-extrabold text-slate-900 outline-none border-b-2 border-slate-900 pb-1"
                            placeholder="Nhập nội dung câu hỏi..."
                          />

                          {/* Extra configurations: helper text + required toggle */}
                          <div className="space-y-2 pt-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Gợi ý phụ / Helper Text</label>
                              <input
                                value={q.description || ''}
                                onChange={(e) => handleFieldChange(q.id, 'description', e.target.value)}
                                placeholder="Gợi ý câu trả lời..."
                                className="w-full border-b border-slate-200 text-xs py-1 focus:outline-none focus:border-slate-800 text-slate-500 font-semibold"
                              />
                            </div>

                            <div className="flex items-center gap-1.5 pt-1">
                              <input
                                type="checkbox"
                                id={`req-${q.id}`}
                                checked={q.required}
                                onChange={(e) => handleFieldChange(q.id, 'required', e.target.checked)}
                                className="h-4 w-4 border-slate-300 text-indigo-600 rounded"
                              />
                              <label htmlFor={`req-${q.id}`} className="text-[11px] font-bold text-slate-500 cursor-pointer select-none">
                                Bắt buộc người dùng trả lời
                              </label>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingId(q.id)}
                          className="text-left w-full text-base font-extrabold text-slate-850 hover:text-indigo-650 transition-colors leading-snug"
                        >
                          {q.title || <span className="text-slate-400 italic">Nhấp để đặt tiêu đề câu hỏi...</span>}
                          {q.required && <span className="text-red-500 ml-1">*</span>}
                        </button>
                      )}

                      {q.description && !editing && (
                        <p className="text-xs text-slate-400 font-medium">{q.description}</p>
                      )}

                      {/* Render Option list editor for choices types inside card */}
                      {(q.type === 'Single Choice' || q.type === 'Multiple Choice') && (
                        <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl mt-4 space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Danh sách các đáp án</span>
                            <button
                              type="button"
                              onClick={() => handleAddOption(q.id)}
                              className="text-[9px] font-black text-indigo-600 hover:underline flex items-center"
                            >
                              + Thêm đáp án
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {q.options?.map((opt, oIdx) => (
                              <div key={oIdx} className="flex gap-2 items-center">
                                <span className="text-xs text-slate-400 font-bold">{oIdx + 1}.</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleOptionTextChange(q.id, oIdx, e.target.value)}
                                  onBlur={flashAutoSaved}
                                  placeholder={`Tùy chọn ${oIdx + 1}`}
                                  className="flex-1 px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                  type="button"
                                  disabled={(q.options?.length || 0) <= 1}
                                  onClick={() => handleDeleteOption(q.id, oIdx)}
                                  className="text-slate-400 hover:text-red-650 p-1 disabled:opacity-30 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ordering arrows and delete bar */}
                  <div className="flex border-t border-slate-100 text-slate-700 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => moveQuestion(q.id, -1)}
                      disabled={idx === 0}
                      className="min-h-12 flex-1 flex items-center justify-center gap-1 text-xs font-extrabold hover:bg-slate-100 disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      <ChevronUp className="w-4 h-4 text-slate-400" /> Lên
                    </button>
                    <div className="w-px bg-slate-150" />
                    <button
                      type="button"
                      onClick={() => moveQuestion(q.id, 1)}
                      disabled={idx === questions.length - 1}
                      className="min-h-12 flex-1 flex items-center justify-center gap-1 text-xs font-extrabold hover:bg-slate-100 disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      <ChevronDown className="w-4 h-4 text-slate-400" /> Xuống
                    </button>
                    <div className="w-px bg-slate-150" />
                    <button
                      type="button"
                      onClick={() => setDeleteId(q.id)}
                      className="min-h-12 flex-1 flex items-center justify-center gap-1 text-xs font-black text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Xoá
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Question picker trigger */}
          {!picking ? (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="min-h-13 w-full mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-350 bg-white hover:bg-slate-50 font-bold text-sm text-slate-800 cursor-pointer"
            >
              <Plus className="w-5 h-5 text-slate-500" /> Thêm câu hỏi mới
            </button>
          ) : (
            <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-5 mt-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                  <Settings className="w-4.5 h-4.5 text-indigo-600" /> Chọn loại câu hỏi muốn thêm
                </p>
                <button
                  type="button"
                  onClick={() => setPicking(false)}
                  className="text-slate-450 hover:text-slate-650"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TYPE_METADATA.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => addQuestion(t.id)}
                      className="min-h-20 flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-250 py-3 text-center cursor-pointer transition-all select-none group"
                    >
                      <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon className={`w-4.5 h-4.5 ${t.color}`} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-950 transition-colors">
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer Bar */}
        <div className="fixed bottom-0 inset-x-0 z-30 flex justify-center px-4 pb-4 pt-3 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent pointer-events-none">
          <button
            type="button"
            onClick={handleSave}
            className="min-h-13 w-full max-w-md flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-base font-extrabold cursor-pointer shadow-md pointer-events-auto select-none"
          >
            <Rocket className="w-5 h-5" /> Lưu khảo sát
          </button>
        </div>

      </div>

      {/* Preview Dialog Modal Overlay */}
      {previewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-50 rounded-3xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-200 text-slate-700">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center border-b border-slate-800">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Eye className="h-4.5 w-4.5 text-indigo-400" />
                Xem trước giao diện
              </h3>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-sm">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
                <h1 className="text-lg font-black text-slate-900">{survey.title || 'Khảo sát chưa đặt tên'}</h1>
                <p className="text-slate-500 text-xs leading-relaxed">{survey.description || 'Mô tả chi tiết khảo sát...'}</p>
              </div>

              <div className="space-y-3">
                {questions.length === 0 ? (
                  <p className="text-center italic text-slate-400 py-4">Chưa có câu hỏi nào được tạo.</p>
                ) : (
                  questions.map((q, idx) => (
                    <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                      <p className="font-bold text-slate-850">
                        {idx + 1}. {q.title || 'Câu hỏi chưa đặt tên'}
                        {q.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      {q.description && <p className="text-slate-400 text-xs font-semibold">{q.description}</p>}

                      {q.type === 'Short Text' && (
                        <input type="text" disabled placeholder="Đáp án trả lời ngắn..." className="w-full border border-slate-200 px-3 py-2 rounded-lg bg-slate-50 text-xs" />
                      )}
                      {q.type === 'Long Text' && (
                        <textarea disabled rows={2} placeholder="Đáp án trả lời dài..." className="w-full border border-slate-200 px-3 py-2 rounded-lg bg-slate-50 text-xs resize-none" />
                      )}
                      {q.type === 'Yes / No' && (
                        <div className="flex gap-2">
                          <button type="button" disabled className="px-4 py-2 border border-slate-200 bg-slate-50 text-xs rounded-xl font-bold">Có</button>
                          <button type="button" disabled className="px-4 py-2 border border-slate-200 bg-slate-50 text-xs rounded-xl font-bold">Không</button>
                        </div>
                      )}
                      {q.type === 'Rating / Scale' && (
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <span key={n} className="h-8 w-8 rounded-full border border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center text-xs font-bold font-mono">{n}</span>
                          ))}
                        </div>
                      )}
                      {q.type === 'Single Choice' && (
                        <div className="space-y-1.5">
                          {q.options?.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                              <input type="radio" disabled className="h-4 w-4" />
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === 'Multiple Choice' && (
                        <div className="space-y-1.5">
                          {q.options?.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                              <input type="checkbox" disabled className="h-4 w-4" />
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === 'Voice Answer' && (
                        <div className="border border-dashed border-red-200 bg-red-50/40 py-2.5 px-4 rounded-xl text-center text-xs text-red-700 font-extrabold flex items-center justify-center gap-1.5">
                          <Mic className="h-4 w-4 shrink-0 text-red-650 animate-pulse" />
                          Người dùng ghi âm câu trả lời qua Micro.
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
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
