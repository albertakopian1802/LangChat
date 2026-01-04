
export type Language = {
  code: string;
  name: string;
  voice: string;
  flag: string;
};

export interface ChatTurn {
  id: string;
  sender: 'user' | 'ai';
  targetText: string;
  nativeText: string;
  isCorrection?: boolean;
}

export interface ProcessedInput {
  targetText: string;
  nativeText: string;
  isCorrection: boolean;
  aiResponse: {
    targetText: string;
    nativeText: string;
  };
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', voice: 'Kore', flag: '🇺🇸' },
  { code: 'ru', name: 'Russian', voice: 'Puck', flag: '🇷🇺' },
  { code: 'es', name: 'Spanish', voice: 'Kore', flag: '🇪🇸' },
  { code: 'fr', name: 'French', voice: 'Kore', flag: '🇫🇷' },
  { code: 'de', name: 'German', voice: 'Puck', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', voice: 'Kore', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', voice: 'Kore', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', voice: 'Kore', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', voice: 'Kore', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', voice: 'Kore', flag: '🇵🇹' },
  { code: 'tr', name: 'Turkish', voice: 'Puck', flag: '🇹🇷' },
  { code: 'ar', name: 'Arabic', voice: 'Puck', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', voice: 'Kore', flag: '🇮🇳' },
  { code: 'nl', name: 'Dutch', voice: 'Puck', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', voice: 'Puck', flag: '🇵🇱' },
  { code: 'vi', name: 'Vietnamese', voice: 'Kore', flag: '🇻🇳' },
];
