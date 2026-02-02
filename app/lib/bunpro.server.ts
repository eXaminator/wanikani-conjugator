import { getCached, setCache } from '~/lib/cache.server';

const BUNPRO_CACHE_KEY = 'bunpro_data';
const BUNPRO_URL = 'https://api.bunpro.jp/api/frontend/share_data/eXaminator/learned_content';

interface BunproRawItem {
    data: {
        attributes: {
            streak: number;
            accuracy: number | null;
            reviewable_type: 'GrammarPoint' | 'Vocab';
        };
    };
    reviewable: {
        data: {
            attributes: {
                title: string;
                meaning: string;
                level: string;
                type_snake: 'grammar_point' | 'vocab';
            };
        };
    };
}

export interface BunproGrammar {
    title: string;
    meaning: string;
}

export interface BunproData {
    grammar: BunproGrammar[];
}

export async function getBunproData(forceReload = false): Promise<BunproData> {
    if (!forceReload) {
        const cached = getCached<BunproData>(BUNPRO_CACHE_KEY);
        if (cached) return cached;
    }

    const response = await fetch(BUNPRO_URL);
    if (!response.ok) {
        throw new Error('Failed to fetch Bunpro data');
    }

    const raw: BunproRawItem[] = await response.json();

    const grammar: BunproGrammar[] = [];

    for (const item of raw) {
        const { type_snake } = item.reviewable.data.attributes;
        if (type_snake !== 'grammar_point') continue;

        const { title, meaning } = item.reviewable.data.attributes;
        grammar.push({ title, meaning });
    }

    const data = { grammar };
    setCache(BUNPRO_CACHE_KEY, data);
    return data;
}
