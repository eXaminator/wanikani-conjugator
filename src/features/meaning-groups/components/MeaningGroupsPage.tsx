import type { Subject } from '@shared/types/types';
import { useMemo, useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import Input from '@shared/components/Input';
import Tooltip from '@shared/components/Tooltip';

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

function normalizeMeaning(meaning: string): string {
    // Normalisiere Bedeutungen für bessere Gruppierung
    return meaning
        .toLowerCase()
        .trim()
        .replace(/[.,;:!?]/g, '') // Entferne Satzzeichen
        .replace(/\s+/g, ' '); // Normalisiere Leerzeichen
}

function areSimilarMeanings(meaning1: string, meaning2: string): boolean {
    const norm1 = normalizeMeaning(meaning1);
    const norm2 = normalizeMeaning(meaning2);

    // Identische Bedeutungen
    if (norm1 === norm2) return true;

    // Prüfe auf gemeinsame Wörter
    const words1 = norm1.split(' ');
    const words2 = norm2.split(' ');

    // Mindestens 50% der Wörter müssen übereinstimmen
    const commonWords = words1.filter(word => words2.includes(word));
    const minWords = Math.min(words1.length, words2.length);

    if (minWords === 0) return false;

    return commonWords.length / minWords >= 0.5;
}

function groupSimilarMeanings(meanings: string[]): string[][] {
    const groups: string[][] = [];
    const used = new Set<string>();

    for (const meaning of meanings) {
        if (used.has(meaning)) continue;

        const group = [meaning];
        used.add(meaning);

        for (const otherMeaning of meanings) {
            if (used.has(otherMeaning)) continue;

            if (areSimilarMeanings(meaning, otherMeaning)) {
                group.push(otherMeaning);
                used.add(otherMeaning);
            }
        }

        if (group.length > 1) {
            groups.push(group);
        }
    }

    return groups;
}

type MeaningGroup = {
    meaning: string;
    subjects: Subject[];
    count: number;
};

export default function MeaningGroupsPage() {
    const subjects = useRouteLoaderData('root') as Subject[];
    const [includeSimilarMeanings, setIncludeSimilarMeanings] = useState(false);

    const meaningGroups = useMemo(() => {
        if (includeSimilarMeanings) {
            // Sammle alle primären Bedeutungen
            const allMeanings = new Set<string>();
            for (const subject of subjects) {
                for (const meaning of subject.data.meanings) {
                    if (meaning.primary) {
                        allMeanings.add(meaning.meaning);
                    }
                }
            }

            // Gruppiere ähnliche Bedeutungen
            const similarGroups = groupSimilarMeanings(Array.from(allMeanings));

            // Erstelle Bedeutungs-Gruppen basierend auf ähnlichen Bedeutungen
            const meaningGroups: MeaningGroup[] = [];

            for (const meaningGroup of similarGroups) {
                const groupSubjects: Subject[] = [];

                for (const meaning of meaningGroup) {
                    for (const subject of subjects) {
                        if (subject.data.meanings.some(m => m.primary && m.meaning === meaning)) {
                            if (!groupSubjects.find(s => s.id === subject.id)) {
                                groupSubjects.push(subject);
                            }
                        }
                    }
                }

                if (groupSubjects.length > 1) {
                    meaningGroups.push({
                        meaning: meaningGroup.join(' / '),
                        subjects: groupSubjects,
                        count: groupSubjects.length,
                    });
                }
            }

            return meaningGroups.sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return b.meaning.length - a.meaning.length;
            });
        }

        // Originale Logik: Gruppiere Vokabeln nach exakter Bedeutung
        const meaningMap = new Map<string, Subject[]>();

        for (const subject of subjects) {
            for (const meaning of subject.data.meanings) {
                if (meaning.primary) {
                    const meaningKey = meaning.meaning;
                    if (!meaningMap.has(meaningKey)) {
                        meaningMap.set(meaningKey, []);
                    }
                    const existingSubjects = meaningMap.get(meaningKey);
                    if (existingSubjects) {
                        existingSubjects.push(subject);
                    }
                }
            }
        }

        // Filtere nur Gruppen mit mehr als einem Vokabel
        const meaningGroups: MeaningGroup[] = Array.from(meaningMap.entries())
            .filter(([_, subjects]) => subjects.length > 1)
            .map(([meaning, subjects]) => ({
                meaning,
                subjects,
                count: subjects.length,
            }))
            // Sortiere nach Anzahl der Vokabeln (absteigend), dann nach Länge der Bedeutung (absteigend)
            .sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return b.meaning.length - a.meaning.length;
            });

        return meaningGroups;
    }, [subjects, includeSimilarMeanings]);

    const totalMeanings = useMemo(() => {
        return meaningGroups.reduce((sum, group) => sum + group.count, 0);
    }, [meaningGroups]);

    return (
        <div className="space-y-6 p-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-stone-100 mb-2">Bedeutungsgruppen</h2>
                <p className="text-stone-300">
                    Vokabeln mit gleicher oder ähnlicher Bedeutung, gruppiert nach Bedeutung und sortiert nach Anzahl
                </p>
                <p className="text-sm text-stone-400 mt-2">
                    <strong>{meaningGroups.length}</strong> Bedeutungsgruppen mit insgesamt{' '}
                    <strong>{totalMeanings}</strong> Vokabeln
                </p>
            </div>

            <div className="flex justify-center">
                <Input
                    type="checkbox"
                    checked={includeSimilarMeanings}
                    onChange={(e) => setIncludeSimilarMeanings(e.target.checked)}
                    label="Ähnliche Bedeutungen einschließen (mind. 50% gemeinsame Wörter)"
                />
            </div>

            {meaningGroups.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-stone-400">Keine Bedeutungsgruppen gefunden.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {meaningGroups.map((group) => (
                        <div key={group.meaning} className="bg-stone-800 border border-stone-600 rounded-lg shadow-sm">
                            <div className="bg-stone-700 px-4 py-3 border-b border-stone-600">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-stone-100">
                                        {group.meaning}
                                    </h3>
                                    <span className="bg-amber-600 text-stone-100 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                        {group.count} Vokabeln
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
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
                                                    <Tooltip
                                                        content={subject.data.meanings.map((meaning) =>
                                                            `${meaning.meaning}${meaning.primary ? ' (primär)' : ''}`
                                                        ).join(', ')}
                                                    >
                                                        <span className="cursor-help">
                                                            {subject.data.meanings
                                                                .filter((meaning) => meaning.primary)
                                                                .map((meaning) => meaning.meaning)
                                                                .join(', ')}
                                                        </span>
                                                    </Tooltip>
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
                    ))}
                </div>
            )}
        </div>
    );
}
