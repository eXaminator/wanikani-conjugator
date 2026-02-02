import type { Route } from './+types/_index';
import { getSubjects } from '~/lib/wanikani.server';
import HomeContent from '~/features/home/HomeContent';

export async function loader({}: Route.LoaderArgs) {
    try {
        const subjects = await getSubjects();
        return { subjects, error: null };
    } catch (error) {
        console.error('Error loading subjects:', error);
        return { subjects: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export default function Index({ loaderData }: Route.ComponentProps) {
    return <HomeContent subjects={loaderData.subjects} initialError={loaderData.error} />;
}
