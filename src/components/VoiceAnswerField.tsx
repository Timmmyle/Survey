import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, CheckCircle2, AlertCircle, Play, Pause } from 'lucide-react';

interface VoiceAnswerFieldProps {
  questionId: string;
  onAudioChange: (url: string | null) => void;
  required?: boolean;
  initialAudioUrl?: string | null;
}

export const VoiceAnswerField: React.FC<VoiceAnswerFieldProps> = ({
  onAudioChange,
  initialAudioUrl = null,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up recording stream & timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setIsConfirmed(false);
    audioChunksRef.current = [];

    // Browser support check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Trình duyệt hoặc thiết bị của bạn không hỗ trợ ghi âm trực tiếp.');
      return;
    }

    try {
      // Permission prompt is triggered ONLY on click
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioChange(url);

        // Turn off microphone tracks to release device active indicator
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Quyền truy cập Microphone bị từ chối. Vui lòng mở quyền trong cài đặt trình duyệt để thực hiện ghi âm.');
      } else {
        setErrorMessage('Không thể truy cập Microphone. Vui lòng kiểm tra thiết bị cắm của bạn.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const handleDiscard = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này để ghi lại?')) {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);
      onAudioChange(null);
      setIsConfirmed(false);
      setRecordingSeconds(0);
    }
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4">
      {errorMessage && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recording flow controls */}
      {!audioUrl ? (
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center justify-center gap-2 h-14 px-6 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-full text-base font-bold shadow-md cursor-pointer transition-transform hover:scale-105 select-none w-full max-w-xs"
            >
              <Mic className="h-5 w-5" />
              Bấm để Ghi âm trả lời
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-3 w-full">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full animate-pulse">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600"></span>
                <span className="text-xs font-bold text-red-700">Đang ghi âm trả lời...</span>
              </div>
              <span className="text-3xl font-black font-mono text-slate-800">
                {formatDuration(recordingSeconds)}
              </span>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center justify-center gap-2 h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-bold shadow-sm cursor-pointer select-none"
              >
                <Square className="h-4 w-4" />
                Dừng ghi âm
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {/* Audio Player and Decision control */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
            <audio src={audioUrl} controls className="h-9 w-full sm:flex-1" />
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleDiscard}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                title="Xóa bản ghi"
              >
                <Trash2 className="h-4 w-4" />
                Xóa làm lại
              </button>

              {!isConfirmed ? (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Xác nhận bản ghi
                </button>
              ) : (
                <span className="flex items-center gap-1 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Đã xác nhận
                </span>
              )}
            </div>
          </div>

          {!isConfirmed && (
            <p className="text-[11px] text-amber-600 text-center font-medium">
              Vui lòng nghe lại và bấm <strong>Xác nhận bản ghi</strong> để lưu câu trả lời này.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

