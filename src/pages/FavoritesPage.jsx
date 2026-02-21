import React, { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import { Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FavoritesPage() {
    const { recipes, favorites, loading } = useContext(AppContext);
    const navigate = useNavigate();

    const favoriteRecipes = useMemo(() => {
        return recipes.filter(r => favorites.includes(r.id));
    }, [recipes, favorites]);

    if (loading) return null; // Avoid flicker

    return (
        <div className="animate-fade-in pt-4">
            <h2 className="font-serif text-2xl font-bold text-orange-900 dark:text-orange-50 mb-6 flex items-center gap-3">
                <Heart className="text-red-500 fill-red-500" size={24} />
                Mes coups de cœur
            </h2>

            {favoriteRecipes.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-orange-50 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="text-gray-300 dark:text-gray-600" size={32} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">Aucun favori pour le moment</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 max-w-[200px] mx-auto leading-relaxed">
                        Appuyez sur le cœur d'une recette pour la retrouver facilement ici.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 justify-center mx-auto bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-6 py-2 rounded-full font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                    >
                        <Search size={16} /> Parcourir les recettes
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 pb-4">
                    {favoriteRecipes.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
}
