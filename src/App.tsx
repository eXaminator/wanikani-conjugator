import QuizPage from '@features/quiz/components/QuizPage';
import VerbConjugator from '@features/verb-conjugation/components/VerbConjugator';
import VocabListPage from '@features/vocabulary/components/VocabListPage';
import HomophonePage from '@features/homophones/components/HomophonePage';
import MeaningGroupsPage from '@features/meaning-groups/components/MeaningGroupsPage';
import { ToastProvider } from '@shared/components/ToastContext';
import type { Subject } from '@shared/types/types';
import { RouterProvider, createBrowserRouter } from 'react-router';
import RootRoute from './RootRoute';
import LandingPage from './features/landingpage/LandingPage';
import ListeningPage from './features/listening/components/ListeningPage';

interface Assignment {
    data: {
        subject_id: number;
        srs_stage: number;
        available_at: string | null;
        passed_at: string | null;
        burned_at: string | null;
    };
}

function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
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
    const assignments: Assignment[] = [];
    for await (const data of loadAllPages(
        'https://api.wanikani.com/v2/assignments?subject_types=vocabulary&started=true',
        token,
    )) {
        assignments.push(...data.data);
    }

    const subjectIds = assignments.map((assignment) => assignment.data.subject_id);
    const subjects: Subject[] = [];

    // Batch subject IDs to avoid URL length limits
    const batches = chunkArray(subjectIds, 100);
    for (const batch of batches) {
        for await (const data of loadAllPages(
            `https://api.wanikani.com/v2/subjects?ids=${batch.join(',')}`,
            token,
        )) {
            subjects.push(...data.data);
        }
    }

    // Füge Assignment-Daten zu den Subjects hinzu
    const subjectsWithAssignments = subjects.map((subject) => {
        const assignment = assignments.find((a) => a.data.subject_id === subject.id);
        return {
            ...subject,
            assignment: assignment?.data || null,
        };
    });

    return subjectsWithAssignments;
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
                path: 'homophones',
                element: <HomophonePage />,
            },
            {
                path: 'meaning-groups',
                element: <MeaningGroupsPage />,
            },
            {
                path: 'verb-conjugation',
                element: <VerbConjugator />,
            },
            {
                path: 'quiz',
                element: <QuizPage />,
            },
            {
                path: 'listening',
                element: <ListeningPage />,
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
