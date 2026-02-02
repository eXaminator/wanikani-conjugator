import type { Subject } from '~/lib/types';
import { useCallback, useState, type ComponentProps } from 'react';
import { useToast } from '~/components/ToastContext';
import type QuizCard from '../QuizCard';
import useRandomSubjects from '~/hooks/useRandomSubjects';

type Options<Answers> = {
    subjects: Subject[];
    wordCount: number;
    filter?: (subject: Subject) => boolean;
    getAnswer: (subject: Subject) => keyof Answers;
    onFinish?: () => void;
    answers: Answers;
};

type WrongAnswer = {
    answer: string;
    expectedAnswer: string;
};

export default function useQuiz<Answers extends Record<string, string>>(options: Options<Answers>) {
    const { subjects: allSubjects, filter, wordCount, getAnswer, onFinish, answers } = options;
    const [score, setScore] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const subjects = useRandomSubjects(allSubjects, {
        amount: wordCount,
        filter,
    });
    const { showToast } = useToast();
    const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);

    const currentSubject = subjects[currentIndex];

    return {
        currentSubject,
        isFinished: currentIndex >= subjects.length,
        wrongAnswers,
        quizCardProps: {
            onAnswer: useCallback(
                (answer: string) => {
                    const expectedAnswer = String(getAnswer(currentSubject));
                    if (expectedAnswer === answer) {
                        showToast('Correct!', 'success');
                        setCurrentIndex((i) => i + 1);
                        setScore((p) => p + 1);
                    } else {
                        showToast(`Incorrect. It's a ${expectedAnswer}.`, 'error');
                        setCurrentIndex((i) => i + 1);
                        setWrongAnswers((a) => [...a, { answer, expectedAnswer }]);
                    }

                    if (currentIndex + 1 >= subjects.length) onFinish?.();
                },
                [showToast, currentIndex, subjects.length, onFinish, getAnswer, currentSubject],
            ),
            answers,
            question: currentSubject?.data.characters,
            score,
            maxPosition: subjects.length,
            currentPosition: currentIndex + 1,
        } as Pick<
            ComponentProps<typeof QuizCard>,
            'answers' | 'onAnswer' | 'question' | 'score' | 'maxPosition' | 'currentPosition'
        >,
    };
}
