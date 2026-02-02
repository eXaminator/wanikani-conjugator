import type { Route } from './+types/homophones';
import { getSubjects } from '~/lib/wanikani.server';
import HomophonePage from '~/features/homophones/HomophonePage';

export async function loader({}: Route.LoaderArgs) {
    const subjects = await getSubjects();
    return { subjects };
}

export default function Homophones({ loaderData }: Route.ComponentProps) {
    return <HomophonePage subjects={loaderData.subjects} />;
}
