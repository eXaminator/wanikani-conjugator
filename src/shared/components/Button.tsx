import classNames from 'classnames';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    primary?: boolean;
}

export default function Button({ primary = false, ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className={classNames([
                'rounded-md border border-transparent px-4 cursor-pointer font-medium shadow-sm',
                'text-base sm:text-lg',
                'focus:outline-none focus:ring-2 focus:ring-opacity-50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors duration-200',
                primary
                    ? 'bg-amber-700 text-stone-100 hover:bg-amber-600 hover:border-amber-500 focus:ring-amber-500'
                    : 'bg-stone-600 text-stone-100 hover:bg-stone-500 hover:border-stone-400 focus:ring-amber-500',
                props.className,
            ])}
        >
            {props.children}
        </button>
    );
}
