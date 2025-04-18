import Button from '@shared/components/Button';
import { useToast } from '@shared/components/ToastContext';
import type { Subject } from '@shared/types/types';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';

type QuizType = 'adjective-type' | 'verb-ending' | 'verb-transitivity';

interface QuizProps {
    subjects: Subject[];
    quizType: QuizType;
    wordCount: number;
    onFinish: () => void;
}

export default function Quiz({ subjects, quizType, wordCount, onFinish }: QuizProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
    const { showToast } = useToast();

    // Select random subjects for the quiz
    const quizSubjects = useMemo(() => {
        // Filter subjects based on quiz type
        const filteredSubjects = subjects.filter((subject) => {
            const partsOfSpeech = subject.data.parts_of_speech;
            switch (quizType) {
                case 'adjective-type':
                    return partsOfSpeech.some((pos) => pos.includes('adjective') || pos.includes('noun'));
                case 'verb-ending':
                    return partsOfSpeech.some((pos) => pos.includes('verb')) && subject.data.characters.endsWith('る');
                case 'verb-transitivity':
                    return partsOfSpeech.some((pos) => pos.includes('verb'));
                default:
                    return false;
            }
        });

        return [...filteredSubjects].sort(() => Math.random() - 0.5).slice(0, wordCount)
    }, [subjects, wordCount, quizType]);

    useEffect(() => {
        if (quizSubjects.length > 0) {
            setCurrentSubject(quizSubjects[currentQuestionIndex]);
        }
    }, [currentQuestionIndex, quizSubjects]);

    const handleAnswer = (answer: string) => {
        if (!currentSubject) return;

        let isCorrect = false;
        let correctAnswer = '';

        console.log({ quizType, currentSubject });

        switch (quizType) {
            case 'adjective-type': {
                const isNaAdj = currentSubject.data.parts_of_speech.includes('na-adjective');
                const isNoAdj = currentSubject.data.parts_of_speech.includes('no-adjective');
                const isNoun = currentSubject.data.parts_of_speech.includes('noun');

                if (answer === 'na' && isNaAdj) isCorrect = true;
                else if (answer === 'no' && isNoAdj) isCorrect = true;
                else if (answer === 'noun' && isNoun) isCorrect = true;

                correctAnswer = isNaAdj ? 'な-adjective' : isNoAdj ? 'の-adjective' : 'noun';
                break;
            }
            case 'verb-ending': {
                const isIchidan = currentSubject.data.parts_of_speech.includes('ichidan verb');
                isCorrect = (answer === 'ichidan' && isIchidan) || (answer === 'godan' && !isIchidan);
                correctAnswer = isIchidan ? 'Ichidan' : 'Godan';
                break;
            }
            case 'verb-transitivity': {
                const isTransitive = currentSubject.data.parts_of_speech.includes('transitive verb');
                isCorrect = (answer === 'transitive' && isTransitive) || (answer === 'intransitive' && !isTransitive);
                correctAnswer = isTransitive ? 'Transitive' : 'Intransitive';
                break;
            }
        }

        // Show feedback toast
        showToast(isCorrect ? 'Correct!' : `Incorrect. It's a ${correctAnswer}.`, isCorrect ? 'success' : 'error');

        // Update score if correct
        if (isCorrect) setScore(score + 1);

        if (currentQuestionIndex + 1 >= quizSubjects.length) {
            onFinish();
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    if (!currentSubject) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <div className="text-lg">
                    Question {currentQuestionIndex + 1} of {quizSubjects.length}
                </div>
                <div className="text-lg">Score: {score}</div>
            </div>

            <div className="text-6xl font-bold text-center">{currentSubject.data.characters}</div>

            <div className={classNames('grid gap-3', quizType === "adjective-type" && "grid-cols-3", quizType !== "adjective-type" && "grid-cols-2")}>
                {quizType === 'adjective-type' && (
                    <div className="contents">
                        <Button
                            onClick={() => handleAnswer('na')}
                            className="aspect-square flex items-center justify-center text-center"
                        >
                            な-adjective
                        </Button>
                        <Button
                            onClick={() => handleAnswer('no')}
                            className="aspect-square flex items-center justify-center text-center"
                        >
                            の-adjective
                        </Button>
                        <Button
                            onClick={() => handleAnswer('noun')}
                            className="aspect-square flex items-center justify-center text-center"
                        >
                            Noun
                        </Button>
                    </div>
                )}
                {quizType === 'verb-ending' && (
                    <div className="contents">
                        <Button
                            onClick={() => handleAnswer('ichidan')}
                            className="aspect-square flex items-center justify-center text-center"
                        >
                            Ichidan
                        </Button>
                        <Button
                            onClick={() => handleAnswer('godan')}
                            className="aspect-square flex items-center justify-center text-center"
                        >
                            Godan
                        </Button>
                    </div>
                )}
                {quizType === 'verb-transitivity' && (
                    <div className="contents">
                        <Button
                            onClick={() => handleAnswer('transitive')}
                            className="aspect-square flex items-center justify-center text-center"
                        >
                            Transitive
                        </Button>
                        <Button
                            onClick={() => handleAnswer('intransitive')}
                            className="aspect-square flex items-center justify-center text-center"
                        >
                            Intransitive
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
