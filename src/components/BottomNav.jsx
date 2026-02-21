import React from 'react';
import { Home, Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        { path: '/', label: 'Accueil', icon: Home },
        { path: '/favorites', label: 'Coups de cœur', icon: Heart }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] z-40 transition-colors">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {tabs.map(tab => {
                    const active = location.pathname === tab.path;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${active
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-orange-300 dark:hover:text-gray-400'
                                }`}
                        >
                            <Icon size={24} className={active ? 'fill-orange-100 dark:fill-orange-900/30' : ''} />
                            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
