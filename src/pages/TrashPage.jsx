import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Trash2, RotateCcw, ArrowLeft, Utensils, Search, XCircle } from 'lucide-react';

export default function TrashPage() {
    const { trashedRecipes, restoreFromTrash, emptyTrash } = useContext(AppContext);
    const navigate = useNavigate();

    const handleEmptyTrash = () => {
        if (window.confirm("Vider la corbeille ? Les recettes personnelles seront supprimées définitivement.")) {
            emptyTrash();
        }
    };

    return (
        <div className="animate-fade-in pb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="font-serif text-2xl font-bold text-orange-900 dark:text-orange-50 flex items-center gap-2">
                        <Trash2 className="text-orange-600" size={24} /> Corbeille
                    </h1>
                </div>
                {trashedRecipes.length > 0 && (
                    <button
                        onClick={handleEmptyTrash}
                        className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl border border-red-100 dark:border-red-900/30 transition-all active:scale-95"
                    >
                        Vider la corbeille
                    </button>
                )}
            </div>

            {trashedRecipes.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-dashed border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="text-gray-300 dark:text-gray-600" size={32} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">La corbeille est vide</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {trashedRecipes.map(recipe => (
                        <div
                            key={recipe.id}
                            className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-orange-100 dark:border-gray-800 flex items-center justify-between gap-4"
                        >
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 block mb-1">
                                    {recipe.chapter}
                                </span>
                                <h3 className="font-serif font-bold text-gray-800 dark:text-gray-100 truncate">
                                    {recipe.title}
                                </h3>
                                {recipe.isCustom && (
                                    <span className="text-[9px] text-gray-400 italic">Recette personnelle</span>
                                )}
                            </div>

                            <button
                                onClick={() => restoreFromTrash(recipe.id)}
                                className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all active:scale-90"
                                title="Restaurer"
                            >
                                <RotateCcw size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
