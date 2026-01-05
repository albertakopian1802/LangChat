import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProcessedInput, Language } from "../types";

// Safety check for API key to prevent immediate crash
const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Helper to decode Base64 to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode PCM to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const processLanguageExchange = async (
  input: { text?: string; audio?: { data: string; mimeType: string } },
  nativeLang: Language,
  targetLang: Language,
  history: { role: string; parts: { text: string }[] }[]
): Promise<ProcessedInput> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const parts: any[] = [];

  // Add audio if present
  if (input.audio) {
    parts.push({
      inlineData: {
        data: input.audio.data,
        mimeType: input.audio.mimeType
      }
    });
  }

  // Add the prompt instruction
  parts.push({
    text: `
      Native Language: ${nativeLang.name}
      Target Language: ${targetLang.name}
      ${input.text ? `User message text: "${input.text}"` : "User message: [See provided audio]"}

      TASK:
      1. If audio is provided: Transcribe it EXACTLY as spoken. Note that the user might mix ${nativeLang.name} and ${targetLang.name} (code-switching). Use the correct script for each word.
      2. Analyze the user's intent:
         - If they spoke/wrote in ${nativeLang.name}: Translate it to ${targetLang.name}.
         - If they spoke/wrote in ${targetLang.name}: Check for grammar/spelling. Provide a corrected version using Markdown **bold** for changes.
      3. Provide a translation of the (corrected) user message into ${nativeLang.name}.
      4. Generate a natural conversation response from the AI in ${targetLang.name}.
      5. Provide a translation of the AI response into ${nativeLang.name}.

      OUTPUT FORMAT: JSON only.
    `
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      {
        role: "user",
        parts: parts
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          targetText: { type: Type.STRING, description: "Corrected/Translated User message in Target language." },
          nativeText: { type: Type.STRING, description: "User message transcription (including mixed languages if spoken) or original native text." },
          isCorrection: { type: Type.BOOLEAN, description: "True if grammar corrections were made to user input." },
          aiResponse: {
            type: Type.OBJECT,
            properties: {
              targetText: { type: Type.STRING },
              nativeText: { type: Type.STRING }
            },
            required: ["targetText", "nativeText"]
          }
        },
        required: ["targetText", "nativeText", "isCorrection", "aiResponse"]
      },
    }
  });

  return JSON.parse(response.text || "{}");
};

export const playSpeech = async (text: string, voiceName: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return;

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(
    decode(base64Audio),
    audioContext,
    24000,
    1
  );

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};

export const translateWord = async (word: string, context: string, nativeLang: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the word "${word}" into ${nativeLang}. Use the context of this sentence: "${context}". Just give the translation and a brief definition.`,
  });
  return response.text || "Translation unavailable";
};