import React, { useState, useEffect } from 'react';
import { Participant, BrandSurveySubmission } from '../../types';
import {
  THESIS_METADATA,
  SURVEY_GROUPS,
  LIKERT_SCALE_OPTIONS,
  COMMON_LIKERT_QUESTIONS,
  GROUP_LIKERT_QUESTIONS,
  INTERVIEW_QUESTIONS,
} from '../../data/surveyData';
import { BrandSurveyService } from '../../services/surveyService';
import { AccessibilityMenu, AccessibilitySettings } from '../conversational/AccessibilityMenu';
import { VoiceAnswerConversational } from '../conversational/VoiceAnswerConversational';
import {
  ChevronLeft, ClipboardCheck, Volume2, Info, Check, AlertCircle,
  ShieldCheck, HelpCircle, CheckSquare, MessageSquare, Play
} from 'lucide-react';

interface BrandSurveyRespondentProps {
  onBackToAdmin?: () => void;
}

type FlowStep = 'welcome' | 'info' | 'consent' | 'common-likert' | 'group-likert' | 'interview' | 'review' | 'success';

export const BrandSurveyRespondent: React.FC<BrandSurveyRespondentProps> = ({
  onBackToAdmin,
}) => {
  // Stepper state
  const [step, setStep] = useState<FlowStep>('welcome');
  
  // Participant Info state
  const [selectedGroup, setSelectedGroup] = useState<string>('QT-LĐ');
  const [participantCode, setParticipantCode] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [titleUnit, setTitleUnit] = useState<string>('');
  const [participationForm, setParticipationForm] = useState<'Bảng hỏi khảo sát' | 'Phỏng vấn' | 'Cả hai hình thức'>('Cả hai hình thức');
  
  // Consent state
  const [consentInfo, setConsentInfo] = useState(false);
  const [consentData, setConsentData] = useState(false);
  const [consentCitation, setConsentCitation] = useState(false);
  const [consentRecord, setConsentRecord] = useState<'yes' | 'no' | 'na'>('yes');
  
  // Question indexing
  const [commonIndex, setCommonIndex] = useState(0);
  const [groupIndex, setGroupIndex] = useState(0);
  const [interviewIndex, setInterviewIndex] = useState(0);

  // Answers State
  const [likertAnswers, setLikertAnswers] = useState<Record<string, any>>({});
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, { text: string; audioUrl: string | null }>>({});

  // UI Interactive States
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState(false);
  const [accessSettings, setAccessSettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    highContrast: false,
    voiceGuides: false,
  });

  // Dynamically update participant code on group select
  useEffect(() => {
    let active = true;
    const fetchCode = async () => {
      const code = await BrandSurveyService.getNextParticipantCode(selectedGroup);
      if (active) {
        setParticipantCode(code);
      }
    };
    fetchCode();
    return () => {
      active = false;
    };
  }, [selectedGroup]);

  // Reset participation form if group is KG-ĐT
  useEffect(() => {
    if (selectedGroup === 'KG-ĐT') {
      setParticipationForm('Bảng hỏi khảo sát');
    }
  }, [selectedGroup]);

  // Sync consentRecord options with participation form
  useEffect(() => {
    if (participationForm === 'Bảng hỏi khảo sát') {
      setConsentRecord('na');
    } else {
      setConsentRecord('yes');
    }
  }, [participationForm]);

  // Read question text out loud
  const readTextAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.onstart = () => setActiveSpeech(true);
      utterance.onend = () => setActiveSpeech(false);
      utterance.onerror = () => setActiveSpeech(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const isInterviewEligible = () => {
    return selectedGroup !== 'KG-ĐT' && (participationForm === 'Phỏng vấn' || participationForm === 'Cả hai hình thức');
  };

  const isLikertEligible = () => {
    return participationForm === 'Bảng hỏi khảo sát' || participationForm === 'Cả hai hình thức';
  };

  // Stepper calculations
  const getStepsCount = () => {
    let steps = 3; // welcome (1), info (2), consent (3)
    if (isLikertEligible()) {
      steps += 2; // common (4), group (5)
    }
    if (isInterviewEligible()) {
      steps += 1; // interview (6)
    }
    steps += 1; // review (7)
    return steps;
  };

  const getCurrentStepIndex = () => {
    if (step === 'welcome') return 1;
    if (step === 'info') return 2;
    if (step === 'consent') return 3;
    
    let current = 3;
    if (isLikertEligible()) {
      if (step === 'common-likert') return current + 1;
      current += 1; // common done
      if (step === 'group-likert') return current + 1;
      current += 1; // group done
    }
    if (isInterviewEligible()) {
      if (step === 'interview') return current + 1;
      current += 1; // interview done
    }
    if (step === 'review') return current + 1;
    return getStepsCount();
  };

  const renderProgressBar = () => {
    const total = getStepsCount();
    const current = getCurrentStepIndex();
    const percent = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * 12);
    const empty = 12 - filled;
    return `Bước ${current} / ${total} [${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percent}%`;
  };

  // Navigations
  const handleWelcomeNext = () => {
    setValidationError(null);
    setStep('info');
  };

  const handleInfoNext = () => {
    setValidationError(null);
    setStep('consent');
  };

  const handleConsentNext = () => {
    if (!consentInfo || !consentData || !consentCitation) {
      setValidationError('Vui lòng chọn đầy đủ các ô xác nhận đồng thuận tham gia và cách trích dẫn ý kiến trước khi bắt đầu.');
      return;
    }
    setValidationError(null);

    // Dynamic routing based on participation choice
    if (isLikertEligible()) {
      setStep('common-likert');
      setCommonIndex(0);
    } else if (isInterviewEligible()) {
      setStep('interview');
      setInterviewIndex(0);
    } else {
      setStep('review');
    }
  };

  const handleCommonNext = () => {
    const q = COMMON_LIKERT_QUESTIONS[commonIndex];
    const ans = likertAnswers[q.id];

    if (ans === undefined) {
      setValidationError('Vui lòng trả lời câu hỏi này trước khi tiếp tục.');
      return;
    }

    setValidationError(null);
    if (commonIndex < COMMON_LIKERT_QUESTIONS.length - 1) {
      setCommonIndex(commonIndex + 1);
    } else {
      setStep('group-likert');
      setGroupIndex(0);
    }
  };

  const handleCommonBack = () => {
    setValidationError(null);
    if (commonIndex > 0) {
      setCommonIndex(commonIndex - 1);
    } else {
      setStep('consent');
    }
  };

  const handleGroupNext = () => {
    const questions = GROUP_LIKERT_QUESTIONS[selectedGroup] || [];
    const q = questions[groupIndex];
    const ans = likertAnswers[q.id];

    if (q.type === 'likert') {
      if (ans === undefined) {
        setValidationError('Vui lòng trả lời câu hỏi này trước khi tiếp tục.');
        return;
      }
    } else if (q.type === 'checkbox') {
      const selectedList = (ans as string[]) || [];
      
      // Check min selection count
      if (q.minSelect && selectedList.length < q.minSelect) {
        setValidationError(`Vui lòng chọn tối thiểu ${q.minSelect} phương án để tiếp tục.`);
        return;
      }
      
      // Check max selection count
      if (q.maxSelect && selectedList.length > q.maxSelect) {
        setValidationError(`Vui lòng chỉ chọn tối đa ${q.maxSelect} phương án.`);
        return;
      }

      // Check if "Khác" checkbox is selected and make sure the text input is filled
      if (selectedList.includes('Khác')) {
        const otherText = ((likertAnswers[q.id + '_other'] as string) || '').trim();
        if (!otherText) {
          setValidationError('Vui lòng nhập nội dung chi tiết cho lựa chọn "Khác".');
          return;
        }
      }
    } else if (q.type === 'textarea') {
      if (q.required && !((ans as string) || '').trim()) {
        setValidationError('Vui lòng nhập câu trả lời của bạn.');
        return;
      }
    }

    setValidationError(null);
    if (groupIndex < questions.length - 1) {
      setGroupIndex(groupIndex + 1);
    } else {
      if (isInterviewEligible()) {
        setStep('interview');
        setInterviewIndex(0);
      } else {
        setStep('review');
      }
    }
  };

  const handleGroupBack = () => {
    setValidationError(null);
    if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
    } else {
      setStep('common-likert');
      setCommonIndex(COMMON_LIKERT_QUESTIONS.length - 1);
    }
  };

  const handleInterviewNext = () => {
    const questions = INTERVIEW_QUESTIONS[selectedGroup] || [];
    const q = questions[interviewIndex];
    const ans = interviewAnswers[q.id];

    const hasText = ans && ans.text && ans.text.trim().length > 0;
    const hasAudio = ans && ans.audioUrl && ans.audioUrl.trim().length > 0;

    if (!hasText && !hasAudio) {
      setValidationError('Vui lòng nhập ý kiến đóng góp bằng chữ hoặc ghi âm câu trả lời trước khi tiếp tục.');
      return;
    }

    setValidationError(null);
    if (interviewIndex < questions.length - 1) {
      setInterviewIndex(interviewIndex + 1);
    } else {
      setStep('review');
    }
  };

  const handleInterviewBack = () => {
    setValidationError(null);
    if (interviewIndex > 0) {
      setInterviewIndex(interviewIndex - 1);
    } else {
      if (isLikertEligible()) {
        const questions = GROUP_LIKERT_QUESTIONS[selectedGroup] || [];
        setStep('group-likert');
        setGroupIndex(questions.length - 1);
      } else {
        setStep('consent');
      }
    }
  };

  const handleReviewBack = () => {
    setValidationError(null);
    if (isInterviewEligible()) {
      const questions = INTERVIEW_QUESTIONS[selectedGroup] || [];
      setStep('interview');
      setInterviewIndex(questions.length - 1);
    } else if (isLikertEligible()) {
      const questions = GROUP_LIKERT_QUESTIONS[selectedGroup] || [];
      setStep('group-likert');
      setGroupIndex(questions.length - 1);
    } else {
      setStep('consent');
    }
  };

  const handleAnswerLikert = (qId: string, val: any) => {
    setLikertAnswers((prev) => ({ ...prev, [qId]: val }));
    setValidationError(null);
  };

  const handleInterviewResponse = (qId: string, text: string, audioUrl: string | null) => {
    setInterviewAnswers((prev) => ({
      ...prev,
      [qId]: { text, audioUrl },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setValidationError(null);

    try {
      // 1. Upload any recorded audio in interviewAnswers
      const uploadedInterviewAnswers = { ...interviewAnswers };
      
      for (const qId of Object.keys(uploadedInterviewAnswers)) {
        const ans = uploadedInterviewAnswers[qId];
        if (ans && ans.audioUrl && ans.audioUrl.startsWith('blob:')) {
          try {
            // Fetch blob from the local blob URL
            const res = await fetch(ans.audioUrl);
            const blob = await res.blob();
            
            // Upload to Supabase Storage
            const fileName = `${participantCode}_${qId}.wav`;
            const publicUrl = await BrandSurveyService.uploadAudio(fileName, blob);
            
            if (publicUrl) {
              uploadedInterviewAnswers[qId] = {
                ...ans,
                audioUrl: publicUrl
              };
            }
          } catch (uploadError) {
            console.error(`Failed to upload audio for ${qId}:`, uploadError);
          }
        }
      }

      // 2. Construct database ready schema object
      const finalParticipant: Participant = {
        id: `p-${Date.now()}`,
        code: participantCode,
        groupCode: selectedGroup,
        fullName: fullName.trim() || undefined,
        titleUnit: titleUnit.trim() || undefined,
        participationForm: participationForm,
        consentAgreed: true,
        consentRecord: isInterviewEligible() ? (consentRecord === 'yes') : null,
        createdAt: new Date().toLocaleString('vi-VN'),
      };

      const submission: BrandSurveySubmission = {
        id: `sub-${Date.now()}`,
        participant: finalParticipant,
        likertAnswers,
        interviewAnswers: uploadedInterviewAnswers,
        submittedAt: new Date().toLocaleString('vi-VN'),
      };

      // 3. Save submission
      await BrandSurveyService.saveSubmission(submission);
      setStep('success');
    } catch (e) {
      console.error('Submission failed:', e);
      setValidationError('Đã xảy ra lỗi khi gửi khảo sát. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Accessibility styling helpers
  const getContainerStyles = () => {
    let classes = 'min-h-screen py-8 px-4 flex flex-col justify-between max-w-xl mx-auto ';
    if (accessSettings.highContrast) {
      classes += 'bg-white text-black ';
    } else {
      classes += 'bg-slate-50 text-slate-800 ';
    }
    return classes;
  };

  const getCardStyles = () => {
    if (accessSettings.highContrast) {
      return 'bg-white border-4 border-black p-5 rounded-none shadow-none ';
    }
    return 'bg-white border border-slate-200 p-5 md:p-6 rounded-3xl shadow-xs ';
  };

  const getFontSizeClass = () => {
    switch (accessSettings.fontSize) {
      case 'large': return 'text-lg';
      case 'extra-large': return 'text-xl';
      default: return 'text-sm';
    }
  };

  const getQuestionSizeClass = () => {
    switch (accessSettings.fontSize) {
      case 'large': return 'text-2xl';
      case 'extra-large': return 'text-3xl';
      default: return 'text-xl';
    }
  };

  const renderQuestionText = (fullText: string) => {
    const parts = fullText.split('\n').map((p) => p.trim()).filter(Boolean);
    const mainQuestion = parts[0];
    const subQuestion = parts[1];

    return (
      <div className="space-y-2">
        <span className={`block font-black text-slate-950 leading-snug tracking-tight ${getQuestionSizeClass()}`}>
          {mainQuestion}
        </span>
        {subQuestion && (
          <span className="block font-normal text-[11px] md:text-xs text-slate-500 leading-relaxed">
            {subQuestion}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={getContainerStyles()}>
      
      {/* 1. Universal Top Header Title */}
      {step !== 'success' && (
        <div className="text-center space-y-4 mb-5 shrink-0">
          <span className="inline-block text-[10px] font-black uppercase text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full border border-slate-200/80">
            Nghiên cứu khoa học mỹ thuật
          </span>
          <h1 className="text-sm font-black text-slate-900 leading-normal max-w-md mx-auto">
            {THESIS_METADATA.websiteTitle}
          </h1>
          {step !== 'welcome' && (
            <div className="font-mono text-xs text-slate-450 font-bold border-t border-slate-100 pt-1.5 mt-2">
              {renderProgressBar()}
            </div>
          )}
        </div>
      )}

      {/* 2. Primary Page Stepper Canvas */}
      <div className="flex-1 flex flex-col justify-center">

        {/* LEVEL 1: GIỚI THIỆU (Welcome Screen) */}
        {step === 'welcome' && (
          <div className="space-y-4">
            
            {/* Header info card */}
            <div className={getCardStyles() + ' space-y-4'}>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="h-5.5 w-5.5 text-amber-500" />
                <h2 className="text-sm font-black text-slate-900 uppercase">
                  {THESIS_METADATA.headerTitle}
                </h2>
              </div>

              {/* Research specifics */}
              <div className="space-y-3.5 text-xs text-slate-655 font-semibold leading-relaxed">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Tên đề tài luận văn:</span>
                  <span className="text-slate-900 font-extrabold italic">{THESIS_METADATA.thesisName}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Học viên thực hiện:</span>
                    <span className="text-slate-900 font-extrabold">{THESIS_METADATA.studentName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Cơ sở đào tạo:</span>
                    <span className="text-slate-900 font-extrabold">{THESIS_METADATA.institution}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl space-y-1.5 text-slate-550 font-medium">
                  {THESIS_METADATA.instructions.map((inst, i) => (
                    <p key={i}>• {inst}</p>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-400">Email:</span> <a href={`mailto:${THESIS_METADATA.contact.email}`} className="text-indigo-650 font-bold underline">{THESIS_METADATA.contact.email}</a>
                  </div>
                  <div>
                    <span className="text-slate-400">Điện thoại:</span> <span className="text-slate-950 font-extrabold">{THESIS_METADATA.contact.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ready Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleWelcomeNext}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 select-none"
              >
                Sẵn sàng →
              </button>
            </div>
          </div>
        )}

        {/* LEVEL 2: THÔNG TIN NGƯỜI THAM GIA */}
        {step === 'info' && (
          <div className="space-y-4">
            
            <div className={getCardStyles() + ' space-y-4'}>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Info className="h-5 w-5 text-slate-500" />
                <h3 className="text-xs font-black uppercase text-slate-900">Thông tin người tham gia</h3>
              </div>

              <div className="space-y-4 text-sm font-semibold">
                
                {/* 5 Participant Groups Radio layout */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Nhóm đối tượng tham gia *</label>
                  <div className="flex flex-col gap-2">
                    {SURVEY_GROUPS.map((gp) => (
                      <label
                        key={gp.code}
                        className={`flex items-center gap-2.5 p-3.5 border-2 rounded-2xl cursor-pointer transition-all active:scale-[0.99] ${
                          selectedGroup === gp.code
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="participantGroup"
                          checked={selectedGroup === gp.code}
                          onChange={() => setSelectedGroup(gp.code)}
                          className="h-4.5 w-4.5 accent-amber-500"
                        />
                        <div className="leading-tight text-xs font-extrabold">
                          {gp.name} <span className="opacity-80 font-mono">({gp.code})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Auto Generated Code display */}
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl text-center">
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Mã người tham gia (Tự động):</span>
                  <span className="block text-xl font-black text-slate-950 mt-0.5">{participantCode}</span>
                </div>

                {/* Optional fields - Horizontally aligned labels using grid alignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 min-h-[2.5rem] flex items-end pb-1">
                      Họ và tên (Không bắt buộc)
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="min-h-12 w-full border border-slate-250 px-4 rounded-xl text-xs font-bold text-slate-900 bg-white outline-none focus:border-slate-800"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 min-h-[2.5rem] flex items-end pb-1">
                      Chức danh / Đơn vị (Không bắt buộc)
                    </label>
                    <input
                      type="text"
                      value={titleUnit}
                      onChange={(e) => setTitleUnit(e.target.value)}
                      placeholder="Võ sư / Nhà nghiên cứu..."
                      className="min-h-12 w-full border border-slate-250 px-4 rounded-xl text-xs font-bold text-slate-900 bg-white outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                {/* Participation form selection */}
                <div className="space-y-2 pt-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Hình thức tham gia *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { value: 'Bảng hỏi khảo sát', label: 'Bảng hỏi khảo sát' },
                      { value: 'Phỏng vấn', label: 'Phỏng vấn', disabled: selectedGroup === 'KG-ĐT' },
                      { value: 'Cả hai hình thức', label: 'Cả hai hình thức', disabled: selectedGroup === 'KG-ĐT' }
                    ].map((item) => (
                      <label
                        key={item.value}
                        className={`flex items-center gap-2 p-3 border-2 rounded-2xl cursor-pointer transition-all ${
                          item.disabled
                            ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400'
                            : participationForm === item.value
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="participationForm"
                          value={item.value}
                          disabled={item.disabled}
                          checked={participationForm === item.value}
                          onChange={() => setParticipationForm(item.value as any)}
                          className="h-4 w-4 accent-amber-500"
                        />
                        <span className="text-xs font-extrabold leading-none">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  {selectedGroup === 'KG-ĐT' && (
                    <p className="text-[10px] text-amber-600 font-bold">
                      * Nhóm Công chúng, khán giả (KG-ĐT) chỉ áp dụng hình thức Bảng hỏi khảo sát.
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* Nav buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="w-2/5 h-13 bg-white border border-slate-250 text-slate-750 font-extrabold text-sm rounded-2xl cursor-pointer hover:bg-slate-50 active:scale-97 select-none"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleInfoNext}
                className="w-3/5 h-13 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-sm"
              >
                Tiếp tục →
              </button>
            </div>
          </div>
        )}

        {/* LEVEL 3: XÁC NHẬN ĐỒNG THUẬN */}
        {step === 'consent' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            <div className={getCardStyles() + ' space-y-4'}>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckSquare className="h-5 w-5 text-slate-500" />
                <h3 className="text-xs font-black uppercase text-slate-900">Xác nhận đồng thuận</h3>
              </div>

              {/* Validation warning */}
              {validationError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold animate-shake">
                  <AlertCircle className="h-4.5 w-4.5 text-red-655 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-3.5 text-xs text-slate-655 font-semibold leading-relaxed">
                
                {/* 1. Study consent check */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentInfo}
                    onChange={(e) => setConsentInfo(e.target.checked)}
                    className="h-4.5 w-4.5 shrink-0 mt-0.5"
                  />
                  <span>Tôi xác nhận đã được thông tin về mục đích nghiên cứu và tự nguyện tham gia. *</span>
                </label>

                {/* 2. Data consent check */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentData}
                    onChange={(e) => setConsentData(e.target.checked)}
                    className="h-4.5 w-4.5 shrink-0 mt-0.5"
                  />
                  <span>Tôi đồng ý để dữ liệu được sử dụng cho luận văn dưới dạng mã hóa. *</span>
                </label>

                {/* 3. Citation method check (New requirement) */}
                <label className="flex items-start gap-2.5 cursor-pointer border-b border-slate-100 pb-3.5">
                  <input
                    type="checkbox"
                    checked={consentCitation}
                    onChange={(e) => setConsentCitation(e.target.checked)}
                    className="h-4.5 w-4.5 shrink-0 mt-0.5"
                  />
                  <span>Cách trích dẫn ý kiến: Chỉ sử dụng dữ liệu tổng hợp, không trích dẫn trực tiếp *</span>
                </label>

                {/* 4. Microphone Recording Consent */}
                {participationForm !== 'Bảng hỏi khảo sát' && selectedGroup !== 'KG-ĐT' ? (
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl space-y-2 mt-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450">Tùy chọn ghi âm phỏng vấn:</span>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="consentRecord"
                          checked={consentRecord === 'yes'}
                          onChange={() => setConsentRecord('yes')}
                          className="h-4.5 w-4.5"
                        />
                        <span className="text-slate-800 font-bold">Tôi đồng ý cho ghi âm phỏng vấn.</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="consentRecord"
                          checked={consentRecord === 'no'}
                          onChange={() => setConsentRecord('no')}
                          className="h-4.5 w-4.5"
                        />
                        <span className="text-slate-800 font-bold">Tôi không đồng ý cho ghi âm phỏng vấn.</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/50 space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450">Tùy chọn ghi âm phỏng vấn:</span>
                    <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                      <input
                        type="radio"
                        readOnly
                        checked={consentRecord === 'na'}
                        className="h-4.5 w-4.5"
                      />
                      <span className="text-slate-500 font-bold">Không áp dụng, tôi chỉ tham gia bảng hỏi.</span>
                    </label>
                  </div>
                )}

              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="w-2/5 h-13 bg-white border border-slate-250 text-slate-750 font-extrabold text-sm rounded-2xl cursor-pointer hover:bg-slate-50 active:scale-97 select-none"
              >
                Quay lại
              </button>
              
              <button
                type="button"
                onClick={handleConsentNext}
                className="w-3/5 h-13 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-sm"
              >
                Bắt đầu khảo sát →
              </button>
            </div>
          </div>
        )}

        {/* STEP B: COMMON LIKERT STEPPER QUESTIONS */}
        {step === 'common-likert' && COMMON_LIKERT_QUESTIONS[commonIndex] && (
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-700 tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-150 w-fit">
              <span>Phần A · Khảo sát ý kiến chung ({commonIndex + 1} / {COMMON_LIKERT_QUESTIONS.length})</span>
            </div>

            {/* Error alerts */}
            {validationError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold animate-shake">
                <AlertCircle className="h-4.5 w-4.5 text-red-655 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Questionnaire card */}
            <div className={getCardStyles() + ' space-y-6'}>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h3>
                    {renderQuestionText(COMMON_LIKERT_QUESTIONS[commonIndex].text)}
                  </h3>

                  <button
                    type="button"
                    onClick={() => readTextAloud(COMMON_LIKERT_QUESTIONS[commonIndex].text)}
                    className="p-2 border border-slate-200 hover:bg-slate-100 rounded-full shrink-0 text-slate-500 cursor-pointer active:scale-95"
                    title="Đọc câu hỏi"
                  >
                    <Volume2 className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="border-b border-slate-150 pb-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  <span>🔊 Nhấn loa để nghe đọc câu hỏi</span>
                </div>
              </div>

              {/* Horizontal Emoji Options List */}
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2.5">
                  {LIKERT_SCALE_OPTIONS.map((opt) => {
                    const isSelected = likertAnswers[COMMON_LIKERT_QUESTIONS[commonIndex].id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAnswerLikert(COMMON_LIKERT_QUESTIONS[commonIndex].id, opt.value)}
                        className={`py-3.5 px-1 border-2 rounded-2xl flex flex-col items-center justify-between min-h-24 text-center cursor-pointer transition-all active:scale-[0.93] ${
                          accessSettings.highContrast
                            ? isSelected
                              ? 'bg-black border-black text-white'
                              : 'bg-white border-black text-black'
                            : isSelected
                            ? 'bg-indigo-50 border-indigo-650 text-indigo-950 ring-4 ring-indigo-100 shadow-sm scale-[1.06]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-3xl leading-none">{opt.emoji}</span>
                        <span className="text-[10px] font-bold tracking-tight mt-2 text-slate-500 leading-none">{opt.label}</span>
                        <span className="text-xs font-black font-mono mt-1 leading-none">{opt.value}</span>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Navigation */}
              <div className="border-t border-slate-100 pt-5 mt-6 flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={handleCommonBack}
                  className="px-6 py-3.5 rounded-2xl border border-slate-250 text-slate-750 text-xs font-extrabold hover:bg-slate-50 active:scale-97 select-none"
                >
                  ← Quay lại
                </button>

                <button
                  type="button"
                  onClick={handleCommonNext}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 active:scale-97 select-none"
                >
                  Tiếp tục →
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP C: GROUP-SPECIFIC LIKERT QUESTIONS */}
        {step === 'group-likert' && GROUP_LIKERT_QUESTIONS[selectedGroup]?.[groupIndex] && (
          <div className="space-y-4">
            
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-700 tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-150 w-fit">
              <span>Phần B · Khảo sát theo nhóm {selectedGroup} ({groupIndex + 1} / {GROUP_LIKERT_QUESTIONS[selectedGroup].length})</span>
            </div>

            {/* Error alerts */}
            {validationError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold animate-shake">
                <AlertCircle className="h-4.5 w-4.5 text-red-655 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className={getCardStyles() + ' space-y-6'}>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h3>
                    {renderQuestionText(GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].text)}
                  </h3>

                  <button
                    type="button"
                    onClick={() => readTextAloud(GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].text)}
                    className="p-2 border border-slate-200 hover:bg-slate-100 rounded-full shrink-0 text-slate-500 cursor-pointer active:scale-95"
                  >
                    <Volume2 className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="border-b border-slate-150 pb-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  <span>🔊 Nhấn loa để nghe đọc câu hỏi</span>
                </div>
              </div>

              {/* Questionnaire controls based on type */}
              {GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].type === 'likert' ? (
                /* Horizontal Emoji Options List */
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2.5">
                    {LIKERT_SCALE_OPTIONS.map((opt) => {
                      const isSelected = likertAnswers[GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleAnswerLikert(GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id, opt.value)}
                          className={`py-3.5 px-1 border-2 rounded-2xl flex flex-col items-center justify-between min-h-24 text-center cursor-pointer transition-all active:scale-[0.93] ${
                            accessSettings.highContrast
                              ? isSelected
                                ? 'bg-black border-black text-white'
                                : 'bg-white border-black text-black'
                              : isSelected
                              ? 'bg-indigo-50 border-indigo-650 text-indigo-950 ring-4 ring-indigo-100 shadow-sm scale-[1.06]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-3xl leading-none">{opt.emoji}</span>
                          <span className="text-[10px] font-bold tracking-tight mt-2 text-slate-500 leading-none">{opt.label}</span>
                          <span className="text-xs font-black font-mono mt-1 leading-none">{opt.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].type === 'checkbox' ? (
                /* Checkbox List for Multiple Choices */
                <div className="space-y-3">
                  <div className="flex flex-col gap-2.5">
                    {GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].options?.map((opt) => {
                      const qId = GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id;
                      const selectedList: string[] = (likertAnswers[qId] as string[]) || [];
                      const isChecked = selectedList.includes(opt);

                      const handleCheckboxToggle = () => {
                        let newList = [...selectedList];
                        if (isChecked) {
                          newList = newList.filter((item) => item !== opt);
                        } else {
                          newList.push(opt);
                        }
                        handleAnswerLikert(qId, newList);
                      };

                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 p-3.5 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 active:scale-[0.99] transition-all ${
                            isChecked ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-white text-slate-750'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={handleCheckboxToggle}
                            className="h-4.5 w-4.5 accent-amber-500 rounded-md shrink-0"
                          />
                          <span className="text-xs font-bold leading-tight">{opt}</span>
                        </label>
                      );
                    })}

                    {/* Checkbox item for "Khác" (allowOther) */}
                    {GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].allowOther && (
                      <div className="space-y-2">
                        <label
                          className={`flex items-center gap-3 p-3.5 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 active:scale-[0.99] transition-all ${
                            ((likertAnswers[GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id] as string[]) || []).includes('Khác')
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                              : 'bg-white text-slate-750'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={((likertAnswers[GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id] as string[]) || []).includes('Khác')}
                            onChange={() => {
                              const qId = GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id;
                              const selectedList = (likertAnswers[qId] as string[]) || [];
                              const isChecked = selectedList.includes('Khác');
                              let newList = [...selectedList];
                              if (isChecked) {
                                newList = newList.filter((item) => item !== 'Khác');
                              } else {
                                newList.push('Khác');
                              }
                              handleAnswerLikert(qId, newList);
                            }}
                            className="h-4.5 w-4.5 accent-amber-500 rounded-md shrink-0"
                          />
                          <span className="text-xs font-bold leading-tight font-mono">Khác / Ý kiến bổ sung</span>
                        </label>

                        {/* Text input when "Khác" is checked */}
                        {((likertAnswers[GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id] as string[]) || []).includes('Khác') && (
                          <input
                            type="text"
                            value={(likertAnswers[GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id + '_other'] as string) || ''}
                            onChange={(e) => {
                              const qId = GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id;
                              setLikertAnswers((prev) => ({
                                ...prev,
                                [qId + '_other']: e.target.value
                              }));
                            }}
                            placeholder="Nhập nội dung khác của bạn tại đây..."
                            className="w-full min-h-12 border border-slate-350 px-4 rounded-xl text-xs font-bold text-slate-900 bg-white outline-none focus:border-slate-800"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Min / Max indicator labels */}
                  <div className="text-[10px] text-slate-450 font-bold">
                    {GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].minSelect && (
                      <span className="block text-amber-700">* Yêu cầu chọn tối thiểu {GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].minSelect} phương án.</span>
                    )}
                    {GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].maxSelect && (
                      <span className="block text-blue-700">* Có thể chọn tối đa {GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].maxSelect} phương án.</span>
                    )}
                  </div>
                </div>
              ) : (
                /* Textarea question */
                <div className="space-y-3">
                  <textarea
                    value={(likertAnswers[GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id] as string) || ''}
                    onChange={(e) => handleAnswerLikert(GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id, e.target.value)}
                    rows={6}
                    placeholder="Gõ ý kiến đóng góp của bạn vào đây..."
                    className="w-full p-4 border border-slate-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 leading-relaxed font-semibold text-slate-750 resize-none bg-white"
                  />
                  
                  {/* Textarea voice recording optionally allowed */}
                  {consentRecord === 'yes' && (
                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Ghi âm đóng góp của bạn:
                      </span>
                      <VoiceAnswerConversational
                        key={GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id}
                        onAudioConfirmed={(url, text) => {
                          const prevText = (likertAnswers[GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id] as string) || '';
                          handleAnswerLikert(
                            GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id,
                            text ? `${prevText} [Ghi âm: ${text}]`.trim() : prevText
                          );
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="border-t border-slate-100 pt-5 mt-6 flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={handleGroupBack}
                  className="px-6 py-3.5 rounded-2xl border border-slate-250 text-slate-750 text-xs font-extrabold hover:bg-slate-50 active:scale-97 select-none"
                >
                  ← Quay lại
                </button>

                <button
                  type="button"
                  onClick={handleGroupNext}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 active:scale-97 select-none"
                >
                  Tiếp tục →
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP D: INTERVIEW QUESTIONS (Voice Recorder Panel) */}
        {step === 'interview' && INTERVIEW_QUESTIONS[selectedGroup]?.[interviewIndex] && (
          <div className="space-y-4">
            
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-700 tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-150 w-fit">
              <span>Phần C · Phỏng vấn sâu nhóm {selectedGroup} ({interviewIndex + 1} / {INTERVIEW_QUESTIONS[selectedGroup].length})</span>
            </div>

            {/* Error alerts */}
            {validationError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold animate-shake">
                <AlertCircle className="h-4.5 w-4.5 text-red-655 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className={getCardStyles() + ' space-y-5'}>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h3>
                    {renderQuestionText(INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].text)}
                  </h3>

                  <button
                    type="button"
                    onClick={() => readTextAloud(INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].text)}
                    className="p-2 border border-slate-200 hover:bg-slate-100 rounded-full shrink-0 text-slate-500 cursor-pointer active:scale-95"
                  >
                    <Volume2 className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="border-b border-slate-150 pb-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  <span>🔊 Bấm loa để nghe đọc câu hỏi (Không bắt buộc trả lời)</span>
                </div>
              </div>

              {/* Text answer input */}
              <div className="space-y-3">
                <textarea
                  value={interviewAnswers[INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].id]?.text || ''}
                  onChange={(e) => handleInterviewResponse(
                    INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].id,
                    e.target.value,
                    interviewAnswers[INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].id]?.audioUrl || null
                  )}
                  rows={4}
                  placeholder="Gõ ý kiến đóng góp của bạn vào đây..."
                  className="w-full p-4 border border-slate-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 leading-relaxed font-semibold text-slate-700 resize-none"
                />

                {/* Voice Answering module (if consent given) */}
                {consentRecord === 'yes' && (
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      Ghi âm giọng nói đóng góp phỏng vấn:
                    </span>
                    <VoiceAnswerConversational
                      key={INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].id}
                      onAudioConfirmed={(url, text) => {
                        const prevText = interviewAnswers[INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].id]?.text || '';
                        handleInterviewResponse(
                          INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].id,
                          text ? `${prevText} [Ghi âm: ${text}]`.trim() : prevText,
                          url
                        );
                      }}
                      initialAudioUrl={interviewAnswers[INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].id]?.audioUrl}
                    />
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="border-t border-slate-100 pt-5 mt-6 flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={handleInterviewBack}
                  className="px-6 py-3.5 rounded-2xl border border-slate-250 text-slate-750 text-xs font-extrabold hover:bg-slate-50 active:scale-97 select-none"
                >
                  ← Quay lại
                </button>

                <button
                  type="button"
                  onClick={handleInterviewNext}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 active:scale-97 select-none"
                >
                  {interviewIndex === INTERVIEW_QUESTIONS[selectedGroup].length - 1 ? 'Xem lại phản hồi →' : 'Tiếp tục →'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP E: REVIEW BEFORE SUBMIT */}
        {step === 'review' && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-150 w-fit">
              <span>Kiểm tra phản hồi của bạn</span>
            </div>

            {/* Profile Overview card */}
            <div className={getCardStyles() + ' space-y-4'}>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ClipboardCheck className="h-5 w-5 text-slate-655" />
                <h3 className="text-xs font-black uppercase text-slate-900">Thông tin người tham gia</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Mã người tham gia:</span>
                  <span className="text-slate-900 font-extrabold text-sm">{participantCode}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Nhóm:</span>
                  <span className="text-slate-900 font-extrabold">{SURVEY_GROUPS.find((g) => g.code === selectedGroup)?.name}</span>
                </div>
                {fullName && (
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Họ và tên:</span>
                    <span className="text-slate-900 font-extrabold">{fullName}</span>
                  </div>
                )}
                {titleUnit && (
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Chức danh / Đơn vị:</span>
                    <span className="text-slate-900 font-extrabold">{titleUnit}</span>
                  </div>
                )}
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Hình thức tham gia:</span>
                  <span className="text-slate-900 font-extrabold">{participationForm}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Đồng thuận nghiên cứu:</span>
                  <span className="text-slate-900 font-extrabold">Đã đồng ý</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Phương thức trích dẫn:</span>
                  <span className="text-slate-900 font-extrabold">Chỉ sử dụng dữ liệu tổng hợp, không trích dẫn trực tiếp</span>
                </div>
                {participationForm !== 'Bảng hỏi khảo sát' && selectedGroup !== 'KG-ĐT' && (
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Đồng thuận ghi âm:</span>
                    <span className="text-slate-900 font-extrabold">{consentRecord === 'yes' ? 'Đồng ý ghi âm' : 'Không ghi âm'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Common Likert responses review card */}
            {isLikertEligible() && (
              <div className={getCardStyles() + ' space-y-4'}>
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">A. Khảo sát ý kiến chung</h3>
                <div className="space-y-3">
                  {COMMON_LIKERT_QUESTIONS.map((q) => {
                    const ans = likertAnswers[q.id];
                    const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === ans);
                    return (
                      <div key={q.id} className="space-y-0.5">
                        <p className="font-bold text-slate-800">{q.text}</p>
                        <p className="text-indigo-700 bg-indigo-50 border border-indigo-150 py-1.5 px-3 rounded-xl w-fit flex items-center gap-1 font-black">
                          {ans === null ? 'Không áp dụng / Khác' : `${opt?.emoji} ${opt?.label} (${ans}/5)`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Group Likert responses review card */}
            {isLikertEligible() && (
              <div className={getCardStyles() + ' space-y-4'}>
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">B. Khảo sát theo nhóm {selectedGroup}</h3>
                <div className="space-y-3">
                  {(GROUP_LIKERT_QUESTIONS[selectedGroup] || []).map((q) => {
                    const ans = likertAnswers[q.id];
                    
                    if (q.type === 'likert') {
                      const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === ans);
                      return (
                        <div key={q.id} className="space-y-0.5">
                          <p className="font-bold text-slate-800">{q.text}</p>
                          <p className="text-indigo-705 bg-indigo-50 border border-indigo-150 py-1.5 px-3 rounded-xl w-fit flex items-center gap-1 font-black">
                            {opt?.emoji} {opt?.label} ({ans}/5)
                          </p>
                        </div>
                      );
                    } else if (q.type === 'checkbox') {
                      const list = (ans as string[]) || [];
                      const otherVal = likertAnswers[q.id + '_other'] as string;
                      return (
                        <div key={q.id} className="space-y-1">
                          <p className="font-bold text-slate-850">{q.text}</p>
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
                          <p className="font-bold text-slate-850">{q.text}</p>
                          <p className="text-slate-600 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl font-semibold italic">
                            {ans ? `"${ans}"` : '(Trống)'}
                          </p>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}

            {/* Interview responses review card */}
            {isInterviewEligible() && (
              <div className={getCardStyles() + ' space-y-4'}>
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">
                  {isLikertEligible() ? 'C. Ý kiến đóng góp phỏng vấn sâu' : 'A. Ý kiến đóng góp phỏng vấn sâu'}
                </h3>
                <div className="space-y-4">
                  {(INTERVIEW_QUESTIONS[selectedGroup] || []).map((q) => {
                    const ans = interviewAnswers[q.id];
                    return (
                      <div key={q.id} className="space-y-1.5">
                        <p className="font-bold text-slate-800">{q.text}</p>
                        <div className="pl-3.5 border-l-2 border-slate-200 space-y-2">
                          <p className="text-slate-650 leading-relaxed font-semibold italic">
                            {ans?.text ? `"${ans.text}"` : '(Không có câu trả lời viết)'}
                          </p>
                          {ans?.audioUrl && (
                            <div className="flex items-center gap-2 pt-1 bg-slate-50 p-2 border border-slate-200 rounded-xl w-fit">
                              <span className="text-[10px] text-slate-400 font-bold">Bản ghi âm:</span>
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

            {/* Footer action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleReviewBack}
                className="w-full sm:flex-1 h-13 bg-white border border-slate-250 text-slate-700 font-extrabold text-sm rounded-2xl cursor-pointer hover:bg-slate-50 active:scale-97 select-none"
              >
                ← Quay lại chỉnh sửa
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className={`w-full sm:flex-1 h-13 font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-md flex items-center justify-center gap-1.5 transition-all ${
                  isSubmitting ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isSubmitting ? 'Đang gửi khảo sát...' : 'Gửi khảo sát'}
              </button>
            </div>
          </div>
        )}

        {/* STEP F: SUCCESS SCREEN */}
        {step === 'success' && (
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 text-center space-y-6 max-w-sm mx-auto shadow-sm animate-in fade-in duration-200">
            <div className="h-16 w-16 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm">
              ✓
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 leading-tight">Hoàn thành!</h1>
              <p className="text-base text-slate-700 font-extrabold">
                Cảm ơn đã khảo sát
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Phản hồi khảo sát của bạn đã được lưu giữ thành công để phục vụ công tác nghiên cứu luận văn.
              </p>
            </div>

            <div className="py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl w-fit mx-auto">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Mã người tham gia của bạn:</span>
              <span className="text-xl font-black text-slate-950 block mt-0.5">{participantCode}</span>
            </div>

            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Bạn có thể đóng tab trình duyệt này an toàn.
            </p>
          </div>
        )}

      </div>

      {/* 3. Floating gear Accessibility Controls widget */}
      {step !== 'success' && (
        <div className="flex justify-start pt-5 shrink-0 z-30">
          <AccessibilityMenu
            settings={accessSettings}
            onUpdateSettings={setAccessSettings}
          />
        </div>
      )}

      {/* 4. ALWAYS RENDERED PRIVACY STATEMENT FOOTER (OUTSIDE CARD CONTAINER) */}
      <footer className="text-center pt-5 shrink-0 border-t border-slate-200/50 mt-5">
        <p className="text-[10px] text-slate-450 font-black italic max-w-md mx-auto leading-relaxed">
          *Ghi chú: Người tham gia có quyền dừng tham gia hoặc yêu cầu không sử dụng thông tin nhận diện cá nhân trong luận văn.
        </p>
      </footer>

    </div>
  );
};
