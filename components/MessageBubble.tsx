
import React from 'react';
import { ChatTurn, Language } from '../types';
import { playSpeech } from '../services/geminiService';
import WordTooltip from './WordTooltip';

interface MessageBubbleProps {
  message: ChatTurn;
  targetLang: Language;
  nativeLang: Language;
  voiceName: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, targetLang, nativeLang, voiceName }) => {
  const isUser = message.sender === 'user';
  
  const handleTTS = () => {
    const cleanText = message.targetText.replace(/\*\*/g, '');
    playSpeech(cleanText, voiceName);
  };

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${isUser ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-500 shadow-slate-200'} text-white text-sm shadow-lg`}>
          {isUser ? <i className="fas fa-user"></i> : <i className="fas fa-robot"></i>}
        </div>

        <div className="flex flex-col gap-2">
          <div className={`relative p-5 rounded-3xl shadow-sm ${isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
            
            {/* User Original Audio Section */}
            {isUser && message.audioUrl && (
              <div className="mb-4 bg-indigo-700/40 p-3 rounded-2xl border border-indigo-400/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 flex items-center gap-1.5">
                    <i className="fas fa-microphone-lines animate-pulse"></i> Your Recording
                  </span>
                </div>
                <audio 
                  src={message.audioUrl} 
                  controls 
                  className="w-full h-8 opacity-90 brightness-110 contrast-125"
                  style={{ filter: 'invert(100%) hue-rotate(180deg)' }} // Match dark/light theme for native player
                />
              </div>
            )}

            {/* Comparison Context Header for User Messages */}
            {isUser && message.audioUrl && (
              <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                Target Expression
              </div>
            )}

            <div className="text-xl leading-relaxed font-medium">
              <WordTooltip text={message.targetText} nativeLangName={nativeLang.name} voiceName={voiceName} />
            </div>
            
            <div className={`mt-3 pt-3 border-t text-sm leading-relaxed ${isUser ? 'border-indigo-400/50 text-indigo-100' : 'border-slate-100 text-slate-500 italic'}`}>
              <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
                {isUser ? 'Transcription' : 'Translation'}
              </div>
              {message.nativeText}
            </div>

            {/* Action Buttons */}
            <div className={`absolute -bottom-2 ${isUser ? '-left-12' : '-right-12'} flex flex-col gap-2`}>
              <button 
                onClick={handleTTS}
                className="w-10 h-10 bg-white border border-slate-200 shadow-md rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all hover:scale-110 active:scale-90"
                title="Hear AI Pronunciation"
              >
                <i className="fas fa-volume-up"></i>
              </button>
              {isUser && (
                <div className="text-[9px] font-black text-slate-400 text-center uppercase tracking-tighter bg-white/80 backdrop-blur rounded px-1 shadow-sm">
                  AI Voice
                </div>
              )}
            </div>
          </div>
          
          {message.isCorrection && (
            <div className="text-[10px] text-amber-600 font-bold px-2 flex items-center gap-1.5 uppercase tracking-wider bg-amber-50 self-start py-1 rounded-full border border-amber-100">
              <i className="fas fa-magic text-[8px]"></i> Grammar Improved
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
