import React, { useState, useEffect, useRef } from 'react';
import { BrandSurveyV2Service, V2SubmissionRecord } from '../../services/surveyServiceV2';
import {
  V2_PARTICIPANT_GROUPS,
  V2_THESIS_METADATA,
  COLOR_OPTIONS_N6,
  DOCUMENTATION_PHOTOS_N2,
  ALL_VIEWER_IMAGES_H1_H11,
  V2_D_QUESTIONS_LEVELS,
} from '../../data/surveyData_v2';
import {
  ShieldCheck, Check, AlertCircle, HelpCircle, Eye,
  Clock, ArrowRight, ArrowLeft, X, ZoomIn, Play, Pause,
  Download, Loader2, Sparkles, MessageSquare, CheckCircle2,
  Layers
} from 'lucide-react';
import { VoiceAnswerConversational } from '../conversational/VoiceAnswerConversational';

interface BrandSurveyV2RespondentProps {
  onBackToAdmin?: () => void;
}

export const BrandSurveyV2Respondent: React.FC<BrandSurveyV2RespondentProps> = ({ onBackToAdmin }) => {
  // Navigation / screen state
  // Màn 1: Giới thiệu
  // Màn 2: Thông tin & Đồng thuận
  // Màn 3: Chọn nhóm tham gia
  // Màn 4: Hướng dẫn trả lời
  // survey-part-a: Thông tin người đánh giá
  // survey-pre-viewer: Xem toàn bộ H1-H11 (Phiếu 2)
  // survey-part-b: Nhu cầu (Phiếu 3, 4) hoặc Đánh giá (Phiếu 1, 2) hoặc Nhận biết (Phiếu 5)
  // survey-part-c: Nhận biết (Phiếu 4) hoặc Đánh giá (Phiếu 3) hoặc Mở (Phiếu 1, 2)
  // survey-part-d: Đánh giá (Phiếu 4) hoặc Mở (Phiếu 3)
  // survey-part-e: Mở (Phiếu 4)
  // survey-interview: Phỏng vấn ngắn
  // thank-you-early: Cảm ơn và kết thúc sớm (do ko đồng ý hoặc đã xem ở Phiếu 5)
  // success: Nộp thành công
  type ScreenState =
    | 'man-1'
    | 'man-2'
    | 'man-3'
    | 'man-4'
    | 'part-a'
    | 'pre-viewer'
    | 'part-b'
    | 'part-c'
    | 'part-d'
    | 'part-e'
    | 'interview'
    | 'thank-you-early'
    | 'success';

  const [currentScreen, setCurrentScreen] = useState<ScreenState>('man-1');
  const [selectedGroupCode, setSelectedGroupCode] = useState<'CG-MT' | 'CG-TK' | 'QT-LD' | 'CD-TH' | 'KG-DT'>('CG-MT');
  const [participantCode, setParticipantCode] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // MÀN 2: Đồng thuận
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [consent3, setConsent3] = useState(false);

  // PHẦN A: Thông tin chung người tham gia
  const [academicTitle, setAcademicTitle] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [specialityOther, setSpecialityOther] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [hasParticipatedBefore, setHasParticipatedBefore] = useState<boolean | null>(null);
  const [maDot1, setMaDot1] = useState('');
  const [independenceConfirmed, setIndependenceConfirmed] = useState(false);
  const [role, setRole] = useState('');
  const [roleOther, setRoleOther] = useState('');
  const [unit, setUnit] = useState('');
  const [hasSeenNewLogo, setHasSeenNewLogo] = useState<boolean | null>(null);
  const [hasSeenHueLion, setHasSeenHueLion] = useState<string>('');
  const [frequencyLSR, setFrequencyLSR] = useState<string>('');

  // CÂU HỎI ĐÁNH GIÁ (Answers & Notes)
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, { text: string; audioUrl: string | null }>>({});

  // Lightbox Zoom
  const [zoomImage, setZoomImage] = useState<{ src: string; caption: string } | null>(null);

  // 5-second countdown timer for NB3a (Xem nhanh)
  const [nb3aStarted, setNb3aStarted] = useState(false);
  const [nb3aRemaining, setNb3aRemaining] = useState(5);
  const [nb3aFinished, setNb3aFinished] = useState(false);

  // Check URL params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get('group');
    if (g && (['CG-MT', 'CG-TK', 'QT-LD', 'CD-TH', 'KG-DT'] as const).includes(g as any)) {
      setSelectedGroupCode(g as any);
    }
  }, []);

  // Generate participant code when group is determined
  const initializeParticipantCode = async (group: string) => {
    const code = await BrandSurveyV2Service.getNextParticipantCode(group);
    setParticipantCode(code);
  };

  const currentGroupInfo = V2_PARTICIPANT_GROUPS.find(g => g.code === selectedGroupCode)!;

  // Helper to handle answers
  const handleSetAnswer = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    setValidationError(null);
  };

  const handleSetNote = (id: string, note: string) => {
    setNotes(prev => ({ ...prev, [id]: note }));
  };

  // Timer effect for NB3a
  useEffect(() => {
    let timer: any;
    if (nb3aStarted && nb3aRemaining > 0) {
      timer = setInterval(() => {
        setNb3aRemaining(prev => prev - 1);
      }, 1000);
    } else if (nb3aStarted && nb3aRemaining === 0) {
      setNb3aFinished(true);
      setNb3aStarted(false);
    }
    return () => clearInterval(timer);
  }, [nb3aStarted, nb3aRemaining]);

  // Final submission
  const handleSubmitSurvey = async () => {
    setIsSubmitting(true);
    setValidationError(null);
    try {
      const record: V2SubmissionRecord = {
        id: `v2-${Date.now()}`,
        participantCode: participantCode || `KC-${selectedGroupCode}-01`,
        groupCode: selectedGroupCode,
        phieuId: currentGroupInfo.phieuId,
        dot: 'Kiem_chung',
        maDot1: maDot1.trim() || undefined,
        profile: {
          fullName: academicTitle ? `${academicTitle}` : undefined,
          titleUnit: unit || role || undefined,
          speciality: speciality === 'Khác' ? `Khác: ${specialityOther}` : speciality || roleOther || undefined,
          yearsExp: yearsExp || undefined,
          hasParticipatedBefore: hasParticipatedBefore ?? undefined,
          hasSeenNewLogo: hasSeenNewLogo ?? undefined,
          hasSeenHueLion: hasSeenHueLion || undefined,
          independenceConfirmed: independenceConfirmed,
          frequencyLSR: frequencyLSR || undefined,
        },
        consentAgreed: consent1 && consent2,
        consentRecord: consent3,
        answers,
        notes,
        openAnswers,
        interviewAnswers,
        submittedAt: new Date().toLocaleString('vi-VN'),
      };

      await BrandSurveyV2Service.saveSubmission(record);
      setCurrentScreen('success');
    } catch (err: any) {
      setValidationError('Đã xảy ra lỗi khi lưu kết quả. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Image with Click-to-Zoom
  const renderSurveyImage = (id: string, caption?: string, noZoom = false) => {
    const url = BrandSurveyV2Service.getImageUrl(id);
    return (
      <div className="space-y-1.5 my-3">
        <div
          onClick={() => {
            if (!noZoom) setZoomImage({ src: url, caption: caption || id });
          }}
          className={`relative group bg-slate-900/5 rounded-2xl p-2 border border-slate-200 overflow-hidden flex flex-col items-center justify-center ${
            noZoom ? '' : 'cursor-zoom-in hover:border-amber-400 hover:shadow-md transition-all'
          }`}
        >
          <img
            src={url}
            alt={caption || id}
            className="max-h-72 w-auto object-contain rounded-xl"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="300" height="150" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2364748b">[Hình ' + id + ']</text></svg>';
            }}
          />
          {!noZoom && (
            <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold">
              <ZoomIn className="w-3.5 h-3.5" /> Bấm để phóng to
            </div>
          )}
        </div>
        {caption && (
          <p className="text-[11px] font-semibold text-slate-500 italic text-center">
            {caption}
          </p>
        )}
      </div>
    );
  };

  // Render 1-5 Semantic Scale with full 5-level descriptive options
  const renderSemanticScale = (
    questionId: string,
    lowLabel?: string,
    highLabel?: string,
    allowNota = true
  ) => {
    const currentVal = answers[questionId];
    const levels = V2_D_QUESTIONS_LEVELS[questionId] || [
      lowLabel || 'Đầu thấp',
      'Nghiêng về đầu thấp',
      'Ở giữa',
      'Nghiêng về đầu cao',
      highLabel || 'Đầu cao'
    ];

    return (
      <div className="space-y-2.5 pt-2">
        {/* 5 Levels as clean, clickable option cards */}
        <div className="space-y-1.5">
          {levels.map((text, idx) => {
            const val = idx + 1;
            const isSelected = currentVal === val;
            return (
              <div
                key={val}
                onClick={() => handleSetAnswer(questionId, val)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-1 ring-amber-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {val}
                </span>
                <span
                  className={`text-xs ${
                    isSelected ? 'font-bold text-slate-950' : 'font-medium text-slate-700'
                  }`}
                >
                  {val}. {text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Nút Không đánh giá được */}
        {allowNota && (
          <div
            onClick={() => handleSetAnswer(questionId, 'nota')}
            className={`p-2.5 px-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs select-none ${
              currentVal === 'nota'
                ? 'bg-slate-800 text-white border-slate-900 font-bold shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="font-medium">Không đánh giá được</span>
            {currentVal === 'nota' && (
              <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-white font-bold">
                Đã chọn
              </span>
            )}
          </div>
        )}

        {/* Ô ghi chú không bắt buộc */}
        <div className="pt-1">
          <input
            type="text"
            placeholder="Ghi chú (không bắt buộc): …………………………………………"
            value={notes[questionId] || ''}
            onChange={(e) => handleSetNote(questionId, e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 placeholder:text-slate-400 shadow-2xs"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between py-6 px-4 sm:px-6">
      
      {/* Lightbox Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-3 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={zoomImage.src}
              alt={zoomImage.caption}
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
            <p className="text-xs font-bold text-slate-700 mt-2 text-center">
              {zoomImage.caption}
            </p>
          </div>
        </div>
      )}

      {/* Primary Card Canvas */}
      <div className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-center">

        {/* ======================================================== */}
        {/* MÀN 1. GIỚI THIỆU                                        */}
        {/* ======================================================== */}
        {currentScreen === 'man-1' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-2 border-b border-slate-100 pb-5">
              <span className="inline-block text-[11px] font-black tracking-widest text-slate-400 uppercase">
                {V2_THESIS_METADATA.institution}
              </span>
              <p className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                {V2_THESIS_METADATA.thesisLevel}
              </p>
              <h1 className="text-base sm:text-lg font-black text-slate-950 leading-snug">
                {V2_THESIS_METADATA.thesisName}
              </h1>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-black uppercase mt-1">
                {V2_THESIS_METADATA.formTitle}
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-650 leading-relaxed font-semibold">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Học viên thực hiện:</span>
                  <span className="text-slate-900 font-extrabold">{V2_THESIS_METADATA.studentName}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Chuyên ngành:</span>
                  <span className="text-slate-900 font-extrabold">{V2_THESIS_METADATA.major}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-amber-900">
                <p className="text-justify font-medium leading-relaxed">
                  {V2_THESIS_METADATA.introText}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setValidationError(null);
                  setCurrentScreen('man-2');
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 select-none"
              >
                Tiếp tục <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MÀN 2. PHIẾU THÔNG TIN VÀ ĐỒNG THUẬN THAM GIA             */}
        {/* ======================================================== */}
        {currentScreen === 'man-2' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full mb-1">
                MÀN 2 / 4
              </span>
              <h2 className="text-base font-black text-slate-950 uppercase tracking-tight">
                PHIẾU THÔNG TIN VÀ ĐỒNG THUẬN THAM GIA
              </h2>
            </div>

            <div className="space-y-3 text-xs text-slate-650 leading-relaxed font-medium">
              {V2_THESIS_METADATA.consentIntro.map((paragraph, idx) => (
                <p key={idx} className="text-justify">{paragraph}</p>
              ))}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1 text-slate-700 font-semibold text-xs mt-2">
                <span className="font-extrabold text-slate-900 block mb-1">Liên hệ học viên:</span>
                <p>Email: <a href={`mailto:${V2_THESIS_METADATA.contact.email}`} className="text-indigo-600 underline font-bold">{V2_THESIS_METADATA.contact.email}</a></p>
                <p>Điện thoại: <span className="font-bold text-slate-900">{V2_THESIS_METADATA.contact.phone}</span></p>
              </div>
            </div>

            {/* Checkboxes Xác nhận đồng thuận */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                Xác nhận đồng thuận
              </span>

              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={consent1}
                  onChange={(e) => setConsent1(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Tôi đã được thông tin về mục đích nghiên cứu và tự nguyện tham gia. <span className="text-red-500 font-black">*</span>
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={consent2}
                  onChange={(e) => setConsent2(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Tôi đồng ý để dữ liệu được sử dụng cho đề án dưới dạng mã hóa. <span className="text-red-500 font-black">*</span>
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={consent3}
                  onChange={(e) => setConsent3(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Tôi đồng ý tham gia phỏng vấn ngắn sau phiếu (không bắt buộc).
                </span>
              </label>
            </div>

            {validationError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {validationError}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCurrentScreen('thank-you-early')}
                className="w-1/3 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 font-bold text-xs rounded-2xl cursor-pointer select-none"
              >
                Không đồng ý
              </button>

              <button
                type="button"
                disabled={!consent1 || !consent2}
                onClick={async () => {
                  if (!consent1 || !consent2) {
                    setValidationError('Vui lòng đánh dấu chọn hai ô đồng thuận bắt buộc để tiếp tục.');
                    return;
                  }
                  setValidationError(null);
                  // Check if group is pre-selected in URL
                  const params = new URLSearchParams(window.location.search);
                  const g = params.get('group');
                  if (g && (['CG-MT', 'CG-TK', 'QT-LD', 'CD-TH', 'KG-DT'] as const).includes(g as any)) {
                    await initializeParticipantCode(g);
                    setCurrentScreen('man-4');
                  } else {
                    setCurrentScreen('man-3');
                  }
                }}
                className={`flex-1 py-3.5 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all select-none ${
                  consent1 && consent2
                    ? 'bg-amber-500 hover:bg-amber-450 text-slate-950 cursor-pointer shadow-md active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Đồng ý và tiếp tục <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MÀN 3. CHỌN NHÓM THAM GIA (CARD SELECTION 5 NHÓM)        */}
        {/* ======================================================== */}
        {currentScreen === 'man-3' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full mb-1">
                MÀN 3 / 4
              </span>
              <h2 className="text-base font-black text-slate-950 uppercase tracking-tight">
                Anh/Chị tham gia với tư cách:
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Chọn một nhóm phù hợp nhất với chuyên môn hoặc vai trò của Anh/Chị:
              </p>
            </div>

            {/* 5 Group Cards */}
            <div className="space-y-3">
              {V2_PARTICIPANT_GROUPS.map((grp) => {
                const isSelected = selectedGroupCode === grp.code;
                return (
                  <div
                    key={grp.code}
                    onClick={() => setSelectedGroupCode(grp.code)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </span>
                        <span className="font-extrabold text-xs text-slate-900">
                          {grp.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-5 leading-relaxed font-medium">
                        {grp.description}
                      </p>
                    </div>

                    <div className="pl-5 sm:pl-0 shrink-0">
                      <span className="inline-block text-[11px] font-bold font-mono text-amber-900 bg-amber-100 border border-amber-250 px-2.5 py-1 rounded-xl">
                        {grp.badgeTime}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={async () => {
                  await initializeParticipantCode(selectedGroupCode);
                  setCurrentScreen('man-4');
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 select-none"
              >
                Bắt đầu <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MÀN 4. HƯỚNG DẪN TRẢ LỜI (hiển thị ở đầu mỗi phiếu)       */}
        {/* ======================================================== */}
        {currentScreen === 'man-4' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex justify-between items-center">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  MÀN 4 / 4 · {currentGroupInfo.phieuId}
                </span>
                <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
                  Mã: {participantCode}
                </span>
              </div>
              <h2 className="text-base font-black text-slate-950 uppercase tracking-tight mt-2 flex flex-wrap items-baseline gap-2">
                <span>HƯỚNG DẪN TRẢ LỜI</span>
                <span className="text-xs font-semibold text-slate-500 lowercase first-letter:uppercase tracking-normal">(hiển thị ở đầu mỗi phiếu)</span>
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <p className="font-medium text-slate-700 leading-relaxed">
                Mỗi câu có 5 mức: 1 là thấp nhất, 5 là cao nhất.
              </p>

              {/* Table thang 1-5 */}
              <div className="overflow-hidden border border-slate-200 rounded-2xl">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black">
                    <tr>
                      <th className="py-2.5 px-3 text-left w-36 sm:w-44">Mức</th>
                      <th className="py-2.5 px-3 text-left">Nghĩa là</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">1</td>
                      <td className="py-2.5 px-3">Rất thấp</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">2</td>
                      <td className="py-2.5 px-3">Thấp</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">3</td>
                      <td className="py-2.5 px-3">Trung bình, hoặc chưa nghiêng về bên nào</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">4</td>
                      <td className="py-2.5 px-3">Khá</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">5</td>
                      <td className="py-2.5 px-3">Rất cao</td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 leading-snug">Không đánh giá được</td>
                      <td className="py-2.5 px-3">Câu này ngoài chuyên môn của Anh/Chị, hoặc hình chưa đủ để nhận xét.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 font-semibold leading-relaxed text-justify">
                Anh/Chị có thể ghi thêm ý kiến vào ô Ghi chú ở bất kỳ mức nào (không bắt buộc). Bấm vào hình để xem lớn hơn, trừ phần phép thử nhận biết. Sau khi bắt đầu xem hình, không thể quay lại phần trước.
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentScreen('part-a')}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 select-none"
              >
                Bắt đầu làm phiếu ({currentGroupInfo.phieuId}) <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHẦN A. THÔNG TIN NGƯỜI ĐÁNH GIÁ (TUỲ TỪNG PHIẾU)        */}
        {/* ======================================================== */}
        {currentScreen === 'part-a' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded">
                  {currentGroupInfo.phieuId} · {currentGroupInfo.code}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {participantCode}
                </span>
              </div>
              <h2 className="text-base font-black text-slate-950 uppercase tracking-tight mt-1.5">
                PHẦN A. THÔNG TIN NGƯỜI ĐÁNH GIÁ
              </h2>
            </div>

            {/* FORM CHO PHIẾU 1 (CG-MT) & PHIẾU 2 (CG-TK) */}
            {(selectedGroupCode === 'CG-MT' || selectedGroupCode === 'CG-TK') && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">
                    Học hàm, học vị / chức danh nghề nghiệp:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: TS. Giảng viên, ThS. Họa sĩ..."
                    value={academicTitle}
                    onChange={(e) => setAcademicTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-slate-800 mb-2.5">
                    Lĩnh vực chuyên môn chính: <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2.5 pt-1">
                    {(selectedGroupCode === 'CG-MT'
                      ? ['Lịch sử mỹ thuật, mỹ thuật học', 'Di sản, bảo tồn, bảo tàng', 'Văn hóa học', 'Khác']
                      : ['Thiết kế đồ họa, nhận diện thương hiệu', 'Giảng dạy thiết kế', 'Khác']
                    ).map((opt) => (
                      <label key={opt} className="flex items-center gap-2.5 font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="spec"
                          checked={speciality === opt}
                          onChange={() => setSpeciality(opt)}
                          className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                    {speciality === 'Khác' && (
                      <input
                        type="text"
                        placeholder="Ghi rõ lĩnh vực..."
                        value={specialityOther}
                        onChange={(e) => setSpecialityOther(e.target.value)}
                        className="w-full px-3.5 py-2 mt-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">
                    Số năm kinh nghiệm trong lĩnh vực: <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Dưới 5 năm', '5 - 10 năm', 'Trên 10 năm'].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setYearsExp(yr)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          yearsExp === yr
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-800">
                    Đã tham gia khảo sát hoặc phỏng vấn nhu cầu của đề tài chưa? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="hadPart"
                        checked={hasParticipatedBefore === false}
                        onChange={() => setHasParticipatedBefore(false)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Chưa</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="hadPart"
                        checked={hasParticipatedBefore === true}
                        onChange={() => setHasParticipatedBefore(true)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Đã tham gia</span>
                    </label>
                  </div>
                  {hasParticipatedBefore === true && (
                    <input
                      type="text"
                      placeholder="Mã đợt 1 (nếu có, không bắt buộc)..."
                      value={maDot1}
                      onChange={(e) => setMaDot1(e.target.value)}
                      className="w-full px-3.5 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  )}
                </div>

                {/* Xác nhận độc lập */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="font-black text-slate-900 block uppercase tracking-wider text-[11px]">
                    Xác nhận độc lập <span className="text-red-500">*</span>
                  </span>
                  <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={independenceConfirmed}
                      onChange={(e) => setIndependenceConfirmed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                      Tôi không tham gia thiết kế hoặc góp ý trong quá trình thiết kế bộ nhận diện, không phải cán bộ hướng dẫn và không dự kiến tham gia hội đồng chấm đề án.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* FORM CHO PHIẾU 3 (QT-LD) & PHIẾU 4 (CD-TH) */}
            {(selectedGroupCode === 'QT-LD' || selectedGroupCode === 'CD-TH') && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="block font-bold text-slate-800 mb-2.5">
                    Chức danh / vai trò: <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2.5 pt-1">
                    {(selectedGroupCode === 'QT-LD'
                      ? ['Lãnh đạo Liên đoàn', 'Cán bộ điều hành', 'Khác']
                      : ['Võ sư / huấn luyện viên', 'Trưởng đoàn', 'Vận động viên', 'Khác']
                    ).map((r) => (
                      <label key={r} className="flex items-center gap-2.5 font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          checked={role === r}
                          onChange={() => setRole(r)}
                          className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>{r}</span>
                      </label>
                    ))}
                    {role === 'Khác' && (
                      <input
                        type="text"
                        placeholder="Ghi rõ vai trò..."
                        value={roleOther}
                        onChange={(e) => setRoleOther(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">
                    Đơn vị / câu lạc bộ, tỉnh/thành:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Đoàn Lân Sư Rồng..., TP.HCM"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">
                    Số năm tham gia hoạt động lân sư rồng: <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Dưới 3 năm', '3 - 10 năm', 'Trên 10 năm'].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setYearsExp(yr)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          yearsExp === yr
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-800">
                    Anh/Chị đã từng xem các phương án biểu trưng mới của Liên đoàn trước phiếu này chưa? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="hasSeenNew"
                        checked={hasSeenNewLogo === false}
                        onChange={() => setHasSeenNewLogo(false)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Chưa</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="hasSeenNew"
                        checked={hasSeenNewLogo === true}
                        onChange={() => setHasSeenNewLogo(true)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Đã xem</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="block font-bold text-slate-800 mb-2.5">
                    Trước phiếu này, Anh/Chị đã từng thấy hình lân trong kiến trúc cung đình Huế chưa? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2.5 pt-1">
                    {['Đã thấy tận nơi', 'Đã thấy qua ảnh, phim', 'Chưa thấy'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2.5 font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="seenHue"
                          checked={hasSeenHueLion === opt}
                          onChange={() => setHasSeenHueLion(opt)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FORM CHO PHIẾU 5 (KG-DT) */}
            {selectedGroupCode === 'KG-DT' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="block font-bold text-slate-800 mb-2.5">
                    Anh/Chị đã từng xem các phương án biểu trưng mới của Liên đoàn Lân Sư Rồng Việt Nam chưa? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="seenKG"
                        checked={hasSeenNewLogo === false}
                        onChange={() => setHasSeenNewLogo(false)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Chưa</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="seenKG"
                        checked={hasSeenNewLogo === true}
                        onChange={() => setHasSeenNewLogo(true)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Đã xem (phiếu cảm ơn và kết thúc)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-800 mb-2.5">
                    Anh/Chị có thường xem hoặc theo dõi hoạt động lân sư rồng không? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2.5 pt-1">
                    {['Thường xuyên', 'Thỉnh thoảng', 'Hiếm khi', 'Chưa bao giờ'].map((freq) => (
                      <label key={freq} className="flex items-center gap-2.5 font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="freq"
                          checked={frequencyLSR === freq}
                          onChange={() => setFrequencyLSR(freq)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span>{freq}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {validationError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {validationError}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setValidationError(null);

                  // Kiểm tra xác nhận độc lập (Phiếu 1, 2)
                  if (selectedGroupCode === 'CG-MT' || selectedGroupCode === 'CG-TK') {
                    if (!independenceConfirmed) {
                      setCurrentScreen('thank-you-early');
                      return;
                    }
                    if (!speciality || !yearsExp || hasParticipatedBefore === null) {
                      setValidationError('Vui lòng hoàn tất các thông tin bắt buộc.');
                      return;
                    }
                  }

                  // Kiểm tra Phiếu 3, 4
                  if (selectedGroupCode === 'QT-LD' || selectedGroupCode === 'CD-TH') {
                    if (!role || !yearsExp || hasSeenNewLogo === null || !hasSeenHueLion) {
                      setValidationError('Vui lòng hoàn tất các thông tin bắt buộc.');
                      return;
                    }
                  }

                  // Kiểm tra Phiếu 5
                  if (selectedGroupCode === 'KG-DT') {
                    if (hasSeenNewLogo === true) {
                      setCurrentScreen('thank-you-early');
                      return;
                    }
                    if (hasSeenNewLogo === null || !frequencyLSR) {
                      setValidationError('Vui lòng trả lời các câu hỏi để tiếp tục.');
                      return;
                    }
                  }

                  // Route sang bước kế tiếp
                  if (selectedGroupCode === 'CG-TK') {
                    setCurrentScreen('pre-viewer');
                  } else {
                    setCurrentScreen('part-b');
                  }
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 select-none"
              >
                Tiếp tục <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* XEM BỘ HÌNH H1-H11 TRƯỚC (PHIẾU 2: CG-TK)                 */}
        {/* ======================================================== */}
        {currentScreen === 'pre-viewer' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded">
                PHIẾU 2 · CG-TK
              </span>
              <h2 className="text-base font-black text-slate-950 uppercase tracking-tight mt-1.5">
                XEM TOÀN BỘ HỆ NHẬN DIỆN (HÌNH 3.7 - 3.18)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Xin Anh/Chị xem lần lượt toàn bộ hệ nhận diện dưới đây trước khi trả lời các câu hỏi:
              </p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {ALL_VIEWER_IMAGES_H1_H11.map((item) => (
                <div key={item.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-800 mb-1">{item.label}</p>
                  {renderSurveyImage(item.id, item.label)}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentScreen('part-b')}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 select-none"
              >
                Tôi đã xem, tiếp tục <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHẦN B / NỘI DUNG TỪNG PHIẾU                              */}
        {/* ======================================================== */}
        {currentScreen === 'part-b' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            
            {/* 1. PHIẾU 1 (CG-MT): ĐÁNH GIÁ BỘ NHẬN DIỆN */}
            {selectedGroupCode === 'CG-MT' && (
              <div className="space-y-8">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-950 uppercase">
                    PHẦN B. ĐÁNH GIÁ BỘ NHẬN DIỆN
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Xin Thầy/Cô xem hình hiển thị ở mỗi câu, sau đó chọn một mức. Câu D3 được hỏi khi Thầy/Cô mới thấy biểu trưng, trước sơ đồ phân vai và phần diễn giải.
                  </p>
                </div>

                {/* Câu D3 (H1a) */}
                <div className="space-y-3">
                  {renderSurveyImage('H1a', 'H1a. Biểu trưng chính, bản màu, không chú thích, không có sơ đồ phân vai')}
                  <p className="font-black text-slate-900 text-xs">
                    D3. Biểu trưng gợi liên hệ với hình tượng lân trong mỹ thuật thời Nguyễn ở mức nào?
                  </p>
                  {renderSemanticScale('D3', 'Không gợi liên hệ', 'Gợi liên hệ rõ')}
                </div>

                {/* Câu D1 (H1) */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {renderSurveyImage('H1', 'H1. Biểu trưng chính và phân vai lân - rồng - sư (Hình 3.8)')}
                  <p className="font-black text-slate-900 text-xs">
                    D1. Cấu trúc và tỷ lệ của biểu trưng chính đạt mức nào?
                  </p>
                  {renderSemanticScale('D1', 'Rời rạc, mất cân đối', 'Chặt chẽ, cân đối')}
                </div>

                {/* Câu D4 (H1, H4, H6) */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2">
                    {renderSurveyImage('H1', 'H1 (Hình 3.8)')}
                    {renderSurveyImage('H4', 'H4. Hệ màu (Hình 3.11)')}
                    {renderSurveyImage('H6', 'H6. Họa tiết (Hình 3.13)')}
                  </div>
                  <p className="font-black text-slate-900 text-xs">
                    D4. Cách đưa yếu tố di sản vào bộ nhận diện nghiêng về phía nào?
                  </p>
                  {renderSemanticScale('D4', 'Sao chép, mang cảm giác phục dựng', 'Chuyển hóa đương đại, vẫn giữ căn cứ di sản')}
                </div>

                {/* Câu D5 (H1, H6, H8) */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2">
                    {renderSurveyImage('H1', 'H1 (Hình 3.8)')}
                    {renderSurveyImage('H6', 'H6. Họa tiết (Hình 3.13)')}
                    {renderSurveyImage('H8', 'H8. Ứng dụng giải đấu (Hình 3.15)')}
                  </div>
                  <p className="font-black text-slate-900 text-xs">
                    D5. Bộ nhận diện giúp phân biệt lân sư rồng Việt Nam với lân sư rồng của nước ngoài ở mức nào?
                  </p>
                  {renderSemanticScale('D5', 'Không phân biệt được', 'Phân biệt rõ')}
                </div>

                {/* Câu D2 (H1, H8, H9) */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2">
                    {renderSurveyImage('H1', 'H1 (Hình 3.8)')}
                    {renderSurveyImage('H8', 'H8 (Hình 3.15)')}
                    {renderSurveyImage('H9', 'H9. Trang phục (Hình 3.16)')}
                  </div>
                  <p className="font-black text-slate-900 text-xs">
                    D2. Tổng thể bộ nhận diện truyền tải tinh thần thể thao - văn hóa của lân sư rồng ở mức nào?
                  </p>
                  {renderSemanticScale('D2', 'Không truyền tải được', 'Truyền tải rõ')}
                </div>
              </div>
            )}

            {/* 2. PHIẾU 2 (CG-TK): ĐÁNH GIÁ HỆ THỐNG */}
            {selectedGroupCode === 'CG-TK' && (
              <div className="space-y-8">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-950 uppercase">
                    PHẦN B. ĐÁNH GIÁ BỘ NHẬN DIỆN
                  </h2>
                </div>

                {/* D1 */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {renderSurveyImage('H1', 'H1 (Hình 3.8)')}
                    {renderSurveyImage('H3', 'H3. Quy chuẩn dựng hình (Hình 3.7, 3.10)')}
                  </div>
                  <p className="font-black text-slate-900 text-xs">
                    D1. Cấu trúc và tỷ lệ của biểu trưng chính đạt mức nào?
                  </p>
                  {renderSemanticScale('D1')}
                </div>

                {/* D2 */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {renderSurveyImage('H1', 'H1 (Hình 3.8)')}
                    {renderSurveyImage('H8', 'H8. Ứng dụng giải đấu (Hình 3.15)')}
                    {renderSurveyImage('H9', 'H9. Trang phục (Hình 3.16)')}
                    {renderSurveyImage('H11', 'H11. Truyền thông (Hình 3.18)')}
                  </div>
                  <p className="font-black text-slate-900 text-xs">
                    D2. Tổng thể bộ nhận diện truyền tải tinh thần thể thao - văn hóa của lân sư rồng ở mức nào?
                  </p>
                  {renderSemanticScale('D2')}
                </div>

                {/* D9 */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {renderSurveyImage('H2', 'H2. Biến thể và huy hiệu (Hình 3.9)')}
                    {renderSurveyImage('H3', 'H3. Cỡ thu nhỏ (Hình 3.7)')}
                    {renderSurveyImage('H8', 'H8. Thẻ đeo (Hình 3.15)')}
                    {renderSurveyImage('H11', 'H11. Ảnh đại diện (Hình 3.18)')}
                  </div>
                  <p className="font-black text-slate-900 text-xs">
                    D9. Ở cỡ nhỏ (huy hiệu, thẻ đeo, ảnh đại diện mạng xã hội), biểu trưng còn nhận ra được ở mức nào?
                  </p>
                  {renderSemanticScale('D9')}
                </div>

                {/* D10 */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {renderSurveyImage('SO-SANH', 'SO-SANH. Biểu trưng đề xuất đặt cạnh 5 biểu trưng liên đoàn lân sư rồng khác (Hình 2.11b)')}
                  <p className="font-black text-slate-900 text-xs">
                    D10. So với biểu trưng của các đoàn, câu lạc bộ và liên đoàn lân sư rồng khác, biểu trưng dễ phân biệt ở mức nào?
                  </p>
                  {renderSemanticScale('D10')}
                </div>

                {/* D11 */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {renderSurveyImage('H1', 'H1. Biểu trưng chính (Hình 3.8)')}
                    {renderSurveyImage('H2', 'H2. Biến thể & huy hiệu (Hình 3.9)')}
                    {renderSurveyImage('H3', 'H3. Quy chuẩn dựng hình (Hình 3.7, 3.10)')}
                    {renderSurveyImage('H4', 'H4. Hệ màu (Hình 3.11)')}
                    {renderSurveyImage('H5', 'H5. Kiểu chữ (Hình 3.12)')}
                    {renderSurveyImage('H6', 'H6. Họa tiết (Hình 3.13)')}
                  </div>
                  <p className="font-black text-slate-900 text-xs">
                    D11. Biểu trưng, màu, chữ và họa tiết liên kết thành một hệ thống ở mức nào?
                  </p>
                  {renderSemanticScale('D11')}
                </div>

                {/* D12 */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {renderSurveyImage('H7', 'H7. Văn phòng (Hình 3.14)')}
                    {renderSurveyImage('H8', 'H8. Ứng dụng giải đấu (Hình 3.15)')}
                    {renderSurveyImage('H9', 'H9. Trang phục (Hình 3.16)')}
                    {renderSurveyImage('H10', 'H10. Vinh danh (Hình 3.17)')}
                    {renderSurveyImage('H11', 'H11. Truyền thông (Hình 3.18)')}
                  </div>
                  <p className="font-black text-slate-900 text-xs">
                    D12. Qua các nhóm ứng dụng (văn phòng, giải đấu, trang phục, truyền thông), nhận diện được giữ nhất quán ở mức nào?
                  </p>
                  {renderSemanticScale('D12')}
                </div>

                {/* D14 */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {renderSurveyImage('H3', 'H3 (Hình 3.7, 3.10)')}
                    {renderSurveyImage('H8', 'H8 (Hình 3.15)')}
                    {renderSurveyImage('H9', 'H9 (Hình 3.16)')}
                    {renderSurveyImage('H10', 'H10 (Hình 3.17)')}
                  </div>
                  <p className="font-black text-slate-900 text-xs">
                    D14. Trước khi gia công (thêu, in, dập nổi), bộ nhận diện cần chỉnh sửa ở mức nào để phù hợp với kỹ thuật và chi phí của Liên đoàn?
                  </p>
                  {renderSemanticScale('D14')}
                </div>
              </div>
            )}

            {/* 3. PHIẾU 3 (QT-LD) & PHIẾU 4 (CD-TH): PHẦN B NHU CẦU SỬ DỤNG */}
            {(selectedGroupCode === 'QT-LD' || selectedGroupCode === 'CD-TH') && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Phần B (Trả lời trước khi xem bộ hình)
                  </span>
                  <h2 className="text-base font-black text-slate-950 uppercase mt-1">
                    NHU CẦU SỬ DỤNG HỆ NHẬN DIỆN
                  </h2>
                </div>

                {/* N1 */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-900 text-xs">
                    N1. Theo Anh/Chị, Liên đoàn có cần một bộ nhận diện (logo, màu, chữ) dùng thống nhất trên cả nước không?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Không cần', 'Ít cần', 'Phân vân', 'Cần', 'Rất cần', 'Không có ý kiến'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSetAnswer('N1', opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          answers['N1'] === opt
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* N2 + Trang tư liệu TL-a - TL-d */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    &ldquo;Bộ ảnh giới thiệu một số hình lân trong mỹ thuật cung đình Huế thời Nguyễn, không đại diện cho toàn bộ.&rdquo;
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {DOCUMENTATION_PHOTOS_N2.map((photo) => (
                      <div key={photo.id}>
                        {renderSurveyImage(photo.id, photo.label)}
                      </div>
                    ))}
                  </div>
                  <p className="font-bold text-slate-900 text-xs pt-2">
                    N2. Sau khi xem trang tư liệu, Anh/Chị thấy hình lân thời Nguyễn phù hợp ở mức nào để làm nguồn cảm hứng cho logo Liên đoàn?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Không phù hợp', 'Ít phù hợp', 'Phân vân', 'Phù hợp', 'Rất phù hợp', 'Không có ý kiến'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSetAnswer('N2', opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          answers['N2'] === opt
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* N3 */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="font-bold text-slate-900 text-xs">
                    N3. Hình nào nên là hình chính trong logo Liên đoàn? (chọn một)
                  </p>
                  <div className="space-y-2 text-xs">
                    {['Lân', 'Rồng', 'Sư tử', 'Cả ba ngang nhau', 'Chỉ dùng chữ, không dùng hình', 'Ý kiến khác'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="n3"
                          checked={answers['N3'] === opt}
                          onChange={() => handleSetAnswer('N3', opt)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* N4: 3 dòng thang 1-5 */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <p className="font-bold text-slate-900 text-xs">
                    N4. Logo Liên đoàn nên nghiêng về phía nào? (chọn một mức trên mỗi dòng; 3 là ở giữa)
                  </p>
                  <div className="space-y-2">
                    {renderSemanticScale('N4_1', 'Truyền thống', 'Hiện đại', false)}
                    {renderSemanticScale('N4_2', 'Trang nghiêm', 'Sôi động', false)}
                    {renderSemanticScale('N4_3', 'Giữ sát hình cổ', 'Giản lược mạnh', false)}
                  </div>
                </div>

                {/* N5: Tối đa 3 yếu tố */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="font-bold text-slate-900 text-xs">
                    N5. Những yếu tố nào nên xuất hiện trong logo? (chọn tối đa 3)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      'Đầu lân', 'Thân rồng', 'Quả cầu, hỏa châu',
                      'Mây, hoa văn cung đình', 'Tên hoặc chữ viết tắt của Liên đoàn',
                      'Dấu hiệu quốc gia (cờ, sao)', 'Trống', 'Ý kiến khác'
                    ].map((opt) => {
                      const currentSelected = (answers['N5'] as string[]) || [];
                      const isChecked = currentSelected.includes(opt);
                      return (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer font-medium p-2 bg-slate-50 rounded-xl border border-slate-200">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (currentSelected.length < 3) {
                                  handleSetAnswer('N5', [...currentSelected, opt]);
                                }
                              } else {
                                handleSetAnswer('N5', currentSelected.filter(i => i !== opt));
                              }
                            }}
                            className="text-amber-600 focus:ring-amber-500 rounded"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* N6: Tối đa 2 màu kèm ô màu */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="font-bold text-slate-900 text-xs">
                    N6. Màu nào phù hợp làm màu chính của Liên đoàn? (chọn tối đa 2)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {COLOR_OPTIONS_N6.map((color) => {
                      const currentColors = (answers['N6'] as string[]) || [];
                      const isSelected = currentColors.includes(color.name);
                      return (
                        <div
                          key={color.name}
                          onClick={() => {
                            if (isSelected) {
                              handleSetAnswer('N6', currentColors.filter(c => c !== color.name));
                            } else if (currentColors.length < 2) {
                              handleSetAnswer('N6', [...currentColors, color.name]);
                            }
                          }}
                          className={`p-2.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer select-none transition-all ${
                            isSelected ? 'border-amber-500 bg-amber-50/50 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span
                            className="w-7 h-7 rounded-full shrink-0 shadow-inner border"
                            style={{ backgroundColor: color.hex, borderColor: color.border }}
                          />
                          <span className="text-xs font-bold text-slate-800">{color.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* N7: Mong muốn nhất */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <label className="font-bold text-slate-900 text-xs">
                    N7. Điều Anh/Chị mong muốn nhất ở bộ nhận diện mới của Liên đoàn là gì?
                  </label>
                  <textarea
                    rows={3}
                    value={openAnswers['N7'] || ''}
                    onChange={(e) => setOpenAnswers(prev => ({ ...prev, N7: e.target.value }))}
                    placeholder="Nhập ý kiến của Anh/Chị..."
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800"
                  />
                </div>

                {/* CÂU HỎI RIÊNG CHO QUẢN TRỊ (NQ1 - NQ6) */}
                {selectedGroupCode === 'QT-LD' && (
                  <div className="space-y-4 pt-4 border-t-2 border-slate-200">
                    <div className="space-y-2">
                      {renderSurveyImage('LOGO-HH', 'LOGO-HH. Biểu trưng hiện hành của Liên đoàn (Hình 2.11a)')}
                      <p className="font-bold text-slate-900 text-xs">
                        NQ1. Anh/Chị hài lòng ở mức nào với logo Liên đoàn đang dùng?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Rất không hài lòng', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng', 'Không có ý kiến'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSetAnswer('NQ1', opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              answers['NQ1'] === opt
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="font-bold text-slate-900 text-xs">
                        NQ2. Một sổ tay hướng dẫn dùng logo, màu, chữ hữu ích ở mức nào cho các đơn vị thành viên?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Không hữu ích', 'Ít hữu ích', 'Phân vân', 'Hữu ích', 'Rất hữu ích', 'Không có ý kiến'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSetAnswer('NQ2', opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              answers['NQ2'] === opt
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="font-bold text-slate-900 text-xs">
                        NQ3. Liên đoàn muốn được nhìn nhận nghiêng về phía nào? (3 là ở giữa)
                      </p>
                      {renderSemanticScale('NQ3', 'Tổ chức thể thao', 'Tổ chức văn hóa - di sản', false)}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="font-bold text-slate-900 text-xs">
                        NQ4. Hiện nay Liên đoàn có người hoặc bộ phận phụ trách việc sử dụng logo, hình ảnh không?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Đã có', 'Chưa có nhưng đã dự kiến', 'Chưa có', 'Không rõ'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSetAnswer('NQ4', opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              answers['NQ4'] === opt
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="font-bold text-slate-900 text-xs">
                        NQ5. Nếu phương án mới đạt yêu cầu, Liên đoàn có sẵn sàng thay logo đang dùng không?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Có', 'Có, sau khi điều chỉnh', 'Không', 'Chưa xác định'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSetAnswer('NQ5', opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              answers['NQ5'] === opt
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <label className="font-bold text-slate-900 text-xs">
                        NQ6. Khi sử dụng logo hiện nay, Liên đoàn có gặp khó khăn nào không? Nếu có, đó là gì?
                      </label>
                      <textarea
                        rows={3}
                        value={openAnswers['NQ6'] || ''}
                        onChange={(e) => setOpenAnswers(prev => ({ ...prev, NQ6: e.target.value }))}
                        placeholder="Nhập khó khăn..."
                        className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* CÂU HỎI RIÊNG CHO CỘNG ĐỒNG THỰC HÀNH (NT1 - NT5) */}
                {selectedGroupCode === 'CD-TH' && (
                  <div className="space-y-4 pt-4 border-t-2 border-slate-200">
                    <div className="space-y-2">
                      {renderSurveyImage('LOGO-HH', 'LOGO-HH. Biểu trưng hiện hành của Liên đoàn (Hình 2.11a)')}
                      <p className="font-bold text-slate-900 text-xs">
                        NT1. Anh/Chị hài lòng ở mức nào với logo Liên đoàn đang dùng?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Rất không hài lòng', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng', 'Không có ý kiến'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSetAnswer('NT1', opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              answers['NT1'] === opt
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="font-bold text-slate-900 text-xs">
                        NT2. Đoàn của Anh/Chị dùng logo Liên đoàn ở đâu nhiều nhất? (chọn tối đa 3)
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {['Cờ, băng rôn', 'Áo thi đấu', 'Huy chương, cúp', 'Thẻ đeo', 'Sân khấu, backdrop', 'Mạng xã hội', 'Chưa dùng', 'Ý kiến khác'].map((opt) => {
                          const curr = (answers['NT2'] as string[]) || [];
                          const checked = curr.includes(opt);
                          return (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer font-medium p-2 bg-slate-50 rounded-xl border border-slate-200">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    if (curr.length < 3) handleSetAnswer('NT2', [...curr, opt]);
                                  } else {
                                    handleSetAnswer('NT2', curr.filter(i => i !== opt));
                                  }
                                }}
                                className="text-amber-600 focus:ring-amber-500 rounded"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="font-bold text-slate-900 text-xs">
                        NT3. Khi dùng logo trong thực tế, những yêu cầu nào quan trọng nhất? (chọn tối đa 3)
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {['Nhìn rõ từ xa', 'Rõ khi in, thêu cỡ nhỏ', 'Dễ sản xuất', 'Màu tương phản tốt', 'Thể hiện tinh thần lân sư rồng', 'Dùng đồng bộ giữa các đoàn', 'Ý kiến khác'].map((opt) => {
                          const curr = (answers['NT3'] as string[]) || [];
                          const checked = curr.includes(opt);
                          return (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer font-medium p-2 bg-slate-50 rounded-xl border border-slate-200">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    if (curr.length < 3) handleSetAnswer('NT3', [...curr, opt]);
                                  } else {
                                    handleSetAnswer('NT3', curr.filter(i => i !== opt));
                                  }
                                }}
                                className="text-amber-600 focus:ring-amber-500 rounded"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="font-bold text-slate-900 text-xs">
                        NT4. Đoàn/câu lạc bộ của Anh/Chị có sẵn sàng in logo Liên đoàn lên trang phục khi dự giải do Liên đoàn tổ chức không?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Có', 'Có, nếu Liên đoàn cung cấp file và quy chuẩn', 'Không', 'Chưa xác định'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSetAnswer('NT4', opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              answers['NT4'] === opt
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <label className="font-bold text-slate-900 text-xs">
                        NT5. Khi in, thêu hoặc dùng logo Liên đoàn hiện nay, đoàn của Anh/Chị có gặp khó khăn nào không? Nếu có, đó là gì?
                      </label>
                      <textarea
                        rows={3}
                        value={openAnswers['NT5'] || ''}
                        onChange={(e) => setOpenAnswers(prev => ({ ...prev, NT5: e.target.value }))}
                        placeholder="Nhập khó khăn..."
                        className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. PHIẾU 5 (KG-DT): PHẦN B PHÉP THỬ NHẬN BIẾT */}
            {selectedGroupCode === 'KG-DT' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    PHÉP THỬ NHẬN BIẾT (Tắt nút quay lại, không cho phóng to hình)
                  </span>
                  <h2 className="text-base font-black text-slate-950 uppercase mt-1">
                    PHẦN B. PHÉP THỬ NHẬN BIẾT
                  </h2>
                </div>

                {/* NB3a: 5 giây đếm ngược */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <p className="font-black text-slate-900 text-xs">
                    NB3a. Xem nhanh. Màn hình hiển thị một biểu trưng trong 5 giây rồi tự ẩn. Xin Anh/Chị quan sát, không chụp màn hình.
                  </p>
                  
                  {!nb3aStarted && !nb3aFinished && (
                    <button
                      type="button"
                      onClick={() => {
                        setNb3aStarted(true);
                        setNb3aRemaining(5);
                      }}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase rounded-xl cursor-pointer"
                    >
                      Bắt đầu xem
                    </button>
                  )}

                  {nb3aStarted && (
                    <div className="space-y-2 animate-in fade-in">
                      <div className="inline-block px-3 py-1 bg-amber-500 text-slate-950 font-mono font-black text-xs rounded-full">
                        Đang hiển thị: {nb3aRemaining}s
                      </div>
                      <div className="flex justify-center">
                        {renderSurveyImage('NB-A', 'NB-A. Biểu trưng chính đã che tên tổ chức', true)}
                      </div>
                    </div>
                  )}

                  {nb3aFinished && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                      ✓ Đã hoàn thành phần xem nhanh 5 giây.
                    </div>
                  )}
                </div>

                {/* NB3b */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <label className="font-bold text-slate-900 text-xs">
                    NB3b. Anh/Chị nhớ được những hình ảnh hoặc chi tiết nào trong biểu trưng vừa xem? (không bắt buộc)
                  </label>
                  <textarea
                    rows={2}
                    value={openAnswers['NB3b'] || ''}
                    onChange={(e) => setOpenAnswers(prev => ({ ...prev, NB3b: e.target.value }))}
                    placeholder="Nhập chi tiết nhớ được..."
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* NB3c */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {renderSurveyImage('NB-SET', 'NB-SET. Sáu biểu trưng A - F xếp ngẫu nhiên', true)}
                  <p className="font-bold text-slate-900 text-xs">
                    NB3c. Biểu trưng nào là biểu trưng Anh/Chị vừa xem? (chọn một)
                  </p>
                  <div className="flex justify-center gap-3">
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSetAnswer('NB3c', opt)}
                        className={`w-10 h-10 rounded-2xl font-black text-sm border-2 cursor-pointer transition-all ${
                          answers['NB3c'] === opt
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-amber-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NB1: 16px, 24px, 32px */}
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <p className="font-bold text-slate-900 text-xs">
                    NB1. Ở cỡ này, Anh/Chị có nhận ra đây là biểu trưng vừa xem không?
                  </p>
                  {[
                    { id: 'NB1_16', img: 'NB1-16', label: '16 px' },
                    { id: 'NB1_24', img: 'NB1-24', label: '24 px' },
                    { id: 'NB1_32', img: 'NB1-32', label: '32 px' },
                  ].map((sz) => (
                    <div key={sz.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-500 w-12">{sz.label}</span>
                        {renderSurveyImage(sz.img, undefined, true)}
                      </div>
                      <div className="flex gap-2">
                        {['Nhận ra', 'Không nhận ra'].map((ans) => (
                          <button
                            key={ans}
                            type="button"
                            onClick={() => handleSetAnswer(sz.id, ans)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              answers[sz.id] === ans
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {ans}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* NB2: 30m, 20m, 10m */}
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <p className="font-bold text-slate-900 text-xs">
                    NB2. Ở ảnh này, Anh/Chị có nhận ra biểu trưng của Liên đoàn không?
                  </p>
                  {[
                    { id: 'NB2_30', img: 'NB2-30', label: 'Khoảng cách 30 m' },
                    { id: 'NB2_20', img: 'NB2-20', label: 'Khoảng cách 20 m' },
                    { id: 'NB2_10', img: 'NB2-10', label: 'Khoảng cách 10 m' },
                  ].map((dist) => (
                    <div key={dist.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">{dist.label}</span>
                      <div className="max-w-[360px] mx-auto">
                        {renderSurveyImage(dist.img, undefined, true)}
                      </div>
                      <div className="flex justify-center gap-2 pt-1">
                        {['Nhận ra', 'Không nhận ra'].map((ans) => (
                          <button
                            key={ans}
                            type="button"
                            onClick={() => handleSetAnswer(dist.id, ans)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              answers[dist.id] === ans
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {ans}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NÚT TIẾP TỤC CHO PHẦN B */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (selectedGroupCode === 'CG-MT' || selectedGroupCode === 'CG-TK') {
                    setCurrentScreen('part-c'); // Sang câu hỏi mở & phỏng vấn
                  } else if (selectedGroupCode === 'QT-LD') {
                    setCurrentScreen('part-c'); // Sang Đánh giá bộ nhận diện (không cho quay lại)
                  } else if (selectedGroupCode === 'CD-TH') {
                    // Nếu đã xem biểu trưng mới ở Phần A -> Bỏ qua phép thử nhận biết, sang thẳng Đánh giá
                    if (hasSeenNewLogo === true) {
                      setCurrentScreen('part-d');
                    } else {
                      setCurrentScreen('part-c'); // Sang Phép thử nhận biết
                    }
                  } else if (selectedGroupCode === 'KG-DT') {
                    // Phiếu 5 hoàn thành sau khi làm xong phần B
                    handleSubmitSurvey();
                  }
                }}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 select-none"
              >
                {selectedGroupCode === 'KG-DT' ? (
                  isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi kết quả...</> : 'Hoàn thành và gửi phiếu'
                ) : (
                  <>Tiếp tục <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHẦN C (TUỲ THEO TỪNG PHIẾU)                              */}
        {/* ======================================================== */}
        {currentScreen === 'part-c' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            
            {/* 1. PHIẾU 1 (CG-MT) & PHIẾU 2 (CG-TK): CÂU HỎI MỞ */}
            {(selectedGroupCode === 'CG-MT' || selectedGroupCode === 'CG-TK') && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-950 uppercase">
                    PHẦN C. CÂU HỎI MỞ
                  </h2>
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-slate-900 text-xs">
                    {selectedGroupCode === 'CG-MT'
                      ? 'Nếu chỉ được thay đổi một điều trong bộ nhận diện này, Thầy/Cô sẽ thay đổi điều gì? Vì sao?'
                      : 'Nếu chỉ được thay đổi một điều trong bộ nhận diện này, Anh/Chị sẽ thay đổi điều gì? Vì sao?'}
                  </label>
                  <textarea
                    rows={4}
                    value={openAnswers['C_OPEN'] || ''}
                    onChange={(e) => setOpenAnswers(prev => ({ ...prev, C_OPEN: e.target.value }))}
                    placeholder="Nhập ý kiến của Thầy/Cô, Anh/Chị..."
                    className="w-full text-xs p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (consent3) {
                        setCurrentScreen('interview');
                      } else {
                        handleSubmitSurvey();
                      }
                    }}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
                  >
                    {consent3 ? (
                      <>Tiếp tục phỏng vấn ngắn <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi kết quả...</> : 'Hoàn thành và gửi phiếu'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 2. PHIẾU 3 (QT-LD): PHẦN C ĐÁNH GIÁ BỘ NHẬN DIỆN */}
            {selectedGroupCode === 'QT-LD' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    Từ phần này, phiếu không cho quay lại Phần B
                  </span>
                  <h2 className="text-base font-black text-slate-950 uppercase mt-1">
                    PHẦN C. ĐÁNH GIÁ BỘ NHẬN DIỆN
                  </h2>
                </div>

                {/* D6 */}
                <div className="space-y-3">
                  {renderSurveyImage('H1a', 'H1a. Biểu trưng chính, bản màu, không chú thích, không có sơ đồ phân vai')}
                  <p className="font-bold text-slate-900 text-xs">
                    D6. Khi nhìn biểu trưng chính, Anh/Chị nhận ra hình nào trước tiên?
                  </p>
                  <div className="space-y-2 text-xs">
                    {['Lân', 'Rồng', 'Cả hai cùng lúc', 'Không nhận ra hình linh vật', 'Không đủ cơ sở đánh giá'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="d6"
                          checked={answers['D6'] === opt}
                          onChange={() => handleSetAnswer('D6', opt)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Ghi chú (không bắt buộc)..."
                    value={notes['D6'] || ''}
                    onChange={(e) => handleSetNote('D6', e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                {/* D7 */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {renderSurveyImage('H1', 'H1. Biểu trưng chính và phân vai lân - rồng - sư (Hình 3.8)')}
                  <p className="font-bold text-slate-900 text-xs">
                    D7. Cách phân vai trong biểu trưng (lân ở trung tâm, rồng bao quanh) phù hợp ở mức nào với hoạt động của Liên đoàn?
                  </p>
                  {renderSemanticScale('D7', 'Không phù hợp', 'Rất phù hợp')}
                </div>

                {/* D8 */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {renderSurveyImage('H1', 'H1 (Hình 3.8)')}
                    {renderSurveyImage('H2', 'H2. Biến thể (Hình 3.9)')}
                    {renderSurveyImage('H8', 'H8 (Hình 3.15)')}
                    {renderSurveyImage('H9', 'H9 (Hình 3.16)')}
                    {renderSurveyImage('H10', 'H10. Vinh danh (Hình 3.17)')}
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    D8. Bộ nhận diện đại diện cho cả ba loại hình lân, sư, rồng của Liên đoàn ở mức nào?
                  </p>
                  {renderSemanticScale('D8')}
                </div>

                {/* D13 */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2">
                    {renderSurveyImage('H3', 'H3. Quy chuẩn (Hình 3.7, 3.10)')}
                    {renderSurveyImage('H4', 'H4. Hệ màu (Hình 3.11)')}
                    {renderSurveyImage('H5', 'H5. Kiểu chữ (Hình 3.12)')}
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    D13. Dựa vào quy chuẩn trong sổ tay, Liên đoàn và các đơn vị thành viên có thể tự áp dụng bộ nhận diện ở mức nào?
                  </p>
                  {renderSemanticScale('D13')}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen('part-d')}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
                  >
                    Tiếp tục <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. PHIẾU 4 (CD-TH): PHÉP THỬ NHẬN BIẾT */}
            {selectedGroupCode === 'CD-TH' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Phần C · Phép thử nhận biết
                  </span>
                  <h2 className="text-base font-black text-slate-950 uppercase mt-1">
                    PHÉP THỬ NHẬN BIẾT (LẦN ĐẦU XEM BIỂU TRƯNG)
                  </h2>
                </div>

                {/* NB3a: 5 giây đếm ngược */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <p className="font-black text-slate-900 text-xs">
                    NB3a. Xem nhanh. Màn hình hiển thị một biểu trưng trong 5 giây rồi tự ẩn. Xin Anh/Chị quan sát, không chụp màn hình.
                  </p>
                  
                  {!nb3aStarted && !nb3aFinished && (
                    <button
                      type="button"
                      onClick={() => {
                        setNb3aStarted(true);
                        setNb3aRemaining(5);
                      }}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase rounded-xl cursor-pointer"
                    >
                      Bắt đầu xem
                    </button>
                  )}

                  {nb3aStarted && (
                    <div className="space-y-2 animate-in fade-in">
                      <div className="inline-block px-3 py-1 bg-amber-500 text-slate-950 font-mono font-black text-xs rounded-full">
                        Đang hiển thị: {nb3aRemaining}s
                      </div>
                      <div className="flex justify-center">
                        {renderSurveyImage('NB-A', 'NB-A. Biểu trưng chính đã che tên tổ chức', true)}
                      </div>
                    </div>
                  )}

                  {nb3aFinished && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                      ✓ Đã hoàn thành phần xem nhanh 5 giây.
                    </div>
                  )}
                </div>

                {/* NB3b */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <label className="font-bold text-slate-900 text-xs">
                    NB3b. Anh/Chị nhớ được những hình ảnh hoặc chi tiết nào trong biểu trưng vừa xem? (không bắt buộc)
                  </label>
                  <textarea
                    rows={2}
                    value={openAnswers['NB3b'] || ''}
                    onChange={(e) => setOpenAnswers(prev => ({ ...prev, NB3b: e.target.value }))}
                    placeholder="Nhập chi tiết nhớ được..."
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* NB3c */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {renderSurveyImage('NB-SET', 'NB-SET. Sáu biểu trưng A - F xếp ngẫu nhiên', true)}
                  <p className="font-bold text-slate-900 text-xs">
                    NB3c. Biểu trưng nào là biểu trưng Anh/Chị vừa xem? (chọn một)
                  </p>
                  <div className="flex justify-center gap-3">
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSetAnswer('NB3c', opt)}
                        className={`w-10 h-10 rounded-2xl font-black text-sm border-2 cursor-pointer transition-all ${
                          answers['NB3c'] === opt
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-amber-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NB1: 16px, 24px, 32px */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <p className="font-bold text-slate-900 text-xs">
                    NB1. Ở cỡ này, Anh/Chị có nhận ra đây là biểu trưng vừa xem không?
                  </p>
                  {[
                    { id: 'NB1_16', img: 'NB1-16', label: '16 px' },
                    { id: 'NB1_24', img: 'NB1-24', label: '24 px' },
                    { id: 'NB1_32', img: 'NB1-32', label: '32 px' },
                  ].map((sz) => (
                    <div key={sz.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-500 w-12">{sz.label}</span>
                        {renderSurveyImage(sz.img, undefined, true)}
                      </div>
                      <div className="flex gap-2">
                        {['Nhận ra', 'Không nhận ra'].map((ans) => (
                          <button
                            key={ans}
                            type="button"
                            onClick={() => handleSetAnswer(sz.id, ans)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              answers[sz.id] === ans
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {ans}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* NB2 */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <p className="font-bold text-slate-900 text-xs">
                    NB2. Ở ảnh này, Anh/Chị có nhận ra biểu trưng của Liên đoàn không?
                  </p>
                  {[
                    { id: 'NB2_30', img: 'NB2-30', label: 'Khoảng cách 30 m' },
                    { id: 'NB2_20', img: 'NB2-20', label: 'Khoảng cách 20 m' },
                    { id: 'NB2_10', img: 'NB2-10', label: 'Khoảng cách 10 m' },
                  ].map((dist) => (
                    <div key={dist.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">{dist.label}</span>
                      <div className="max-w-[360px] mx-auto">
                        {renderSurveyImage(dist.img, undefined, true)}
                      </div>
                      <div className="flex justify-center gap-2 pt-1">
                        {['Nhận ra', 'Không nhận ra'].map((ans) => (
                          <button
                            key={ans}
                            type="button"
                            onClick={() => handleSetAnswer(dist.id, ans)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              answers[dist.id] === ans
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {ans}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen('part-d')}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
                  >
                    Tiếp tục sang Đánh giá bộ nhận diện <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PHẦN D (PHIẾU 3: CÂU HỎI MỞ, PHIẾU 4: ĐÁNH GIÁ)           */}
        {/* ======================================================== */}
        {currentScreen === 'part-d' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            
            {/* PHIẾU 3: PHẦN D CÂU HỎI MỞ */}
            {selectedGroupCode === 'QT-LD' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-950 uppercase">
                    PHẦN D. CÂU HỎI MỞ
                  </h2>
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-slate-900 text-xs">
                    Nếu chỉ được thay đổi một điều trong bộ nhận diện này, Anh/Chị sẽ thay đổi điều gì? Vì sao?
                  </label>
                  <textarea
                    rows={4}
                    value={openAnswers['D_OPEN'] || ''}
                    onChange={(e) => setOpenAnswers(prev => ({ ...prev, D_OPEN: e.target.value }))}
                    placeholder="Nhập ý kiến của Anh/Chị..."
                    className="w-full text-xs p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (consent3) {
                        setCurrentScreen('interview');
                      } else {
                        handleSubmitSurvey();
                      }
                    }}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
                  >
                    {consent3 ? (
                      <>Tiếp tục phỏng vấn ngắn <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi kết quả...</> : 'Hoàn thành và gửi phiếu'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* PHIẾU 4: PHẦN D ĐÁNH GIÁ BỘ NHẬN DIỆN */}
            {selectedGroupCode === 'CD-TH' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-950 uppercase">
                    PHẦN D. ĐÁNH GIÁ BỘ NHẬN DIỆN
                  </h2>
                </div>

                {/* D6 */}
                <div className="space-y-3">
                  {renderSurveyImage('H1a', 'H1a. Biểu trưng chính, bản màu, không chú thích')}
                  <p className="font-bold text-slate-900 text-xs">
                    D6. Khi nhìn biểu trưng chính, Anh/Chị nhận ra hình nào trước tiên?
                  </p>
                  <div className="space-y-2 text-xs">
                    {['Lân', 'Rồng', 'Cả hai cùng lúc', 'Không nhận ra hình linh vật', 'Không đủ cơ sở đánh giá'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="d6_th"
                          checked={answers['D6'] === opt}
                          onChange={() => handleSetAnswer('D6', opt)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Ghi chú (không bắt buộc)..."
                    value={notes['D6'] || ''}
                    onChange={(e) => handleSetNote('D6', e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                {/* D7 */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {renderSurveyImage('H1', 'H1. Biểu trưng chính và phân vai lân - rồng - sư (Hình 3.8)')}
                  <p className="font-bold text-slate-900 text-xs">
                    D7. Cách phân vai trong biểu trưng (lân ở trung tâm, rồng bao quanh) phù hợp ở mức nào với hoạt động của Liên đoàn?
                  </p>
                  {renderSemanticScale('D7', 'Không phù hợp', 'Rất phù hợp')}
                </div>

                {/* D8 */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {renderSurveyImage('H1', 'H1 (Hình 3.8)')}
                    {renderSurveyImage('H2', 'H2. Biến thể (Hình 3.9)')}
                    {renderSurveyImage('H8', 'H8 (Hình 3.15)')}
                    {renderSurveyImage('H9', 'H9 (Hình 3.16)')}
                    {renderSurveyImage('H10', 'H10. Vinh danh (Hình 3.17)')}
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    D8. Bộ nhận diện đại diện cho cả ba loại hình lân, sư, rồng của Liên đoàn ở mức nào?
                  </p>
                  {renderSemanticScale('D8')}
                </div>

                {/* D9 */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {renderSurveyImage('H2', 'H2. Biến thể và huy hiệu (Hình 3.9)')}
                    {renderSurveyImage('H3', 'H3. Cỡ thu nhỏ (Hình 3.7)')}
                    {renderSurveyImage('H8', 'H8. Thẻ đeo (Hình 3.15)')}
                    {renderSurveyImage('H11', 'H11. Ảnh đại diện (Hình 3.18)')}
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    D9. Ở cỡ nhỏ (huy hiệu, thẻ đeo, ảnh đại diện mạng xã hội), biểu trưng còn nhận ra được ở mức nào?
                  </p>
                  {renderSemanticScale('D9')}
                </div>

                {/* D10 */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {renderSurveyImage('SO-SANH', 'SO-SANH. Biểu trưng đề xuất đặt cạnh 5 biểu trưng liên đoàn lân sư rồng khác (Hình 2.11b)')}
                  <p className="font-bold text-slate-900 text-xs">
                    D10. So với biểu trưng của các đoàn, câu lạc bộ và liên đoàn lân sư rồng khác, biểu trưng dễ phân biệt ở mức nào?
                  </p>
                  {renderSemanticScale('D10')}
                </div>

                {/* D14 */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {renderSurveyImage('H3', 'H3 (Hình 3.7, 3.10)')}
                    {renderSurveyImage('H8', 'H8 (Hình 3.15)')}
                    {renderSurveyImage('H9', 'H9 (Hình 3.16)')}
                    {renderSurveyImage('H10', 'H10 (Hình 3.17)')}
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    D14. Trước khi gia công (thêu, in, dập nổi), bộ nhận diện cần chỉnh sửa ở mức nào để phù hợp với kỹ thuật và chi phí của Liên đoàn?
                  </p>
                  {renderSemanticScale('D14')}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen('part-e')}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
                  >
                    Tiếp tục sang Câu hỏi mở <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PHẦN E: CÂU HỎI MỞ CHO PHIẾU 4 (CD-TH)                   */}
        {/* ======================================================== */}
        {currentScreen === 'part-e' && selectedGroupCode === 'CD-TH' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-950 uppercase">
                PHẦN E. CÂU HỎI MỞ
              </h2>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-slate-900 text-xs">
                Nếu chỉ được thay đổi một điều trong bộ nhận diện này, Anh/Chị sẽ thay đổi điều gì? Vì sao?
              </label>
              <textarea
                rows={4}
                value={openAnswers['E_OPEN'] || ''}
                onChange={(e) => setOpenAnswers(prev => ({ ...prev, E_OPEN: e.target.value }))}
                placeholder="Nhập ý kiến của Anh/Chị..."
                className="w-full text-xs p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (consent3) {
                    setCurrentScreen('interview');
                  } else {
                    handleSubmitSurvey();
                  }
                }}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
              >
                {consent3 ? (
                  <>Tiếp tục phỏng vấn ngắn <ArrowRight className="w-4 h-4" /></>
                ) : (
                  isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi kết quả...</> : 'Hoàn thành và gửi phiếu'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHỎNG VẤN NGẮN (5 - 10 PHÚT)                             */}
        {/* ======================================================== */}
        {currentScreen === 'interview' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase">
                <MessageSquare className="w-4 h-4" /> Phỏng vấn ngắn (5 - 10 phút)
              </div>
              <h2 className="text-base font-black text-slate-950 uppercase mt-1">
                Ý KIẾN ĐÓNG GÓP CHUYÊN SÂU
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Anh/Chị có thể bấm nút ghi âm giọng nói hoặc nhập nội dung văn bản bên dưới:
              </p>
            </div>

            {/* CÂU HỎI PHỎNG VẤN PHIẾU 1 (CG-MT) */}
            {selectedGroupCode === 'CG-MT' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="font-black text-slate-900 text-xs">
                    Câu 1. Chi tiết nào trong biểu trưng khiến Thầy/Cô liên tưởng, hoặc không liên tưởng, tới lân trong mỹ thuật thời Nguyễn?
                  </p>
                  <VoiceAnswerConversational
                    initialTranscript={interviewAnswers['IV_1']?.text || ''}
                    initialAudioUrl={interviewAnswers['IV_1']?.audioUrl || null}
                    onAudioConfirmed={(audioUrl: string | null, textTranscript: string) => setInterviewAnswers(prev => ({
                      ...prev,
                      IV_1: { text: textTranscript, audioUrl }
                    }))}
                  />
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="font-black text-slate-900 text-xs">
                    Câu 2. Phần diễn giải ý nghĩa và tham chiếu màu (sơn son thếp vàng, men lam, khảm sành sứ) trong sổ tay có chỗ nào cần sửa để tránh suy diễn?
                  </p>
                  <VoiceAnswerConversational
                    initialTranscript={interviewAnswers['IV_2']?.text || ''}
                    initialAudioUrl={interviewAnswers['IV_2']?.audioUrl || null}
                    onAudioConfirmed={(audioUrl: string | null, textTranscript: string) => setInterviewAnswers(prev => ({
                      ...prev,
                      IV_2: { text: textTranscript, audioUrl }
                    }))}
                  />
                </div>
              </div>
            )}

            {/* CÂU HỎI PHỎNG VẤN PHIẾU 2 (CG-TK) */}
            {selectedGroupCode === 'CG-TK' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="font-black text-slate-900 text-xs">
                    Câu 1. Nếu nhận triển khai sản xuất bộ nhận diện này, Anh/Chị sẽ phải sửa gì trước tiên?
                  </p>
                  <VoiceAnswerConversational
                    initialTranscript={interviewAnswers['IV_1']?.text || ''}
                    initialAudioUrl={interviewAnswers['IV_1']?.audioUrl || null}
                    onAudioConfirmed={(audioUrl: string | null, textTranscript: string) => setInterviewAnswers(prev => ({
                      ...prev,
                      IV_1: { text: textTranscript, audioUrl }
                    }))}
                  />
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="font-black text-slate-900 text-xs">
                    Câu 2. Quy chuẩn nào trong sổ tay còn thiếu để người không chuyên tự áp dụng đúng?
                  </p>
                  <VoiceAnswerConversational
                    initialTranscript={interviewAnswers['IV_2']?.text || ''}
                    initialAudioUrl={interviewAnswers['IV_2']?.audioUrl || null}
                    onAudioConfirmed={(audioUrl: string | null, textTranscript: string) => setInterviewAnswers(prev => ({
                      ...prev,
                      IV_2: { text: textTranscript, audioUrl }
                    }))}
                  />
                </div>
              </div>
            )}

            {/* CÂU HỎI PHỎNG VẤN PHIẾU 3 (QT-LD) */}
            {selectedGroupCode === 'QT-LD' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="font-black text-slate-900 text-xs">
                    Câu 1. Khi áp dụng bộ nhận diện, Liên đoàn dự kiến gặp trở ngại gì (chi phí, thói quen dùng logo cũ, quản lý đơn vị thành viên)?
                  </p>
                  <VoiceAnswerConversational
                    initialTranscript={interviewAnswers['IV_1']?.text || ''}
                    initialAudioUrl={interviewAnswers['IV_1']?.audioUrl || null}
                    onAudioConfirmed={(audioUrl: string | null, textTranscript: string) => setInterviewAnswers(prev => ({
                      ...prev,
                      IV_1: { text: textTranscript, audioUrl }
                    }))}
                  />
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="font-black text-slate-900 text-xs">
                    Câu 2. Ai sẽ quản lý việc sử dụng bộ nhận diện, và Liên đoàn dự kiến áp dụng theo thứ tự nào?
                  </p>
                  <VoiceAnswerConversational
                    initialTranscript={interviewAnswers['IV_2']?.text || ''}
                    initialAudioUrl={interviewAnswers['IV_2']?.audioUrl || null}
                    onAudioConfirmed={(audioUrl: string | null, textTranscript: string) => setInterviewAnswers(prev => ({
                      ...prev,
                      IV_2: { text: textTranscript, audioUrl }
                    }))}
                  />
                </div>
              </div>
            )}

            {/* CÂU HỎI PHỎNG VẤN PHIẾU 4 (CD-TH) */}
            {selectedGroupCode === 'CD-TH' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="font-black text-slate-900 text-xs">
                    Câu 1. Khi in, thêu hoặc dùng trên trang phục, cờ, đạo cụ, Anh/Chị dự đoán khó khăn gì?
                  </p>
                  <VoiceAnswerConversational
                    initialTranscript={interviewAnswers['IV_1']?.text || ''}
                    initialAudioUrl={interviewAnswers['IV_1']?.audioUrl || null}
                    onAudioConfirmed={(audioUrl: string | null, textTranscript: string) => setInterviewAnswers(prev => ({
                      ...prev,
                      IV_1: { text: textTranscript, audioUrl }
                    }))}
                  />
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="font-black text-slate-900 text-xs">
                    Câu 2. So với cách đoàn của Anh/Chị đang thể hiện hình ảnh hiện nay, bộ nhận diện này khác ở điểm nào?
                  </p>
                  <VoiceAnswerConversational
                    initialTranscript={interviewAnswers['IV_2']?.text || ''}
                    initialAudioUrl={interviewAnswers['IV_2']?.audioUrl || null}
                    onAudioConfirmed={(audioUrl: string | null, textTranscript: string) => setInterviewAnswers(prev => ({
                      ...prev,
                      IV_2: { text: textTranscript, audioUrl }
                    }))}
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmitSurvey}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu dữ liệu...</>
                ) : (
                  <>Hoàn thành & Gửi toàn bộ phiếu <Check className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MÀN HÌNH CẢM ƠN VÀ KẾT THÚC SỚM (THANK YOU EARLY)        */}
        {/* ======================================================== */}
        {currentScreen === 'thank-you-early' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto text-2xl font-bold">
              🤝
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-slate-950">
                Chân thành cảm ơn Quý Ông/Bà, Anh/Chị!
              </h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                Theo tiêu chí độc lập và phạm vi nghiên cứu của vòng kiểm chứng, lượt tham gia này đã được ghi nhận và kết thúc.
              </p>
              <p className="text-xs text-slate-500 font-semibold">
                Kính chúc Quý Ông/Bà, Anh/Chị nhiều sức khỏe và thành công!
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MÀN HÌNH NỘP THÀNH CÔNG (SUCCESS)                        */}
        {/* ======================================================== */}
        {currentScreen === 'success' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono text-xs font-black">
                MÃ: {participantCode}
              </span>
              <h2 className="text-lg font-black text-slate-950">
                Gửi Phiếu Đánh Giá Thành Công!
              </h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                Những ý kiến đóng góp quý báu của Thầy/Cô, Anh/Chị sẽ là cơ sở khoa học quan trọng để hoàn thiện đề án thạc sĩ và bộ nhận diện thương hiệu cho Liên đoàn Lân Sư Rồng Việt Nam.
              </p>
              <p className="text-xs font-bold text-amber-700 italic pt-2">
                Em xin trân trọng cảm ơn Thầy/Cô và Anh/Chị!
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
