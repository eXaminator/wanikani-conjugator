import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import classNames from "classnames";
import { useCallback, useEffect, useRef, type FormEvent } from "react";
import { bind } from "wanakana";

type Props = {
    question: string;
    hint?: string;
    answers?: Record<string, string>;
    onAnswer: (answer: string) => void;
    onFinish: () => void;
    score?: number;
    currentPosition?: number;
    maxPosition?: number;
    // state: 'unchecked' | 'correct' | 'incorrect';
    tags?: string[],
    icons?: { icon: string; tooltip: string }[];
};

const answerCols: Record<string, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
};

export default function QuizCard(props: Props) {
    const { onAnswer, onFinish, question, answers, hint, tags, icons, currentPosition, maxPosition, score } = props;
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (input.current) {
            bind(input.current, {
                IMEMode: 'toHiragana',
            });
            input.current.focus();
        }
    }, []);

    const handleSubmit = useCallback((event: FormEvent) => {
        event.preventDefault();
        onAnswer(input.current?.value.replace(/n$/g, 'ん') ?? '');
    }, [onAnswer]);

    const answerCount = Object.values(answers ?? {}).length || 1;
    const maxAnswerPerRows = Object.values(answerCols).length;
    const answersColClass = answerCols[String(Math.min(answerCount, maxAnswerPerRows))];

    return (
        <div className="space-y-6 max-w-2xl mx-auto flex flex-col items-stretch">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <div className="text-lg">
                    Question {currentPosition} of {maxPosition}
                </div>
                <Button onClick={onFinish} type="button">
                    Finish
                </Button>
                <div className="text-lg">Score: {score}</div>
            </div>
            <form
                onSubmit={handleSubmit}
                className={classNames([
                    'rounded-md border border-stone-900 px-4 py-8 bg-stone-700 flex flex-col items-center gap-8 w-full shadow-lg shadow-neutral-900 relative',
                    // state === 'correct' ? '!bg-green-700/30' : state === 'incorrect' ? '!bg-red-700/30' : '',
                ])}
            >
                <h3 className="text-6xl font-bold">{question}</h3>
                <p className="flex items-center gap-2">
                    {tags?.map((c) => (
                        <span key={c} className="rounded px-2 bg-amber-800">
                            {c}
                        </span>
                    ))}

                    {icons?.map((iconData) => (
                        <span key={iconData.icon} className="rounded px-2 bg-slate-600" title={iconData.tooltip}>
                            {iconData.icon}
                        </span>
                    ))}
                </p>
                {hint ? (
                    <p
                        tabIndex={-1}
                        className={classNames([
                            'px-4 py-1',
                            // state === 'unchecked' && 'bg-black text-black hover:text-inherit focus:text-inherit',
                        ])}
                    >
                        {hint}
                    </p>
                ) : null}
                <div className={`grid gap-3 ${answersColClass}`}>
                    {answers ? (
                        Object.entries(answers).map(([key, value]) => (
                            <Button
                                key={key}
                                onClick={() => onAnswer(key)}
                                className="aspect-square flex items-center justify-center text-center"
                            >
                                {value}
                            </Button>
                        ))
                    ) : (
                        <Input
                            ref={input}
                            autoComplete="off"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            placeholder="Antwort"
                            type="text"
                            lang="ja"
                        // onChange={resetState}
                        // readOnly={state === 'correct'}
                        />
                    )}
                    {/* <Button onClick={gotoNext} type="button">
                    Next
                </Button> */}
                </div>
                {/* {state !== 'unchecked' ? (
                <p
                    className={classNames([
                        'text-4xl font-bold',
                        state === 'correct' ? 'text-green-500' : 'text-red-500',
                    ])}
                >
                    {answer}
                </p>
            ) : null} */}
            </form>
        </div>
    );
}
