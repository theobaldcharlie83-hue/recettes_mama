import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import { Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="min-h-screen bg-[#fdfbf7] dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans pb-24 relative overflow-hidden transition-colors">
            <Header />
            <main className="max-w-md mx-auto p-4">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}
