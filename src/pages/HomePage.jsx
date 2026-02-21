import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, XCircle, BookOpen, Utensils, Carrot, Drumstick, Cookie, Coffee, Droplet, Martini, ChefHat } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';

const CHAPTERS = [
    "Bases & Sauces",
    "Apéritifs & Entrées",
    "Accompagnements & Légumes",
    "Plats de Résistance",
    "Desserts & Goûters",
    "Autre"
];

const getIcon = (chapter) => {
    if (chapter.includes('Sauces')) return <Droplet size={24} />;
    if (chapter.includes('Entrées')) return <Martini size={24} />;
    if (chapter.includes('Légumes')) return <Carrot size={24} />;
    if (chapter.includes('Plats')) return <Drumstick size={24} />;
    if (chapter.includes('Desserts')) return <Cookie size={24} />;
    return <ChefHat size={24} />;
};

export default function HomePage() {
    const { recipes, loading } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeChapter, setActiveChapter] = useState("Tous");

    const filteredRecipes = useMemo(() => {
        return recipes.filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.ingredients.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesChapter = activeChapter === "Tous" || r.chapter === activeChapter;
            return matchesSearch && matchesChapter;
        });
    }, [recipes, searchTerm, activeChapter]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center mt-32 text-orange-800 dark:text-orange-200">
                <Utensils className="animate-spin mb-4" size={48} />
                <p className="font-serif italic text-gray-500 dark:text-gray-400">Mise en place de la cuisine...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* SEARCH BAR */}
            <div className="mb-6 sticky top-16 z-30 pt-2 pb-2 bg-[#fdfbf7] dark:bg-gray-950">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une recette (ex: poulet, farine)..."
                        className="w-full bg-white dark:bg-gray-900 border border-orange-200 dark:border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-gray-200 shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* SOMMAIRE / CHAPTERS */}
            {activeChapter === 'Tous' && !searchTerm && (
                <div className="mb-8">
                    <h2 className="font-serif text-xl font-bold text-orange-900 dark:text-orange-50 mb-4 flex items-center gap-2">
                        <BookOpen size={20} className="text-orange-600 dark:text-orange-500" /> Sommaire
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {CHAPTERS.map(chapter => (
                            <button
                                key={chapter}
                                onClick={() => setActiveChapter(chapter)}
                                className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-orange-100 dark:border-gray-800 flex flex-col items-center text-center gap-2 hover:bg-orange-50 dark:hover:bg-gray-800 transition-all active:scale-95 group"
                            >
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {getIcon(chapter)}
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-tight">{chapter}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIVE FILTER BADGE */}
            {activeChapter !== 'Tous' && (
                <div className="mb-4 flex items-center gap-2">
                    <button
                        onClick={() => setActiveChapter("Tous")}
                        className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        <XCircle size={16} />
                    </button>
                    <span className="font-bold text-orange-800 dark:text-orange-200">{activeChapter}</span>
                </div>
            )}

            {/* RECIPE LIST */}
            {(activeChapter !== 'Tous' || searchTerm) && (
                <div className="grid gap-4 pb-4">
                    {filteredRecipes.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400 italic bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p>Aucune recette trouvée pour "{searchTerm}".</p>
                        </div>
                    ) : (
                        filteredRecipes.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
