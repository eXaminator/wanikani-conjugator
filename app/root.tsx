import { Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigation } from 'react-router';
import { ToastProvider } from '~/components/ToastContext';
import NavLink from '~/components/NavLink';
import './app.css';

export function HydrateFallback() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-600 border-t-amber-500" />
            <p className="text-stone-400">Lade Vokabeln...</p>
        </div>
    );
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Vokabeltrainer</title>
                <Meta />
                <Links />
            </head>
            <body className="bg-stone-800 text-stone-300">
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function Root() {
    const navigation = useNavigation();
    const isLoading = navigation.state === 'loading';

    return (
        <ToastProvider>
            {isLoading && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-amber-500 animate-pulse z-50" />
            )}
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
        </ToastProvider>
    );
}
