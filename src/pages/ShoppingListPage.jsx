import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShoppingCart, ArrowLeft, Square, CheckSquare, X, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function ShoppingListPage() {
    const { shoppingList, toggleShoppingItem, removeShoppingItem, clearCheckedShoppingItems, clearShoppingList } = useContext(AppContext);
    const navigate = useNavigate();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const uncheckedItems = shoppingList.filter(i => !i.checked);
    const checkedItems = shoppingList.filter(i => i.checked);
    const hasChecked = checkedItems.length > 0;

    const handleClearAll = () => {
        clearShoppingList();
        setConfirmOpen(false);
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
                        <ShoppingCart className="text-orange-600" size={24} /> Liste de courses
                    </h1>
                </div>
                {shoppingList.length > 0 && (
                    <button
                        onClick={() => setConfirmOpen(true)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl border border-red-100 dark:border-red-900/30 transition-all active:scale-95"
                    >
                        Tout vider
                    </button>
                )}
            </div>

            <ConfirmModal
                open={confirmOpen}
                title="Vider la liste de courses ?"
                message="Tous les articles seront supprimés définitivement."
                confirmLabel="Vider"
                variant="danger"
                onConfirm={handleClearAll}
                onCancel={() => setConfirmOpen(false)}
            />

            {shoppingList.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-dashed border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="text-gray-300 dark:text-gray-600" size={32} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Ta liste de courses est vide</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 max-w-[240px] mx-auto">
                        Ajoute des ingrédients depuis une recette pour commencer.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {uncheckedItems.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-orange-100 dark:border-gray-800 divide-y divide-orange-50 dark:divide-gray-800">
                            {uncheckedItems.map(item => (
                                <div key={item.id} className="flex items-center gap-2 p-3">
                                    <button onClick={() => toggleShoppingItem(item.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                        <Square size={18} className="flex-shrink-0 text-gray-300 dark:text-gray-600" />
                                        <div className="min-w-0">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.text}</p>
                                            {item.recipeTitle && <p className="text-[10px] text-orange-500 dark:text-orange-400 truncate">{item.recipeTitle}</p>}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => removeShoppingItem(item.id)}
                                        className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 active:scale-90 transition-all flex-shrink-0"
                                        aria-label="Supprimer l'article"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasChecked && (
                        <div>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Déjà pris ({checkedItems.length})</span>
                                <button onClick={clearCheckedShoppingItems} className="text-[11px] font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                                    <Trash2 size={12} /> Vider
                                </button>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
                                {checkedItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-2 p-3">
                                        <button onClick={() => toggleShoppingItem(item.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                            <CheckSquare size={18} className="flex-shrink-0 text-orange-400" />
                                            <div className="min-w-0">
                                                <p className="text-sm text-gray-400 dark:text-gray-600 line-through truncate">{item.text}</p>
                                                {item.recipeTitle && <p className="text-[10px] text-gray-300 dark:text-gray-700 truncate">{item.recipeTitle}</p>}
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => removeShoppingItem(item.id)}
                                            className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 active:scale-90 transition-all flex-shrink-0"
                                            aria-label="Supprimer l'article"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
