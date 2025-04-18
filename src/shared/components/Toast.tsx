import classNames from 'classnames';
import '../styles/animations.css';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
}

export default function Toast({ message, type }: ToastProps) {
    return (
        <div className="fixed inset-x-0 bottom-4 flex justify-center z-50">
            <div
                className={classNames(
                    'px-6 py-3 rounded-lg shadow-lg text-white font-medium',
                    'fade-in-up',
                    type === 'success' ? 'bg-green-600' : 'bg-red-600',
                )}
            >
                {message}
            </div>
        </div>
    );
}
