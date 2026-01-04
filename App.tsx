
import React, { useState, useEffect, useRef } from 'react';
import { ChatTurn, Language, SUPPORTED_LANGUAGES } from './types';
import { processLanguageExchange } from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import SettingsModal from './components/SettingsModal';

const STORAGE_KEY_NATIVE = 'linguistai_native_lang';
const STORAGE_KEY_TARGET = 'linguistai_target_lang';
const STORAGE_KEY_MESSAGES = 'linguistai_chat_history';

const App: React.FC = () => {
  // Load settings from localStorage
  const getInitialNative = () => {
    const saved = localStorage.getItem(STORAGE_KEY_NATIVE);
    if (saved) return JSON.parse(saved);
    return SUPPORTED_LANGUAGES[1]; // Default Russian
  };

  const getInitialTarget = () => {
    const saved = localStorage.getItem(STORAGE_KEY_TARGET);
    if (saved) return JSON.parse(saved);
    return SUPPORTED_LANGUAGES[0]; // Default English
  };

  const getInitialMessages = () => {
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
    return saved ? JSON.parse(saved) : [];
  };

  const [nativeLang, setNativeLang] = useState<Language>(getInitialNative);
  const [targetLang, setTargetLang] = useState<Language>(getInitialTarget);
  const [messages, setMessages] = useState<ChatTurn[]>(getInitialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(!localStorage.getItem(STORAGE_KEY_NATIVE));
  const [recordingTime, setRecordingTime] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NATIVE, JSON.stringify(nativeLang));
    localStorage.setItem(STORAGE_KEY_TARGET, JSON.stringify(targetLang));
  }, [nativeLang, targetLang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleSendAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendAudio = async (blob: Blob) => {
    setIsLoading(true);
    try {
      const base64Audio = await blobToBase64(blob);
      const history = messages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.targetText }]
      }));

      const result = await processLanguageExchange(
        { audio: { data: base64Audio, mimeType: 'audio/webm' } },
        nativeLang,
        targetLang,
        history
      );

      updateChatWithResult(result);
    } catch (error) {
      console.error("Audio process error:", error);
      alert("Failed to process audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.targetText }]
      }));

      const result = await processLanguageExchange({ text: userInput }, nativeLang, targetLang, history);
      updateChatWithResult(result);
    } catch (error) {
      console.error("Chat error:", error);
      alert("Failed to process message.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatWithResult = (result: any) => {
    const userTurn: ChatTurn = {
      id: Date.now().toString(),
      sender: 'user',
      targetText: result.targetText,
      nativeText: result.nativeText,
      isCorrection: result.isCorrection
    };

    const aiTurn: ChatTurn = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      targetText: result.aiResponse.targetText,
      nativeText: result.aiResponse.nativeText
    };

    setMessages(prev => [...prev, userTurn, aiTurn]);
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white text-2xl shadow-indigo-200 shadow-lg">
            <i className="fas fa-brain"></i>
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-xl leading-none tracking-tight">LinguistAI</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 bg-slate-100 text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                {nativeLang.flag} {nativeLang.name}
              </span>
              <i className="fas fa-arrow-right text-[8px] text-slate-300"></i>
              <span className="flex items-center gap-1 bg-indigo-50 text-[10px] font-bold text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                {targetLang.flag} {targetLang.name}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChat}
            className="p-3 w-11 h-11 rounded-xl hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500 border border-transparent hover:border-red-100"
            title="Clear Chat"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 w-11 h-11 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors text-slate-500 hover:text-indigo-600 border border-slate-200 shadow-sm"
            title="Settings"
          >
            <i className="fas fa-sliders-h"></i>
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar bg-gradient-to-b from-slate-50 to-white" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-8 animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-4xl text-indigo-500 animate-pulse">
                <i className="fas fa-comment-dots"></i>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border-2 border-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shadow-md">
                <i className="fas fa-star text-xs"></i>
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Speak your mind</h3>
            <p className="text-slate-500 leading-relaxed mb-8">
              Don't know a word in <span className="font-bold text-indigo-600 underline decoration-indigo-200">{targetLang.name}</span>? Just say it in <span className="font-bold text-indigo-600 underline decoration-indigo-200">{nativeLang.name}</span> while speaking and I'll help you fix it!
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full pb-10">
            {messages.map((m, index) => (
              <div key={m.id} className="animate-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
                <MessageBubble 
                  message={m} 
                  targetLang={targetLang} 
                  nativeLang={nativeLang} 
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-6 animate-pulse">
                <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI is listening & translating</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 md:p-6 pb-6 md:pb-10 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex items-end gap-3 md:gap-4"
        >
          <div className="flex-1 relative group">
            {isRecording ? (
              <div className="w-full bg-red-50 border-2 border-red-200 rounded-3xl px-6 py-4 flex items-center justify-between animate-pulse" style={{ minHeight: '60px' }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-red-600 font-bold uppercase tracking-widest text-sm">Recording Audio...</span>
                </div>
                <span className="text-red-600 font-mono font-bold text-lg">{formatTime(recordingTime)}</span>
              </div>
            ) : (
              <>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Write in ${nativeLang.name} or ${targetLang.name}...`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 pr-14 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none max-h-40 text-slate-800 shadow-inner font-medium"
                  rows={1}
                  style={{ minHeight: '60px' }}
                />
                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-300 tracking-tighter hidden md:block">ENTER</span>
                  <div className={`w-2 h-2 rounded-full transition-colors ${inputValue.trim() ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-200'}`}></div>
                </div>
              </>
            )}
          </div>
          
          <button 
            type="button"
            onClick={toggleRecording}
            className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50'}`}
            title={isRecording ? "Stop & Send" : "Hold to speak"}
          >
            <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'} text-xl`}></i>
          </button>

          <button 
            type="submit"
            disabled={!inputValue.trim() || isLoading || isRecording}
            className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${!inputValue.trim() || isLoading || isRecording ? 'bg-slate-200 text-slate-400 shadow-none' : 'bg-gradient-to-br from-indigo-600 to-violet-700 hover:shadow-indigo-200 hover:scale-105 active:scale-95'}`}
          >
            {isLoading ? <i className="fas fa-circle-notch fa-spin text-xl"></i> : <i className="fas fa-paper-plane text-xl"></i>}
          </button>
        </form>
        <div className="max-w-4xl mx-auto flex justify-center items-center gap-6 mt-4">
           <div className="flex items-center gap-1.5">
             <i className="fas fa-bolt text-[10px] text-indigo-400"></i>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">AI processes audio natively</span>
           </div>
           <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
           <div className="flex items-center gap-1.5">
             <i className="fas fa-random text-[10px] text-indigo-400"></i>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Mixed languages supported</span>
           </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
          nativeLang={nativeLang} 
          setNativeLang={setNativeLang} 
          targetLang={targetLang} 
          setTargetLang={setTargetLang} 
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
