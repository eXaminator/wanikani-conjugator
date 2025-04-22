import QuizCard from './QuizCard';
import useQuiz from '../hooks/useQuiz';

interface QuizProps {
    wordCount: number;
    onFinish: () => void;
}

export default function VerbEndingQuiz(props: QuizProps) {
    const { wordCount, onFinish } = props;

    const { currentSubject, quizCardProps } = useQuiz({
        wordCount,
        filter: subject => subject.data.parts_of_speech.some(pos => ['godan verb', 'ichidan verb', 'intransitive verb', 'transitive verb', 'する verb'].includes(pos) && subject.data.characters.endsWith('る')),
        answers: { ichidan: 'Ichidan', godan: 'Godan', special: 'Special' },
        onFinish,
        getAnswer: (subject) => {
            const isIchidan = subject.data.parts_of_speech.includes('ichidan verb');
            const isGodan = subject.data.parts_of_speech.includes('godan verb');
            if (isIchidan) return 'ichidan';
            if (isGodan) return 'godan';
            return 'special';
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
