import type React from 'react';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Toast from './Toast';

type ToastType = 'success' | 'error';

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<{ message: string; type: ToastType; timeout: NodeJS.Timeout, identifier: number } | null>(null);
    const identifier = useRef(0);

    const showToast = useCallback((message: string, type: ToastType) => {
        identifier.current += 1;

        if (toast?.timeout) {
            clearTimeout(toast.timeout);
        }

        // Auto-hide after 2 seconds
        const timeout = setTimeout(() => {
            setToast(null);
        }, 2000);
        setToast({ message, type, timeout, identifier: identifier.current });
    }, [toast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && <Toast key={toast.identifier} message={toast.message} type={toast.type} />}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
