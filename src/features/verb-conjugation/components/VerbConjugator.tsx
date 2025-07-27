import Button from '@shared/components/Button';
import usePersistedState from '@shared/hooks/usePersistedState';
import useAudioPlayer from '@shared/hooks/useAudioPlayer';
import type { Subject } from '@shared/types/types';
import classNames from 'classnames';
import { conjugateAuxiliaries, adjConjugate, type Auxiliary, type Conjugation, type AdjConjugation } from 'kamiya-codec';
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import useStreak from '../hooks/useStreak';
import QuestionCard from './QuestionCard';

/**
 * TODO:
 * - Wiederholungen meiden
 * - streaks nachhalten
 * - Fehler besser behandeln
 * - Filterung welche Formen gefragt werden sollen
 */

const conjugationContexts: Record<string, string[]> = {
    // Verb forms
    te: ['てーForm'],
    casual_present: ['🧢 casual', '✅ affirmative', '⌚️ present'],
    casual_negative: ['🧢 casual', '❌ negative', '⌚️ present'],
    casual_past: ['🧢 casual', '✅ affirmative', '🕰️ past'],
    casual_pastNegative: ['🧢 casual', '❌ negative', '🕰️ past'],
    casual_potential: ['🧢 casual', '💪 potential', '✅ affirmative'],
    casual_potential_negative: ['🧢 casual', '💪 potential', '❌ negative'],
    casual_volitional: ['🧢 casual', '🎯 volitional', '✅ affirmative'],
    polite_present: ['🎩 polite', '✅ affirmative', '⌚️ present'],
    polite_negative: ['🎩 polite', '❌ negative', '⌚️ present'],
    polite_past: ['🎩 polite', '✅ affirmative', '🕰️ past'],
    polite_pastNegative: ['🎩 polite', '❌ negative', '🕰️ past'],
    polite_potential: ['🎩 polite', '💪 potential', '✅ affirmative'],
    polite_potential_negative: ['🎩 polite', '💪 potential', '❌ negative'],
    polite_volitional: ['🎩 polite', '🎯 volitional', '✅ affirmative'],

    // Adjective forms
    adj_present: ['✅ affirmative', '⌚️ present'],
    adj_negative: ['❌ negative', '⌚️ present'],
    adj_past: ['✅ affirmative', '🕰️ past'],
    adj_pastNegative: ['❌ negative', '🕰️ past'],
    adj_te: ['てーForm'],
};

const miscSettingNames = {
    showVerbTransitivity: 'Show verb transitivity',
    showVerbType: 'Show verb type',
    showAdjectiveType: 'Show adjective type',
    showAllValidForms: 'Show all valid forms (e.g., じゃない/ではない)',
    playAudio: 'Play audio',
    ttsAnswers: 'TTS: Read correct answers after subject audio',
    ttsSlowMode: 'TTS: Slower pronunciation for clarity',
    skipCorrectSolution: 'Korrekte Antworten automatisch überspringen',
};

const iconMap = {
    transitive: { icon: '👫🏻', tooltip: 'Transitive Verb' },
    intransitive: { icon: '🧍‍♂️', tooltip: 'Intransitive Verb' },
    ichidan: { icon: '一', tooltip: 'Ichidan Verb' },
    godan: { icon: '五', tooltip: 'Godan Verb' },
    i: { icon: 'い', tooltip: 'い-Adjective' },
    na: { icon: 'な', tooltip: 'な-Adjective' },
};

type ConjugationContext = keyof typeof conjugationContexts;
type ConjugationFilter = Partial<Record<ConjugationContext, boolean>>;
type MiscSettingKey = keyof typeof miscSettingNames;
type MiscSettings = Partial<Record<MiscSettingKey, boolean>>;

