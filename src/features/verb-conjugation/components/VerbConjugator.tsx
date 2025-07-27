import Button from '@shared/components/Button';
import usePersistedState from '@shared/hooks/usePersistedState';
import type { Subject } from '@shared/types/types';
import classNames from 'classnames';
import { conjugateAuxiliaries } from 'kamiya-codec';
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
};

const miscSettingNames = {
    showVerbTransitivity: 'Show verb transitivity',
    showVerbType: 'Show verb type',
    playAudio: 'Play audio',
    skipCorrectSolution: 'Korrekte Antworten automatisch überspringen',
};

const iconMap = {
    transitive: { icon: '👫🏻', tooltip: 'Transitive Verb' },
    intransitive: { icon: '🧍‍♂️', tooltip: 'Intransitive Verb' },
    ichidan: { icon: '一', tooltip: 'Ichidan Verb' },
    godan: { icon: '五', tooltip: 'Godan Verb' },
};

type ConjugationContext = keyof typeof conjugationContexts;
type ConjugationFilter = Partial<Record<ConjugationContext, boolean>>;
type MiscSettingKey = keyof typeof miscSettingNames;
type MiscSettings = Partial<Record<MiscSettingKey, boolean>>;

function getForms(verb: Subject): Record<keyof typeof conjugationContexts, string> {
    const verbString = verb.data.readings.find((reading) => reading.primary)?.reading ?? '';
    const isIchidan = verb.data.parts_of_speech.some((pos) => pos.includes('ichidan'));

    return {
        te: conjugateAuxiliaries(verbString, [], 'Te', isIchidan)[0],
        casual_present: conjugateAuxiliaries(verbString, [], 'Dictionary', isIchidan)[0],
        casual_negative: conjugateAuxiliaries(verbString, [], 'Negative', isIchidan)[1],
        casual_past: conjugateAuxiliaries(verbString, [], 'Ta', isIchidan)[0],
        casual_pastNegative: conjugateAuxiliaries(verbString, ['Nai'], 'Ta', isIchidan)[0],
        casual_potential: conjugateAuxiliaries(verbString, ['ReruRareru'], 'Dictionary', isIchidan)[0],
        casual_potential_negative: conjugateAuxiliaries(verbString, ['ReruRareru'], 'Negative', isIchidan)[1],
        casual_volitional: conjugateAuxiliaries(verbString, [], 'Volitional', isIchidan)[0],
        polite_present: conjugateAuxiliaries(verbString, ['Masu'], 'Dictionary', isIchidan)[0],
        polite_negative: conjugateAuxiliaries(verbString, ['Masu'], 'Negative', isIchidan)[0],
        polite_past: conjugateAuxiliaries(verbString, ['Masu'], 'Ta', isIchidan)[0],
        polite_pastNegative: conjugateAuxiliaries(verbString, ['Masu'], 'Negative', isIchidan)[1],
        polite_potential: conjugateAuxiliaries(verbString, ['ReruRareru', 'Masu'], 'Dictionary', isIchidan)[0],
        polite_potential_negative: conjugateAuxiliaries(verbString, ['ReruRareru', 'Masu'], 'Negative', isIchidan)[1],
        polite_volitional: conjugateAuxiliaries(verbString, ['Masu'], 'Volitional', isIchidan)[0],
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

function playAudio(subject: Subject) {
    const audios = subject.data.pronunciation_audios.filter((a) => a.content_type === 'audio/webm');
    const audio = audios[Math.floor(Math.random() * audios.length)];
    console.log('Play audio', { audio, audios });
    if (audio) new Audio(audio.url).play();
}

export default function VerbConjugator() {
    const subjects = useRouteLoaderData('root') as Subject[];
    const potentialVerbs = useMemo(
        () =>
            subjects.filter(
                (subject) =>
                    subject.data.parts_of_speech.includes('godan verb') ||
                    subject.data.parts_of_speech.includes('ichidan verb'),
            ),
        [subjects],
    );

    const [showSettings, setShowSettings] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<Subject>(potentialVerbs[0]);
    const [currentForm, setCurrentForm] = useState<ConjugationContext>('casual_present');
    const [conjugationFilters, setConjugationFilters] = usePersistedState<ConjugationFilter>('conjugationFilters', {});
    const [miscSettings, setMiscSettings] = usePersistedState<MiscSettings>('miscSettings', {
        showVerbTransitivity: true,
        showVerbType: true,
        playAudio: true,
        skipCorrectSolution: true,
    });
    const streak = useStreak();

    const potentialConjugations = useMemo(() => {
        return (Object.keys(conjugationContexts) as ConjugationContext[]).filter(
            (key) => conjugationFilters[key] ?? true,
        );
    }, [conjugationFilters]);

    const setRandom = useCallback(() => {
        setCurrentForm(potentialConjugations[Math.floor(Math.random() * potentialConjugations.length)]);
        setCurrentSubject(potentialVerbs[Math.floor(Math.random() * potentialVerbs.length)]);
    }, [potentialVerbs, potentialConjugations]);

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

    useEffect(() => {
        setRandom();
    }, [setRandom]);

    const handleCorrect = useCallback(() => {
        streak.increase();
        if (miscSettings.playAudio) playAudio(currentSubject);
    }, [streak, currentSubject, miscSettings]);

    const handleIncorrect = useCallback(() => {
        streak.reset();
        if (miscSettings.playAudio) playAudio(currentSubject);
    }, [streak, currentSubject, miscSettings]);

    const translation = currentSubject.data.meanings.map((m) => m.meaning).join(', ');
    const forms = getForms(currentSubject);
    const transitivity = getTransitivityType(currentSubject);
    const verbType = getVerbType(currentSubject);

    const icons = [];
    if (miscSettings.showVerbTransitivity) icons.push(...transitivity.map((t) => iconMap[t]));
    if (miscSettings.showVerbType && verbType) icons.push(iconMap[verbType]);

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
                    <legend className="mx-2 px-2">Conjugation Filters</legend>
                    {(Object.keys(conjugationContexts) as ConjugationContext[]).map((key) => (
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
                answer={forms[currentForm]}
                hint={`${translation} (${currentSubject.data.parts_of_speech.join(', ')})`}
                onNext={setRandom}
                onCorrect={handleCorrect}
                onMistake={handleIncorrect}
                nextOnCheck={miscSettings.skipCorrectSolution === true}
            />
        </>
    );
}
