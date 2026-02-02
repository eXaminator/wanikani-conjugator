import { useCallback, useState } from 'react';
import { useRevalidator } from 'react-router';
import type { Subject } from '~/lib/types';

interface Props {
    subjects: Subject[];
    initialError: string | null;
}

export default function HomeContent({ subjects, initialError }: Props) {
    const [error, setError] = useState<string | null>(initialError);
    const revalidator = useRevalidator();

    const handleForceReload = useCallback(async () => {
        setError(null);
        try {
            await fetch('/api/subjects?forceReload=true');
            revalidator.revalidate();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        }
    }, [revalidator]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleForceReload}
                    disabled={revalidator.state === 'loading'}
                    className="px-3 py-1.5 text-sm rounded border border-stone-500 text-stone-200 hover:border-stone-400 hover:bg-stone-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {revalidator.state === 'loading' ? 'Lädt...' : 'Neu laden'}
                </button>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <p className="text-stone-400">{subjects.length} Vokabeln geladen</p>
        </div>
    );
}
