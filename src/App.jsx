import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import RecipePage from './pages/RecipePage';
import AddRecipePage from './pages/AddRecipePage';
import TrashPage from './pages/TrashPage';
import ShoppingListPage from './pages/ShoppingListPage';
import SettingsPage from './pages/SettingsPage';

// --- COMPOSANT SPLASH SCREEN ---
const SplashScreen = ({ onSkip }) => (
    <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[200] bg-[#fdfbf7] flex flex-col justify-center items-center p-8 cursor-pointer"
        onClick={onSkip}
    >
        <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full max-w-sm flex flex-col items-center justify-center gap-6"
        >
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
        </motion.div>

        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute bottom-10 text-xs text-gray-400 font-medium tracking-wide"
        >
            Toucher pour continuer
        </motion.p>
    </motion.div>
);

export default function App() {
    const [showSplash, setShowSplash] = useState(true);

    // Splash Timer
    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <AnimatePresence>
                {showSplash && <SplashScreen onSkip={() => setShowSplash(false)} />}
            </AnimatePresence>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="favorites" element={<FavoritesPage />} />
                    <Route path="recipe/:id" element={<RecipePage />} />
                    <Route path="add" element={<AddRecipePage />} />
                    <Route path="edit/:id" element={<AddRecipePage />} />
                    <Route path="trash" element={<TrashPage />} />
                    <Route path="shopping-list" element={<ShoppingListPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Routes>
            <div className="fixed bottom-1 right-2 text-[7px] text-gray-400/60 dark:text-gray-500/60 z-[100] pointer-events-none font-mono drop-shadow-sm">
                v1.3
            </div>
        </>
    );
}
