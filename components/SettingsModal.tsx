
import React, { useState } from 'react';
import { Language, SUPPORTED_LANGUAGES, AVAILABLE_VOICES } from '../types';
import { playSpeech } from '../services/geminiService';

interface SettingsModalProps {
  nativeLang: Language;
  setNativeLang: (l: Language) => void;
  targetLang: Language;
  setTargetLang: (l: Language) => void;
  voiceName: string;
  setVoiceName: (v: string) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ nativeLang, setNativeLang, targetLang, setTargetLang, voiceName, setVoiceName, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSwap = () => {
    const temp = nativeLang;
    setNativeLang(targetLang);
    setTargetLang(temp);
  };

  const handlePlaySample = async (e: React.MouseEvent, voiceId: string) => {
    e.stopPropagation();
    if (playingVoice) return;
    
    setPlayingVoice(voiceId);
    try {
      // A generic greeting sample
      await playSpeech("Hello, this is my voice. I hope you enjoy learning with me!", voiceId);
    } catch (err) {
      console.error("Failed to play sample:", err);
    } finally {
      setPlayingVoice(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div>
            <h2 className="text-2xl font-black text-indigo-900">Preferences</h2>
            <p className="text-sm text-indigo-600 font-medium">Customize your learning experience</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 flex-1">
          {/* Quick Swap UI */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
            <div className="flex-1 text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Native</span>
              <div className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
                <span>{nativeLang.flag}</span> {nativeLang.name}
              </div>
            </div>
            
            <button 
              onClick={handleSwap}
              className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
            >
              <i className="fas fa-exchange-alt"></i>
            </button>

            <div className="flex-1 text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Learning</span>
              <div className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
                <span>{targetLang.flag}</span> {targetLang.name}
              </div>
            </div>
          </div>

          {/* AI Voice Selection */}
          <section>
            <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest px-1">Select AI Voice</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {AVAILABLE_VOICES.map((voice) => (
                <div key={voice.id} className="relative group">
                  <button
                    onClick={() => setVoiceName(voice.id)}
                    className={`w-full p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${voiceName === voice.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600'}`}
                  >
                    <i className="fas fa-comment-dots text-lg"></i>
                    <span className="text-xs font-bold">{voice.name}</span>
                  </button>
                  <button 
                    onClick={(e) => handlePlaySample(e, voice.id)}
                    disabled={playingVoice !== null}
                    className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all ${playingVoice === voice.id ? 'bg-amber-400 text-white animate-pulse' : 'bg-white text-indigo-500 hover:bg-indigo-50 scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100'}`}
                    title="Play sample"
                  >
                    <i className={`fas ${playingVoice === voice.id ? 'fa-spinner fa-spin' : 'fa-play text-[10px]'}`}></i>
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-3 px-1">
              {AVAILABLE_VOICES.find(v => v.id === voiceName)?.description} • Click the <i className="fas fa-play text-[8px]"></i> to preview.
            </p>
          </section>

          {/* Language Search */}
          <div className="relative pt-2">
            <i className="fas fa-search absolute left-4 top-[calc(50%+4px)] -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-widest px-1">Native Language</h3>
              <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredLanguages.map((lang) => (
                  <button
                    key={`native-${lang.code}`}
                    onClick={() => setNativeLang(lang)}
                    className={`p-3 rounded-xl border text-sm flex items-center gap-2 transition-all ${nativeLang.code === lang.code ? 'bg-indigo-600 border-indigo-600 text-white shadow-md font-bold' : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600'}`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-widest px-1">Target Language</h3>
              <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredLanguages.map((lang) => (
                  <button
                    key={`target-${lang.code}`}
                    onClick={() => setTargetLang(lang)}
                    className={`p-3 rounded-xl border text-sm flex items-center gap-2 transition-all ${targetLang.code === lang.code ? 'bg-indigo-600 border-indigo-600 text-white shadow-md font-bold' : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600'}`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.name}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            SAVE PREFERENCES
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
