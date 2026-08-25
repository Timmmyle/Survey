import React, { useState, useEffect } from 'react';
import { Survey, SurveyQuestion, SurveyResponse } from '../types';
import { AccessibilityMenu, AccessibilitySettings } from './conversational/AccessibilityMenu';
import { InterviewWelcome } from './conversational/InterviewWelcome';
import { ConsentScreen } from './conversational/ConsentScreen';
import { VoiceAnswerConversational } from './conversational/VoiceAnswerConversational';
import { Volume2, ChevronLeft, AlertTriangle, WifiOff, Check } from 'lucide-react';

interface SurveyRespondentProps {
  survey: Survey;
  questions: SurveyQuestion[];
  onSubmit: (response: Omit<SurveyResponse, 'id' | 'submittedAt'>) => void;
  onBackToDashboard?: () => void;
}

type FlowStep = 'recovery-prompt' | 'welcome' | 'consent' | 'interview' | 'completion';

export const SurveyRespondent: React.FC<SurveyRespondentProps> = ({
  survey,
  questions,
  onSubmit,
  onBackToDashboard,
}) => {
  const [flowStep, setFlowStep] = useState<FlowStep>('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);

  // States
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNetworkRestore, setShowNetworkRestore] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState(false);

  // Double-mode voice option trigger
  const [showVoiceRecorderForText, setShowVoiceRecorderForText] = useState<string | null>(null);

  // Accessibility States
  const [accessSettings, setAccessSettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    highContrast: false,
    voiceGuides: false,
  });

  const autosaveKey = `survey_autosave_${survey.id}`;

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNetworkRestore(true);
      setTimeout(() => setShowNetworkRestore(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowNetworkRestore(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for auto-save recovery on load
  useEffect(() => {
    const savedData = localStorage.getItem(autosaveKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.answers && Object.keys(parsed.answers).length > 0) {
          setFlowStep('recovery-prompt');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [survey.id]);

  // Read current question automatically if voice guide is ON
  useEffect(() => {
    if (flowStep === 'interview' && accessSettings.voiceGuides && questions[currentIndex]) {
      const q = questions[currentIndex];
      const text = `${q.title}. ${q.description ? q.description : ''}`;
      readTextAloud(text);
    }
  }, [currentIndex, flowStep, accessSettings.voiceGuides]);

  const saveProgress = (updatedAnswers: Record<string, any>, index: number, step: FlowStep) => {
    localStorage.setItem(
      autosaveKey,
      JSON.stringify({
        answers: updatedAnswers,
        currentQuestionIndex: index,
        step,
        consentGiven,
      })
    );
  };

  const handleRecover = () => {
    const savedData = localStorage.getItem(autosaveKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAnswers(parsed.answers || {});
        setCurrentIndex(parsed.currentQuestionIndex || 0);
        setConsentGiven(parsed.consentGiven !== undefined ? parsed.consentGiven : null);
        setFlowStep(parsed.step || 'interview');
      } catch (e) {
        setFlowStep('welcome');
      }
    }
  };

  const handleDiscardRecovery = () => {
    localStorage.removeItem(autosaveKey);
    setAnswers({});
    setCurrentIndex(0);
    setConsentGiven(null);
    setFlowStep('welcome');
  };

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

  const handleStart = () => {
    const hasVoiceQuestion = questions.some((q) => q.type === 'Voice Answer');
    if (hasVoiceQuestion) {
      setFlowStep('consent');
      saveProgress(answers, currentIndex, 'consent');
    } else {
      setFlowStep('interview');
      saveProgress(answers, 0, 'interview');
    }
  };

  const handleConsentDecision = (agreed: boolean) => {
    setConsentGiven(agreed);
    setFlowStep('interview');
    localStorage.setItem(
      autosaveKey,
      JSON.stringify({
        answers,
        currentQuestionIndex: 0,
        step: 'interview',
        consentGiven: agreed,
      })
    );
  };

  const handleAnswerChange = (questionId: string, val: any) => {
    const updatedAnswers = { ...answers, [questionId]: val };
    setAnswers(updatedAnswers);
    setValidationError(null);
    saveProgress(updatedAnswers, currentIndex, 'interview');
  };

  const handleMultiSelectChange = (questionId: string, option: string) => {
    const currentList: string[] = answers[questionId] || [];
    let newList: string[];

    if (currentList.includes(option)) {
      newList = currentList.filter((item) => item !== option);
    } else {
      newList = [...currentList, option];
    }

    handleAnswerChange(questionId, newList);
  };

  const handleNext = () => {
    const q = questions[currentIndex];
    const val = answers[q.id];

    if (q.required) {
      const isUnanswered =
        val === undefined ||
        val === null ||
        (typeof val === 'string' && val.trim() === '') ||
        (Array.isArray(val) && val.length === 0);

      if (isUnanswered) {
        setValidationError('Vui lòng chọn một câu trả lời để tiếp tục.');
        return;
      }
    }

    if (currentIndex < questions.length - 1) {
      setValidationError(null);
      setShowVoiceRecorderForText(null);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      saveProgress(answers, nextIdx, 'interview');
    } else {
      onSubmit({
        surveyId: survey.id,
        answers,
      });
      localStorage.removeItem(autosaveKey);
      setFlowStep('completion');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setValidationError(null);
      setShowVoiceRecorderForText(null);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      saveProgress(answers, prevIdx, 'interview');
    }
  };

  // Generate ASCII block progress bar
  const renderProgressBar = () => {
    const total = questions.length;
    const answered = currentIndex + 1;
    const filledBlocks = Math.round((answered / total) * 10);
    const emptyBlocks = 10 - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  };

  // Accessibility Style generators
  const getFontSizeClass = () => {
    switch (accessSettings.fontSize) {
      case 'large':
        return 'text-lg';
      case 'extra-large':
        return 'text-xl';
      default:
        return 'text-sm';
    }
  };

  const getQuestionSizeClass = () => {
    switch (accessSettings.fontSize) {
      case 'large':
        return 'text-2xl md:text-3xl';
      case 'extra-large':
        return 'text-3xl md:text-4xl';
      default:
        return 'text-xl md:text-2xl';
    }
  };

  const getContainerStyles = () => {
    let classes = 'min-h-[90vh] flex flex-col justify-between py-6 px-4 max-w-lg mx-auto ';
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

  const getOptionStyles = (isSelected: boolean) => {
    if (accessSettings.highContrast) {
      return `w-full text-left p-4 border-4 text-base font-black transition-all flex items-center gap-3 ${
        isSelected ? 'bg-black text-white border-black' : 'bg-white border-black text-black'
      }`;
    }
    return `w-full text-left p-4 border-2 rounded-2xl text-sm transition-all font-semibold flex items-center gap-3 active:scale-99 ${
      isSelected
        ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-100 shadow-sm'
        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
    }`;
  };

  const getNavButtonStyles = (isPrimary: boolean) => {
    if (accessSettings.highContrast) {
      return `px-6 py-4 border-4 border-black font-black text-sm uppercase ${
        isPrimary ? 'bg-black text-white' : 'bg-white text-black'
      }`;
    }
    return `px-7 py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs select-none ${
      isPrimary
        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-97'
        : 'bg-white border border-slate-250 text-slate-750 hover:bg-slate-50 active:scale-97'
    }`;
  };

  return (
    <div className={getContainerStyles()}>
      
      {/* 1. Offline Alert Banners */}
      {!isOnline && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-300 p-4 mb-4 animate-bounce">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-800 leading-relaxed font-semibold">
            <p className="font-extrabold">⚠️ Không có kết nối mạng</p>
            <p className="mt-0.5 text-slate-500">Câu trả lời của bạn vẫn đang được lưu an toàn trên thiết bị.</p>
          </div>
        </div>
      )}

      {showNetworkRestore && (
        <div className="flex items-center gap-2 bg-slate-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl mb-4 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="h-4.5 w-4.5 text-emerald-400 stroke-[3]" />
          <span>✓ Đã kết nối lại</span>
        </div>
      )}

      {/* 2. Unified Question Stepper Header */}
      {flowStep === 'interview' && questions[currentIndex] && (
        <div className="flex flex-col gap-1.5 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
            <span>Câu {currentIndex + 1} / {questions.length}</span>
            <span className="font-mono">{renderProgressBar()}</span>
          </div>
        </div>
      )}

      {/* 3. Primary Stepper Screen Canvas */}
      <div className="flex-1 flex flex-col justify-center">
        
        {/* Recovery prompt */}
        {flowStep === 'recovery-prompt' && (
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 text-center space-y-5 max-w-sm mx-auto shadow-lg">
            <div className="text-4xl">⏱</div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-black text-slate-900">Bạn muốn tiếp tục cuộc phỏng vấn?</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bạn đã hoàn thành <strong>{currentIndex + 1} / {questions.length}</strong> câu hỏi từ trước.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleRecover}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl cursor-pointer"
              >
                Tiếp tục
              </button>
              <button
                type="button"
                onClick={handleDiscardRecovery}
                className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl cursor-pointer border border-slate-250"
              >
                Bắt đầu lại
              </button>
            </div>
          </div>
        )}

        {/* Welcome slide */}
        {flowStep === 'welcome' && (
          <InterviewWelcome
            title={survey.title}
            description={survey.description}
            onStart={handleStart}
            onReadAloud={readTextAloud}
          />
        )}

        {/* Consent slide */}
        {flowStep === 'consent' && (
          <ConsentScreen onConsentDecision={handleConsentDecision} />
        )}

        {/* Completion slide */}
        {flowStep === 'completion' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 text-center space-y-6 max-w-sm mx-auto shadow-sm animate-in fade-in duration-200 text-slate-800">
            <div className="text-5xl text-emerald-600">✓</div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900">Hoàn thành!</h1>
              <p className="text-base text-slate-700 font-extrabold">
                Cảm ơn đã khảo sát
              </p>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Câu trả lời của bạn đã được ghi nhận thành công.
              </p>
            </div>
          </div>
        )}

        {/* Question panel */}
        {flowStep === 'interview' && questions[currentIndex] && (
          <div className="space-y-5">
            {/* Validation alert banner */}
            {validationError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-semibold animate-shake">
                <AlertTriangle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Main Question view */}
            <div className={getCardStyles()}>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h2 className={`font-black text-slate-900 leading-snug tracking-tight ${getQuestionSizeClass()}`}>
                    {questions[currentIndex].title}
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      readTextAloud(
                        `${questions[currentIndex].title}. ${
                          questions[currentIndex].description || ''
                        }`
                      )
                    }
                    className={`p-2 border rounded-full shrink-0 cursor-pointer transition-colors active:scale-95 ${
                      activeSpeech
                        ? 'bg-amber-50 border-amber-400 text-amber-700 animate-pulse'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                    title="Đọc câu hỏi bằng giọng nói"
                  >
                    <Volume2 className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="border-b border-slate-150 flex items-center justify-between pb-2 mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    🔊 Đọc câu hỏi
                  </span>
                </div>
              </div>

              {questions[currentIndex].description && (
                <p className={`text-slate-450 mt-1.5 leading-relaxed font-semibold ${getFontSizeClass()}`}>
                  {questions[currentIndex].description}
                </p>
              )}

              {/* Input rendering matching the types */}
              <div className="mt-6">
                
                {/* Short text input */}
                {questions[currentIndex].type === 'Short Text' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={answers[questions[currentIndex].id] || ''}
                      onChange={(e) => handleAnswerChange(questions[currentIndex].id, e.target.value)}
                      placeholder="Hãy nhập câu trả lời ngắn của bạn..."
                      className="w-full px-4 py-3.5 border-2 border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-500 text-base"
                    />

                    {/* Speech recorder backup option (if consent) */}
                    {consentGiven && (
                      <div className="pt-1">
                        {showVoiceRecorderForText !== questions[currentIndex].id ? (
                          <button
                            type="button"
                            onClick={() => setShowVoiceRecorderForText(questions[currentIndex].id)}
                            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            🎙️ Trả lời bằng giọng nói
                          </button>
                        ) : (
                          <div className="space-y-2 border-t border-slate-100 pt-3">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                              <span>Bộ ghi âm câu trả lời</span>
                              <button
                                type="button"
                                onClick={() => setShowVoiceRecorderForText(null)}
                                className="text-red-500 hover:underline"
                              >
                                Tắt ghi âm
                              </button>
                            </div>
                            <VoiceAnswerConversational
                              onAudioConfirmed={(_, text) => {
                                handleAnswerChange(questions[currentIndex].id, text);
                              }}
                              initialTranscript={answers[questions[currentIndex].id]}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Long text input */}
                {questions[currentIndex].type === 'Long Text' && (
                  <div className="space-y-3">
                    <textarea
                      value={answers[questions[currentIndex].id] || ''}
                      onChange={(e) => handleAnswerChange(questions[currentIndex].id, e.target.value)}
                      rows={5}
                      placeholder="Hãy nhập câu trả lời chi tiết..."
                      className="w-full px-4 py-3.5 border-2 border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-500 text-base resize-none leading-relaxed"
                    />

                    {/* Speech recorder backup option (if consent) */}
                    {consentGiven && (
                      <div className="pt-1">
                        {showVoiceRecorderForText !== questions[currentIndex].id ? (
                          <button
                            type="button"
                            onClick={() => setShowVoiceRecorderForText(questions[currentIndex].id)}
                            className="text-xs font-extrabold text-indigo-655 hover:text-indigo-850 flex items-center gap-1 cursor-pointer"
                          >
                            🎙️ Trả lời bằng giọng nói
                          </button>
                        ) : (
                          <div className="space-y-2 border-t border-slate-100 pt-3">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                              <span>Bộ ghi âm câu trả lời</span>
                              <button
                                type="button"
                                onClick={() => setShowVoiceRecorderForText(null)}
                                className="text-red-500 hover:underline animate-pulse"
                              >
                                Tắt ghi âm
                              </button>
                            </div>
                            <VoiceAnswerConversational
                              onAudioConfirmed={(_, text) => {
                                handleAnswerChange(questions[currentIndex].id, text);
                              }}
                              initialTranscript={answers[questions[currentIndex].id]}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Yes / No layout */}
                {questions[currentIndex].type === 'Yes / No' && (
                  <div className="grid grid-cols-1 gap-3 max-w-xs mx-auto">
                    {[
                      { val: 'Yes', label: '✓  CÓ' },
                      { val: 'No', label: '✕  KHÔNG' },
                    ].map((btn) => {
                      const isSelected = answers[questions[currentIndex].id] === btn.val;
                      return (
                        <button
                          key={btn.val}
                          type="button"
                          onClick={() => handleAnswerChange(questions[currentIndex].id, btn.val)}
                          className={`min-h-18 flex items-center justify-center border-2 text-lg font-black transition-all cursor-pointer select-none ${
                            accessSettings.highContrast
                              ? isSelected
                                ? 'bg-black text-white border-black border-4'
                                : 'bg-white text-black border-black border-4'
                              : isSelected
                              ? 'bg-slate-900 border-slate-900 text-white rounded-2xl shadow-md scale-102'
                              : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50 rounded-2xl'
                          }`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Rating 1-5 layout with Emojis */}
                {questions[currentIndex].type === 'Rating / Scale' && (
                  <div className="space-y-5 max-w-sm mx-auto">
                    {/* Emojis subheaders */}
                    <div className="flex justify-between items-center text-slate-400 font-bold px-1.5 pt-1">
                      <div className="flex flex-col items-start">
                        <span className="text-3.5xl">😞</span>
                        <span className="text-[10px] mt-0.5 font-bold tracking-wide uppercase text-slate-400">Rất tệ</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-3.5xl">😍</span>
                        <span className="text-[10px] mt-0.5 font-bold tracking-wide uppercase text-slate-400">Rất tốt</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((num) => {
                        const isSelected = answers[questions[currentIndex].id] === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleAnswerChange(questions[currentIndex].id, num)}
                            className={`h-12 border flex items-center justify-center font-mono text-base font-black transition-all cursor-pointer select-none ${
                              accessSettings.highContrast
                                ? isSelected
                                  ? 'bg-black text-white border-black border-4'
                                  : 'bg-white text-black border-black border-4'
                                : isSelected
                                ? 'bg-slate-900 border-slate-900 text-white rounded-2xl shadow-md scale-108'
                                : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 rounded-2xl'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Single Choice cards list */}
                {questions[currentIndex].type === 'Single Choice' && (
                  <div className="space-y-3">
                    {questions[currentIndex].options?.map((opt) => {
                      const isSelected = answers[questions[currentIndex].id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleAnswerChange(questions[currentIndex].id, opt)}
                          className={getOptionStyles(isSelected)}
                        >
                          <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 bg-white ${
                            accessSettings.highContrast
                              ? 'border-black'
                              : isSelected ? 'border-indigo-650' : 'border-slate-300'
                          }`}>
                            {isSelected && (
                              <span className={`h-3 w-3 rounded-full ${
                                accessSettings.highContrast ? 'bg-black' : 'bg-indigo-600'
                              }`} />
                            )}
                          </span>
                          <span className={getFontSizeClass()}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Multiple Choice cards list */}
                {questions[currentIndex].type === 'Multiple Choice' && (
                  <div className="space-y-3">
                    {questions[currentIndex].options?.map((opt) => {
                      const isSelected = (answers[questions[currentIndex].id] as string[] || []).includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleMultiSelectChange(questions[currentIndex].id, opt)}
                          className={getOptionStyles(isSelected)}
                        >
                          <span className={`h-5 w-5 rounded-xs border-2 flex items-center justify-center shrink-0 ${
                            accessSettings.highContrast
                              ? 'border-black'
                              : isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </span>
                          <span className={getFontSizeClass()}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Voice Answering screen */}
                {questions[currentIndex].type === 'Voice Answer' && (
                  consentGiven === false ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400 font-bold bg-slate-100 p-2.5 rounded-lg">
                        * Bạn đã chọn trả lời bằng bàn phím. Vui lòng gõ vào ô bên dưới.
                      </p>
                      <textarea
                        value={answers[questions[currentIndex].id] || ''}
                        onChange={(e) => handleAnswerChange(questions[currentIndex].id, e.target.value)}
                        rows={5}
                        placeholder="Hãy nhập câu trả lời của bạn..."
                        className="w-full px-4 py-3.5 border-2 border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-500 text-base"
                      />
                    </div>
                  ) : (
                    <VoiceAnswerConversational
                      onAudioConfirmed={(url, text) => {
                        handleAnswerChange(questions[currentIndex].id, url || text);
                      }}
                      initialAudioUrl={
                        typeof answers[questions[currentIndex].id] === 'string' &&
                        answers[questions[currentIndex].id].startsWith('blob:')
                          ? answers[questions[currentIndex].id]
                          : null
                      }
                      initialTranscript={
                        typeof answers[questions[currentIndex].id] === 'string' &&
                        !answers[questions[currentIndex].id].startsWith('blob:')
                          ? answers[questions[currentIndex].id]
                          : ''
                      }
                    />
                  )
                )}

              </div>

              {/* Redesigned Actions Navigation Panel - Moved inside the Question Card container */}
              <div className="border-t border-slate-150 pt-5 mt-6 flex flex-col gap-4">
                <div className="flex justify-between items-center w-full">
                  {/* Minimal floating gear menu */}
                  <AccessibilityMenu
                    settings={accessSettings}
                    onUpdateSettings={setAccessSettings}
                  />

                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                    Đã tự động lưu nháp
                  </span>
                </div>

                <div className="flex items-center gap-2 justify-between w-full">
                  {/* Back button */}
                  {currentIndex > 0 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className={getNavButtonStyles(false)}
                    >
                      ← Quay lại
                    </button>
                  ) : (
                    <div />
                  )}

                  {/* Next / Submit buttons */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className={getNavButtonStyles(true)}
                  >
                    {currentIndex === questions.length - 1 ? 'Nộp câu trả lời' : 'Tiếp tục →'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
