import { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
}

export default function Tooltip({ content, children, className = '' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className={className}
            >
                {children}
            </div>
            {isVisible && (
                <div className="absolute z-50 px-3 py-2 text-sm text-stone-100 bg-stone-900 border border-stone-600 rounded-lg shadow-lg max-w-xs break-words">
                    {content}
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-stone-900 border-l border-t border-stone-600 transform rotate-45" />
                </div>
            )}
        </div>
    );
}
