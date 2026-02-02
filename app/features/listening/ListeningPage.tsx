import Button from '~/components/Button';
import useAudioPlayer from '~/hooks/useAudioPlayer';
import useRandomSubjects from '~/hooks/useRandomSubjects';
import Queue from '~/lib/Queue';
import type { Subject } from '~/lib/types';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    subjects: Subject[];
}

export default function ListeningPage({ subjects }: Props) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeBetweenWords, setTimeBetweenWords] = useState(1);
    const [timeToAnswer, setTimeToAnswer] = useState(3);
    const [reverse, setReverse] = useState(false);
    const audio = useAudioPlayer();
    const randomSubjects = useRandomSubjects(subjects, { filter: (sub) => sub.object === 'vocabulary' });
    const audioQueue = useMemo(() => new Queue(), []);

    useEffect(() => {
        audioQueue.clear();
        if (isPlaying) {
            for (const subject of randomSubjects) {
                audioQueue.add(() =>
                    reverse ? audio.readSubjectTranslation(subject) : audio.playSubjectAudio(subject),
                );
                audioQueue.add(() => new Promise((resolve) => setTimeout(resolve, timeToAnswer * 1000)));
                audioQueue.add(() =>
                    reverse ? audio.playSubjectAudio(subject) : audio.readSubjectTranslation(subject),
                );
                audioQueue.add(() => new Promise((resolve) => setTimeout(resolve, timeBetweenWords * 1000)));
            }
            audioQueue.add(() => setIsPlaying(false));
        } else {
            audioQueue.clear();
        }

        return () => {
            audioQueue.clear();
        };
    }, [audioQueue, randomSubjects, audio, isPlaying, timeBetweenWords, timeToAnswer, reverse]);

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Listening</h1>

            <div className="mb-8">
                <h2 className="text-xl mb-4">Time to answer:</h2>
                <div className="flex items-center gap-5">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={timeToAnswer}
                        onChange={(e) => setTimeToAnswer(Number.parseInt(e.target.value) || 3)}
                        className="border border-stone-600 p-3 rounded-md bg-stone-700 text-stone-100
                        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
                        hover:border-stone-500 transition-colors duration-200 text-lg w-full"
                    />
                    <span className="w-10 text-right">{timeToAnswer}</span>
                </div>

                <h2 className="text-xl mb-4">Time to next words:</h2>
                <div className="flex items-center gap-5">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={timeBetweenWords}
                        onChange={(e) => setTimeBetweenWords(Number.parseInt(e.target.value) || 1)}
                        className="border border-stone-600 p-3 rounded-md bg-stone-700 text-stone-100
                            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
                            hover:border-stone-500 transition-colors duration-200 text-lg w-full"
                    />
                    <span className="w-10 text-right">{timeBetweenWords}</span>
                </div>

                <label className="flex flex-row my-5">
                    <input
                        type="checkbox"
                        className="mr-2"
                        checked={reverse}
                        onChange={(e) => setReverse(e.currentTarget.checked)}
                    />
                    Reihenfolge umkehren
                </label>
            </div>

            <Button onClick={() => setIsPlaying(!isPlaying)} primary className="w-full text-lg py-4">
                {isPlaying ? 'Stop' : 'Play'}
            </Button>
        </div>
    );
}
