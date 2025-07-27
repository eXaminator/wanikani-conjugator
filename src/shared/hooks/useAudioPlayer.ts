import { useMemo } from "react";
import type { Subject } from "../types/types";

type AudioPromise = Promise<void> & { stop: () => void };

function ehnhancePromise(promise: Promise<void>, stop: () => void = () => { }): AudioPromise {
    (promise as AudioPromise).stop = stop;
    return promise as AudioPromise;
}

export default function useAudioPlayer() {
    return useMemo(() => {
        return {
            playSubjectAudio(subject: Subject) {
                const audios = subject.data.pronunciation_audios.filter((a) => a.content_type === 'audio/webm');
                const file = audios[Math.floor(Math.random() * audios.length)];
                console.log('Play audio', { audio: file, audios });
                if (!file) return ehnhancePromise(Promise.resolve(undefined));
                const audio = new Audio(file.url);

                let stop: () => void = () => { };

                const promise = new Promise<void>((resolve, reject) => {
                    audio.onerror = e => reject(e);
                    audio.onended = () => resolve(undefined);
                    audio.play().catch(reject);

                    stop = () => {
                        audio.pause();
                        audio.currentTime = 0;
                    };
                });

                return ehnhancePromise(promise, stop);
            },
            readSubjectTranslation(subject: Subject) {
                const promise = new Promise<void>((resolve, reject) => {
                    const text = subject.data.meanings
                        // .sort((a, b) => Number(b.primary) - Number(a.primary))
                        .filter(s => s.primary)
                        .map(m => m.meaning)
                        .join(', ');
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = "en-US";

                    utterance.onend = () => resolve();
                    utterance.onerror = (event) => reject(event.error);

                    speechSynthesis.speak(utterance);
                });

                return ehnhancePromise(promise, () => speechSynthesis.cancel());
            },
            readJapaneseText(text: string, slowMode = true) {
                const promise = new Promise<void>((resolve, reject) => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = "ja-JP";
                    utterance.rate = slowMode ? 0.7 : 0.9; // Slower for better clarity
                    utterance.pitch = 1.1; // Slightly higher pitch for better clarity
                    utterance.volume = 0.9; // Slightly lower volume to avoid distortion

                    // Try to get a better Japanese voice if available
                    const voices = speechSynthesis.getVoices();
                    const japaneseVoices = voices.filter(voice =>
                        voice.lang.startsWith('ja') &&
                        (voice.name.includes('Google') || voice.name.includes('Siri') || voice.name.includes('Alex'))
                    );

                    if (japaneseVoices.length > 0) {
                        // Prefer Google, Siri, or Alexa voices as they tend to be better quality
                        utterance.voice = japaneseVoices[0];
                    }

                    utterance.onend = () => resolve();
                    utterance.onerror = (event) => reject(event.error);

                    speechSynthesis.speak(utterance);
                });

                return ehnhancePromise(promise, () => speechSynthesis.cancel());
            }
        };
    }, []);
}
