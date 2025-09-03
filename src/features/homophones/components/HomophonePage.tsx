import type { Subject } from '@shared/types/types';
import { useMemo, useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import Input from '@shared/components/Input';

function getSrsStageName(srsStage: number): string {
    switch (srsStage) {
        case 0: return 'Initiate';
        case 1: return 'Apprentice I';
        case 2: return 'Apprentice II';
        case 3: return 'Apprentice III';
        case 4: return 'Apprentice IV';
        case 5: return 'Guru I';
        case 6: return 'Guru II';
        case 7: return 'Master';
        case 8: return 'Enlightened';
        case 9: return 'Burned';
        default: return 'Unknown';
    }
}

function getSrsStageColor(srsStage: number): string {
    switch (srsStage) {
        case 0: return 'bg-gray-500'; // Initiate
        case 1:
        case 2:
        case 3:
        case 4: return 'bg-pink-600'; // Apprentice
        case 5:
        case 6: return 'bg-purple-600'; // Guru
        case 7: return 'bg-blue-600'; // Master
        case 8: return 'bg-yellow-600'; // Enlightened
        case 9: return 'bg-gray-600'; // Burned
        default: return 'bg-gray-500';
    }
}

// Vokal-Zeilen für ähnliche Lesungen
const vowelGroups: Record<string, string[]> = {
    'a': ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', 'が', 'ざ', 'だ', 'ば', 'ぱ'],
    'i': ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'り', 'ぎ', 'じ', 'ぢ', 'び', 'ぴ'],
    'u': ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る', 'ぐ', 'ず', 'づ', 'ぶ', 'ぷ'],
    'e': ['え', 'け', 'せ', 'て', 'ね', 'へ', 'め', 'れ', 'げ', 'ぜ', 'で', 'べ', 'ぺ'],
    'o': ['お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'よ', 'ろ', 'を', 'ご', 'ぞ', 'ど', 'ぼ', 'ぽ']
};

function getVowelGroup(kana: string): string | null {
    for (const [vowel, kanas] of Object.entries(vowelGroups)) {
        if (kanas.includes(kana)) {
            return vowel;
        }
    }
    return null;
}

function areSimilarReadings(reading1: string, reading2: string): boolean {
    // Identische Lesungen
    if (reading1 === reading2) return true;

    const len1 = reading1.length;
    const len2 = reading2.length;

    // Ähnliche Lesungen müssen die gleiche Anzahl Kana haben und mindestens 3 Kana lang sein
    if (len1 !== len2 || len1 < 3) return false;

    // Prüfe auf ähnliche Vokale - nur ein Kana darf sich unterscheiden
    let differences = 0;
    for (let i = 0; i < len1; i++) {
        const char1 = reading1[i];
        const char2 = reading2[i];

        if (char1 !== char2) {
            const vowel1 = getVowelGroup(char1);
            const vowel2 = getVowelGroup(char2);

            // Nur ein Unterschied erlaubt, und nur wenn es sich um verschiedene Vokale handelt
            if (vowel1 && vowel2 && vowel1 !== vowel2) {
                differences++;
                if (differences > 1) return false;
            } else {
                return false;
            }
        }
    }
    return differences === 1;
}

function groupSimilarReadings(readings: string[]): string[][] {
    const groups: string[][] = [];
    const used = new Set<string>();

    for (const reading of readings) {
        if (used.has(reading)) continue;

        const group = [reading];
        used.add(reading);

        for (const otherReading of readings) {
            if (used.has(otherReading)) continue;

            if (areSimilarReadings(reading, otherReading)) {
                group.push(otherReading);
                used.add(otherReading);
            }
        }

        if (group.length > 1) {
            groups.push(group);
        }
    }

    return groups;
}

type HomophoneGroup = {
    reading: string;
    subjects: Subject[];
    count: number;
};

export default function HomophonePage() {
    const subjects = useRouteLoaderData('root') as Subject[];
    const [includeSimilarReadings, setIncludeSimilarReadings] = useState(false);

    const homophoneGroups = useMemo(() => {
        if (includeSimilarReadings) {
            // Sammle alle Lesungen
            const allReadings = new Set<string>();
            for (const subject of subjects) {
                for (const reading of subject.data.readings) {
                    allReadings.add(reading.reading);
                }
            }

            // Gruppiere ähnliche Lesungen
            const similarGroups = groupSimilarReadings(Array.from(allReadings));

            // Erstelle Homophone-Gruppen basierend auf ähnlichen Lesungen
            const homophoneGroups: HomophoneGroup[] = [];

            for (const readingGroup of similarGroups) {
                const groupSubjects: Subject[] = [];

                for (const reading of readingGroup) {
                    for (const subject of subjects) {
                        if (subject.data.readings.some(r => r.reading === reading)) {
                            if (!groupSubjects.find(s => s.id === subject.id)) {
                                groupSubjects.push(subject);
                            }
                        }
                    }
                }

                if (groupSubjects.length > 1) {
                    homophoneGroups.push({
                        reading: readingGroup.join(' / '),
                        subjects: groupSubjects,
                        count: groupSubjects.length,
                    });
                }
            }

            return homophoneGroups.sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return b.reading.length - a.reading.length;
            });
        }

        // Originale Logik: Gruppiere Vokabeln nach exakter Lesung
        const readingMap = new Map<string, Subject[]>();

        for (const subject of subjects) {
            for (const reading of subject.data.readings) {
                const readingKey = reading.reading;
                if (!readingMap.has(readingKey)) {
                    readingMap.set(readingKey, []);
                }
                const existingSubjects = readingMap.get(readingKey);
                if (existingSubjects) {
                    existingSubjects.push(subject);
                }
            }
        }

        // Filtere nur Gruppen mit mehr als einem Vokabel (echte Homophone)
        const homophoneGroups: HomophoneGroup[] = Array.from(readingMap.entries())
            .filter(([_, subjects]) => subjects.length > 1)
            .map(([reading, subjects]) => ({
                reading,
                subjects,
                count: subjects.length,
            }))
            // Sortiere nach Anzahl der Vokabeln (absteigend), dann nach Länge der Lesung (absteigend)
            .sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return b.reading.length - a.reading.length;
            });

        return homophoneGroups;
    }, [subjects, includeSimilarReadings]);

    const totalHomophones = useMemo(() => {
        return homophoneGroups.reduce((sum, group) => sum + group.count, 0);
    }, [homophoneGroups]);

    return (
        <div className="space-y-6 p-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-stone-100 mb-2">Homophone</h2>
                <p className="text-stone-300">
                    Vokabeln mit gleicher Lesung, gruppiert nach Lesung und sortiert nach Anzahl
                </p>
                <p className="text-sm text-stone-400 mt-2">
                    <strong>{homophoneGroups.length}</strong> Homophone-Gruppen mit insgesamt{' '}
                    <strong>{totalHomophones}</strong> Vokabeln
                </p>
            </div>

            <div className="flex justify-center">
                <Input
                    type="checkbox"
                    checked={includeSimilarReadings}
                    onChange={(e) => setIncludeSimilarReadings(e.target.checked)}
                    label="Ähnliche Lesungen einschließen (mind. 3 Kana, gleiche Länge, nur ein Kana aus anderer Vokal-Zeile)"
                />
            </div>

            {homophoneGroups.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-stone-400">Keine Homophone gefunden.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {homophoneGroups.map((group) => (
                        <div key={group.reading} className="bg-stone-800 border border-stone-600 rounded-lg shadow-sm">
                            <div className="bg-stone-700 px-4 py-3 border-b border-stone-600">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-stone-100">
                                        {group.reading}
                                    </h3>
                                    <span className="bg-amber-600 text-stone-100 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                        {group.count} Vokabeln
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-stone-600">
                                        <thead className="bg-stone-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                                                    Zeichen
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                                                    Lesungen
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                                                    Bedeutungen
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                                                    Wortarten
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                                                    Level
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                                                    Lernstufe
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-stone-800 divide-y divide-stone-600">
                                            {group.subjects.map((subject) => (
                                                <tr key={subject.id} className="hover:bg-stone-700 transition-colors duration-200">
                                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-stone-100">
                                                        <a
                                                            href={`https://www.wanikani.com/vocabulary/${subject.data.characters}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-amber-400 hover:text-amber-300 underline transition-colors duration-200"
                                                        >
                                                            {subject.data.characters}
                                                        </a>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-stone-200">
                                                        {subject.data.readings.map((reading) => (
                                                            <span key={`${subject.id}-${reading.reading}`} className="mr-2">
                                                                {reading.reading}
                                                                {reading.primary && (
                                                                    <span className="ml-1 text-xs text-amber-400 font-medium">
                                                                        (primär)
                                                                    </span>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </td>
                                                    <td className="px-4 py-3 text-stone-200">
                                                        {subject.data.meanings
                                                            .filter((meaning) => meaning.primary)
                                                            .map((meaning) => meaning.meaning)
                                                            .join(', ')}
                                                    </td>
                                                    <td className="px-4 py-3 text-stone-200">
                                                        <div className="flex flex-wrap gap-1">
                                                            {subject.data.parts_of_speech.map((pos) => (
                                                                <span
                                                                    key={pos}
                                                                    className="inline-block bg-stone-600 text-stone-200 text-xs px-2 py-1 rounded-md"
                                                                >
                                                                    {pos}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-stone-400">
                                                        {subject.data.level}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {subject.assignment ? (
                                                            <span className={`inline-block text-stone-100 text-xs px-2 py-1 rounded-md ${getSrsStageColor(subject.assignment.srs_stage)}`}>
                                                                {getSrsStageName(subject.assignment.srs_stage)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-stone-500 text-xs">Nicht verfügbar</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
