import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  voiceGuides: boolean;
}

interface AccessibilityMenuProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (settings: AccessibilitySettings) => void;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const updateFontSize = (size: AccessibilitySettings['fontSize']) => {
    onUpdateSettings({ ...settings, fontSize: size });
  };

  const toggleHighContrast = () => {
    onUpdateSettings({ ...settings, highContrast: !settings.highContrast });
  };

  const toggleVoiceGuides = () => {
    onUpdateSettings({ ...settings, voiceGuides: !settings.voiceGuides });
  };

  return (
    <div className="relative select-none z-40">
      {/* Floating Gear Trigger Button - Minimal and positioned at the corner */}
      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all cursor-pointer border border-slate-700 active:scale-95"
        aria-label="Cài đặt trợ năng"
      >
        <Settings className={`h-6 w-6 ${isOpen ? 'rotate-45' : ''} transition-transform duration-200`} />
      </button>

      {/* Accessibility Control Card */}
      {isOpen && (
        <>
          {/* Transparent click backdrop to close */}
          <div className="fixed inset-0 z-40" onClick={toggleOpen} />

          <div className="absolute left-0 bottom-14 w-72 bg-white border-2 border-slate-900 rounded-3xl shadow-xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-150 text-slate-900 z-50">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <h4 className="font-extrabold text-base tracking-tight">Trợ năng</h4>
              <button
                type="button"
                onClick={toggleOpen}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Font size switcher */}
            <div className="space-y-2">
              <span className="block text-xs font-black uppercase tracking-wider text-slate-400">Cỡ chữ</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'A' },
                  { id: 'large', label: 'A+' },
                  { id: 'extra-large', label: 'A++' },
                ].map((item) => {
                  const isActive = settings.fontSize === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateFontSize(item.id as any)}
                      className={`h-11 flex items-center justify-center text-sm font-black border-2 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 border-slate-900 text-white font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TTS switch */}
            <div className="flex items-center justify-between py-1.5 border-t border-slate-55 pt-3.5">
              <span className="text-sm font-bold text-slate-800">🔊 Đọc câu hỏi</span>
              <button
                type="button"
                onClick={toggleVoiceGuides}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                  settings.voiceGuides
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-450 hover:bg-slate-50'
                }`}
              >
                {settings.voiceGuides ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* High contrast switch */}
            <div className="flex items-center justify-between py-1.5 border-t border-slate-55 pt-3.5">
              <span className="text-sm font-bold text-slate-800">◐ Tương phản cao</span>
              <button
                type="button"
                onClick={toggleHighContrast}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                  settings.highContrast
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-450 hover:bg-slate-50'
                }`}
              >
                {settings.highContrast ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
