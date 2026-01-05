
import React, { useState } from 'react';
import { translateWord, playSpeech } from '../services/geminiService';

interface WordTooltipProps {
  text: string;
  nativeLangName: string;
  voiceName: string;
}

const WordTooltip: React.FC<WordTooltipProps> = ({ text, nativeLangName, voiceName }) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleWordClick = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (!cleanWord) return;

    setSelectedWord(cleanWord);
    setTranslation(null);
    setLoading(true);
    setPosition({ x: e.clientX, y: e.clientY });

    try {
      const result = await translateWord(cleanWord, text, nativeLangName);
      setTranslation(result);
    } catch (error) {
      setTranslation("Error loading translation.");
    } finally {
      setLoading(false);
    }
  };

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedWord) {
      playSpeech(selectedWord, voiceName);
    }
  };

  const words = text.split(/(\s+)/);

  return (
    <div className="relative inline">
      {words.map((part, idx) => {
        const isWord = /\w+/.test(part);
        
        if (part.startsWith('**') && part.endsWith('**')) {
            const inner = part.slice(2, -2);
            return (
                <span key={idx} className="font-bold text-indigo-700 cursor-pointer hover:bg-indigo-100 rounded px-0.5 transition-colors" onClick={(e) => handleWordClick(e, inner)}>
                    {inner}
                </span>
            );
        }

        return isWord ? (
          <span
            key={idx}
            className="cursor-pointer hover:bg-slate-200 rounded px-0.5 transition-colors"
            onClick={(e) => handleWordClick(e, part)}
          >
            {part}
          </span>
        ) : (
          <span key={idx}>{part}</span>
        );
      })}

      {selectedWord && (
        <div 
          className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 max-w-xs text-sm animate-in fade-in zoom-in duration-200"
          style={{ top: position.y + 10, left: Math.min(position.x, window.innerWidth - 280) }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-indigo-600 text-base">{selectedWord}</h4>
              <button 
                onClick={handlePronounce}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                title="Hear pronunciation"
              >
                <i className="fas fa-volume-up text-xs"></i>
              </button>
            </div>
            <button onClick={() => setSelectedWord(null)} className="text-slate-400 hover:text-slate-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <i className="fas fa-circle-notch fa-spin"></i> Translating...
            </div>
          ) : (
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
              {translation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WordTooltip;