function conjugateVerb(subject: Subject, auxiliaries: Auxiliary[], conjugation: Conjugation): string[] {
    const isVerb = subject.data.parts_of_speech.some(pos => pos.includes('verb'));
    if (!isVerb) return [];

    const wordString = subject.data.readings.find((reading) => reading.primary)?.reading ?? '';
    const isIchidan = subject.data.parts_of_speech.some((pos) => pos.includes('ichidan'));

    try {
        return conjugateAuxiliaries(wordString, auxiliaries, conjugation, isIchidan);
    } catch (error) {
        console.error('Verb conjugation error:', {
            subject: subject.data.characters,
            wordString,
            auxiliaries,
            conjugation,
            isIchidan,
            error: error instanceof Error ? error.message : String(error)
        });
        return [`[Error: ${subject.data.characters} + ${conjugation}]`];
    }
}

function conjugateAdjective(subject: Subject, conjugation: AdjConjugation): string[] {
    const isAdjective = subject.data.parts_of_speech.some(pos => pos.includes('adjective'));
    if (!isAdjective) return [];

    const wordString = subject.data.readings.find((reading) => reading.primary)?.reading ?? '';
    const isIAdjective = subject.data.parts_of_speech.includes('い adjective');

    try {
        return adjConjugate(wordString, conjugation, isIAdjective);
    } catch (error) {
        console.error('Adjective conjugation error:', {
            subject: subject.data.characters,
            wordString,
            conjugation,
            isIAdjective,
            error: error instanceof Error ? error.message : String(error)
        });
        return [`[Error: ${subject.data.characters} + ${conjugation}]`];
    }
}

function getForms(subject: Subject): Record<keyof typeof conjugationContexts, string[]> {
    return {
        // Verb forms
        te: conjugateVerb(subject, [], 'Te'),
        casual_present: conjugateVerb(subject, [], 'Dictionary'),
        casual_negative: conjugateVerb(subject, [], 'Negative'),
        casual_past: conjugateVerb(subject, [], 'Ta'),
        casual_pastNegative: conjugateVerb(subject, ['Nai'], 'Ta'),
        casual_potential: conjugateVerb(subject, ['Potential'], 'Dictionary'),
        casual_potential_negative: conjugateVerb(subject, ['Potential'], 'Negative'),
        casual_volitional: conjugateVerb(subject, [], 'Volitional'),
        polite_present: conjugateVerb(subject, ['Masu'], 'Dictionary'),
        polite_negative: conjugateVerb(subject, ['Masu'], 'Negative'),
        polite_past: conjugateVerb(subject, ['Masu'], 'Ta'),
        polite_pastNegative: conjugateVerb(subject, ['Masu'], 'Negative'),
        polite_potential: conjugateVerb(subject, ['Potential', 'Masu'], 'Dictionary'),
        polite_potential_negative: conjugateVerb(subject, ['Potential', 'Masu'], 'Negative'),
        polite_volitional: conjugateVerb(subject, ['Masu'], 'Volitional'),

        // Adjective forms
        adj_present: conjugateAdjective(subject, 'Present'),
        adj_negative: conjugateAdjective(subject, 'Negative'),
        adj_past: conjugateAdjective(subject, 'Past'),
        adj_pastNegative: conjugateAdjective(subject, 'NegativePast'),
        adj_te: conjugateAdjective(subject, 'ConjunctiveTe'),
    };
}

function getTransitivityType(subject: Subject): ('transitive' | 'intransitive')[] {
    const types: ('transitive' | 'intransitive')[] = [];

    if (subject.data.parts_of_speech.includes('intransitive verb')) {
        types.push('intransitive');
    }

    if (subject.data.parts_of_speech.includes('transitive verb')) {
        types.push('transitive');
    }

    return types;
}

function getVerbType(subject: Subject): 'ichidan' | 'godan' | null {
    if (subject.data.parts_of_speech.includes('ichidan verb')) {
        return 'ichidan';
    }

    if (subject.data.parts_of_speech.includes('godan verb')) {
        return 'godan';
    }

    return null;
}

function getAdjectiveType(subject: Subject): 'i' | 'na' | null {
    if (subject.data.parts_of_speech.includes('い adjective')) {
        return 'i';
    }

    if (subject.data.parts_of_speech.includes('な adjective')) {
        return 'na';
    }

    return null;
}





