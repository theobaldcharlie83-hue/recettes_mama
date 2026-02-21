import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, XCircle, BookOpen, Utensils, Carrot, Drumstick, Cookie, Coffee, Droplet, Martini, ChefHat, ArrowLeft } from 'lucide-react';
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

const normalizeString = (str) => {
    if (!str) return "";
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
};

export default function HomePage() {
    const { recipes, loading } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeChapter, setActiveChapter] = useState("Tous");

    const filteredRecipes = useMemo(() => {
        const normalizedSearch = normalizeString(searchTerm);
        return recipes.filter(r => {
            const matchesSearch = normalizeString(r.title).includes(normalizedSearch);
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

            {/* BACK TO SUMMARY BUTTON */}
            {(activeChapter !== 'Tous' || searchTerm) && (
                <div className="mb-6 flex flex-col gap-3">
                    <button
                        onClick={() => {
                            setActiveChapter("Tous");
                            setSearchTerm("");
                        }}
                        className="flex items-center justify-center gap-2 text-white bg-orange-600 dark:bg-orange-500 font-bold text-xs py-2 px-4 rounded-lg hover:bg-orange-700 transition-all active:scale-95 shadow-sm w-fit mx-auto"
                    >
                        <ArrowLeft size={14} />
                        Retour au sommaire
                    </button>
                    {activeChapter !== 'Tous' && (
                        <div className="text-center">
                            <span className="text-xs font-serif italic text-gray-500 dark:text-gray-400">
                                Catégorie : <span className="text-orange-900 dark:text-orange-50 font-bold not-italic">{activeChapter}</span>
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* RECIPE LIST */}
            {(activeChapter !== 'Tous' || searchTerm) && (
                <div className="grid gap-4 pb-4">
                    {filteredRecipes.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-orange-50 dark:border-gray-800 animate-fade-in px-6">
                            <div className="w-16 h-16 bg-orange-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-orange-300 dark:text-gray-600" size={32} />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">Aucune recette trouvée</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed max-w-[220px] mx-auto">
                                Nous n'avons rien trouvé pour "<span className="text-orange-600 dark:text-orange-400 font-bold">{searchTerm}</span>".
                            </p>
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
