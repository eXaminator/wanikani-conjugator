import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';

export default function usePersistedState<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState(() => {
        const item = window.localStorage.getItem(key);
        const value = item ? JSON.parse(item) : defaultValue;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return { ...defaultValue, ...value };
        }
        return value;
    });

    const updateState: Dispatch<SetStateAction<T>> = useCallback((newState) => {
        window.localStorage.setItem(key, JSON.stringify(newState));
        setState(newState);
    }, [key]);

    return [state, updateState];
}
