import type { Route } from './+types/meaning-groups';
import { getSubjects } from '~/lib/wanikani.server';
import MeaningGroupsPage from '~/features/meaning-groups/MeaningGroupsPage';

export async function loader({}: Route.LoaderArgs) {
    const subjects = await getSubjects();
    return { subjects };
}

export default function MeaningGroups({ loaderData }: Route.ComponentProps) {
    return <MeaningGroupsPage subjects={loaderData.subjects} />;
}
