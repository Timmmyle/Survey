import React, { useState, useEffect, useRef } from 'react';
import { BrandSurveyV2Service, V2Submission, V2SemanticAnswer } from '../../services/surveyServiceV2';
import { V2PhieuConfig, V2Question, V2_PHIEU_CONFIGS, V2_THESIS_METADATA, getV2PhieuByGroup } from '../../data/surveyData_v2';
import { isSupabaseV2Configured } from '../../services/supabaseClient';
import { VoiceAnswerConversational } from '../conversational/VoiceAnswerConversational';
import { ChevronLeft, ShieldCheck, Eye, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface Props {
  initialGroupCode?: string; // from URL param ?group=CG-MT
  onBackToAdmin?: () => void;
}

type FlowStep = 'welcome' | 'info' | 'consent' | 'image-viewer' | 'questions' | 'open' | 'interview' | 'success';

// ============================================================
// HELPERS
// ============================================================

const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
};

const makeProgressBar = (current: number, total: number, width = 20): string => {
  if (total === 0) return '';
  const filled = Math.round((current / total) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
};

const generateParticipantCode = (groupCode: string, seq: number): string =>
  `${groupCode}-V2-${seq}`;

// ============================================================
// COMPONENT
// ============================================================

export const BrandSurveyV2Respondent: React.FC<Props> = ({ initialGroupCode, onBackToAdmin }) => {
  // ---- Flow ----
  const [step, setStep] = useState<FlowStep>('welcome');

  // ---- Group & Config ----
  const [selectedGroup, setSelectedGroup] = useState<string>(initialGroupCode || '');
  const [phieuConfig, setPhieuConfig] = useState<V2PhieuConfig | null>(null);

  // ---- Participant code ----
  const [participantCode, setParticipantCode] = useState<string>('');

  // ---- Part A Info ----
  const [fullName, setFullName] = useState<string>('');
  const [titleUnit, setTitleUnit] = useState<string>('');
  const [speciality, setSpeciality] = useState<string>('');
  const [yearsExp, setYearsExp] = useState<string>('');
  const [hasParticipatedBefore, setHasParticipatedBefore] = useState<boolean | null>(null);
  const [independenceConfirmed, setIndependenceConfirmed] = useState<boolean>(false);

  // ---- Consent ----
  const [consentAgreed, setConsentAgreed] = useState<boolean>(false);
  const [consentData, setConsentData] = useState<boolean>(false);
  const [consentRecord, setConsentRecord] = useState<boolean>(false);

  // ---- Questions ----
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [semanticAnswers, setSemanticAnswers] = useState<Record<string, V2SemanticAnswer>>({});
  const [recognitionAnswers, setRecognitionAnswers] = useState<Record<string, string>>({});

  // ---- Open ----
  const [openAnswer, setOpenAnswer] = useState<string>('');

  // ---- Interview ----
  const [interviewIndex, setInterviewIndex] = useState<number>(0);
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, { text: string; audioUrl: string | null }>>({});

  // ---- UI state ----
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // ---- Misc ----
  const lang: 'vi' = 'vi';
  const topRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // EFFECTS
  // ============================================================

  // Read URL param ?group=... on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get('group');
    if (g) setSelectedGroup(g);
  }, []);

  // Sync phieuConfig when selectedGroup changes
  useEffect(() => {
    if (selectedGroup) {
      const cfg = getV2PhieuByGroup(selectedGroup);
      setPhieuConfig(cfg || null);
    } else {
      setPhieuConfig(null);
    }
  }, [selectedGroup]);

  // Prefetch image URLs when phieuConfig changes
  useEffect(() => {
    if (!phieuConfig) return;
    const allImageNames = new Set<string>();
    phieuConfig.questions.forEach(q => (q.images || []).forEach(i => allImageNames.add(i)));
    if (phieuConfig.allImagesForViewer) phieuConfig.allImagesForViewer.forEach(i => allImageNames.add(i));
    const urls: Record<string, string> = {};
    allImageNames.forEach(name => {
      urls[name] = BrandSurveyV2Service.getImageUrl(name);
    });
    setImageUrls(urls);
  }, [phieuConfig]);

  // ============================================================
  // NAVIGATION HELPERS
  // ============================================================

  const goToStep = (s: FlowStep) => {
    setStep(s);
    setValidationError(null);
    scrollToTop();
  };

  // ============================================================
  // WELCOME → INFO
  // ============================================================

  const handleWelcomeNext = async () => {
    if (!selectedGroup) {
      setValidationError('Vui lòng chọn phiếu khảo sát của bạn.');
      return;
    }
    const cfg = getV2PhieuByGroup(selectedGroup);
    if (!cfg) {
      setValidationError('Nhóm không hợp lệ. Vui lòng chọn lại.');
      return;
    }
    setPhieuConfig(cfg);
    // Generate participant code
    try {
      const seq = await BrandSurveyV2Service.getNextParticipantCode(selectedGroup);
      setParticipantCode(seq);
    } catch {
      setParticipantCode(generateParticipantCode(selectedGroup, Date.now() % 1000));
    }
    goToStep('info');
  };

  // ============================================================
  // INFO → CONSENT
  // ============================================================

  const handleInfoNext = () => {
    if (!fullName.trim()) {
      setValidationError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!titleUnit.trim()) {
      setValidationError('Vui lòng nhập chức danh / đơn vị.');
      return;
    }
    if (!yearsExp) {
      setValidationError('Vui lòng chọn số năm kinh nghiệm.');
      return;
    }
    if (hasParticipatedBefore === null) {
      setValidationError('Vui lòng trả lời câu hỏi về tham gia trước đây.');
      return;
    }
    setValidationError(null);
    goToStep('consent');
  };

  // ============================================================
  // CONSENT → NEXT STEP
  // ============================================================

  const handleConsentNext = () => {
    if (!consentAgreed || !consentData) {
      setValidationError('Vui lòng đồng ý với các điều khoản bắt buộc (✓).');
      return;
    }
    setValidationError(null);

    // If Phiếu 1-4 and independence not confirmed → thank you / exit
    const isPublic = phieuConfig?.groupCode === 'KG-ĐT';
    if (!isPublic && !independenceConfirmed) {
      // Show inline thank-you (re-use success screen wording but indicate no submission)
      goToStep('success');
      return;
    }

    // Decide next step
    if (phieuConfig?.requiresImageViewer) {
      goToStep('image-viewer');
    } else {
      goToStep('questions');
    }
  };

  // ============================================================
  // IMAGE VIEWER → QUESTIONS
  // ============================================================

  const handleImageViewerNext = () => {
    goToStep('questions');
  };

  // ============================================================
  // QUESTIONS
  // ============================================================

  const currentQuestion = (): V2Question | null => {
    if (!phieuConfig) return null;
    return phieuConfig.questions[questionIndex] || null;
  };

  const handleSemanticSelect = (qId: string, value: number | null) => {
    setSemanticAnswers(prev => ({
      ...prev,
      [qId]: { value, note: prev[qId]?.note || '' },
    }));
    setValidationError(null);
  };

  const handleSemanticNote = (qId: string, note: string) => {
    setSemanticAnswers(prev => ({
      ...prev,
      [qId]: { value: prev[qId]?.value ?? null, note },
    }));
  };

  const handleRecognitionSelect = (qId: string, option: string) => {
    setRecognitionAnswers(prev => ({ ...prev, [qId]: option }));
    setValidationError(null);
  };

  const handleQuestionNext = () => {
    const q = currentQuestion();
    if (!q) return;

    // Validate
    if (q.type === 'semantic') {
      const ans = semanticAnswers[q.id];
      if (!ans || (ans.value === undefined && ans.value !== null)) {
        // null is valid (nota apply), undefined is not answered
        if (ans === undefined) {
          setValidationError('Vui lòng chọn mức đánh giá hoặc "Không đủ cơ sở đánh giá".');
          return;
        }
      }
    } else if (q.type === 'recognition') {
      if (!recognitionAnswers[q.id]) {
        setValidationError('Vui lòng chọn một đáp án.');
        return;
      }
    }

    setValidationError(null);

    if (!phieuConfig) return;
    const total = phieuConfig.questions.length;
    if (questionIndex + 1 < total) {
      setQuestionIndex(qi => qi + 1);
      scrollToTop();
    } else {
      // All questions done — go to open or interview or submit
      if (phieuConfig.partCOpen) {
        goToStep('open');
      } else if (phieuConfig.interviewQuestions && phieuConfig.interviewQuestions.length > 0 && consentRecord) {
        goToStep('interview');
      } else {
        handleSubmit();
      }
    }
  };

  const handleQuestionBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex(qi => qi - 1);
      setValidationError(null);
      scrollToTop();
    } else {
      // Back to consent
      goToStep('consent');
    }
  };

  // ============================================================
  // OPEN ANSWER
  // ============================================================

  const handleOpenNext = () => {
    // Not required; proceed
    if (phieuConfig?.interviewQuestions && phieuConfig.interviewQuestions.length > 0 && consentRecord) {
      goToStep('interview');
    } else {
      handleSubmit();
    }
  };

  // ============================================================
  // INTERVIEW
  // ============================================================

  const handleInterviewAnswer = (qId: string, audioUrl: string | null, text: string) => {
    setInterviewAnswers(prev => ({ ...prev, [qId]: { text, audioUrl } }));
  };

  const handleInterviewNext = () => {
    if (!phieuConfig?.interviewQuestions) return;
    const total = phieuConfig.interviewQuestions.length;
    if (interviewIndex + 1 < total) {
      setInterviewIndex(i => i + 1);
      scrollToTop();
    } else {
      handleSubmit();
    }
  };

  const handleInterviewSkip = () => {
    if (!phieuConfig?.interviewQuestions) return;
    const total = phieuConfig.interviewQuestions.length;
    if (interviewIndex + 1 < total) {
      setInterviewIndex(i => i + 1);
      scrollToTop();
    } else {
      handleSubmit();
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Upload any blob: audio URLs
      const uploadedInterviewAnswers: Record<string, { text: string; audioUrl: string | null }> = {};
      for (const [qId, ans] of Object.entries(interviewAnswers)) {
        let audioUrl = ans.audioUrl;
        if (audioUrl && audioUrl.startsWith('blob:')) {
          const resp = await fetch(audioUrl);
          const blob = await resp.blob();
          const fname = `${participantCode}_${qId}_${Date.now()}.webm`;
          const uploadedUrl = await BrandSurveyV2Service.uploadAudio(fname, blob);
          audioUrl = uploadedUrl;
        }
        uploadedInterviewAnswers[qId] = { text: ans.text, audioUrl };
      }

      // 2. Build V2Submission
      const openAnswers: Record<string, string> = {};
      if (phieuConfig?.partCOpen && openAnswer.trim()) {
        openAnswers[phieuConfig.partCOpen.id] = openAnswer.trim();
      }

      const submission: V2Submission = {
        id: participantCode,
        participantCode,
        groupCode: selectedGroup,
        phieuId: phieuConfig?.phieuId || selectedGroup,
        fullName: fullName.trim() || undefined,
        titleUnit: titleUnit.trim() || undefined,
        speciality: speciality || undefined,
        yearsExp: yearsExp || undefined,
        hasParticipatedBefore: hasParticipatedBefore ?? undefined,
        independenceConfirmed,
        consentAgreed,
        consentRecord,
        semanticAnswers,
        openAnswers,
        interviewAnswers: uploadedInterviewAnswers,
        recognitionAnswers: Object.keys(recognitionAnswers).length > 0 ? recognitionAnswers : undefined,
        submittedAt: new Date().toISOString(),
      };

      // 3. Save
      await BrandSurveyV2Service.saveSubmission(submission);
    } catch (err) {
      console.error('[V2] Submit error:', err);
    } finally {
      setIsSubmitting(false);
      goToStep('success');
    }
  };

  // ============================================================
  // IMAGE HELPERS
  // ============================================================

  const getImgUrl = (name: string): string => {
    if (imageUrls[name]) return imageUrls[name];
    return BrandSurveyV2Service.getImageUrl(name);
  };

  const handleImageError = (name: string) => {
    setImageLoadErrors(prev => ({ ...prev, [name]: true }));
  };

  // ============================================================
  // DERIVED
  // ============================================================

  const totalQuestions = phieuConfig?.questions.length || 0;
  const isPhieu5 = phieuConfig?.groupCode === 'KG-ĐT';

  // ============================================================
  // RENDER: PROGRESS BAR
  // ============================================================

  const renderProgressBar = (current: number, total: number, label: string) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span>
        <span className="text-[10px] font-mono font-bold text-slate-500">
          {current}/{total}
        </span>
      </div>
      <div className="font-mono text-xs text-amber-500 tracking-tighter leading-none select-none">
        {makeProgressBar(current, total)}
      </div>
    </div>
  );

  // ============================================================
  // RENDER: HEADER / BACK BUTTON
  // ============================================================

  const renderHeader = (title: string, onBack?: () => void) => (
    <div className="flex items-center gap-3 mb-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center h-9 w-9 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer active:scale-95 shadow-xs"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</span>
    </div>
  );

  // ============================================================
  // RENDER: ZOOM MODAL
  // ============================================================

  const renderZoomModal = () => {
    if (!zoomedImage) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={() => setZoomedImage(null)}
      >
        <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setZoomedImage(null)}
            className="absolute -top-3 -right-3 z-10 h-8 w-8 rounded-full bg-white text-slate-700 font-black text-sm flex items-center justify-center shadow-lg cursor-pointer hover:bg-slate-100"
          >
            ✕
          </button>
          <img
            src={zoomedImage}
            alt="Phóng to"
            className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER: IMAGE ROW
  // ============================================================

  const renderImages = (images: string[], allowZoom: boolean) => {
    if (!images || images.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-3 mb-5 justify-center">
        {images.map(imgName => {
          const url = getImgUrl(imgName);
          if (imageLoadErrors[imgName]) {
            return (
              <div
                key={imgName}
                className="flex flex-col items-center justify-center h-28 w-40 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold gap-1"
              >
                <ImageIcon className="h-6 w-6 text-slate-300" />
                <span>{imgName}</span>
              </div>
            );
          }
          return (
            <div key={imgName} className="relative">
              <img
                src={url}
                alt={imgName}
                onError={() => handleImageError(imgName)}
                onClick={() => allowZoom && url && setZoomedImage(url)}
                style={{ maxWidth: allowZoom ? '280px' : '240px' }}
                className={`rounded-2xl border border-slate-200 object-contain shadow-sm max-h-52 ${
                  allowZoom && url ? 'cursor-zoom-in hover:border-amber-400 transition-colors' : ''
                }`}
              />
              {allowZoom && url && (
                <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-black/40 flex items-center justify-center">
                  <Eye className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================================
  // RENDER: SEMANTIC SCALE
  // ============================================================

  const renderSemanticScale = (q: V2Question) => {
    const ans = semanticAnswers[q.id];
    const selectedValue = ans?.value;

    return (
      <div className="space-y-4">
        {/* Scale row */}
        <div className="flex items-start gap-2">
          {/* Low label */}
          <div className="flex-1 text-right">
            <span className="text-xs font-bold text-slate-500 leading-snug">{q.lowLabel}</span>
          </div>

          {/* Circles */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(val => {
              const isSelected = selectedValue === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSemanticSelect(q.id, val)}
                  className={`flex flex-col items-center gap-1 group cursor-pointer`}
                >
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center font-black text-sm transition-all border-2 ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-white shadow-md scale-110'
                        : 'bg-white border-slate-300 text-slate-500 hover:border-amber-400 hover:text-amber-600'
                    }`}
                  >
                    {val}
                  </div>
                </button>
              );
            })}
          </div>

          {/* High label */}
          <div className="flex-1 text-left">
            <span className="text-xs font-bold text-slate-500 leading-snug">{q.highLabel}</span>
          </div>
        </div>

        {/* NOTA button */}
        {q.notaApply && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => handleSemanticSelect(q.id, null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                ans && 'value' in ans && ans.value === null
                  ? 'bg-slate-200 border-slate-400 text-slate-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
              }`}
            >
              Không đủ cơ sở đánh giá
            </button>
          </div>
        )}

        {/* Note textarea */}
        <div>
          <textarea
            value={ans?.note || ''}
            onChange={e => handleSemanticNote(q.id, e.target.value)}
            rows={2}
            placeholder="Ghi chú (không bắt buộc)..."
            className="w-full p-3 border border-slate-200 bg-slate-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300 leading-relaxed font-medium text-slate-700 resize-none"
          />
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER: RECOGNITION (radio)
  // ============================================================

  const renderRecognitionOptions = (q: V2Question) => {
    const selected = recognitionAnswers[q.id];
    return (
      <div className="space-y-2">
        {(q.options || []).map(opt => (
          <label
            key={opt}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selected === opt
                ? 'bg-amber-50 border-amber-400 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
            }`}
          >
            <input
              type="radio"
              name={`rec_${q.id}`}
              value={opt}
              checked={selected === opt}
              onChange={() => handleRecognitionSelect(q.id, opt)}
              className="accent-amber-500 h-4 w-4 cursor-pointer"
            />
            <span className="text-sm font-semibold">{opt}</span>
          </label>
        ))}
      </div>
    );
  };

  // ============================================================
  // RENDER: STEPS
  // ============================================================

  // ---- WELCOME ----
  if (step === 'welcome') {
    const meta = V2_THESIS_METADATA;
    return (
      <div ref={topRef} className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-10">
        {renderZoomModal()}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-sm space-y-6 animate-in fade-in duration-200">
          {/* Logo / branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 text-2xl mx-auto">
              🦁
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {meta.university}
              </p>
              <h1 className="text-lg font-black text-slate-900 leading-tight">{meta.title}</h1>
              <p className="text-xs font-bold text-amber-600 mt-1">{meta.subtitle}</p>
            </div>
          </div>

          {/* Thesis info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1 text-xs font-semibold text-slate-600">
            <p><span className="font-black text-slate-800">Nghiên cứu sinh:</span> {meta.researcher}</p>
            <p><span className="font-black text-slate-800">Người hướng dẫn:</span> {meta.advisors}</p>
            <p><span className="font-black text-slate-800">Chuyên ngành:</span> {meta.major}</p>
          </div>

          {/* Group selection */}
          {!initialGroupCode && (
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
                Chọn phiếu khảo sát của bạn <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300 cursor-pointer"
              >
                <option value="">-- Chọn nhóm --</option>
                {V2_PHIEU_CONFIGS.map(cfg => (
                  <option key={cfg.groupCode} value={cfg.groupCode}>
                    {cfg.groupCode} — {cfg.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Estimated time */}
          {phieuConfig && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
              <span className="text-lg">⏱</span>
              <div>
                <p className="text-xs font-black text-amber-800">Thời gian ước tính: {phieuConfig.estimatedMinutes}</p>
                {phieuConfig.specialistNote && (
                  <p className="text-[11px] font-semibold text-amber-700 mt-0.5">{phieuConfig.specialistNote}</p>
                )}
              </div>
            </div>
          )}

          {validationError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">{validationError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleWelcomeNext}
            className="w-full h-13 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-md transition-all"
          >
            Bắt đầu →
          </button>

          {onBackToAdmin && (
            <button
              type="button"
              onClick={onBackToAdmin}
              className="w-full h-10 bg-white border border-slate-200 text-slate-500 font-bold text-xs rounded-2xl cursor-pointer hover:bg-slate-50 active:scale-97"
            >
              ← Về trang quản trị
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---- INFO (Part A) ----
  if (step === 'info') {
    const isKGDT = isPhieu5;
    const specialityOptions: string[] = phieuConfig?.specialistNote
      ? [] // Will be inferred per group below
      : [];

    // Speciality options by group
    const getSpecialityOptions = (): string[] => {
      if (!phieuConfig) return [];
      switch (phieuConfig.groupCode) {
        case 'CG-MT': return ['Mỹ thuật', 'Di sản', 'Văn hóa', 'Lịch sử nghệ thuật', 'Khác'];
        case 'CG-TK': return ['Thiết kế đồ họa', 'Nhận diện thương hiệu', 'UI/UX', 'Minh họa', 'Khác'];
        case 'QT-LĐ': return ['Quản lý thể thao', 'Quản trị tổ chức', 'Lân sư rồng', 'Khác'];
        case 'CĐ-TH': return ['Vận động viên lân sư rồng', 'Huấn luyện viên', 'Thành viên đoàn', 'Khác'];
        default: return [];
      }
    };

    return (
      <div ref={topRef} className="min-h-screen bg-slate-50 flex flex-col items-center justify-start px-4 py-10">
        {renderZoomModal()}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-sm space-y-5 animate-in fade-in duration-200">
          {renderHeader('Phần A — Thông tin người tham gia', () => goToStep('welcome'))}

          <p className="text-xs text-slate-500 font-semibold">
            Thông tin dưới đây được bảo mật và chỉ dùng cho mục đích nghiên cứu.
          </p>

          {/* Full name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300"
            />
          </div>

          {/* Title / Unit */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
              Chức danh / Đơn vị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titleUnit}
              onChange={e => setTitleUnit(e.target.value)}
              placeholder="VD: Giảng viên — Trường ĐH Mỹ thuật TP.HCM"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300"
            />
          </div>

          {/* Speciality (not for KG-ĐT) */}
          {!isKGDT && getSpecialityOptions().length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
                Lĩnh vực chuyên môn
              </label>
              <select
                value={speciality}
                onChange={e => setSpeciality(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300 cursor-pointer"
              >
                <option value="">-- Chọn lĩnh vực --</option>
                {getSpecialityOptions().map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          {/* Years exp */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
              Số năm kinh nghiệm <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {['Dưới 5 năm', '5-10 năm', 'Trên 10 năm'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setYearsExp(opt)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    yearsExp === opt
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Has participated before */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
              Bạn đã từng tham gia khảo sát Vòng 1 chưa? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {([true, false] as boolean[]).map(val => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setHasParticipatedBefore(val)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    hasParticipatedBefore === val
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400'
                  }`}
                >
                  {val ? 'Có, đã tham gia' : 'Chưa tham gia'}
                </button>
              ))}
            </div>
          </div>

          {/* Independence (not for KG-ĐT) */}
          {!isKGDT && (
            <label className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={independenceConfirmed}
                onChange={e => setIndependenceConfirmed(e.target.checked)}
                className="accent-blue-500 h-4 w-4 mt-0.5 cursor-pointer shrink-0"
              />
              <span className="text-xs font-semibold text-blue-800 leading-relaxed">
                Tôi xác nhận rằng tôi <strong>độc lập với nhóm nghiên cứu</strong> và chưa xem tài liệu thiết kế chi tiết bộ nhận diện này trước buổi đánh giá.
              </span>
            </label>
          )}

          {validationError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">{validationError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleInfoNext}
            className="w-full h-13 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-md transition-all"
          >
            Tiếp tục →
          </button>
        </div>
      </div>
    );
  }

  // ---- CONSENT ----
  if (step === 'consent') {
    const hasInterview = !!(phieuConfig?.interviewQuestions && phieuConfig.interviewQuestions.length > 0);

    return (
      <div ref={topRef} className="min-h-screen bg-slate-50 flex flex-col items-center justify-start px-4 py-10">
        {renderZoomModal()}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-sm space-y-5 animate-in fade-in duration-200">
          {renderHeader('Đồng ý tham gia', () => goToStep('info'))}

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-700">Cam kết bảo mật</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              Mọi thông tin thu thập được sử dụng <strong>độc quyền</strong> cho mục đích nghiên cứu luận án tiến sĩ. Dữ liệu được bảo mật theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
            </p>
          </div>

          {/* Consent checkboxes */}
          <div className="space-y-3">
            {/* consentAgreed */}
            <label className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
              consentAgreed ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={e => setConsentAgreed(e.target.checked)}
                className="accent-emerald-500 h-4 w-4 mt-0.5 cursor-pointer shrink-0"
              />
              <div>
                <span className="text-xs font-black text-slate-800 block mb-0.5">
                  Đồng ý tham gia khảo sát <span className="text-red-500">*</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                  Tôi hiểu mục đích nghiên cứu và tự nguyện tham gia đánh giá bộ nhận diện thương hiệu.
                </span>
              </div>
            </label>

            {/* consentData */}
            <label className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
              consentData ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={consentData}
                onChange={e => setConsentData(e.target.checked)}
                className="accent-emerald-500 h-4 w-4 mt-0.5 cursor-pointer shrink-0"
              />
              <div>
                <span className="text-xs font-black text-slate-800 block mb-0.5">
                  Đồng ý lưu trữ và sử dụng dữ liệu <span className="text-red-500">*</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                  Câu trả lời được lưu trữ bảo mật và chỉ được trích dẫn ở dạng tổng hợp trong luận án.
                </span>
              </div>
            </label>

            {/* consentRecord — only if phieu has interview */}
            {hasInterview && (
              <label className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                consentRecord ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}>
                <input
                  type="checkbox"
                  checked={consentRecord}
                  onChange={e => setConsentRecord(e.target.checked)}
                  className="accent-blue-500 h-4 w-4 mt-0.5 cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-xs font-black text-slate-800 block mb-0.5">
                    Đồng ý ghi âm phỏng vấn{' '}
                    <span className="text-[10px] font-bold text-slate-400">(không bắt buộc)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    Cho phép ghi âm câu trả lời phỏng vấn chuyên sâu (Phần C) để hỗ trợ phân tích.
                  </span>
                </div>
              </label>
            )}
          </div>

          {/* Independence warning for Phiếu 1-4 */}
          {!isPhieu5 && !independenceConfirmed && (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="text-xs font-bold leading-relaxed">
                Lưu ý: Do chưa xác nhận tính độc lập, bạn sẽ được chuyển sang màn hình cảm ơn sau khi nhấn tiếp tục. Cảm ơn sự trung thực của bạn.
              </span>
            </div>
          )}

          {validationError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">{validationError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleConsentNext}
            className="w-full h-13 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-md transition-all"
          >
            Tiếp tục →
          </button>
        </div>
      </div>
    );
  }

  // ---- IMAGE VIEWER (Phiếu 2 only) ----
  if (step === 'image-viewer') {
    const viewerImages = phieuConfig?.allImagesForViewer || [];

    return (
      <div ref={topRef} className="min-h-screen bg-slate-50 flex flex-col items-center justify-start px-4 py-10">
        {renderZoomModal()}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-sm space-y-5 animate-in fade-in duration-200">
          {renderHeader('Xem tài liệu trước khi đánh giá')}

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Eye className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-800 leading-relaxed">
              Vui lòng xem <strong>toàn bộ</strong> hình ảnh bộ nhận diện dưới đây trước khi trả lời bảng hỏi. Nhấp vào hình để phóng to.
            </p>
          </div>

          {/* Image grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {viewerImages.map(imgName => {
              const url = getImgUrl(imgName);
              if (imageLoadErrors[imgName]) {
                return (
                  <div
                    key={imgName}
                    className="aspect-video flex flex-col items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold gap-1"
                  >
                    <ImageIcon className="h-5 w-5 text-slate-300" />
                    <span>{imgName}</span>
                  </div>
                );
              }
              return (
                <div
                  key={imgName}
                  className="relative cursor-zoom-in group"
                  onClick={() => url && setZoomedImage(url)}
                >
                  <img
                    src={url}
                    alt={imgName}
                    onError={() => handleImageError(imgName)}
                    className="w-full object-contain rounded-2xl border border-slate-200 shadow-xs aspect-video group-hover:border-amber-400 transition-colors"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-8 w-8 rounded-full bg-black/50 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-[9px] font-bold rounded-lg">{imgName}</span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleImageViewerNext}
            className="w-full h-13 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-md transition-all"
          >
            Tôi đã xem toàn bộ hình, tiếp tục →
          </button>
        </div>
      </div>
    );
  }

  // ---- QUESTIONS ----
  if (step === 'questions') {
    const q = currentQuestion();
    if (!q || !phieuConfig) return null;

    const isRecognition = q.type === 'recognition';
    const allowZoom = !isRecognition;

    return (
      <div ref={topRef} className="min-h-screen bg-slate-50 flex flex-col items-center justify-start px-4 py-10">
        {renderZoomModal()}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-sm space-y-5 animate-in fade-in duration-200">
          {/* Progress */}
          {renderProgressBar(questionIndex, totalQuestions, `Phần B — Câu ${questionIndex + 1} / ${totalQuestions}`)}

          {/* Images */}
          {q.images && q.images.length > 0 && renderImages(q.images, allowZoom)}

          {/* Question text */}
          <div className="py-1">
            <p className="text-sm font-black text-slate-900 leading-relaxed">{q.text}</p>
          </div>

          {/* Answer UI */}
          {isRecognition ? renderRecognitionOptions(q) : renderSemanticScale(q)}

          {/* Validation error */}
          {validationError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">{validationError}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleQuestionBack}
              disabled={questionIndex === 0}
              className={`flex items-center justify-center h-13 w-13 rounded-2xl border font-black text-sm transition-all ${
                questionIndex === 0
                  ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                  : 'border-slate-200 text-slate-600 cursor-pointer hover:bg-slate-50 active:scale-95 bg-white'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleQuestionNext}
              className="flex-1 h-13 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-md transition-all"
            >
              {questionIndex + 1 === totalQuestions ? 'Hoàn thành →' : 'Tiếp tục →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- OPEN ANSWER (Part C) ----
  if (step === 'open') {
    const partC = phieuConfig?.partCOpen;
    return (
      <div ref={topRef} className="min-h-screen bg-slate-50 flex flex-col items-center justify-start px-4 py-10">
        {renderZoomModal()}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-sm space-y-5 animate-in fade-in duration-200">
          {renderHeader('Phần C — Câu hỏi mở')}

          <div className="space-y-2">
            <p className="text-sm font-black text-slate-900 leading-relaxed">
              {partC?.text || 'Câu hỏi mở'}
            </p>
            <p className="text-[11px] font-semibold text-slate-400">Không bắt buộc — bạn có thể để trống nếu muốn.</p>
          </div>

          <textarea
            value={openAnswer}
            onChange={e => setOpenAnswer(e.target.value)}
            rows={6}
            placeholder="Nhập câu trả lời của bạn tại đây..."
            className="w-full p-4 border border-slate-200 bg-slate-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300 leading-relaxed font-medium text-slate-700 resize-none"
          />

          <button
            type="button"
            onClick={handleOpenNext}
            className="w-full h-13 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-md transition-all"
          >
            Tiếp tục →
          </button>
        </div>
      </div>
    );
  }

  // ---- INTERVIEW ----
  if (step === 'interview') {
    const interviewQs = phieuConfig?.interviewQuestions || [];
    const iQ = interviewQs[interviewIndex];

    if (!iQ) {
      handleSubmit();
      return null;
    }

    const totalInt = interviewQs.length;

    return (
      <div ref={topRef} className="min-h-screen bg-slate-50 flex flex-col items-center justify-start px-4 py-10">
        {renderZoomModal()}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-sm space-y-5 animate-in fade-in duration-200">
          {renderProgressBar(interviewIndex, totalInt, `Phỏng vấn — Câu ${interviewIndex + 1} / ${totalInt}`)}

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm font-black text-blue-900 leading-relaxed">{iQ.text}</p>
          </div>

          <VoiceAnswerConversational
            key={iQ.id}
            onAudioConfirmed={(audioUrl, text) => handleInterviewAnswer(iQ.id, audioUrl, text)}
            initialAudioUrl={interviewAnswers[iQ.id]?.audioUrl || null}
            initialTranscript={interviewAnswers[iQ.id]?.text || ''}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleInterviewSkip}
              className="flex-1 h-12 bg-white border border-slate-200 text-slate-500 font-bold text-xs rounded-2xl cursor-pointer hover:bg-slate-50 active:scale-97"
            >
              Bỏ qua
            </button>
            <button
              type="button"
              onClick={handleInterviewNext}
              className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 shadow-md transition-all"
            >
              {interviewIndex + 1 === totalInt ? 'Hoàn thành →' : 'Câu tiếp theo →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- SUCCESS ----
  if (step === 'success') {
    return (
      <div ref={topRef} className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-10">
        {renderZoomModal()}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 text-center space-y-6 max-w-sm w-full mx-auto shadow-sm animate-in fade-in duration-200">
          <div className="h-16 w-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              Cảm ơn Thầy/Cô!
            </h1>
            <p className="text-base font-extrabold text-slate-700">
              Cảm ơn Thầy/Cô đã tham gia vòng kiểm chứng.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Phản hồi của Thầy/Cô đã được lưu thành công và sẽ đóng góp trực tiếp vào kết quả nghiên cứu luận án.
            </p>
          </div>

          {participantCode && (
            <div className="py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl w-fit mx-auto">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                Mã người tham gia:
              </span>
              <span className="text-xl font-black text-slate-950 block mt-0.5">{participantCode}</span>
            </div>
          )}

          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Bạn có thể đóng tab trình duyệt này an toàn.
          </p>

          {onBackToAdmin && (
            <button
              type="button"
              onClick={onBackToAdmin}
              className="w-full h-10 bg-white border border-slate-200 text-slate-500 font-bold text-xs rounded-2xl cursor-pointer hover:bg-slate-50 active:scale-97"
            >
              ← Về trang quản trị
            </button>
          )}
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};
