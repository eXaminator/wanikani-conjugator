import QuizCard from './QuizCard';
import useQuiz from '../hooks/useQuiz';

interface QuizProps {
    wordCount: number;
    onFinish: () => void;
}

export default function VerbTransitivityQuiz(props: QuizProps) {
    const { wordCount, onFinish } = props;

    const { currentPosition, currentSubject, score, maxPosition, handleAnswer } = useQuiz({
        wordCount,
        filter: subject => subject.data.parts_of_speech.some(pos => pos.includes('verb')),
        onFinish,
        checkAnswer: (answer, subject) => {
            const isTransitive = subject.data.parts_of_speech.includes('transitive verb');
            if (answer === 'transitive' && isTransitive) return true;
            if (answer === 'intransitive' && !isTransitive) return true;
            return isTransitive ? 'Transitive' : 'Intransitive';
        }
    });

    if (!currentSubject) {
        return <div>Loading...</div>;
    }

    return (
        <QuizCard
            question={currentSubject.data.characters}
            onAnswer={handleAnswer}
            onFinish={onFinish}
            answers={{ transitive: 'Transitive', intransitive: 'Intransitive' }}
            score={score}
            maxPosition={maxPosition}
            currentPosition={currentPosition}
        />
    );
}
