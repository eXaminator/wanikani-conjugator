import { useMemo } from 'react';
import type { Subject } from '~/lib/types';

type AudioPromise = Promise<void> & { stop: () => void };

function enhancePromise(promise: Promise<void>, stop: () => void = () => {}): AudioPromise {
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
                if (!file) return enhancePromise(Promise.resolve(undefined));
                const audio = new Audio(file.url);

                let stop: () => void = () => {};

                const promise = new Promise<void>((resolve, reject) => {
                    audio.onerror = (e) => reject(e);
                    audio.onended = () => resolve(undefined);
                    audio.play().catch(reject);

                    stop = () => {
                        audio.pause();
                        audio.currentTime = 0;
                    };
                });

                return enhancePromise(promise, stop);
            },
            readSubjectTranslation(subject: Subject) {
                const promise = new Promise<void>((resolve, reject) => {
                    const text = subject.data.meanings
                        .filter((s) => s.primary)
                        .map((m) => m.meaning)
                        .join(', ');
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'en-US';

                    utterance.onend = () => resolve();
                    utterance.onerror = (event) => reject(event.error);

                    speechSynthesis.speak(utterance);
                });

                return enhancePromise(promise, () => speechSynthesis.cancel());
            },
            readJapaneseText(text: string, slowMode = true) {
                const promise = new Promise<void>((resolve, reject) => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'ja-JP';
                    utterance.rate = slowMode ? 0.7 : 0.9;
                    utterance.pitch = 1.1;
                    utterance.volume = 0.9;

                    const voices = speechSynthesis.getVoices();
                    const japaneseVoices = voices.filter(
                        (voice) =>
                            voice.lang.startsWith('ja') &&
                            (voice.name.includes('Google') ||
                                voice.name.includes('Siri') ||
                                voice.name.includes('Alex')),
                    );

                    if (japaneseVoices.length > 0) {
                        utterance.voice = japaneseVoices[0];
                    }

                    utterance.onend = () => resolve();
                    utterance.onerror = (event) => reject(event.error);

                    speechSynthesis.speak(utterance);
                });

                return enhancePromise(promise, () => speechSynthesis.cancel());
            },
        };
    }, []);
}
