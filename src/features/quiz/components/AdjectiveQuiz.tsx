import QuizCard from './QuizCard';
import useQuiz from '../hooks/useQuiz';

interface QuizProps {
    wordCount: number;
    onFinish: () => void;
}

export default function AdjectiveQuiz(props: QuizProps) {
    const { wordCount, onFinish } = props;

    const { currentSubject, quizCardProps } = useQuiz({
        wordCount,
        filter: subject => subject.data.parts_of_speech.some(pos => ['な adjective', 'の adjective'].includes(pos)),
        onFinish,
        answers: { na: 'な-adjective', no: 'の-adjective', both: 'Both' },
        getAnswer: (subject) => {
            const isNaAdj = subject.data.parts_of_speech.includes('な adjective');
            const isNoAdj = subject.data.parts_of_speech.includes('の adjective');

            if (isNaAdj && isNoAdj) return 'both';
            if (isNaAdj) return 'na';
            return 'no';
        }
    });

    if (!currentSubject) {
        return <div>Loading...</div>;
    }

    return (
        <QuizCard
            {...quizCardProps}
            onFinish={onFinish}
        />
    );
}
