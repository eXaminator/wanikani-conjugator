import usePersistedState from '@shared/hooks/usePersistedState';
import { useCallback } from 'react';

export default function useStreak() {
    const [current, setCurrent] = usePersistedState('currentStreak', 0);
    const [max, setMax] = usePersistedState('maxStreak', 0);

    const increase = useCallback(() => {
        setCurrent(current + 1);
        setMax(Math.max(max, current + 1));
    }, [setCurrent, setMax, current, max]);
    const reset = useCallback(() => setCurrent(0), [setCurrent]);

    return { current, max, increase, reset };
}
