import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, XCircle, BookOpen, Utensils, Carrot, Drumstick, Cookie, Coffee, Droplet, Martini, ChefHat } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const getCategoryIcon = (chapter, size = 48) => {
    if (!chapter) return <ChefHat size={size} />;
    if (chapter.includes('Sauces')) return <Droplet size={size} />;
    if (chapter.includes('Entrées')) return <Martini size={size} />;
    if (chapter.includes('Légumes')) return <Carrot size={size} />;
    if (chapter.includes('Plats')) return <Drumstick size={size} />;
    if (chapter.includes('Desserts')) return <Cookie size={size} />;
    return <ChefHat size={size} />;
};

export default function RecipeCard({ recipe }) {
    const navigate = useNavigate();
    const { favorites, toggleFavorite } = useContext(AppContext);

    const isFavorite = favorites.includes(recipe.id);

    const handleFavoriteClick = (e) => {
        e.stopPropagation(); // Évite de naviguer quand on clique sur le cœur
        toggleFavorite(recipe.id);
    };

    return (
        <div
            onClick={() => navigate(`/recipe/${recipe.id}`)}
            className="relative rounded-xl shadow-sm border p-4 flex flex-col active:scale-95 transition-all cursor-pointer bg-white dark:bg-gray-900 border-orange-50 dark:border-gray-800 hover:shadow-md dark:hover:border-gray-700 group"
        >
            <button
                onClick={handleFavoriteClick}
                className="absolute top-3 right-3 p-2 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors z-10"
                aria-label="Toggle favorite"
            >
                <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
            </button>

            {recipe.image && recipe.image !== '/default_recipe.png' ? (
                <div className="w-full h-32 mb-3 rounded-lg overflow-hidden relative shadow-sm">
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
            ) : (
                <div className="w-full h-32 mb-3 rounded-lg overflow-hidden relative bg-orange-50/80 dark:bg-gray-800/80 border border-orange-100 dark:border-gray-700 flex items-center justify-center text-orange-400 dark:text-gray-500 shadow-sm transition-colors group-hover:bg-orange-100/80 dark:group-hover:bg-gray-700/80 group-hover:text-orange-500 dark:group-hover:text-orange-400">
                    <div className="group-hover:scale-110 transition-transform duration-500 opacity-80">
                        {getCategoryIcon(recipe.chapter, 48)}
                    </div>
                </div>
            )}

            <span className="text-[10px] uppercase tracking-widest font-bold mb-1 text-orange-600 dark:text-orange-400 pr-8">
                {recipe.chapter}
            </span>
            <h3 className="font-serif text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight mb-3 flex justify-between pr-8">
                {recipe.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-auto">
                {recipe.tags && recipe.tags.slice(0, 3).map(tag => (
                    <span
                        key={tag}
                        className={`text-[10px] px-2 py-0.5 rounded border ${tag === 'WW'
                            ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                            : tag === 'Thermomix'
                                ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                : 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                            }`}
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* Ajout temporaire pour le design, on pourra ajouter un champ "time" et "difficulty" plus tard */}
            <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] text-gray-500 font-medium bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded-md backdrop-blur shadow-sm">
                {recipe.prepTime && <span>⏱️ {recipe.prepTime}'</span>}
                {recipe.difficulty && <span>🍳 {recipe.difficulty}</span>}
            </div>
        </div>
    );
}
