import type { PartOfSpeech, Subject } from "@/shared/types/types";
import useRandomSubjects from "./useRandomSubjects";
import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/shared/components/ToastContext";

type Options = {
    wordCount: number,
    filter?: Parameters<typeof useRandomSubjects>[1],
    checkAnswer: (answer: string, subject: Subject) => boolean | string,
    onFinish?: () => void,
};

export default function useQuiz(options: Options) {
    const { filter, wordCount, checkAnswer, onFinish } = options;
    const [score, setScore] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const subjects = useRandomSubjects(wordCount, filter);
    const { showToast } = useToast();

    const currentSubject = subjects[currentIndex];

    return {
        score,
        maxPosition: subjects.length,
        currentPosition: currentIndex + 1,
        currentSubject,
        isFinished: currentIndex >= subjects.length,
        handleAnswer: useCallback((answer: string) => {
            const result = checkAnswer(answer, currentSubject);
            if (result === true) {
                showToast('Correct!', 'success');
                setCurrentIndex(i => i + 1);
                setScore(p => p + 1);
            } else {
                showToast(`Incorrect. It's a ${result}.`, 'error');
                setCurrentIndex(i => i + 1);
            }

            if ((currentIndex + 1) >= subjects.length) onFinish?.();
        }, [showToast, currentIndex, subjects.length, onFinish, checkAnswer, currentSubject]),
    };
}
