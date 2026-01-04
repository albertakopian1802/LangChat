
import React, { useState } from 'react';
import { Language, SUPPORTED_LANGUAGES } from '../types';

interface SettingsModalProps {
  nativeLang: Language;
  setNativeLang: (l: Language) => void;
  targetLang: Language;
  setTargetLang: (l: Language) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ nativeLang, setNativeLang, targetLang, setTargetLang, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSwap = () => {
    const temp = nativeLang;
    setNativeLang(targetLang);
    setTargetLang(temp);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div>
            <h2 className="text-2xl font-black text-indigo-900">Language Setup</h2>
            <p className="text-sm text-indigo-600 font-medium">Configure your learning pair</p>
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

          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
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
              <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-widest px-1">Choose Native</h3>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
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
              <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-widest px-1">Choose Learning</h3>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
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
            CONFIRM SELECTION
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