export default function VerbConjugator() {
    const subjects = useRouteLoaderData('root') as Subject[];
    const potentialSubjects = useMemo(
        () =>
            subjects.filter(
                (subject) =>
                    subject.data.parts_of_speech.includes('godan verb') ||
                    subject.data.parts_of_speech.includes('ichidan verb') ||
                    subject.data.parts_of_speech.includes('い adjective') ||
                    subject.data.parts_of_speech.includes('な adjective'),
            ),
        [subjects],
    );

    const [showSettings, setShowSettings] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<Subject>(potentialSubjects[0]);
    const [currentForm, setCurrentForm] = useState<ConjugationContext>('casual_present');
    const [conjugationFilters, setConjugationFilters] = usePersistedState<ConjugationFilter>('conjugationFilters', {});
    const [miscSettings, setMiscSettings] = usePersistedState<MiscSettings>('miscSettings', {
        showVerbTransitivity: true,
        showVerbType: true,
        showAdjectiveType: true,
        showAllValidForms: false,
        playAudio: true,
        ttsAnswers: false,
        ttsSlowMode: true,
        skipCorrectSolution: true,
    });
    const streak = useStreak();
    const audioPlayer = useAudioPlayer();

    const potentialConjugations = useMemo(() => {
        return (Object.keys(conjugationContexts) as ConjugationContext[]).filter(
            (key) => conjugationFilters[key] ?? true,
        );
    }, [conjugationFilters]);

    const setRandom = useCallback(() => {
        // Filter subjects based on available conjugations
        const availableVerbConjugations = potentialConjugations.filter(key => !key.startsWith('adj_'));
        const availableAdjConjugations = potentialConjugations.filter(key => key.startsWith('adj_'));

        const filteredSubjects = potentialSubjects.filter(subject => {
            const isVerb = subject.data.parts_of_speech.some(pos => pos.includes('verb'));
            const isAdjective = subject.data.parts_of_speech.some(pos => pos.includes('adjective'));

            if (isVerb && availableVerbConjugations.length > 0) return true;
            if (isAdjective && availableAdjConjugations.length > 0) return true;
            return false;
        });

        if (filteredSubjects.length === 0) {
            // If no subjects are available, don't change anything
            return;
        }

        const randomSubject = filteredSubjects[Math.floor(Math.random() * filteredSubjects.length)];
        setCurrentSubject(randomSubject);

        // Filter conjugations based on subject type
        const isVerb = randomSubject.data.parts_of_speech.some(pos =>
            pos.includes('verb')
        );
        const isAdjective = randomSubject.data.parts_of_speech.some(pos =>
            pos.includes('adjective')
        );

        let availableConjugations: ConjugationContext[];
        if (isVerb) {
            availableConjugations = availableVerbConjugations;
        } else if (isAdjective) {
            availableConjugations = availableAdjConjugations;
        } else {
            availableConjugations = potentialConjugations;
        }

        if (availableConjugations.length > 0) {
            setCurrentForm(availableConjugations[Math.floor(Math.random() * availableConjugations.length)]);
        }
    }, [potentialSubjects, potentialConjugations]);

    const handleFilterChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setConjugationFilters({ ...conjugationFilters, [event.target.name]: event.target.checked });
        },
        [conjugationFilters, setConjugationFilters],
    );

    const handleMiscSettingChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setMiscSettings({ ...miscSettings, [event.target.name]: event.target.checked });
        },
        [setMiscSettings, miscSettings],
    );

    const handleSelectAllVerbs = useCallback(
        (checked: boolean) => {
            const verbKeys = (Object.keys(conjugationContexts) as ConjugationContext[]).filter(key => !key.startsWith('adj_'));
            const newFilters = { ...conjugationFilters };
            for (const key of verbKeys) {
                newFilters[key] = checked;
            }
            setConjugationFilters(newFilters);
        },
        [conjugationFilters, setConjugationFilters],
    );

    const handleSelectAllAdjectives = useCallback(
        (checked: boolean) => {
            const adjKeys = (Object.keys(conjugationContexts) as ConjugationContext[]).filter(key => key.startsWith('adj_'));
            const newFilters = { ...conjugationFilters };
            for (const key of adjKeys) {
                newFilters[key] = checked;
            }
            setConjugationFilters(newFilters);
        },
        [conjugationFilters, setConjugationFilters],
    );

    useEffect(() => {
        setRandom();
    }, [setRandom]);

    const handleCorrect = useCallback(() => {
        streak.increase();
        if (miscSettings.playAudio) {
            const audioPromise = audioPlayer.playSubjectAudio(currentSubject);

            // If TTS is enabled, play the correct answers after the subject audio
            if (miscSettings.ttsAnswers) {
                const forms = getForms(currentSubject);
                const currentFormAnswers = forms[currentForm];
                const validAnswers = currentFormAnswers.filter(answer => !answer.startsWith('[Error:'));

                if (validAnswers.length > 0) {
                    audioPromise.then(() => {
                        // Cancel any pending speech synthesis to ensure immediate playback
                        speechSynthesis.cancel();
                        const answerText = validAnswers.join('、');
                        audioPlayer.readJapaneseText(answerText, miscSettings.ttsSlowMode ?? true);
                    }).catch(error => {
                        console.error('Error playing subject audio:', error);
                    });
                }
            }
        } else if (miscSettings.ttsAnswers) {
            // If no subject audio but TTS is enabled, play TTS immediately
            const forms = getForms(currentSubject);
            const currentFormAnswers = forms[currentForm];
            const validAnswers = currentFormAnswers.filter(answer => !answer.startsWith('[Error:'));

            if (validAnswers.length > 0) {
                const answerText = validAnswers.join('、');
                audioPlayer.readJapaneseText(answerText, miscSettings.ttsSlowMode ?? true);
            }
        }
    }, [streak, currentSubject, miscSettings, audioPlayer, currentForm]);

    const handleIncorrect = useCallback(() => {
        streak.reset();
        if (miscSettings.playAudio) {
            const audioPromise = audioPlayer.playSubjectAudio(currentSubject);

            // If TTS is enabled, play the correct answers after the subject audio
            if (miscSettings.ttsAnswers) {
                const forms = getForms(currentSubject);
                const currentFormAnswers = forms[currentForm];
                const validAnswers = currentFormAnswers.filter(answer => !answer.startsWith('[Error:'));

                if (validAnswers.length > 0) {
                    audioPromise.then(() => {
                        // Cancel any pending speech synthesis to ensure immediate playback
                        speechSynthesis.cancel();
                        const answerText = validAnswers.join('、');
                        audioPlayer.readJapaneseText(answerText, miscSettings.ttsSlowMode ?? true);
                    }).catch(error => {
                        console.error('Error playing subject audio:', error);
                    });
                }
            }
        } else if (miscSettings.ttsAnswers) {
            // If no subject audio but TTS is enabled, play TTS immediately
            const forms = getForms(currentSubject);
            const currentFormAnswers = forms[currentForm];
            const validAnswers = currentFormAnswers.filter(answer => !answer.startsWith('[Error:'));

            if (validAnswers.length > 0) {
                const answerText = validAnswers.join('、');
                audioPlayer.readJapaneseText(answerText, miscSettings.ttsSlowMode ?? true);
            }
        }
    }, [streak, currentSubject, miscSettings, audioPlayer, currentForm]);

    const translation = currentSubject.data.meanings.map((m) => m.meaning).join(', ');
    const forms = getForms(currentSubject);
    const transitivity = getTransitivityType(currentSubject);
    const verbType = getVerbType(currentSubject);
    const adjectiveType = getAdjectiveType(currentSubject);

    const icons = [];
    if (miscSettings.showVerbTransitivity) icons.push(...transitivity.map((t) => iconMap[t]));
    if (miscSettings.showVerbType && verbType) icons.push(iconMap[verbType]);
    if (miscSettings.showAdjectiveType && adjectiveType) icons.push(iconMap[adjectiveType]);

    // Get the current form's valid answers
    const currentFormAnswers = forms[currentForm];

    return (
        <>
            <Button onClick={() => setShowSettings(!showSettings)}>⚙️ Settings</Button>
            <form
                className={classNames(
                    'p-4 text-lg justify-center transition-all ease-in-out overflow-hidden rounded border opacity-100 max-h-screen gap-6 flex flex-col',
                    !showSettings && '!max-h-0 !opacity-0',
                )}
            >
                <fieldset className="grid grid-cols-2 text-lg justify-center transition-all ease-in-out overflow-hidden rounded border opacity-100 max-h-screen">
                    <legend className="mx-2 px-2">Other settings</legend>
                    {(Object.keys(miscSettingNames) as MiscSettingKey[]).map((key) => (
                        <label key={key} className="flex flex-row px-8 py-1">
                            <input
                                type="checkbox"
                                name={key}
                                className="mr-2"
                                checked={miscSettings[key] ?? true}
                                onChange={handleMiscSettingChange}
                            />
                            {miscSettingNames[key]}
                        </label>
                    ))}
                </fieldset>
                <fieldset className="grid grid-cols-2 text-lg justify-center transition-all ease-in-out overflow-hidden rounded border opacity-100 max-h-screen">
                    <legend className="mx-2 px-2">Verb Conjugation Filters</legend>
                    <label className="flex flex-row px-8 py-1 col-span-2 border-b border-gray-600">
                        <input
                            type="checkbox"
                            className="mr-2"
                            checked={(Object.keys(conjugationContexts) as ConjugationContext[])
                                .filter(key => !key.startsWith('adj_'))
                                .every(key => conjugationFilters[key] ?? true)}
                            onChange={(e) => handleSelectAllVerbs(e.target.checked)}
                        />
                        <strong>Select All Verbs</strong>
                    </label>
                    {(Object.keys(conjugationContexts) as ConjugationContext[])
                        .filter(key => !key.startsWith('adj_'))
                        .map((key) => (
                            <label key={key} className="flex flex-row px-8 py-1">
                                <input
                                    type="checkbox"
                                    name={key}
                                    className="mr-2"
                                    checked={conjugationFilters[key] ?? true}
                                    onChange={handleFilterChange}
                                />
                                {conjugationContexts[key].join(' ')}
                            </label>
                        ))}
                </fieldset>
                <fieldset className="grid grid-cols-2 text-lg justify-center transition-all ease-in-out overflow-hidden rounded border opacity-100 max-h-screen">
                    <legend className="mx-2 px-2">Adjective Conjugation Filters</legend>
                    <label className="flex flex-row px-8 py-1 col-span-2 border-b border-gray-600">
                        <input
                            type="checkbox"
                            className="mr-2"
                            checked={(Object.keys(conjugationContexts) as ConjugationContext[])
                                .filter(key => key.startsWith('adj_'))
                                .every(key => conjugationFilters[key] ?? true)}
                            onChange={(e) => handleSelectAllAdjectives(e.target.checked)}
                        />
                        <strong>Select All Adjectives</strong>
                    </label>
                    {(Object.keys(conjugationContexts) as ConjugationContext[])
                        .filter(key => key.startsWith('adj_'))
                        .map((key) => (
                            <label key={key} className="flex flex-row px-8 py-1">
                                <input
                                    type="checkbox"
                                    name={key}
                                    className="mr-2"
                                    checked={conjugationFilters[key] ?? true}
                                    onChange={handleFilterChange}
                                />
                                {conjugationContexts[key].join(' ')}
                            </label>
                        ))}
                </fieldset>
            </form>
            <div>
                Streak: {streak.current} / {streak.max}
            </div>
            <QuestionCard
                question={currentSubject.data.characters}
                tags={conjugationContexts[currentForm]}
                icons={icons}
                answers={currentFormAnswers}
                hint={`${translation} (${currentSubject.data.parts_of_speech.join(', ')})`}
                onNext={setRandom}
                onCorrect={handleCorrect}
                onMistake={handleIncorrect}
                nextOnCheck={miscSettings.skipCorrectSolution === true}
            />
        </>
    );
}
