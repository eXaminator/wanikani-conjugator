import type { Route } from './+types/list';
import { getSubjects } from '~/lib/wanikani.server';
import VocabListPage from '~/features/vocabulary/VocabListPage';

export async function loader({}: Route.LoaderArgs) {
    const subjects = await getSubjects();
    return { subjects };
}

export default function List({ loaderData }: Route.ComponentProps) {
    return <VocabListPage subjects={loaderData.subjects} />;
}
