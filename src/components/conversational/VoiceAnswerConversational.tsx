import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RotateCcw, Play, CheckCircle2, AlertCircle } from 'lucide-react';

interface VoiceAnswerConversationalProps {
  onAudioConfirmed: (audioUrl: string | null, textTranscript: string) => void;
  initialAudioUrl?: string | null;
  initialTranscript?: string;
  useCamera?: boolean;
}

export const VoiceAnswerConversational: React.FC<VoiceAnswerConversationalProps> = ({
  onAudioConfirmed,
  initialAudioUrl = null,
  initialTranscript = '',
  useCamera = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    setErrorMsg(null);
    setAudioUrl(null);
    setTranscript('');
    setIsConfirmed(false);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg(useCamera ? 'Thiết bị của bạn không hỗ trợ Camera/Microphone.' : 'Thiết bị của bạn không hỗ trợ Microphone.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: useCamera ? { facingMode: 'user', width: 480, height: 360 } : false
      });
      streamRef.current = stream;

      // Set live preview stream if using camera
      if (useCamera) {
        setTimeout(() => {
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = stream;
          }
        }, 100);
      }

      let options = {};
      if (useCamera) {
        if (MediaRecorder.isTypeSupported('video/webm')) {
          options = { mimeType: 'video/webm;codecs=vp8,opus' };
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options = { mimeType: 'video/mp4' };
        }
      } else {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blobType = useCamera ? 'video/webm' : 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: blobType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      // Real-time speech transcription (Vietnamese)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'vi-VN';

        recognition.onresult = (event: any) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              text += event.results[i][0].transcript + ' ';
            }
          }
          if (text) {
            setTranscript((prev) => prev + text);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg(useCamera 
          ? 'Quyền truy cập Camera/Microphone bị chặn. Vui lòng cấp quyền trong cài đặt trình duyệt.' 
          : 'Quyền truy cập Microphone bị chặn. Vui lòng cấp quyền trong cài đặt trình duyệt.');
      } else {
        setErrorMsg(useCamera ? 'Lỗi kết nối Camera/Microphone.' : 'Lỗi kết nối Microphone.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const handleDiscard = () => {
    setAudioUrl(null);
    setTranscript('');
    setIsConfirmed(false);
    setRecordingSeconds(0);
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    const textReport = transcript.trim() || (useCamera ? '(Ghi hình phỏng vấn)' : '(Ghi âm giọng nói)');
    onAudioConfirmed(audioUrl, textReport);
  };

  const handleTextEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!audioUrl ? (
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {!isRecording ? (
            <div className="text-center space-y-4 w-full">
              <p className="text-sm font-semibold text-slate-500">
                {useCamera ? 'Vui lòng nhấn để ghi nhận hình ảnh và âm thanh trả lời.' : 'Bạn có thể nói câu trả lời của mình.'}
              </p>
              
              <button
                type="button"
                onClick={startRecording}
                className="mx-auto flex flex-col items-center justify-center h-28 w-28 bg-slate-900 text-white rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 border-2 border-slate-700 animate-in fade-in duration-200"
              >
                <Mic className="h-8 w-8 mb-1 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-355">
                  {useCamera ? 'Bật Camera' : 'Nhấn để nói'}
                </span>
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4 w-full">
              <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full w-fit mx-auto animate-pulse">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
                <span className="text-[10px] font-black text-red-700 uppercase tracking-wider">Đang ghi hình/âm</span>
              </div>

              {useCamera && (
                <div className="w-full max-w-xs mx-auto border-2 border-red-500 rounded-2xl overflow-hidden bg-black aspect-video relative">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-600 text-white font-mono text-[9px] font-bold rounded-sm animate-pulse">
                    REC
                  </div>
                </div>
              )}

              <span className="block text-4xl font-black font-mono text-slate-900">
                {formatTime(recordingSeconds)}
              </span>

              {/* Waveform indicator */}
              <div className="flex items-center justify-center gap-1 h-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
                  const animDelays = ['0.1s', '0.3s', '0.5s', '0.2s', '0.4s', '0.6s', '0.15s', '0.35s', '0.25s', '0.45s'];
                  return (
                    <span
                      key={bar}
                      className="w-1 bg-indigo-600 rounded-full animate-wave"
                      style={{
                        animationDelay: animDelays[bar - 1],
                        height: bar % 2 === 0 ? '16px' : '24px'
                      }}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={stopRecording}
                className="h-13 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-sm shadow-md cursor-pointer flex items-center justify-center gap-2 mx-auto active:scale-95"
              >
                <Square className="h-4 w-4 fill-white" />
                Dừng
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 w-full bg-slate-50 border border-slate-200 p-4 rounded-3xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">✓ Đã ghi</span>
            <span className="font-mono text-xs font-bold text-slate-500">{formatTime(recordingSeconds)}</span>
          </div>
          
          {useCamera ? (
            <video src={audioUrl} controls playsInline className="w-full rounded-2xl max-h-56 bg-black" />
          ) : (
            <audio src={audioUrl} controls className="h-10 w-full" />
          )}
          
          {/* Transcript display */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Câu trả lời được nhận diện:</label>
            <textarea
              value={transcript}
              onChange={handleTextEdit}
              rows={3}
              placeholder="Giọng nói của bạn sẽ chuyển đổi ở đây. Bạn có thể tự gõ bổ sung..."
              className="w-full p-3.5 border border-slate-300 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 leading-relaxed font-semibold text-slate-700 resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={handleDiscard}
              className="flex items-center gap-1.5 px-4.5 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl cursor-pointer shadow-xs"
            >
              <RotateCcw className="h-4 w-4 text-slate-400" />
              Ghi lại
            </button>

            {!isConfirmed ? (
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-5 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 stroke-[3]" />
                Sử dụng câu trả lời
              </button>
            ) : (
              <span className="flex items-center gap-1 px-4.5 py-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black rounded-2xl shadow-inner">
                <CheckCircle2 className="h-4 w-4" />
                Đã sử dụng
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
