import QuizPage from '@features/quiz/components/QuizPage';
import VerbConjugator from '@features/verb-conjugation/components/VerbConjugator';
import VocabListPage from '@features/vocabulary/components/VocabListPage';
import { ToastProvider } from '@shared/components/ToastContext';
import type { Subject } from '@shared/types/types';
import { RouterProvider, createBrowserRouter } from 'react-router';
import RootRoute from './RootRoute';
import LandingPage from './features/landingpage/LandingPage';

interface Assignment {
    data: {
        subject_id: number;
    };
}

async function* loadAllPages(initialUrl: string, token: string) {
    let url = initialUrl;
    while (url) {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Could not load subjects.');
        }

        const data = await response.json();
        yield data;

        url = data.pages.next_url;
    }
}

async function loadAllSubjects(token: string) {
    const subjectIds: number[] = [];
    for await (const data of loadAllPages(
        'https://api.wanikani.com/v2/assignments?subject_types=vocabulary&started=true',
        token,
    )) {
        subjectIds.push(...data.data.map((assignment: Assignment) => assignment.data.subject_id));
    }

    const subjects: Subject[] = [];
    for await (const data of loadAllPages(`https://api.wanikani.com/v2/subjects?ids=${subjectIds.join(',')}`, token)) {
        subjects.push(...data.data);
    }

    return subjects;
}

const router = createBrowserRouter([
    {
        path: '/',
        id: 'root',
        element: <RootRoute />,
        loader: async () => {
            const token = JSON.parse(window.localStorage.getItem('apiKey') ?? '""');
            if (!token) return [];
            try {
                return await loadAllSubjects(token);
            } catch {
                return [];
            }
        },
        children: [
            {
                index: true,
                element: <LandingPage />,
            },
            {
                path: 'list',
                element: <VocabListPage />,
            },
            {
                path: 'verb-conjugation',
                element: <VerbConjugator />,
            },
            {
                path: 'quiz',
                element: <QuizPage />,
            },
        ],
    },
]);

function App() {
    return (
        <ToastProvider>
            <RouterProvider router={router} />
        </ToastProvider>
    );
}

export default App;
