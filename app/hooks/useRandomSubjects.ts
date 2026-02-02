import { useMemo } from 'react';
import type { Subject } from '~/lib/types';

type Options = {
    amount?: number;
    filter?: (subject: Subject) => boolean;
};

export default function useRandomSubjects(allSubjects: Subject[], { amount, filter }: Options = {}) {
    // biome-ignore lint/correctness/useExhaustiveDependencies: Ignore filter function
    return useMemo(() => {
        let subjects = [...allSubjects];

        if (filter) subjects = subjects.filter(filter);
        subjects.sort(() => Math.random() - 0.5);
        if (amount) subjects = subjects.slice(0, amount);

        return subjects;
    }, [amount, allSubjects]);
}
