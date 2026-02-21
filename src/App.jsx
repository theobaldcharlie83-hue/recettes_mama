import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import RecipePage from './pages/RecipePage';

// --- COMPOSANT SPLASH SCREEN ---
const SplashScreen = () => (
    <div className="fixed inset-0 z-[200] bg-[#fdfbf7] dark:bg-gray-950 flex justify-center items-center animate-fade-out pointer-events-none p-8">
        <div className="w-full max-w-sm animate-bounce-gentle flex justify-center">
            <img
                src="/logo_transparent.png"
                alt="Les recettes de MaMa MATTIO"
                className="w-10/12 h-auto object-contain drop-shadow-md rounded-[25%]"
            />
        </div>
    </div>
);

export default function App() {
    const [showSplash, setShowSplash] = useState(true);

    // Splash Timer
    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {showSplash && <SplashScreen />}
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="favorites" element={<FavoritesPage />} />
                    <Route path="recipe/:id" element={<RecipePage />} />
                </Route>
            </Routes>
            <div className="fixed bottom-1 right-2 text-[10px] text-gray-400/80 dark:text-gray-500/80 z-[100] pointer-events-none font-mono font-bold drop-shadow-sm">
                v1.1
            </div>
        </>
    );
}
