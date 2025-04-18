import classNames from 'classnames';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className, ...props }, ref) => {
    return (
        <label className="flex items-center gap-2">
            {label && <span className="text-sm text-stone-200 text-nowrap">{label}</span>}
            <input
                ref={ref}
                className={classNames(
                    'rounded border border-stone-500 px-3 py-1.5 text-sm text-stone-50 bg-stone-80 block w-full',
                    'placeholder:text-stone-400',
                    'focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500',
                    'hover:border-stone-400 transition-colors duration-200',
                    className,
                )}
                {...props}
            />
        </label>
    );
});

Input.displayName = 'Input';

export default Input;
