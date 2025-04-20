import QuizCard from './QuizCard';
import useQuiz from '../hooks/useQuiz';

interface QuizProps {
    wordCount: number;
    onFinish: () => void;
}

export default function VerbEndingQuiz(props: QuizProps) {
    const { wordCount, onFinish } = props;

    const { currentPosition, currentSubject, score, maxPosition, handleAnswer } = useQuiz({
        wordCount,
        filter: subject => subject.data.parts_of_speech.some(pos => pos.includes('verb') && subject.data.characters.endsWith('る')),
        onFinish,
        checkAnswer: (answer, subject) => {
            const isIchidan = subject.data.parts_of_speech.includes('ichidan verb');
            if (answer === 'ichidan' && isIchidan) return true;
            if (answer === 'godan' && !isIchidan) return true;
            return isIchidan ? 'Ichidan' : 'Godan';
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
            answers={{ ichidan: 'Ichidan', godan: 'Godan' }}
            score={score}
            maxPosition={maxPosition}
            currentPosition={currentPosition}
        />
    );
}
