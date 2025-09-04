import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { NavLink as Link } from 'react-router';

export default function NavLink(props: ComponentProps<typeof Link>) {
    return (
        <Link
            {...props}
            className={({ isActive }) => classNames([
                'text-blue-500 hover:text-blue-400 transition-colors duration-200',
                'px-2 py-1 rounded text-sm sm:text-base',
                'whitespace-nowrap',
                isActive ? 'font-bold bg-blue-100 text-blue-700' : ''
            ])}
        />
    );
}
