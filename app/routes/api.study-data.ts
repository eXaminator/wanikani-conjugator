import type { Route } from './+types/api.study-data';
import { getUserLevel, getSubjects, formatVocabulary } from '~/lib/wanikani.server';
import { getBunproData } from '~/lib/bunpro.server';

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const forceReload = url.searchParams.get('forceReload') === 'true';

    const [level, subjects, bunpro] = await Promise.all([
        getUserLevel(),
        getSubjects(forceReload),
        getBunproData(forceReload),
    ]);

    return Response.json({
        wanikani: {
            level,
            vocabulary: formatVocabulary(subjects),
        },
        bunpro,
    });
}
