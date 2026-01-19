import Input from "@/shared/components/Input";
import usePersistedState from "@/shared/hooks/usePersistedState";
import { invalidateCache } from "@/shared/utils/subjectCache";
import { useCallback, type ChangeEvent } from "react";
import { useRevalidator } from "react-router";

export default function LandingPage() {
    const [apiKey, setApiKey] = usePersistedState('apiKey', '');
    const revalidator = useRevalidator();

    const handleApiKeyUpdate = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setApiKey(event.target.value);
        revalidator.revalidate();
    }, [revalidator, setApiKey]);

    const handleForceReload = useCallback(() => {
        invalidateCache();
        revalidator.revalidate();
    }, [revalidator]);

    return (
        <div className="flex items-center gap-2">
            <Input label="Wanikani API-Key" value={apiKey} onChange={handleApiKeyUpdate} className="w-xs" />
            <button
                type="button"
                onClick={handleForceReload}
                disabled={revalidator.state === 'loading'}
                className="px-3 py-1.5 text-sm rounded border border-stone-500 text-stone-200 hover:border-stone-400 hover:bg-stone-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {revalidator.state === 'loading' ? 'Lädt...' : 'Neu laden'}
            </button>
        </div>
    );
}
