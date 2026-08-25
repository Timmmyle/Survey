import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, AlertCircle, RefreshCw, FileText, Check } from 'lucide-react';

interface AudioRecorderProps {
  onTranscriptChange: (text: string) => void;
  onAudioBlobChange: (audioUrl: string | null) => void;
  candidatePosition: string;
  initialTranscript?: string;
  initialAudioUrl?: string | null;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptChange,
  onAudioBlobChange,
  candidatePosition,
  initialTranscript = '',
  initialAudioUrl = null,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [speechActive, setSpeechActive] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    }
  }, []);

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    audioChunksRef.current = [];
    setTranscript('');
    onTranscriptChange('');
    setAudioUrl(null);
    onAudioBlobChange(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        onAudioBlobChange(url);

        // Stop all audio tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      // Set up Speech Recognition if supported
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'vi-VN';

        recognition.onstart = () => {
          setSpeechActive(true);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => {
              const updated = prev + finalTranscript;
              onTranscriptChange(updated.trim());
              return updated;
            });
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
          setSpeechActive(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      alert('Không thể truy cập Microphone. Vui lòng cấp quyền ghi âm và thử lại.');
    }
  };

  // Stop recording
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

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Simulation helper to generate test transcripts
  const simulateTranscript = () => {
    const mockTranscripts: Record<string, string> = {
      'Software Engineer':
        'Tôi tên là Nguyễn Văn Nam. Về kỹ thuật, tôi có 3 năm kinh nghiệm lập trình React, NodeJS và cơ sở dữ liệu PostgreSQL. Trong dự án gần nhất, tôi phụ trách tối ưu hóa hiệu năng render giúp giảm 30% thời gian tải trang. Tôi cũng thường xuyên thiết lập CI/CD bằng GitHub Actions và viết các bộ unit test bằng Jest để đảm bảo chất lượng code.',
      'Product Manager':
        'Chào bạn, tôi là Trần Thị Mai. Ở vị trí Product Manager, tôi thường áp dụng mô hình RICE để ưu tiên tính năng sản phẩm dựa trên sức ảnh hưởng và nguồn lực DEV. Tôi có kinh nghiệm viết tài liệu PRD chi tiết, làm việc chặt chẽ với Stakeholders để cân bằng kỳ vọng kinh doanh và năng lực kỹ thuật của team nhằm đảm bảo tiến độ ra mắt sản phẩm đúng hạn.',
      'UI/UX Designer':
        'Xin chào, tôi là Lê Hoàng Anh. Quy trình thiết kế của tôi bắt đầu từ việc nghiên cứu trải nghiệm, phỏng vấn người dùng để vẽ User Journey Map. Sau đó tôi sẽ phác thảo wireframe trước khi lên Figma làm hi-fi mockups. Tôi cũng có kinh nghiệm xây dựng Figma Design System đồng nhất và bàn giao thông số kỹ thuật chuẩn chỉ cho lập trình viên thiết kế.',
      'QA Engineer':
        'Chào anh/chị, tôi là Phạm Minh Quân. Tôi chuyên lập kế hoạch kiểm thử và viết Test Cases cho các hệ thống Web và Mobile. Tôi thành thạo việc viết script test tự động bằng Playwright/JS để chạy regression test hàng đêm. Khi phát hiện lỗi lạ, tôi thường xem log hệ thống, bắt gói tin API để khoanh vùng nguyên nhân trước khi báo cho DEV.',
    };

    const text = mockTranscripts[candidatePosition] || 'Đây là bản ghi âm phỏng vấn giả lập để kiểm tra chức năng chuyển đổi giọng nói thành văn bản. Ứng viên có tiềm năng tốt và kỹ năng giao tiếp tự tin.';
    setTranscript(text);
    onTranscriptChange(text);

    // Create a mock audio file url so recruiter can test audio player
    // We generate a tiny silent audio file data URL or similar so the player is functional
    const dummyBlob = new Blob([new Uint8Array(100)], { type: 'audio/wav' });
    const url = URL.createObjectURL(dummyBlob);
    setAudioUrl(url);
    onAudioBlobChange(url);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
    onTranscriptChange(e.target.value);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <Mic className="h-5 w-5 text-slate-700" />
        <h3 className="font-semibold text-slate-800 text-base">Ghi âm phỏng vấn & Transcript</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-slate-50 border border-slate-200 p-4 rounded-xl mb-5">
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
            >
              <Mic className="h-4.5 w-4.5" />
              Bắt đầu ghi âm
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer animate-pulse"
            >
              <Square className="h-4.5 w-4.5" />
              Dừng ghi âm
            </button>
          )}

          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-sm font-semibold font-mono text-red-600">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto mt-3 md:mt-0">
          {audioUrl && !isRecording && (
            <div className="w-full flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-medium shrink-0">Nghe lại:</span>
              <audio src={audioUrl} controls className="h-8 max-w-full" />
            </div>
          )}

          {!audioUrl && !isRecording && (
            <button
              type="button"
              onClick={simulateTranscript}
              className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              title="Sinh dữ liệu ghi âm và transcript giả lập để thử nghiệm mà không cần mic"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Giả lập Transcript
            </button>
          )}
        </div>
      </div>

      {!isSpeechSupported && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs mb-4">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <strong>Lưu ý:</strong> Web Speech API không được hỗ trợ hoặc bị chặn trên trình duyệt này.
            Tính năng nhận diện giọng nói thực tế sẽ không hoạt động. Vui lòng dùng nút <strong>Giả lập Transcript</strong> hoặc tự nhập trực tiếp bằng bàn phím.
          </div>
        </div>
      )}

      {speechActive && (
        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-xs mb-4 animate-pulse">
          <Check className="h-4 w-4 shrink-0" />
          <span>Đang nghe giọng nói của bạn qua Web Speech API... Hãy nói bằng tiếng Việt.</span>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FileText className="h-3.5 w-3.5" />
            Bản Transcript Cuộc Phỏng Vấn
          </label>
          {transcript && (
            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-sm">
              Có thể chỉnh sửa bên dưới
            </span>
          )}
        </div>
        <textarea
          value={transcript}
          onChange={handleTextChange}
          placeholder="Nội dung phỏng vấn sẽ được chuyển hóa thành chữ viết tại đây sau khi bạn bắt đầu nói... Hoặc bạn có thể tự nhập bản tóm tắt phỏng vấn vào đây."
          className="w-full h-36 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm placeholder-slate-400 leading-relaxed resize-none"
        />
      </div>
    </div>
  );
};

