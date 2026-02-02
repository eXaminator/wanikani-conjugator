import type { Route } from './+types/listening';
import { getSubjects } from '~/lib/wanikani.server';
import ListeningPage from '~/features/listening/ListeningPage';

export async function loader({}: Route.LoaderArgs) {
    const subjects = await getSubjects();
    return { subjects };
}

export default function Listening({ loaderData }: Route.ComponentProps) {
    return <ListeningPage subjects={loaderData.subjects} />;
}
