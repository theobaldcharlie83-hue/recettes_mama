import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Save, X, Plus, Trash2, Clock, ChefHat, BookOpen, Utensils, Camera, ImagePlus, Pencil } from 'lucide-react';

const CHAPTERS = [
    "Bases & Sauces",
    "Apéritifs & Entrées",
    "Accompagnements & Légumes",
    "Plats de Résistance",
    "Desserts & Goûters",
    "Autre"
];

const EMPTY_RECIPE = {
    title: '',
    chapter: CHAPTERS[0],
    ingredients: '',
    instructions: [''],
    prepTime: '',
    difficulty: 'Facile',
    tags: [],
    image: null
};

// Redimensionne/compresse la photo avant stockage en base64 dans le localStorage,
// pour éviter de dépasser rapidement le quota (5-10 Mo) avec des photos de téléphone.
const compressImage = (file, maxWidth = 900, quality = 0.75) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement('canvas');
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function AddRecipePage() {
    const { recipes, addRecipe, updateRecipe } = useContext(AppContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const fileInputRef = useRef(null);

    const existingRecipe = id ? recipes.find(r => r.id === id && r.isCustom) : null;
    const isEditMode = !!existingRecipe;

    const [recipe, setRecipe] = useState(EMPTY_RECIPE);
    const [loadedExistingId, setLoadedExistingId] = useState(null);

    // Pré-remplit le formulaire quand on arrive en mode édition (ajustement pendant
    // le rendu plutôt qu'un effet, pour éviter un rendu supplémentaire à l'arrivée).
    if (existingRecipe && existingRecipe.id !== loadedExistingId) {
        setLoadedExistingId(existingRecipe.id);
        setRecipe({
            title: existingRecipe.title || '',
            chapter: existingRecipe.chapter || CHAPTERS[0],
            ingredients: existingRecipe.ingredients || '',
            instructions: existingRecipe.instructions?.length ? existingRecipe.instructions : [''],
            prepTime: existingRecipe.prepTime || '',
            difficulty: existingRecipe.difficulty || 'Facile',
            tags: (existingRecipe.tags || []).filter(t => t !== 'Perso'),
            image: existingRecipe.image && existingRecipe.image !== '/default_recipe.png' ? existingRecipe.image : null
        });
    }

    // Si l'id dans l'URL ne correspond à aucune recette perso existante, on revient à l'accueil
    useEffect(() => {
        if (id && !existingRecipe) {
            navigate('/', { replace: true });
        }
    }, [id, existingRecipe, navigate]);

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const dataUrl = await compressImage(file);
            setRecipe(prev => ({ ...prev, image: dataUrl }));
        } catch {
            // Silencieux : la photo est optionnelle, on n'empêche pas la sauvegarde de la recette
        }
        e.target.value = '';
    };

    const removeImage = () => setRecipe(prev => ({ ...prev, image: null }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!recipe.title.trim()) return;

        // Assurer que le tag "Perso" est présent
        const finalTags = recipe.tags.includes('Perso') ? recipe.tags : [...recipe.tags, 'Perso'];
        const payload = { ...recipe, tags: finalTags, image: recipe.image || '/default_recipe.png' };

        if (isEditMode) {
            updateRecipe(existingRecipe.id, payload);
            navigate(`/recipe/${existingRecipe.id}`);
        } else {
            addRecipe(payload);
            navigate('/');
        }
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
                    {isEditMode ? <Pencil className="text-orange-600" size={22} /> : <Plus className="text-orange-600" size={24} />}
                    {isEditMode ? 'Modifier la recette' : 'Ajouter une recette'}
                </h1>
                <button
                    onClick={() => navigate(isEditMode ? `/recipe/${existingRecipe.id}` : '/')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="Annuler et fermer"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* SECTION: PHOTO */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-gray-800">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1 flex items-center gap-1">
                        <Camera size={12} /> Photo (facultatif)
                    </label>
                    {recipe.image ? (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden group">
                            <img src={recipe.image} alt="Aperçu de la recette" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 active:scale-90 transition-all"
                                aria-label="Supprimer la photo"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-32 rounded-xl border-2 border-dashed border-orange-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 text-orange-400 dark:text-gray-500 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ImagePlus size={28} />
                            <span className="text-xs font-bold">Ajouter une photo</span>
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </div>

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
                                    aria-label={`Supprimer l'étape ${index + 1}`}
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
                    <Save size={20} /> {isEditMode ? 'Enregistrer les modifications' : 'Enregistrer la recette'}
                </button>
            </form>
        </div>
    );
}
