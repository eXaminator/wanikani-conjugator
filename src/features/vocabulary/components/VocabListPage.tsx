import Input from '@shared/components/Input';
import type { Subject } from '@shared/types/types';
import { useMemo, useState } from 'react';
import { useRouteLoaderData } from 'react-router';

export default function VocabListPage() {
    const subjects = useRouteLoaderData('root') as Subject[];

    const [sortBy, setSortBy] = useState<string>('kanji');
    const [onlyType, setOnlyType] = useState<string>('');
    const [onlyHiragana, setOnlyHiragana] = useState(false);

    const metaSubjects = useMemo(() => {
        return subjects
            .map((subject) => {
                return {
                    subject,
                    prefix: subject.data.characters.match(/^[\u3040-\u309F\u30a0-\u30ff]+/)?.[0] ?? '',
                    suffix: subject.data.characters.match(/[\u3040-\u309F\u30a0-\u30ff]+$/)?.[0] ?? '',
                    kanji: subject.data.characters.match(/[\u4e00-\u9faf\u3400-\u4dbf]+/)?.[0] ?? '',
                };
            })
            .filter((meta) => {
                if (onlyHiragana && meta.suffix.length === 0) {
                    return false;
                }

                if (onlyType && !meta.subject.data.parts_of_speech.includes(onlyType)) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'all') {
                    return a.subject.data.characters.localeCompare(b.subject.data.characters);
                }

                if (sortBy === 'kanji') {
                    return a.kanji.localeCompare(b.kanji);
                }

                return a.suffix.localeCompare(b.suffix);
            });
    }, [subjects, onlyType, onlyHiragana, sortBy]);

    const types = useMemo(() => {
        return subjects
            .reduce((acc, subject) => {
                for (const type of subject.data.parts_of_speech) {
                    if (!acc.includes(type)) {
                        acc.push(type);
                    }
                }
                return acc;
            }, [] as string[])
            .sort();
    }, [subjects]);

    return (
        <div className="space-y-4 p-4">
            <div className="flex flex-wrap gap-4">
                <Input
                    type="checkbox"
                    checked={onlyHiragana}
                    onChange={(e) => setOnlyHiragana(e.target.checked)}
                    label="Enthält Hiragana"
                />
                <div className="flex items-center gap-2">
                    <label htmlFor="type-select" className="text-sm text-gray-600">
                        Typ:
                    </label>
                    <select
                        id="type-select"
                        value={onlyType}
                        onChange={(e) => setOnlyType(e.target.value)}
                        className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Alle</option>
                        {types.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="sort-select" className="text-sm text-gray-600">
                        Sortieren nach:
                    </label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">Alle</option>
                        <option value="kanji">Kanji</option>
                        <option value="suffix">Suffix</option>
                    </select>
                </div>
            </div>
            <p className="text-sm text-gray-600">
                <strong>{metaSubjects.length}</strong> Einträge
            </p>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                        {metaSubjects.map((meta) => (
                            <tr key={meta.subject.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-4 py-2 font-medium">
                                    {meta.subject.data.characters}
                                </td>
                                <td className="whitespace-nowrap px-4 py-2">
                                    {meta.subject.data.readings.map((m) => (
                                        <span key={m.reading} className="mr-2">
                                            {m.reading}
                                        </span>
                                    ))}
                                </td>
                                <td className="px-4 py-2">
                                    {meta.subject.data.meanings.map((m) => m.meaning).join(', ')}
                                </td>
                                <td className="px-4 py-2">{meta.subject.data.parts_of_speech.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
