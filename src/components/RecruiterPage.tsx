import React, { useState } from 'react';
import { CandidateInfo, Question, PositionQuestions, EvaluationResult } from '../types';
import { CandidateInfoCard } from './CandidateInfoCard';
import { LikertQuestion } from './LikertQuestion';
import { AudioRecorder } from './AudioRecorder';
import { AdminPanel } from './AdminPanel';
import { Settings, Award, ClipboardCheck, ArrowLeft, AlertTriangle } from 'lucide-react';

interface RecruiterPageProps {
  candidate: CandidateInfo;
  positions: string[];
  questionsByPosition: PositionQuestions[];
  onUpdateCandidate: (updated: CandidateInfo) => void;
  onUpdateQuestions: (updated: PositionQuestions[]) => void;
  onUpdatePositions: (updated: string[]) => void;
  onBack: () => void;
  onComplete: (result: { scores: Record<string, number>; transcript: string; audioUrl: string | null }) => void;
}

export const RecruiterPage: React.FC<RecruiterPageProps> = ({
  candidate,
  positions,
  questionsByPosition,
  onUpdateCandidate,
  onUpdateQuestions,
  onUpdatePositions,
  onBack,
  onComplete,
}) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Find questions for candidate's position
  const currentPosData = questionsByPosition.find((q) => q.position === candidate.position);
  const currentQuestions = currentPosData ? currentPosData.questions : [];

  const handleScoreChange = (questionId: string, rating: number) => {
    setScores((prev) => ({
      ...prev,
      [questionId]: rating,
    }));
    setValidationError('');
  };

  const handleComplete = () => {
    const unanswered = currentQuestions.filter((q) => !scores[q.id]);

    if (unanswered.length > 0) {
      setValidationError(
        `Vui lòng đánh giá tất cả các tiêu chí trước khi hoàn tất. Còn ${unanswered.length} tiêu chí chưa cho điểm.`
      );
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    onComplete({
      scores,
      transcript,
      audioUrl,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-800">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4.5 rounded-3xl shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-extrabold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-slate-400" />
          Quay lại Trang Ứng Viên
        </button>

        <button
          onClick={() => setIsAdminOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-indigo-750 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 active:bg-indigo-200 rounded-xl font-extrabold text-xs transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4 animate-spin-hover" />
          Cấu hình câu hỏi (Admin)
        </button>
      </div>

      {/* 1. Candidate Info Card */}
      <CandidateInfoCard
        candidate={candidate}
        positions={positions}
        onUpdate={onUpdateCandidate}
      />

      {/* Validation alert banner */}
      {validationError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-semibold animate-shake">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-650" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 2. Evaluation criteria list */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="h-5 w-5 text-slate-450 shrink-0" />
          <div>
            <h3 className="font-extrabold text-slate-900 text-base leading-tight">Bảng đánh giá năng lực</h3>
            <p className="text-slate-400 text-xs mt-0.5">Tiêu chuẩn phỏng vấn vị trí: <span className="font-bold text-indigo-650">{candidate.position}</span></p>
          </div>
        </div>

        {currentQuestions.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500">
            <p className="text-sm italic mb-2">Chưa có tiêu chí đánh giá cho vị trí này.</p>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Thêm câu hỏi ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentQuestions.map((q, index) => (
              <LikertQuestion
                key={q.id}
                id={q.id}
                text={q.text}
                index={index}
                currentScore={scores[q.id]}
                onChange={(rating) => handleScoreChange(q.id, rating)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Audio recorder and transcripts */}
      <AudioRecorder
        candidatePosition={candidate.position}
        onTranscriptChange={setTranscript}
        onAudioBlobChange={setAudioUrl}
        initialTranscript={transcript}
        initialAudioUrl={audioUrl}
      />

      {/* Complete button */}
      <div className="flex justify-end border-t border-slate-150 pt-5">
        <button
          onClick={handleComplete}
          className="h-13 px-8 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-1.5 shadow-md active:scale-97 transition-all select-none cursor-pointer"
        >
          <ClipboardCheck className="h-4.5 w-4.5 shrink-0" />
          Hoàn tất đánh giá
        </button>
      </div>

      {/* Admin Panel Modal Dialog */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        positions={positions}
        questionsByPosition={questionsByPosition}
        onUpdateQuestions={onUpdateQuestions}
        onUpdatePositions={onUpdatePositions}
      />
    </div>
  );
};
