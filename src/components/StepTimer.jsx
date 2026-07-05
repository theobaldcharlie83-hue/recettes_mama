import React, { useState, useEffect, useRef } from 'react';
import { Timer } from 'lucide-react';

const formatDuration = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

export default function StepTimer({ seconds }) {
    const [remaining, setRemaining] = useState(null);
    const endTimeRef = useRef(null);

    useEffect(() => {
        if (remaining === null) return;
        if (remaining <= 0) {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
            return;
        }
        const interval = setInterval(() => {
            const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
            setRemaining(left);
        }, 250);
        return () => clearInterval(interval);
    }, [remaining !== null]);

    const start = (e) => {
        e.stopPropagation();
        endTimeRef.current = Date.now() + seconds * 1000;
        setRemaining(seconds);
    };

    const isRunning = remaining !== null && remaining > 0;
    const isDone = remaining !== null && remaining <= 0;

    return (
        <button
            onClick={start}
            className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold align-middle transition-colors ${isDone
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 animate-pulse'
                    : isRunning
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-900/30 dark:hover:text-orange-400'
                }`}
            title="Lancer un minuteur pour cette étape"
            aria-label={`Lancer un minuteur de ${formatDuration(seconds)}`}
        >
            <Timer size={11} />
            {isDone ? 'Terminé !' : isRunning ? formatDuration(remaining) : formatDuration(seconds)}
        </button>
    );
}
