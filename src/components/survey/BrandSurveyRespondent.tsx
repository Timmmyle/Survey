import React, { useState, useEffect, useRef } from 'react';
import { Participant, BrandSurveySubmission } from '../../types';
import {
  THESIS_METADATA,
  SURVEY_GROUPS,
  LIKERT_SCALE_OPTIONS,
  COMMON_LIKERT_QUESTIONS,
  GROUP_LIKERT_QUESTIONS,
  INTERVIEW_QUESTIONS,
  TRANSLATIONS,
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

const cleanAudioText = (text: string): string => {
  if (!text) return '';
  return text.replace(/\[Ghi âm:\s*(.*?)\]/g, '$1').trim();
};

const renderRequiredAsterisk = () => (
  <span className="text-red-500 font-black">*</span>
);

const renderTextWithRedAsterisks = (text: string): React.ReactNode => {
  if (!text) return text;
  const parts = text.split(/(\*)/g);
  return parts.map((part, i) =>
    part === '*' ? <span key={i} className="text-red-500 font-black">*</span> : part
  );
};

const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
};

export const BrandSurveyRespondent: React.FC<BrandSurveyRespondentProps> = ({
  onBackToAdmin,
}) => {
  // Stepper state
  const [step, setStep] = useState<FlowStep>('welcome');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [showCameraPopup, setShowCameraPopup] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [consentCamera, setConsentCamera] = useState<string>('Người dùng không bật camera');
  
  // Participant Info state
  const [selectedGroup, setSelectedGroup] = useState<string>('');
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

  const t = (key: keyof typeof TRANSLATIONS.vi) => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS.vi[key] || '';
  };

  const renderLikertLabel = (label: string) => {
    if (label.startsWith("Hoàn toàn ")) {
      return (
        <>
          <span className="block">{lang === 'vi' ? 'Hoàn toàn' : 'Strongly'}</span>
          <span className="block">{label.replace("Hoàn toàn ", "")}</span>
        </>
      );
    }
    if (label.startsWith("Strongly ")) {
      return (
        <>
          <span className="block">Strongly</span>
          <span className="block">{label.replace("Strongly ", "")}</span>
        </>
      );
    }
    return <span className="block">{label}</span>;
  };

  const saveProgressIncrementally = async (
    updatedLikert = likertAnswers,
    updatedInterview = interviewAnswers,
    force = false,
    cameraConsentOverride?: string
  ) => {
    if (!force && (step === 'welcome' || step === 'info' || step === 'consent')) return;

    try {
      const finalParticipant: Participant = {
        id: participantCode ? `p-${participantCode}` : `p-${Date.now()}`,
        code: participantCode,
        groupCode: selectedGroup,
        fullName: fullName.trim() || undefined,
        titleUnit: titleUnit.trim() || undefined,
        participationForm: participationForm,
        consentAgreed: true,
        consentCitation: consentCitation,
        consentRecord: isInterviewEligible() ? (consentRecord === 'yes') : null,
        consentCamera: cameraConsentOverride || consentCamera,
        createdAt: new Date().toLocaleString('vi-VN'),
      };

      const submission: BrandSurveySubmission = {
        id: participantCode ? `sub-${participantCode}` : `sub-${Date.now()}`,
        participant: finalParticipant,
        likertAnswers: updatedLikert,
        interviewAnswers: updatedInterview,
        submittedAt: new Date().toLocaleString('vi-VN'),
      };

      await BrandSurveyService.saveSubmission(submission);
    } catch (err) {
      console.error('Failed to save incremental progress:', err);
    }
  };

  // Dynamically update document root font size when accessibility font size changes
  useEffect(() => {
    let size = '';
    if (accessSettings.fontSize === 'normal') {
      size = '17px'; // standard 16px -> 17px (+1px)
    } else if (accessSettings.fontSize === 'large') {
      size = '19px'; // standard 16px -> 19px (+3px)
    } else if (accessSettings.fontSize === 'extra-large') {
      size = '21px'; // standard 16px -> 21px (+5px)
    }
    document.documentElement.style.fontSize = size;
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [accessSettings.fontSize]);

  // Dynamically update participant code on group select
  useEffect(() => {
    let active = true;
    const fetchCode = async () => {
      if (!selectedGroup) {
        if (active) setParticipantCode('');
        return;
      }
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
      utterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
      
      if (lang === 'en') {
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find((v) => v.lang.startsWith('en'));
        if (enVoice) {
          utterance.voice = enVoice;
        }
      }
      
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
    scrollToTop();
  };

  const handleInfoNext = () => {
    setValidationError(null);
    if (!selectedGroup) {
      setValidationError(lang === 'vi' ? 'Vui lòng chọn nhóm tham gia phù hợp trước khi tiếp tục.' : 'Please select a suitable participation group before continuing.');
      return;
    }
    setStep('consent');
    scrollToTop();
  };

  const handleConsentNext = () => {
    if (!consentInfo || !consentData || !consentCitation) {
      setValidationError(lang === 'vi' ? 'Vui lòng chọn đầy đủ các ô xác nhận đồng thuận tham gia và cách trích dẫn ý kiến trước khi bắt đầu.' : 'Please check all consent boxes and citation preference before starting.');
      return;
    }
    setValidationError(null);

    if (isLikertEligible()) {
      setStep('common-likert');
      setCommonIndex(0);
      scrollToTop();
      setTimeout(() => {
        saveProgressIncrementally(likertAnswers, interviewAnswers, true);
      }, 50);
    } else if (isInterviewEligible()) {
      setShowCameraPopup(true);
    } else {
      setStep('review');
      scrollToTop();
      setTimeout(() => {
        saveProgressIncrementally(likertAnswers, interviewAnswers, true);
      }, 50);
    }
  };

  const handleCommonNext = () => {
    setValidationError(null);
    const q = COMMON_LIKERT_QUESTIONS[commonIndex];
    const ans = likertAnswers[q.id];
    if (q.required && (ans === undefined || ans === null)) {
      setValidationError(lang === 'vi' ? 'Vui lòng chọn một mức độ đánh giá trước khi tiếp tục.' : 'Please select a rating level before continuing.');
      return;
    }
    if (commonIndex < COMMON_LIKERT_QUESTIONS.length - 1) {
      setCommonIndex(commonIndex + 1);
      scrollToTop();
    } else {
      setStep('group-likert');
      setGroupIndex(0);
      scrollToTop();
    }
    saveProgressIncrementally();
  };

  const handleCommonBack = () => {
    setValidationError(null);
    if (commonIndex > 0) {
      setCommonIndex(commonIndex - 1);
      scrollToTop();
    } else {
      setStep('consent');
      scrollToTop();
    }
    saveProgressIncrementally();
  };

  const handleGroupNext = () => {
    const questions = GROUP_LIKERT_QUESTIONS[selectedGroup] || [];
    const q = questions[groupIndex];
    const ans = likertAnswers[q.id];

    if (q.required && q.type === 'likert' && (ans === undefined || ans === null)) {
      setValidationError(lang === 'vi' ? 'Vui lòng chọn một mức độ đánh giá trước khi tiếp tục.' : 'Please select a rating level before continuing.');
      return;
    }

    if (ans !== undefined) {
      if (q.type === 'checkbox') {
        const selectedList = (ans as string[]) || [];
        const hasOther = selectedList.includes('Khác');
        
        if (q.minSelect && selectedList.length < q.minSelect && !hasOther && selectedList.length > 0) {
          setValidationError(lang === 'vi' ? `Vui lòng chọn tối thiểu ${q.minSelect} phương án để tiếp tục.` : `Please select at least ${q.minSelect} options.`);
          return;
        }
        
        if (q.maxSelect && selectedList.length > q.maxSelect) {
          setValidationError(lang === 'vi' ? `Vui lòng chỉ chọn tối đa ${q.maxSelect} phương án.` : `Please select at most ${q.maxSelect} options.`);
          return;
        }

        if (selectedList.includes('Khác')) {
          const otherText = ((likertAnswers[q.id + '_other'] as string) || '').trim();
          if (!otherText) {
            setValidationError(lang === 'vi' ? 'Vui lòng nhập nội dung chi tiết cho lựa chọn "Khác".' : 'Please enter details for the "Other" option.');
            return;
          }
        }
      }
    } else if (q.type === 'checkbox') {
      if (q.required) {
        setValidationError(lang === 'vi' ? `Vui lòng chọn ít nhất ${q.minSelect || 1} phương án để tiếp tục.` : `Please select at least ${q.minSelect || 1} option(s).`);
        return;
      }
    }

    setValidationError(null);
    if (groupIndex < questions.length - 1) {
      setGroupIndex(groupIndex + 1);
      scrollToTop();
      saveProgressIncrementally();
    } else {
      if (isInterviewEligible()) {
        setShowCameraPopup(true);
      } else {
        setStep('review');
        scrollToTop();
        saveProgressIncrementally();
      }
    }
  };

  const handleGroupBack = () => {
    setValidationError(null);
    if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
      scrollToTop();
    } else {
      setStep('common-likert');
      setCommonIndex(COMMON_LIKERT_QUESTIONS.length - 1);
      scrollToTop();
    }
    saveProgressIncrementally();
  };

  const handleInterviewNext = () => {
    const questions = INTERVIEW_QUESTIONS[selectedGroup] || [];
    setValidationError(null);
    if (interviewIndex < questions.length - 1) {
      setInterviewIndex(interviewIndex + 1);
      scrollToTop();
    } else {
      setStep('review');
      scrollToTop();
    }
    saveProgressIncrementally();
  };

  const handleInterviewBack = () => {
    setValidationError(null);
    if (interviewIndex > 0) {
      setInterviewIndex(interviewIndex - 1);
      scrollToTop();
    } else {
      if (isLikertEligible()) {
        const questions = GROUP_LIKERT_QUESTIONS[selectedGroup] || [];
        setStep('group-likert');
        setGroupIndex(questions.length - 1);
        scrollToTop();
      } else {
        setStep('consent');
        scrollToTop();
      }
    }
    saveProgressIncrementally();
  };

  const handleReviewBack = () => {
    setValidationError(null);
    if (isInterviewEligible()) {
      const questions = INTERVIEW_QUESTIONS[selectedGroup] || [];
      setStep('interview');
      setInterviewIndex(questions.length - 1);
      scrollToTop();
    } else if (isLikertEligible()) {
      const questions = GROUP_LIKERT_QUESTIONS[selectedGroup] || [];
      setStep('group-likert');
      setGroupIndex(questions.length - 1);
      scrollToTop();
    } else {
      setStep('consent');
      scrollToTop();
    }
    saveProgressIncrementally();
  };

  const handleAnswerLikert = (qId: string, val: any) => {
    const updated = { ...likertAnswers, [qId]: val };
    setLikertAnswers(updated);
    setValidationError(null);
    saveProgressIncrementally(updated, interviewAnswers);
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
            const fileExt = blob.type.includes('video') ? 'webm' : 'wav';
            const fileName = `${participantCode}_${qId}.${fileExt}`;
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
        consentCitation: consentCitation,
        consentRecord: isInterviewEligible() ? (consentRecord === 'yes') : null,
        consentCamera: consentCamera,
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
        <span className={`block font-bold text-slate-950 leading-snug tracking-tight ${getQuestionSizeClass()}`}>
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
      
      {/* 0. Language Switcher Toggle */}
      {step !== 'success' && (
        <div className="flex justify-end max-w-md mx-auto mb-2 w-full z-45 shrink-0">
          <button
            type="button"
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className="px-3 py-1 text-[11px] font-black bg-white border border-slate-200 rounded-full hover:bg-slate-50 cursor-pointer shadow-xs select-none transition-all active:scale-95 text-slate-700 flex items-center gap-1.5"
          >
            {lang === 'vi' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}
          </button>
        </div>
      )}
      {/* Camera Consent Popup */}
      {showCameraPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-full flex items-center justify-center text-xl mx-auto shadow-sm">
              📷
            </div>
            <h3 className="text-base font-black text-slate-900">
              {lang === 'vi' ? 'Quyền truy cập Camera' : 'Camera Access'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              {lang === 'vi' 
                ? 'Bạn có đồng ý bật camera trong quá trình phỏng vấn để hỗ trợ nghiên cứu không?' 
                : 'Do you agree to turn on the camera during the interview to support the research?'}
            </p>
            <p className="text-xs text-slate-450 font-bold italic">
              {lang === 'vi' ? 'Không bắt buộc.' : 'Optional.'}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setUseCamera(true);
                  setConsentCamera('Đã bật camera');
                  setShowCameraPopup(false);
                  setStep('interview');
                  setInterviewIndex(0);
                  setTimeout(() => {
                    saveProgressIncrementally(
                      likertAnswers, 
                      interviewAnswers, 
                      true, 
                      "Đã bật camera"
                    );
                  }, 50);
                }}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all active:scale-97 select-none"
              >
                {lang === 'vi' ? 'Đồng ý bật camera' : 'Agree to turn on camera'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseCamera(false);
                  setConsentCamera('Người dùng không bật camera');
                  setShowCameraPopup(false);
                  setStep('interview');
                  setInterviewIndex(0);
                  setTimeout(() => {
                    saveProgressIncrementally(
                      likertAnswers, 
                      interviewAnswers, 
                      true, 
                      "Người dùng không bật camera"
                    );
                  }, 50);
                }}
                className="w-full h-11 bg-white border border-slate-250 text-slate-750 font-extrabold text-xs rounded-xl cursor-pointer hover:bg-slate-50 transition-all active:scale-97 select-none"
              >
                {lang === 'vi' ? 'Không đồng ý' : 'Disagree'}
              </button>
            </div>
          </div>
        </div>
      )}
      {step !== 'success' && (
        <div className="text-center space-y-4 mb-5 shrink-0">
          <span className="inline-block text-xs font-black uppercase text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full border border-slate-200/80">
            {lang === 'vi' ? 'KHẢO SÁT PHỤC VỤ LUẬN VĂN THẠC SĨ MỸ THUẬT ỨNG DỤNG' : 'SURVEY FOR APPLIED FINE ARTS MASTER\'S THESIS'}
          </span>
          <h1 className="text-sm font-black text-slate-900 leading-normal max-w-md mx-auto">
            {lang === 'vi' ? THESIS_METADATA.websiteTitle : THESIS_METADATA.websiteTitleEn}
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
                  {lang === 'vi' ? THESIS_METADATA.headerTitle : THESIS_METADATA.headerTitleEn}
                </h2>
              </div>

              {/* Research specifics */}
              <div className="space-y-3.5 text-xs text-slate-655 font-semibold leading-relaxed">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    {lang === 'vi' ? 'Đề tài:' : 'Thesis:'}
                  </span>
                  <span className="text-slate-900 font-extrabold italic">
                    {lang === 'vi' ? THESIS_METADATA.thesisName : THESIS_METADATA.thesisNameEn}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-xs font-bold uppercase text-slate-400">
                      {lang === 'vi' ? 'Học viên thực hiện:' : 'Researcher:'}
                    </span>
                    <span className="text-slate-900 font-extrabold">
                      {lang === 'vi' ? THESIS_METADATA.studentName : THESIS_METADATA.studentNameEn}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase text-slate-400">
                      {lang === 'vi' ? 'Cơ sở đào tạo:' : 'Institution:'}
                    </span>
                    <span className="text-slate-900 font-extrabold">
                      {lang === 'vi' ? THESIS_METADATA.institution : THESIS_METADATA.institutionEn}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3.5 text-slate-550 font-medium text-[12.5px] leading-relaxed">
                  {(lang === 'vi' ? THESIS_METADATA.instructions : THESIS_METADATA.instructionsEn).map((inst, i) => (
                    <p key={i} className="indent-6 text-justify">{inst}</p>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-400">Email:</span> <a href={`mailto:${THESIS_METADATA.contact.email}`} className="text-indigo-650 font-bold underline">{THESIS_METADATA.contact.email}</a>
                  </div>
                  <div>
                    <span className="text-slate-400">{lang === 'vi' ? 'Điện thoại:' : 'Phone:'}</span> <span className="text-slate-950 font-extrabold">{THESIS_METADATA.contact.phone}</span>
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
                {t('ready')}
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
                <h3 className="text-xs font-black uppercase text-slate-900">
                  {lang === 'vi' ? 'Thông tin người tham gia' : 'Participant Information'}
                </h3>
              </div>

              {validationError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold animate-shake">
                  <AlertCircle className="h-4.5 w-4.5 text-red-655 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-4 text-sm font-semibold">
                
                {/* 5 Participant Groups Radio layout */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-900 tracking-tight text-center">{renderTextWithRedAsterisks(t('participantGroup'))}</label>
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
                          {lang === 'vi' ? gp.name : gp.nameEn} <span className="opacity-80 font-mono">({gp.code})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Auto Generated Code display */}
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl text-center">
                  <span className="text-xs font-black uppercase text-amber-800 tracking-wider">{t('participantCode')}</span>
                  <span className="block text-xl font-black text-slate-950 mt-0.5">{participantCode}</span>
                </div>

                {/* Optional fields - Horizontally aligned labels using grid alignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 min-h-[2.5rem] flex items-end pb-1">
                      {t('fullName')}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={lang === 'vi' ? 'Nguyễn Văn A' : 'John Doe'}
                      className="min-h-12 w-full border border-slate-250 px-4 rounded-xl text-xs font-bold text-slate-900 bg-white outline-none focus:border-slate-800"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 min-h-[2.5rem] flex items-end pb-1">
                      {t('titleUnit')}
                    </label>
                    <input
                      type="text"
                      value={titleUnit}
                      onChange={(e) => setTitleUnit(e.target.value)}
                      placeholder={lang === 'vi' ? 'Võ sư / Nhà nghiên cứu...' : 'Martial artist / Researcher...'}
                      className="min-h-12 w-full border border-slate-250 px-4 rounded-xl text-xs font-bold text-slate-900 bg-white outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                {/* Participation form selection */}
                <div className="space-y-2 pt-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{renderTextWithRedAsterisks(t('participationForm'))}</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { value: 'Bảng hỏi khảo sát', label: lang === 'vi' ? 'Bảng hỏi khảo sát' : 'Survey Questionnaire' },
                      { value: 'Phỏng vấn', label: lang === 'vi' ? 'Phỏng vấn' : 'In-depth Interview', disabled: selectedGroup === 'KG-ĐT' },
                      { value: 'Cả hai hình thức', label: lang === 'vi' ? 'Cả hai hình thức' : 'Both formats', disabled: selectedGroup === 'KG-ĐT' }
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
                    <p className="text-xs text-amber-600 font-bold">
                      {renderTextWithRedAsterisks(t('publicWarning'))}
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
                {t('back')}
              </button>
              <button
                type="button"
                onClick={handleInfoNext}
                className="w-3/5 h-13 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-sm"
              >
                {t('continue')}
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
                <h3 className="text-xs font-black uppercase text-slate-900">{t('consentTitle')}</h3>
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
                  <span>{renderTextWithRedAsterisks(t('consentInfo'))}</span>
                </label>

                {/* 2. Data consent check */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentData}
                    onChange={(e) => setConsentData(e.target.checked)}
                    className="h-4.5 w-4.5 shrink-0 mt-0.5"
                  />
                  <span>{renderTextWithRedAsterisks(t('consentData'))}</span>
                </label>

                {/* 3. Citation method check (New requirement) */}
                <label className="flex items-start gap-2.5 cursor-pointer border-b border-slate-100 pb-3.5">
                  <input
                    type="checkbox"
                    checked={consentCitation}
                    onChange={(e) => setConsentCitation(e.target.checked)}
                    className="h-4.5 w-4.5 shrink-0 mt-0.5"
                  />
                  <span>{renderTextWithRedAsterisks(t('consentCitation'))}</span>
                </label>

                {/* 4. Microphone Recording Consent */}
                {participationForm !== 'Bảng hỏi khảo sát' && selectedGroup !== 'KG-ĐT' ? (
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl space-y-2 mt-1">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-450">{t('recordOption')}</span>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="consentRecord"
                          checked={consentRecord === 'yes'}
                          onChange={() => setConsentRecord('yes')}
                          className="h-4.5 w-4.5"
                        />
                        <span className="text-slate-800 font-bold">{t('recordYes')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="consentRecord"
                          checked={consentRecord === 'no'}
                          onChange={() => setConsentRecord('no')}
                          className="h-4.5 w-4.5"
                        />
                        <span className="text-slate-800 font-bold">{t('recordNo')}</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/50 space-y-1.5">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-450">{t('recordOption')}</span>
                    <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                      <input
                        type="radio"
                        readOnly
                        checked={consentRecord === 'na'}
                        className="h-4.5 w-4.5"
                      />
                      <span className="text-slate-500 font-bold">{t('recordNa')}</span>
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
                {t('back')}
              </button>
              
              <button
                type="button"
                onClick={handleConsentNext}
                className="w-3/5 h-13 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-sm"
              >
                {t('startSurvey')}
              </button>
            </div>
          </div>
        )}
        {step === 'common-likert' && COMMON_LIKERT_QUESTIONS[commonIndex] && (
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex justify-center w-full">
              <div className="text-xs font-black uppercase text-indigo-705 tracking-wider bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-150 text-center">
                <span>{lang === 'vi' ? 'Phần A · Khảo sát ý kiến chung' : 'Part A · General Survey'} ({commonIndex + 1} / {COMMON_LIKERT_QUESTIONS.length})</span>
              </div>
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
                    {renderQuestionText(lang === 'vi' ? COMMON_LIKERT_QUESTIONS[commonIndex].text : (COMMON_LIKERT_QUESTIONS[commonIndex].textEn || COMMON_LIKERT_QUESTIONS[commonIndex].text))}
                  </h3>

                  <button
                    type="button"
                    onClick={() => readTextAloud(lang === 'vi' ? COMMON_LIKERT_QUESTIONS[commonIndex].text : (COMMON_LIKERT_QUESTIONS[commonIndex].textEn || COMMON_LIKERT_QUESTIONS[commonIndex].text))}
                    className="p-2 border border-slate-200 hover:bg-slate-100 rounded-full shrink-0 text-slate-500 cursor-pointer active:scale-95"
                    title={lang === 'vi' ? 'Đọc câu hỏi' : 'Read question'}
                  >
                    <Volume2 className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="border-b border-slate-150 pb-2 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                  <span>{t('playAudio')}</span>
                </div>
              </div>

              {/* Horizontal Emoji Options List */}
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2.5">
                  {LIKERT_SCALE_OPTIONS.map((opt) => {
                    const isSelected = likertAnswers[COMMON_LIKERT_QUESTIONS[commonIndex].id] === opt.value;
                    const labelText = lang === 'vi' ? opt.label : opt.labelEn;
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
                        <span className="text-[11.5px] font-bold tracking-tight mt-2 text-slate-500 leading-tight">
                          {renderLikertLabel(labelText)}
                        </span>
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
                  ← {t('back')}
                </button>

                <button
                  type="button"
                  onClick={handleCommonNext}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 active:scale-97 select-none"
                >
                  {t('continue')}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP C: GROUP-SPECIFIC LIKERT QUESTIONS */}
        {step === 'group-likert' && GROUP_LIKERT_QUESTIONS[selectedGroup]?.[groupIndex] && (
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex justify-center w-full">
              <div className="text-xs font-black uppercase text-indigo-705 tracking-wider bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-150 text-center">
                <span>{lang === 'vi' ? 'Phần B · Khảo sát theo nhóm' : 'Part B · Group Survey'} {selectedGroup} ({groupIndex + 1} / {GROUP_LIKERT_QUESTIONS[selectedGroup].length})</span>
              </div>
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
                    {renderQuestionText(lang === 'vi' ? GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].text : (GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].textEn || GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].text))}
                  </h3>

                  <button
                    type="button"
                    onClick={() => readTextAloud(lang === 'vi' ? GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].text : (GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].textEn || GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].text))}
                    className="p-2 border border-slate-200 hover:bg-slate-100 rounded-full shrink-0 text-slate-500 cursor-pointer active:scale-95"
                  >
                    <Volume2 className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="border-b border-slate-150 pb-2 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                  <span>{t('playAudio')}</span>
                </div>
              </div>

              {/* Questionnaire controls based on type */}
              {GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].type === 'likert' ? (
                /* Horizontal Emoji Options List */
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2.5">
                    {LIKERT_SCALE_OPTIONS.map((opt) => {
                      const isSelected = likertAnswers[GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id] === opt.value;
                      const labelText = lang === 'vi' ? opt.label : opt.labelEn;
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
                          <span className="text-[11.5px] font-bold tracking-tight mt-2 text-slate-500 leading-tight">
                            {renderLikertLabel(labelText)}
                          </span>
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
                    {GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].options?.map((opt, idx) => {
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

                      const q = GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex];
                      const optText = lang === 'vi' ? opt : (q.optionsEn?.[idx] || opt);

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
                          <span className="text-xs font-bold leading-tight">{optText}</span>
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
                          <span className="text-xs font-bold leading-tight">{t('otherOption')}</span>
                        </label>

                        {/* Text input when "Khác" is checked */}
                        {((likertAnswers[GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id] as string[]) || []).includes('Khác') && (
                          <input
                            type="text"
                            value={(likertAnswers[GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id + '_other'] as string) || ''}
                            onChange={(e) => {
                              const qId = GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id;
                              setLikertAnswers((prev) => {
                                const updated = {
                                  ...prev,
                                  [qId + '_other']: e.target.value
                                };
                                saveProgressIncrementally(updated, interviewAnswers);
                                return updated;
                              });
                            }}
                            placeholder={t('otherPlaceholder')}
                            className="w-full min-h-12 border border-slate-350 px-4 rounded-xl text-xs font-bold text-slate-900 bg-white outline-none focus:border-slate-800"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Min / Max indicator labels */}
                  <div className="text-xs text-slate-450 font-bold">
                    {GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].minSelect && (
                      <span className="block text-amber-700">{renderTextWithRedAsterisks(t('minSelect').replace('{count}', String(GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].minSelect)))}</span>
                    )}
                    {GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].maxSelect && (
                      <span className="block text-blue-700">{renderTextWithRedAsterisks(t('maxSelect').replace('{count}', String(GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].maxSelect)))}</span>
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
                    placeholder={t('typeFeedback')}
                    className="w-full p-4 border border-slate-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 leading-relaxed font-semibold text-slate-750 resize-none bg-white"
                  />
                  
                  {/* Textarea voice recording optionally allowed */}
                  {consentRecord === 'yes' && (
                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t('recordFeedback')}
                      </span>
                      <VoiceAnswerConversational
                        key={GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id}
                        onAudioConfirmed={(url, text) => {
                          const prevText = (likertAnswers[GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id] as string) || '';
                          handleAnswerLikert(
                            GROUP_LIKERT_QUESTIONS[selectedGroup][groupIndex].id,
                            text ? `${prevText} ${text}`.trim() : prevText
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
                  ← {t('back')}
                </button>

                <button
                  type="button"
                  onClick={handleGroupNext}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 active:scale-97 select-none"
                >
                  {t('continue')}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP D: INTERVIEW QUESTIONS (Voice Recorder Panel) */}
        {step === 'interview' && INTERVIEW_QUESTIONS[selectedGroup]?.[interviewIndex] && (
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex justify-center w-full">
              <div className="text-xs font-black uppercase text-indigo-755 tracking-wider bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-150 text-center">
                <span>{lang === 'vi' ? 'Phần C · Phỏng vấn sâu nhóm' : 'Part C · In-depth Interview Group'} {selectedGroup} ({interviewIndex + 1} / {INTERVIEW_QUESTIONS[selectedGroup].length})</span>
              </div>
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
                    {renderQuestionText(lang === 'vi' ? INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].text : (INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].textEn || INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].text))}
                  </h3>

                  <button
                    type="button"
                    onClick={() => readTextAloud(lang === 'vi' ? INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].text : (INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].textEn || INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].text))}
                    className="p-2 border border-slate-200 hover:bg-slate-100 rounded-full shrink-0 text-slate-500 cursor-pointer active:scale-95"
                  >
                    <Volume2 className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="border-b border-slate-150 pb-2 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                  <span>{t('playAudioOptional')}</span>
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
                  placeholder={t('typeFeedback')}
                  className="w-full p-4 border border-slate-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 leading-relaxed font-semibold text-slate-700 resize-none"
                />

                {/* Voice Answering module (if consent given) */}
                {consentRecord === 'yes' && (
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-450">
                      {useCamera ? (lang === 'vi' ? 'Ghi hình phỏng vấn:' : 'Video record interview:') : t('recordVoice')}
                    </span>
                    <VoiceAnswerConversational
                      key={INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].id}
                      useCamera={useCamera}
                      onAudioConfirmed={(url, text) => {
                        const prevText = interviewAnswers[INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].id]?.text || '';
                        handleInterviewResponse(
                          INTERVIEW_QUESTIONS[selectedGroup][interviewIndex].id,
                          text ? `${prevText} ${text}`.trim() : prevText,
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
                  ← {t('back')}
                </button>

                <button
                  type="button"
                  onClick={handleInterviewNext}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 active:scale-97 select-none"
                >
                  {interviewIndex === INTERVIEW_QUESTIONS[selectedGroup].length - 1 ? (lang === 'vi' ? 'Xem lại phản hồi →' : 'Review responses →') : t('continue')}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP E: REVIEW BEFORE SUBMIT */}
        {step === 'review' && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            
            <div className="flex justify-center w-full">
              <div className="text-xs font-black uppercase text-emerald-705 tracking-wider bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-150 text-center">
                <span>{lang === 'vi' ? 'Kiểm tra phản hồi của bạn' : 'Review Your Responses'}</span>
              </div>
            </div>

            {/* Profile Overview card */}
            <div className={getCardStyles() + ' space-y-4'}>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ClipboardCheck className="h-5 w-5 text-slate-655" />
                <h3 className="text-xs font-black uppercase text-slate-900">
                  {lang === 'vi' ? 'Thông tin người tham gia' : 'Participant Information'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                <div>
                  <span className="block text-xs text-slate-400 font-bold uppercase">{t('participantCode')}</span>
                  <span className="text-slate-900 font-extrabold text-sm">{participantCode}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-bold uppercase">{lang === 'vi' ? 'Nhóm:' : 'Group:'}</span>
                  <span className="text-slate-900 font-extrabold">
                    {lang === 'vi'
                      ? SURVEY_GROUPS.find((g) => g.code === selectedGroup)?.name
                      : SURVEY_GROUPS.find((g) => g.code === selectedGroup)?.nameEn}
                  </span>
                </div>
                {fullName && (
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase">{lang === 'vi' ? 'Họ và tên:' : 'Full name:'}</span>
                    <span className="text-slate-900 font-extrabold">{fullName}</span>
                  </div>
                )}
                {titleUnit && (
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase">{lang === 'vi' ? 'Chức danh / Đơn vị:' : 'Title/Unit:'}</span>
                    <span className="text-slate-900 font-extrabold">{titleUnit}</span>
                  </div>
                )}
                <div>
                  <span className="block text-xs text-slate-400 font-bold uppercase">{lang === 'vi' ? 'Hình thức tham gia:' : 'Participation form:'}</span>
                  <span className="text-slate-900 font-extrabold">
                    {participationForm === 'Bảng hỏi khảo sát'
                      ? (lang === 'vi' ? 'Bảng hỏi khảo sát' : 'Survey Questionnaire')
                      : participationForm === 'Phỏng vấn'
                      ? (lang === 'vi' ? 'Phỏng vấn' : 'In-depth Interview')
                      : (lang === 'vi' ? 'Cả hai hình thức' : 'Both formats')}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-bold uppercase">{lang === 'vi' ? 'Đồng thuận nghiên cứu:' : 'Research consent:'}</span>
                  <span className="text-slate-900 font-extrabold">{lang === 'vi' ? 'Đã đồng ý' : 'Agreed'}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-bold uppercase">{lang === 'vi' ? 'Phương thức trích dẫn:' : 'Citation method:'}</span>
                  <span className="text-slate-900 font-extrabold">{lang === 'vi' ? 'Chỉ sử dụng dữ liệu tổng hợp, không trích dẫn trực tiếp' : 'Use aggregated data only, no direct citation'}</span>
                </div>
                {participationForm !== 'Bảng hỏi khảo sát' && selectedGroup !== 'KG-ĐT' && (
                  <>
                    <div>
                      <span className="block text-xs text-slate-400 font-bold uppercase">{lang === 'vi' ? 'Đồng thuận ghi âm:' : 'Audio recording consent:'}</span>
                      <span className="text-slate-900 font-extrabold">{consentRecord === 'yes' ? (lang === 'vi' ? 'Đồng ý ghi âm' : 'Agreed to record') : (lang === 'vi' ? 'Không ghi âm' : 'No recording')}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 font-bold uppercase">{lang === 'vi' ? 'Trạng thái camera:' : 'Camera status:'}</span>
                      <span className="text-slate-900 font-extrabold">
                        {useCamera 
                          ? (lang === 'vi' ? 'Đã bật camera' : 'Camera enabled') 
                          : (lang === 'vi' ? consentCamera : 'User did not turn on camera')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Common Likert responses review card */}
            {isLikertEligible() && (
              <div className={getCardStyles() + ' space-y-4'}>
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">
                  {lang === 'vi' ? 'A. Khảo sát ý kiến chung' : 'A. General Survey'}
                </h3>
                <div className="space-y-3">
                  {COMMON_LIKERT_QUESTIONS.map((q) => {
                    const ans = likertAnswers[q.id];
                    const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === ans);
                    const qText = lang === 'vi' ? q.text : (q.textEn || q.text);
                    const optLabel = opt ? (lang === 'vi' ? opt.label : opt.labelEn) : '';
                    return (
                      <div key={q.id} className="space-y-0.5">
                        <p className="font-bold text-slate-800">{qText}</p>
                        <p className="text-indigo-700 bg-indigo-50 border border-indigo-150 py-1.5 px-3 rounded-xl w-fit flex items-center gap-1 font-black">
                          {ans === null || ans === undefined ? (lang === 'vi' ? 'Chưa trả lời' : 'Not answered') : `${opt?.emoji} ${optLabel} (${ans}/5)`}
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
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">
                  {lang === 'vi' ? `B. Khảo sát theo nhóm ${selectedGroup}` : `B. Group Survey ${selectedGroup}`}
                </h3>
                <div className="space-y-3">
                  {(GROUP_LIKERT_QUESTIONS[selectedGroup] || []).map((q) => {
                    const ans = likertAnswers[q.id];
                    const qText = lang === 'vi' ? q.text : (q.textEn || q.text);
                    
                    if (q.type === 'likert') {
                      const opt = LIKERT_SCALE_OPTIONS.find((o) => o.value === ans);
                      const optLabel = opt ? (lang === 'vi' ? opt.label : opt.labelEn) : '';
                      return (
                        <div key={q.id} className="space-y-0.5">
                          <p className="font-bold text-slate-800">{qText}</p>
                          <p className="text-indigo-755 bg-indigo-50 border border-indigo-150 py-1.5 px-3 rounded-xl w-fit flex items-center gap-1 font-black">
                            {ans === null || ans === undefined ? (lang === 'vi' ? 'Chưa trả lời' : 'Not answered') : `${opt?.emoji} ${optLabel} (${ans}/5)`}
                          </p>
                        </div>
                      );
                    } else if (q.type === 'checkbox') {
                      const list = (ans as string[]) || [];
                      const otherVal = likertAnswers[q.id + '_other'] as string;
                      return (
                        <div key={q.id} className="space-y-1">
                          <p className="font-bold text-slate-850">{qText}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {list.map((item) => {
                              const optIdx = q.options?.indexOf(item);
                              const displayItem = optIdx !== undefined && optIdx >= 0 ? (lang === 'vi' ? item : (q.optionsEn?.[optIdx] || item)) : item;
                              return (
                                <span key={item} className="text-amber-800 bg-amber-50 border border-amber-250 py-1 px-2.5 rounded-lg font-extrabold text-[10px]">
                                  {item === 'Khác' && otherVal ? `${lang === 'vi' ? 'Ý kiến khác' : 'Other opinion'}: ${otherVal}` : displayItem}
                                </span>
                              );
                            })}
                            {list.length === 0 && (
                              <span className="text-slate-400 italic font-semibold">{lang === 'vi' ? '(Chưa chọn lựa chọn nào)' : '(No options selected)'}</span>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={q.id} className="space-y-1">
                          <p className="font-bold text-slate-850">{qText}</p>
                          <p className="text-slate-600 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl font-semibold italic">
                            {ans ? `"${ans}"` : (lang === 'vi' ? '(Trống)' : '(Empty)')}
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
                  {isLikertEligible()
                    ? (lang === 'vi' ? 'C. Ý kiến đóng góp phỏng vấn sâu' : 'C. In-depth Interview Feedback')
                    : (lang === 'vi' ? 'A. Ý kiến đóng góp phỏng vấn sâu' : 'A. In-depth Interview Feedback')}
                </h3>
                <div className="space-y-4">
                  {(INTERVIEW_QUESTIONS[selectedGroup] || []).map((q) => {
                    const ans = interviewAnswers[q.id];
                    const qText = lang === 'vi' ? q.text : (q.textEn || q.text);
                    return (
                      <div key={q.id} className="space-y-1.5">
                        <p className="font-bold text-slate-800">{qText}</p>
                        <div className="pl-3.5 border-l-2 border-slate-200 space-y-2">
                          <p className="text-slate-650 leading-relaxed font-semibold italic">
                            {ans?.text ? cleanAudioText(ans.text) : (lang === 'vi' ? '(Không có câu trả lời bằng chữ)' : '(No written response)')}
                          </p>
                          {ans?.audioUrl && (
                            <div className="flex flex-col gap-2 pt-1 bg-slate-50 p-2.5 border border-slate-200 rounded-xl w-fit">
                              <span className="text-[10px] text-slate-400 font-bold">
                                {ans.audioUrl.toLowerCase().includes('.webm') || ans.audioUrl.toLowerCase().includes('.mp4') || ans.audioUrl.startsWith('blob:')
                                  ? (lang === 'vi' ? 'Bản ghi hình phỏng vấn:' : 'Video recording:') 
                                  : (lang === 'vi' ? 'Bản ghi âm:' : 'Audio recording:')}
                              </span>
                              {ans.audioUrl.toLowerCase().includes('.webm') || ans.audioUrl.toLowerCase().includes('.mp4') || ans.audioUrl.startsWith('blob:') ? (
                                <video src={ans.audioUrl} controls playsInline className="h-28 rounded-lg max-w-xs bg-black" />
                              ) : (
                                <audio src={ans.audioUrl} controls className="h-7" />
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

            {/* Footer action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleReviewBack}
                className="w-full sm:flex-1 h-13 bg-white border border-slate-250 text-slate-700 font-extrabold text-sm rounded-2xl cursor-pointer hover:bg-slate-50 active:scale-97 select-none"
              >
                ← {lang === 'vi' ? 'Quay lại chỉnh sửa' : 'Go back and edit'}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className={`w-full sm:flex-1 h-13 font-extrabold text-sm rounded-2xl cursor-pointer active:scale-97 select-none shadow-md flex items-center justify-center gap-1.5 transition-all ${
                  isSubmitting ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isSubmitting ? (lang === 'vi' ? 'Đang gửi khảo sát...' : 'Submitting responses...') : (lang === 'vi' ? 'Gửi khảo sát' : 'Submit survey')}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 text-center space-y-6 max-w-sm mx-auto shadow-sm animate-in fade-in duration-200">
            <div className="h-16 w-16 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm">
              ✓
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 leading-tight">
                {lang === 'vi' ? 'Hoàn thành!' : 'Completed!'}
              </h1>
              <p className="text-base text-slate-700 font-extrabold">
                {lang === 'vi' ? 'Cảm ơn đã khảo sát' : 'Thank you for participating'}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                {lang === 'vi' 
                  ? 'Phản hồi khảo sát của bạn đã được lưu giữ thành công để phục vụ công tác nghiên cứu luận văn.' 
                  : 'Your survey responses have been successfully saved for research purposes.'}
              </p>
            </div>

            <div className="py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl w-fit mx-auto">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                {lang === 'vi' ? 'Mã người tham gia của bạn:' : 'Your participant code:'}
              </span>
              <span className="text-xl font-black text-slate-950 block mt-0.5">{participantCode}</span>
            </div>

            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              {lang === 'vi' ? 'Bạn có thể đóng tab trình duyệt này an toàn.' : 'You can safely close this browser tab.'}
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
        <p className="text-xs text-slate-455 font-black italic max-w-md mx-auto leading-relaxed">
          {renderTextWithRedAsterisks(t('footerNote'))}
        </p>
      </footer>

    </div>
  );
};
