import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { NavLink as Link } from 'react-router';

export default function NavLink(props: ComponentProps<typeof Link>) {
    return <Link {...props} className={({ isActive }) => classNames(['text-blue-500', isActive ? 'font-bold' : ''])} />;
}
