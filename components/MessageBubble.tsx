
import React from 'react';
import { ChatTurn, Language } from '../types';
import { playSpeech } from '../services/geminiService';
import WordTooltip from './WordTooltip';

interface MessageBubbleProps {
  message: ChatTurn;
  targetLang: Language;
  nativeLang: Language;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, targetLang, nativeLang }) => {
  const isUser = message.sender === 'user';
  
  const handleTTS = () => {
    // Play target language text
    // Remove markdown bold markers for cleaner TTS
    const cleanText = message.targetText.replace(/\*\*/g, '');
    playSpeech(cleanText, targetLang.voice);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] sm:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        {/* Avatar Placeholder */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-indigo-600' : 'bg-slate-500'} text-white text-xs`}>
          {isUser ? <i className="fas fa-user"></i> : <i className="fas fa-robot"></i>}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <div className={`relative p-4 rounded-2xl shadow-sm ${isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
            <div className="text-lg leading-relaxed">
              <WordTooltip text={message.targetText} nativeLangName={nativeLang.name} />
            </div>
            
            <div className={`mt-2 pt-2 border-t text-sm opacity-80 ${isUser ? 'border-indigo-400 text-indigo-100' : 'border-slate-100 text-slate-500'}`}>
              {message.nativeText}
            </div>

            {/* TTS Button */}
            <button 
              onClick={handleTTS}
              className={`absolute top-2 ${isUser ? '-left-10' : '-right-10'} p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-400 hover:text-indigo-600`}
              title="Listen"
            >
              <i className="fas fa-volume-up"></i>
            </button>
          </div>
          
          {message.isCorrection && (
            <div className="text-[10px] text-amber-600 font-medium px-1 flex items-center gap-1">
              <i className="fas fa-magic"></i> Grammar corrected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
