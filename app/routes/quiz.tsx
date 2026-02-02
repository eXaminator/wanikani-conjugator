import type { Route } from './+types/quiz';
import { getSubjects } from '~/lib/wanikani.server';
import QuizPage from '~/features/quiz/QuizPage';

export async function loader({}: Route.LoaderArgs) {
    const subjects = await getSubjects();
    return { subjects };
}

export default function Quiz({ loaderData }: Route.ComponentProps) {
    return <QuizPage subjects={loaderData.subjects} />;
}
