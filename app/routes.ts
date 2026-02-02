import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/_index.tsx'),
    route('list', 'routes/list.tsx'),
    route('homophones', 'routes/homophones.tsx'),
    route('meaning-groups', 'routes/meaning-groups.tsx'),
    route('verb-conjugation', 'routes/verb-conjugation.tsx'),
    route('quiz', 'routes/quiz.tsx'),
    route('listening', 'routes/listening.tsx'),
    route('api/subjects', 'routes/api.subjects.ts'),
    route('api/study-data', 'routes/api.study-data.ts'),
] satisfies RouteConfig;
