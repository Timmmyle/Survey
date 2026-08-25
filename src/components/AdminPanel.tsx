import React, { useState } from 'react';
import { PositionQuestions, Question } from '../types';
import { Settings, Plus, Trash2, X, PlusCircle, LayoutGrid } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  positions: string[];
  questionsByPosition: PositionQuestions[];
  onUpdateQuestions: (updatedQuestions: PositionQuestions[]) => void;
  onUpdatePositions: (updatedPositions: string[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  positions,
  questionsByPosition,
  onUpdateQuestions,
  onUpdatePositions,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<string>(positions[0] || '');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newPositionName, setNewPositionName] = useState('');
  const [positionError, setPositionError] = useState('');
  const [questionError, setQuestionError] = useState('');

  if (!isOpen) return null;

  // Find questions for selected position
  const currentPosData = questionsByPosition.find((q) => q.position === selectedPosition);
  const currentQuestions = currentPosData ? currentPosData.questions : [];

  // Add a new position
  const handleAddPosition = () => {
    setPositionError('');
    const name = newPositionName.trim();
    if (!name) {
      setPositionError('Tên vị trí tuyển dụng không được trống');
      return;
    }
    if (positions.some((p) => p.toLowerCase() === name.toLowerCase())) {
      setPositionError('Vị trí tuyển dụng này đã tồn tại');
      return;
    }

    const updatedPositions = [...positions, name];
    const updatedQuestions = [
      ...questionsByPosition,
      { position: name, questions: [] },
    ];

    onUpdatePositions(updatedPositions);
    onUpdateQuestions(updatedQuestions);
    setSelectedPosition(name);
    setNewPositionName('');
  };

  // Add a question to selected position
  const handleAddQuestion = () => {
    setQuestionError('');
    const text = newQuestionText.trim();
    if (!text) {
      setQuestionError('Nội dung câu hỏi không được trống');
      return;
    }

    const newQuestion: Question = {
      id: `${selectedPosition.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      text,
    };

    const updatedQuestions = questionsByPosition.map((posQ) => {
      if (posQ.position === selectedPosition) {
        return {
          ...posQ,
          questions: [...posQ.questions, newQuestion],
        };
      }
      return posQ;
    });

    onUpdateQuestions(updatedQuestions);
    setNewQuestionText('');
  };

  // Delete a question from selected position
  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = questionsByPosition.map((posQ) => {
      if (posQ.position === selectedPosition) {
        return {
          ...posQ,
          questions: posQ.questions.filter((q) => q.id !== questionId),
        };
      }
      return posQ;
    });
    onUpdateQuestions(updatedQuestions);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-400" />
            <h2 className="font-semibold text-lg">Quản lý câu hỏi phỏng vấn (Admin)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Create Position */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-3">
              <PlusCircle className="h-4.5 w-4.5 text-indigo-600" />
              Thêm vị trí tuyển dụng mới
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPositionName}
                onChange={(e) => {
                  setNewPositionName(e.target.value);
                  setPositionError('');
                }}
                placeholder="Ví dụ: Data Analyst, Devops Engineer..."
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddPosition}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Thêm vị trí
              </button>
            </div>
            {positionError && <p className="text-red-500 text-xs mt-1.5 font-medium">{positionError}</p>}
          </div>

          {/* Section 2: Manage questions */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <LayoutGrid className="h-4.5 w-4.5 text-indigo-600" />
                Chọn vị trí để chỉnh sửa câu hỏi:
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => {
                  setSelectedPosition(e.target.value);
                  setQuestionError('');
                }}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm bg-white font-medium"
              >
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* List of questions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Danh sách câu hỏi hiện tại ({currentQuestions.length})</h4>
              {currentQuestions.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center">
                  Chưa có câu hỏi nào cho vị trí này. Hãy thêm câu hỏi bên dưới.
                </p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {currentQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="flex items-start justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex gap-2">
                        <span className="text-xs font-semibold text-slate-400 mt-0.5">{idx + 1}.</span>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">{q.text}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add question form */}
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Thêm câu hỏi mới vào vị trí "{selectedPosition}"
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => {
                    setNewQuestionText(e.target.value);
                    setQuestionError('');
                  }}
                  placeholder="Ví dụ: Kỹ năng quản lý thời gian và giải quyết xung đột?"
                  className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center justify-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Thêm câu hỏi
                </button>
              </div>
              {questionError && <p className="text-red-500 text-xs mt-1.5 font-medium">{questionError}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Hoàn tất thiết lập
          </button>
        </div>
      </div>
    </div>
  );
};

