import classNames from 'classnames';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { bind } from 'wanakana';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

type Props = {
    question: string;
    answers: string[];
    tags?: string[];
    icons?: { icon: string; tooltip: string }[];
    hint?: string;
    nextOnCheck?: boolean;
    onNext?: () => void;
    onCorrect?: () => void;
    onMistake?: () => void;
};

export default function QuestionCard({
    question,
    hint,
    tags,
    icons,
    nextOnCheck = false,
    answers,
    onNext,
    onCorrect,
    onMistake,
}: Props) {
    const input = useRef<HTMLInputElement>(null);
    const [state, setState] = useState<'unchecked' | 'correct' | 'incorrect'>('unchecked');
    const [userAnswer, setUserAnswer] = useState<string>('');

    useEffect(() => {
        if (input.current) {
            bind(input.current, {
                IMEMode: 'toHiragana',
            });
            input.current.focus();
        }
    }, []);

    const resetState = useCallback(() => {
        setState('unchecked');
        setUserAnswer('');
    }, []);

    const showInput = useCallback(() => {
        setTimeout(() => input.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    }, []);

    const gotoNext = useCallback(() => {
        if (input.current) {
            input.current.value = '';
            input.current.focus();
        }

        resetState();

        onNext?.();
    }, [onNext, resetState]);

    const handleSubmit = useCallback(
        (event: FormEvent) => {
            event.preventDefault();

            if (state !== 'unchecked') {
                gotoNext();
                return;
            }

            const userInput = input.current?.value.replace(/n$/g, 'ん') || '';

            // Check if any answer is an error (starts with [Error:)
            const hasError = answers.some(answer => answer.startsWith('[Error:'));

            if (hasError) {
                // For error cases, treat any input as correct to allow training to continue
                setUserAnswer(userInput || 'skipped');
                onCorrect?.();
                setState('correct');
                if (nextOnCheck) {
                    gotoNext();
                }
                return;
            }

            const isCorrect = answers.some(answer => answer === userInput);

            if (isCorrect) {
                setUserAnswer(userInput);
                onCorrect?.();
                setState('correct');
                if (nextOnCheck) {
                    gotoNext();
                }
            } else {
                onMistake?.();
                setState('incorrect');
            }
        },
        [state, answers, nextOnCheck, gotoNext, onCorrect, onMistake],
    );

    return (
        <form
            onSubmit={handleSubmit}
            className={classNames([
                'rounded-md border border-stone-900 px-4 py-8 bg-stone-700 flex flex-col items-center gap-8 w-full lg:w-1/2 2xl:w-1/3 shadow-lg shadow-neutral-900 relative',
                state === 'correct' ? '!bg-green-700/30' : state === 'incorrect' ? '!bg-red-700/30' : '',
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
                        state === 'unchecked' && 'bg-black text-black hover:text-inherit focus:text-inherit',
                    ])}
                >
                    {hint}
                </p>
            ) : null}
            <div className="flex gap-3">
                <Input
                    ref={input}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    placeholder="Antwort"
                    type="text"
                    lang="ja"
                    onChange={resetState}
                    readOnly={state !== 'unchecked'}
                    onFocus={showInput}
                />
                <Button onClick={gotoNext} type="button">
                    Next
                </Button>
            </div>
            {state !== 'unchecked' ? (
                <div className="text-center">
                    <p className={classNames([
                        'text-2xl font-bold mb-3',
                        state === 'correct' ? 'text-green-500' : 'text-red-500',
                    ])}>
                        {state === 'correct' ? 'Correct!' : 'Incorrect'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {answers.map((answer) => {
                            const isError = answer.startsWith('[Error:');
                            return (
                                <span
                                    key={answer}
                                    className={classNames([
                                        'px-3 py-1 rounded text-lg font-mono',
                                        isError
                                            ? 'bg-orange-600 text-white'
                                            : state === 'correct' && answer === userAnswer
                                                ? 'bg-green-600 text-white'
                                                : state === 'correct'
                                                    ? 'bg-gray-600 text-gray-300'
                                                    : 'bg-red-600 text-white'
                                    ])}
                                >
                                    {isError ? '⚠️ Conjugation Error' : answer}
                                </span>
                            );
                        })}
                    </div>
                    {answers.some(answer => answer.startsWith('[Error:')) && (
                        <p className="text-sm text-orange-400 mt-2">
                            Conjugation error occurred. Training continued automatically.
                        </p>
                    )}
                </div>
            ) : null}
        </form>
    );
}
