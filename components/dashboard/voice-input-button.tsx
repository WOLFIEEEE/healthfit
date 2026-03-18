"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";

type VoiceInputButtonProps = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

export function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, onTranscript]);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`flex items-center justify-center rounded-full p-2 transition ${
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "text-muted-foreground hover:bg-secondary"
      } disabled:opacity-50`}
      aria-label={isListening ? "Stop listening" : "Voice input"}
    >
      {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
    </button>
  );
}
