/**
 * VoiceInput — microphone button using Web Speech API.
 * Appends transcribed text into the answer box in real time.
 *
 * Props:
 *   onTranscript: (text: string) => void — called with accumulated transcript
 *   disabled: boolean — hides the button if SpeechRecognition is unavailable
 */
import { useState, useRef, useEffect } from "react";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function VoiceInput({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const recognitionRef = useRef(null);
  const accumulatedRef = useRef(""); // text committed from previous final results

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  if (!SpeechRecognition || disabled) return null;

  function startListening() {
    setPermissionDenied(false);
    accumulatedRef.current = ""; // reset accumulated on new session

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";

    recognition.onresult = (e) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalChunk += transcript;
        } else {
          interimChunk += transcript;
        }
      }

      if (finalChunk) {
        accumulatedRef.current += (accumulatedRef.current ? " " : "") + finalChunk.trim();
      }

      const display = accumulatedRef.current
        + (interimChunk ? (accumulatedRef.current ? " " : "") + interimChunk : "");

      onTranscript(display);
    };

    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setPermissionDenied(true);
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  }

  function handleToggle() {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl border transition-all select-none
          ${listening
            ? "bg-red-500/15 border-red-500/50 text-red-400 animate-pulse"
            : "bg-card border-border text-muted-foreground hover:brightness-110"
          }`}
      >
        {listening ? "🔴 Listening… tap to stop" : "🎤 Tap to speak your answer"}
      </button>

      {permissionDenied && (
        <p className="text-[11px] text-amber-400/80 text-center leading-relaxed px-2">
          Microphone access is needed for voice input. You can still type your answer below.
        </p>
      )}

      {!listening && !permissionDenied && accumulatedRef.current && (
        <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed px-2">
          Review your answer — physics terms may need correcting before you submit.
        </p>
      )}
    </div>
  );
}