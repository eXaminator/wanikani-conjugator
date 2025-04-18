import NavLink from '@shared/components/NavLink';
import { Outlet } from 'react-router';

export default function RootRoute() {
    return (
        <div className="flex flex-col items-center gap-4 m-4">
            <h1 className="text-4xl">Vokabeltrainer</h1>
            <div>
                <nav>
                    <ul className="flex gap-2">
                        <li>
                            <NavLink to="/">Home</NavLink>
                        </li>
                        <li>
                            <NavLink to="/list">Vokabelliste</NavLink>
                        </li>
                        <li>
                            <NavLink to="/verb-conjugation">Verb-Conjugation</NavLink>
                        </li>
                        <li>
                            <NavLink to="/quiz">Quiz</NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
            <Outlet />
        </div>
    );
}
