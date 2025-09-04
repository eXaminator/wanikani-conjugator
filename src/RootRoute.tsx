import NavLink from '@shared/components/NavLink';
import { Outlet } from 'react-router';

export default function RootRoute() {
    return (
        <div className="flex flex-col items-center gap-4 m-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl text-center">Vokabeltrainer</h1>
            <div className="w-full max-w-6xl">
                <nav>
                    <ul className="flex flex-wrap justify-center gap-1 sm:gap-2">
                        <li>
                            <NavLink to="/">Home</NavLink>
                        </li>
                        <li>
                            <NavLink to="/list">Vokabelliste</NavLink>
                        </li>
                        <li>
                            <NavLink to="/homophones">Homophone</NavLink>
                        </li>
                        <li>
                            <NavLink to="/meaning-groups">Bedeutungsgruppen</NavLink>
                        </li>
                        <li>
                            <NavLink to="/verb-conjugation">Verb-Conjugation</NavLink>
                        </li>
                        <li>
                            <NavLink to="/quiz">Quiz</NavLink>
                        </li>
                        <li>
                            <NavLink to="/listening">Listening</NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
            <Outlet />
        </div>
    );
}
