import type { Subject } from '~/lib/types';
import { getCached, setCache } from '~/lib/cache.server';

const CACHE_KEY = 'wanikani_subjects';

interface Assignment {
    data: {
        subject_id: number;
        srs_stage: number;
        available_at: string | null;
        passed_at: string | null;
        burned_at: string | null;
    };
}

const SRS_NAMES = [
    'lesson',
    'apprentice',
    'apprentice',
    'apprentice',
    'apprentice',
    'guru',
    'guru',
    'master',
    'enlightened',
    'burned',
] as const;

type SrsName = (typeof SRS_NAMES)[number];

function srsStageToName(stage: number): SrsName {
    return SRS_NAMES[Math.min(stage, 9)] ?? 'lesson';
}

function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

async function* loadAllPages(initialUrl: string, token: string) {
    let url = initialUrl;
    while (url) {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Could not load subjects.');
        }

        const data = await response.json();
        yield data;

        url = data.pages.next_url;
    }
}

async function fetchSubjectsFromAPI(token: string): Promise<Subject[]> {
    const assignments: Assignment[] = [];
    for await (const data of loadAllPages(
        'https://api.wanikani.com/v2/assignments?subject_types=vocabulary&started=true',
        token,
    )) {
        assignments.push(...data.data);
    }

    const subjectIds = assignments.map((assignment) => assignment.data.subject_id);
    const subjects: Subject[] = [];

    const batches = chunkArray(subjectIds, 80);
    for (const batch of batches) {
        for await (const data of loadAllPages(
            `https://api.wanikani.com/v2/subjects?ids=${batch.join(',')}`,
            token,
        )) {
            subjects.push(...data.data);
        }
    }

    const subjectsWithAssignments = subjects.map((subject) => {
        const assignment = assignments.find((a) => a.data.subject_id === subject.id);
        return {
            ...subject,
            assignment: assignment?.data || null,
        };
    });

    return subjectsWithAssignments;
}

export async function getSubjects(forceReload = false): Promise<Subject[]> {
    const token = process.env.WANIKANI_API_KEY;
    if (!token) {
        throw new Error('WANIKANI_API_KEY environment variable is not set');
    }

    if (!forceReload) {
        const cached = getCached<Subject[]>(CACHE_KEY);
        if (cached) return cached;
    }

    const subjects = await fetchSubjectsFromAPI(token);
    setCache(CACHE_KEY, subjects);
    return subjects;
}

export async function getUserLevel(): Promise<number> {
    const token = process.env.WANIKANI_API_KEY;
    if (!token) throw new Error('WANIKANI_API_KEY not set');

    const cached = getCached<number>('wanikani_level');
    if (cached !== null) return cached;

    const response = await fetch('https://api.wanikani.com/v2/user', {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch WaniKani user');

    const data = await response.json();
    const level = data.data.level;
    setCache('wanikani_level', level);
    return level;
}

export interface WanikaniKanji {
    char: string;
    reading: string;
    meaning: string;
    srs: SrsName;
}

export async function getKanji(forceReload = false): Promise<WanikaniKanji[]> {
    const token = process.env.WANIKANI_API_KEY;
    if (!token) throw new Error('WANIKANI_API_KEY not set');

    const cacheKey = 'wanikani_kanji';
    if (!forceReload) {
        const cached = getCached<WanikaniKanji[]>(cacheKey);
        if (cached) return cached;
    }

    // Fetch kanji assignments
    const assignments: Assignment[] = [];
    for await (const data of loadAllPages(
        'https://api.wanikani.com/v2/assignments?subject_types=kanji&started=true',
        token,
    )) {
        assignments.push(...data.data);
    }

    // Fetch kanji subjects
    const subjectIds = assignments.map((a) => a.data.subject_id);
    interface KanjiSubject {
        id: number;
        data: {
            characters: string;
            readings: Array<{ reading: string; primary: boolean }>;
            meanings: Array<{ meaning: string; primary: boolean }>;
        };
    }
    const subjects: KanjiSubject[] = [];
    const batches = chunkArray(subjectIds, 80);
    for (const batch of batches) {
        for await (const data of loadAllPages(
            `https://api.wanikani.com/v2/subjects?ids=${batch.join(',')}`,
            token,
        )) {
            subjects.push(...data.data);
        }
    }

    const kanji: WanikaniKanji[] = subjects.map((subject) => {
        const assignment = assignments.find((a) => a.data.subject_id === subject.id);
        const srsStage = assignment?.data.srs_stage ?? 0;
        return {
            char: subject.data.characters,
            reading: subject.data.readings.find((r) => r.primary)?.reading ?? '',
            meaning: subject.data.meanings.find((m) => m.primary)?.meaning ?? '',
            srs: srsStageToName(srsStage),
        };
    });

    setCache(cacheKey, kanji);
    return kanji;
}

export function formatVocabulary(subjects: Subject[]): string[] {
    return subjects.map((subject) => subject.data.characters);
}
