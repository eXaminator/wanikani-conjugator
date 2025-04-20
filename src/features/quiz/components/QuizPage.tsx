import Button from '@shared/components/Button';
import { useState } from 'react';
import AdjectiveQuiz from './AdjectiveQuiz';
import VerbEndingQuiz from './VerbEndingQuiz';
import VerbTransitivityQuiz from './VerbTransitivityQuiz';

type QuizType = 'adjective-type' | 'verb-ending' | 'verb-transitivity';

export default function QuizPage() {
    const [quizType, setQuizType] = useState<QuizType | null>(null);
    const [wordCount, setWordCount] = useState(30);
    const [isQuizActive, setIsQuizActive] = useState(false);

    const startQuiz = () => {
        if (quizType) {
            setIsQuizActive(true);
        }
    };

    const handleQuizFinish = () => {
        setIsQuizActive(false);
        setQuizType(null);
    };

    if (isQuizActive && quizType) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Quiz in Progress</h1>
                {quizType === "adjective-type" ? (
                    <AdjectiveQuiz wordCount={wordCount} onFinish={handleQuizFinish} />
                ) : null}
                {quizType === "verb-ending" ? (
                    <VerbEndingQuiz wordCount={wordCount} onFinish={handleQuizFinish} />
                ) : null}
                {quizType === "verb-transitivity" ? (
                    <VerbTransitivityQuiz wordCount={wordCount} onFinish={handleQuizFinish} />
                ) : null}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Choose Quiz Type</h1>

            <div className="mb-8">
                <h2 className="text-xl mb-4">Quiz Type:</h2>
                <div className="grid grid-cols-3 gap-3">
                    <Button onClick={() => setQuizType('adjective-type')} primary={quizType === 'adjective-type'}>
                        Adjective Type Quiz (な/の/noun)
                    </Button>
                    <Button onClick={() => setQuizType('verb-ending')} primary={quizType === 'verb-ending'}>
                        Verb Ending Quiz (Ichidan/Godan)
                    </Button>
                    <Button onClick={() => setQuizType('verb-transitivity')} primary={quizType === 'verb-transitivity'}>
                        Verb Transitivity Quiz
                    </Button>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl mb-4">Number of Words:</h2>
                <input
                    type="number"
                    min="1"
                    max="100"
                    value={wordCount}
                    onChange={(e) => setWordCount(Number.parseInt(e.target.value) || 30)}
                    className="border border-stone-600 p-3 rounded-md bg-stone-700 text-stone-100 w-32
                        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
                        hover:border-stone-500 transition-colors duration-200 text-lg"
                />
            </div>

            <Button onClick={startQuiz} disabled={!quizType} primary className="w-full text-lg py-4">
                Start Quiz
            </Button>
        </div>
    );
}
