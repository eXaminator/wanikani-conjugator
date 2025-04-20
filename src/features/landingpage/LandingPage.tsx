import Input from "@/shared/components/Input";
import usePersistedState from "@/shared/hooks/usePersistedState";
import { useCallback, type ChangeEvent } from "react";
import { useRevalidator } from "react-router";

export default function LandingPage() {
    const [apiKey, setApiKey] = usePersistedState('apiKey', '');
    const revalidator = useRevalidator();

    const handleApiKeyUpdate = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setApiKey(event.target.value);
        revalidator.revalidate();
    }, [revalidator, setApiKey]);

    return (
        <Input label="Wanikani API-Key" value={apiKey} onChange={handleApiKeyUpdate} className="w-xs" />
    );
}
