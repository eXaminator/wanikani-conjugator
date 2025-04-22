import QuizCard from './QuizCard';
import useQuiz from '../hooks/useQuiz';

interface QuizProps {
    wordCount: number;
    onFinish: () => void;
}

export default function VerbTransitivityQuiz(props: QuizProps) {
    const { wordCount, onFinish } = props;

    const { currentSubject, quizCardProps } = useQuiz({
        wordCount,
        filter: subject => subject.data.parts_of_speech.some(pos => ['transitive verb', 'intransitive verb'].includes(pos)),
        answers: { transitive: 'Transitive', intransitive: 'Intransitive', both: 'Both' },
        onFinish,
        getAnswer: (subject) => {
            const isTransitive = subject.data.parts_of_speech.includes('transitive verb');
            const isIntransitive = subject.data.parts_of_speech.includes('transitive verb');
            const isBoth = isTransitive && isIntransitive;

            if (isBoth) return 'both';
            if (isTransitive) return 'transitive';
            return 'intransitive';
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
