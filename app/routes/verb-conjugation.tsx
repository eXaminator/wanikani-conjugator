import type { Route } from './+types/verb-conjugation';
import { getSubjects } from '~/lib/wanikani.server';
import VerbConjugator from '~/features/verb-conjugation/VerbConjugator';

export async function loader({}: Route.LoaderArgs) {
    const subjects = await getSubjects();
    return { subjects };
}

export default function VerbConjugation({ loaderData }: Route.ComponentProps) {
    return <VerbConjugator subjects={loaderData.subjects} />;
}
