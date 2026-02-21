import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Save, X, Plus, Trash2, Clock, ChefHat, BookOpen, Utensils } from 'lucide-react';

const CHAPTERS = [
    "Bases & Sauces",
    "Apéritifs & Entrées",
    "Accompagnements & Légumes",
    "Plats de Résistance",
    "Desserts & Goûters",
    "Autre"
];

export default function AddRecipePage() {
    const { addRecipe } = useContext(AppContext);
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState({
        title: '',
        chapter: CHAPTERS[0],
        ingredients: '',
        instructions: [''],
        prepTime: '',
        difficulty: 'Facile',
        tags: []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!recipe.title.trim()) return;

        // Assurer que le tag "Perso" est présent
        const finalTags = recipe.tags.includes('Perso') ? recipe.tags : [...recipe.tags, 'Perso'];

        addRecipe({ ...recipe, tags: finalTags });
        navigate('/');
    };

    const addStep = () => {
        setRecipe(prev => ({
            ...prev,
            instructions: [...prev.instructions, '']
        }));
    };

    const updateStep = (index, value) => {
        const newSteps = [...recipe.instructions];
        newSteps[index] = value;
        setRecipe(prev => ({ ...prev, instructions: newSteps }));
    };

    const removeStep = (index) => {
        if (recipe.instructions.length === 1) return;
        const newSteps = recipe.instructions.filter((_, i) => i !== index);
        setRecipe(prev => ({ ...prev, instructions: newSteps }));
    };

    return (
        <div className="animate-fade-in pb-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-serif text-2xl font-bold text-orange-900 dark:text-orange-50 flex items-center gap-2">
                    <Plus className="text-orange-600" size={24} /> Ajouter une recette
                </h1>
                <button
                    onClick={() => navigate('/')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* SECTION: GENERAL */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-gray-800 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">Titre de la recette</label>
                        <input
                            type="text"
                            required
                            placeholder="ex: Gratin Dauphinois de Mama"
                            className="w-full bg-orange-50/50 dark:bg-gray-800 border border-orange-100 dark:border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-gray-200"
                            value={recipe.title}
                            onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1 flex items-center gap-1">
                                <BookOpen size={12} /> Chapitre
                            </label>
                            <select
                                className="w-full bg-orange-50/50 dark:bg-gray-800 border border-orange-100 dark:border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-gray-200 text-sm"
                                value={recipe.chapter}
                                onChange={(e) => setRecipe({ ...recipe, chapter: e.target.value })}
                            >
                                {CHAPTERS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1 flex items-center gap-1">
                                <ChefHat size={12} /> Difficulté
                            </label>
                            <select
                                className="w-full bg-orange-50/50 dark:bg-gray-800 border border-orange-100 dark:border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-gray-200 text-sm"
                                value={recipe.difficulty}
                                onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value })}
                            >
                                <option>Facile</option>
                                <option>Moyen</option>
                                <option>Difficile</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1 flex items-center gap-1">
                            <Clock size={12} /> Temps de préparation
                        </label>
                        <input
                            type="text"
                            placeholder="ex: 20 min"
                            className="w-full bg-orange-50/50 dark:bg-gray-800 border border-orange-100 dark:border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-gray-200"
                            value={recipe.prepTime}
                            onChange={(e) => setRecipe({ ...recipe, prepTime: e.target.value })}
                        />
                    </div>
                </div>

                {/* SECTION: INGREDIENTS */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-gray-800">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1 flex items-center gap-1">
                        <Utensils size={12} /> Ingrédients
                    </label>
                    <textarea
                        rows="5"
                        placeholder="Une liste d'ingrédients, un par ligne..."
                        className="w-full bg-orange-50/50 dark:bg-gray-800 border border-orange-100 dark:border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-gray-200 text-sm"
                        value={recipe.ingredients}
                        onChange={(e) => setRecipe({ ...recipe, ingredients: e.target.value })}
                    />
                    <p className="text-[10px] text-gray-400 mt-2 px-1 italic">Astuce: Mets un ingrédient par ligne pour un meilleur affichage.</p>
                </div>

                {/* SECTION: INSTRUCTIONS */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-gray-800 space-y-4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">Préparation</label>

                    {recipe.instructions.map((step, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-2">
                                {index + 1}
                            </div>
                            <textarea
                                rows="2"
                                placeholder={`Étape ${index + 1}...`}
                                className="w-full bg-orange-50/50 dark:bg-gray-800 border border-orange-100 dark:border-gray-700 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-gray-200 text-sm"
                                value={step}
                                onChange={(e) => updateStep(index, e.target.value)}
                            />
                            {recipe.instructions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeStep(index)}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors mt-1"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addStep}
                        className="w-full py-2 border-2 border-dashed border-orange-200 dark:border-gray-700 rounded-xl text-orange-600 dark:text-orange-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={16} /> Ajouter une étape
                    </button>
                </div>

                {/* SUBMIT */}
                <button
                    type="submit"
                    className="w-full bg-orange-600 dark:bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Save size={20} /> Enregistrer la recette
                </button>
            </form>
        </div>
    );
}
