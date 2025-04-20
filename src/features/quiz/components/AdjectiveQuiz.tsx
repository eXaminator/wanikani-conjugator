import QuizCard from './QuizCard';
import useQuiz from '../hooks/useQuiz';

interface QuizProps {
    wordCount: number;
    onFinish: () => void;
}

export default function AdjectiveQuiz(props: QuizProps) {
    const { wordCount, onFinish } = props;

    const { currentPosition, currentSubject, score, maxPosition, handleAnswer } = useQuiz({
        wordCount,
        filter: subject => subject.data.parts_of_speech.some(pos => ['noun', 'な adjective', 'の adjective'].includes(pos)),
        onFinish,
        checkAnswer: (answer, subject) => {
            const isNaAdj = subject.data.parts_of_speech.includes('な adjective');
            const isNoAdj = subject.data.parts_of_speech.includes('の adjective');
            const isNoun = subject.data.parts_of_speech.includes('noun');

            if (answer === 'na' && isNaAdj) return true;
            if (answer === 'no' && isNoAdj) return true;
            if (answer === 'noun' && isNoun) return true;
            return isNaAdj ? 'な-adjective' : isNoAdj ? 'の-adjective' : 'noun';
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
            answers={{ na: 'な-adjective', no: 'の-adjective', noun: 'Noun' }}
            score={score}
            maxPosition={maxPosition}
            currentPosition={currentPosition}
        />
    );
}
