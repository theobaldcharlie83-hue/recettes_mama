import React, { useContext } from 'react';
import { ChefHat, ArrowLeft, Sun, Moon, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(AppContext);

    // Determine if we are on the home page (or a main tab) to show Title vs Back button
    const isHome = location.pathname === '/' || location.pathname === '/favorites';

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-orange-100 dark:border-gray-800 sticky top-0 z-40 transition-colors">
            <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                {isHome ? (
                    <div className="flex items-center gap-2">
                        <ChefHat className="text-orange-600 dark:text-orange-500" />
                        <h1 className="font-serif font-bold text-lg text-orange-900 dark:text-orange-50 leading-tight">
                            Les recettes de Mama MATTIO
                        </h1>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-orange-800 dark:text-orange-200 font-medium active:scale-95 transition-transform"
                    >
                        <ArrowLeft size={20} /> Retour
                    </button>
                )}

                <div className="flex items-center gap-2">
                    {/* Trash Button */}
                    <button
                        onClick={() => navigate('/trash')}
                        className="p-2 rounded-full bg-orange-50 dark:bg-gray-800 text-orange-600 dark:text-orange-400 active:scale-95 transition-all"
                        aria-label="View Trash"
                    >
                        <Trash2 size={20} />
                    </button>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-orange-50 dark:bg-gray-800 text-orange-600 dark:text-orange-400 active:scale-95 transition-all"
                        aria-label="Toggle Dark Mode"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>
        </header>
    );
}
