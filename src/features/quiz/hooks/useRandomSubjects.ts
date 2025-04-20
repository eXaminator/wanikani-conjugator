import type { Subject } from "@/shared/types/types";
import { useMemo } from "react";
import { useRouteLoaderData } from "react-router";

export default function useRandomSubjects(amount: number, filter?: (subject: Subject) => boolean) {
    const allSubjects = useRouteLoaderData('root') as Subject[];

    // biome-ignore lint/correctness/useExhaustiveDependencies: Ignore filter function
    return useMemo(() => {
        const filteredSubjects = allSubjects.filter(filter ?? (() => true));

        return [...filteredSubjects].sort(() => Math.random() - 0.5).slice(0, amount)
    }, [amount, allSubjects]);
}
