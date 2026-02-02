import type { Route } from './+types/api.subjects';
import { getSubjects } from '~/lib/wanikani.server';
import { invalidateCache } from '~/lib/cache.server';

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const forceReload = url.searchParams.get('forceReload') === 'true';

    if (forceReload) {
        invalidateCache('wanikani_subjects');
    }

    try {
        const subjects = await getSubjects(forceReload);
        return Response.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return Response.json({ error: 'Failed to fetch subjects' }, { status: 500 });
    }
}
