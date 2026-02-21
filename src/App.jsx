import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import RecipePage from './pages/RecipePage';
import AddRecipePage from './pages/AddRecipePage';
import TrashPage from './pages/TrashPage';

// --- COMPOSANT SPLASH SCREEN ---
const SplashScreen = () => (
    <div className="fixed inset-0 z-[200] bg-[#fdfbf7] flex flex-col justify-center items-center animate-fade-out pointer-events-none p-8">
        <div className="w-full max-w-sm animate-bounce-gentle flex flex-col items-center justify-center gap-6">
            <div className="relative w-8/12 max-w-[200px] aspect-square flex items-center justify-center rounded-3xl p-4 drop-shadow-xl">
                <img
                    src="/logo_transparent.png"
                    alt="Logo des recettes de Mama MATTIO"
                    className="w-full h-auto object-contain drop-shadow-md"
                />
            </div>

            <h1 className="font-serif font-bold text-3xl text-center text-orange-900 tracking-tight leading-snug drop-shadow-sm">
                Les recettes de <br />
                <span className="text-orange-600 text-[2.5rem] mt-1 block">Mama MATTIO</span>
            </h1>
        </div>
    </div>
);

export default function App() {
    const [showSplash, setShowSplash] = useState(true);

    // Splash Timer
    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2000);
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
                    <Route path="add" element={<AddRecipePage />} />
                    <Route path="trash" element={<TrashPage />} />
                </Route>
            </Routes>
            <div className="fixed bottom-1 right-2 text-[10px] text-gray-400/80 dark:text-gray-500/80 z-[100] pointer-events-none font-mono font-bold drop-shadow-sm">
                v1.1
            </div>
        </>
    );
}
