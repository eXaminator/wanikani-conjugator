import type { Subject } from "@/shared/types/types";
import { useMemo } from "react";
import { useRouteLoaderData } from "react-router";

type Options = {
    amount?: number,
    filter?: (subject: Subject) => boolean
};

export default function useRandomSubjects({ amount, filter }: Options = {}) {
    const allSubjects = useRouteLoaderData('root') as Subject[];

    // biome-ignore lint/correctness/useExhaustiveDependencies: Ignore filter function
    return useMemo(() => {
        let subjects = allSubjects;

        if (filter) subjects = subjects.filter(filter);
        subjects.sort(() => Math.random() - 0.5);
        if (amount) subjects = subjects.slice(0, amount);

        return subjects;
    }, [amount, allSubjects]);
}
