import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Utensils, BookOpen, Heart, ArrowLeft, Loader2, Carrot, Drumstick, Cookie, Coffee, Droplet, Martini, ChefHat, Trash2, Send, Share, Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const getCategoryIcon = (chapter, size = 120) => {
    if (!chapter) return <ChefHat size={size} strokeWidth={1.5} />;
    if (chapter.includes('Sauces')) return <Droplet size={size} strokeWidth={1.5} />;
    if (chapter.includes('Entrées')) return <Martini size={size} strokeWidth={1.5} />;
    if (chapter.includes('Légumes')) return <Carrot size={size} strokeWidth={1.5} />;
    if (chapter.includes('Plats')) return <Drumstick size={size} strokeWidth={1.5} />;
    if (chapter.includes('Desserts')) return <Cookie size={size} strokeWidth={1.5} />;
    return <ChefHat size={size} strokeWidth={1.5} />;
};

export default function RecipePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { recipes, loading, favorites, toggleFavorite, defaultPortions, moveToTrash } = useContext(AppContext);

    // State pour les portions dynamiques
    const [portions, setPortions] = useState(defaultPortions);
    const [copySuccess, setCopySuccess] = useState(null); // 'propose' or 'share'

    const recipe = recipes.find(r => r.id === parseInt(id) || r.id === id);

    const handleDelete = () => {
        if (window.confirm("Mettre cette recette à la corbeille ?")) {
            moveToTrash(recipe.id);
            navigate('/');
        }
    };

    const handlePropose = () => {
        const instructionsList = (recipe.instructions || [])
            .map((step, i) => `  ${i + 1}. ${step}`)
            .join('\n');
        const tagsList = (recipe.tags || []).join(', ') || 'Aucun';

        const emailBody =
            `═══════════════════════════════════════
🍽️  PROPOSITION DE RECETTE
═══════════════════════════════════════

📌 Titre        : ${recipe.title}
📂 Chapitre     : ${recipe.chapter}
⏱️  Temps        : ${recipe.prepTime || 'Non renseigné'}
👨‍🍳 Difficulté   : ${recipe.difficulty || 'Non renseignée'}
🏷️  Tags         : ${tagsList}

───────────────────────────────────────
🥕 INGRÉDIENTS
───────────────────────────────────────
${recipe.ingredients || 'Non renseignés'}

───────────────────────────────────────
👩‍🍳 PRÉPARATION
───────────────────────────────────────
${instructionsList || 'Non renseignée'}
${recipe.notes ? `\n───────────────────────────────────────\n📝 NOTES\n───────────────────────────────────────\n${recipe.notes}` : ''}

═══════════════════════════════════════
Recette envoyée depuis l'app Recettes de MaMa MATTIO
═══════════════════════════════════════`;

        const subject = encodeURIComponent(`🍽️ Proposition de recette : ${recipe.title}`);
        const body = encodeURIComponent(emailBody);
        const mailto = `mailto:theobald.charlie83@gmail.com?subject=${subject}&body=${body}`;

        navigator.clipboard.writeText(emailBody)
            .then(() => {
                setCopySuccess('propose');
                setTimeout(() => setCopySuccess(null), 2000);
            })
            .catch(() => { }); // Silencieux si clipboard échoue

        if (window.confirm("Souhaitez-vous ouvrir votre application e-mail pour envoyer cette recette au chef ?")) {
            window.location.href = mailto;
        }
    };

    const handleShare = () => {
        const shareText = `Découvre cette recette : ${recipe.title}\n\nIngrédients :\n${recipe.ingredients}`;
        navigator.clipboard.writeText(shareText)
            .then(() => {
                setCopySuccess('share');
                setTimeout(() => setCopySuccess(null), 2000);
            })
            .catch(err => console.error('Erreur partage:', err));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="text-center mt-20 text-gray-500 dark:text-gray-400">
                <p>Recette introuvable.</p>
                <button onClick={() => navigate('/')} className="mt-4 text-orange-600 underline">Retour à l'accueil</button>
            </div>
        );
    }

    const isFavorite = favorites.includes(recipe.id);

    // Fonction basique pour recalculer les ingrédients en fonction des portions
    // (A améliorer plus tard avec une regex complexe si nécessaire)
    const calculateIngredients = (text, targetPortions, basePortions = 4) => {
        if (!text) return text;
        const ratio = targetPortions / basePortions;
        return text.replace(/\b(\d+(?:[.,]\d+)?)\b/g, (match) => {
            const num = parseFloat(match.replace(',', '.'));
            // Evite de parser les années ou gros nombres bizarres
            if (num > 1000) return match;
            const newNum = num * ratio;
            // Retourne sans virgule si entier, sinon 1 chiffre après la virgule max
            return Number.isInteger(newNum) ? newNum.toString() : newNum.toFixed(1).replace('.', ',');
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-orange-100 dark:border-gray-800 overflow-hidden min-h-[70vh] mb-8"
        >
            <div className="relative p-6 text-center pt-24 pb-8 transition-colors flex flex-col items-center justify-end min-h-[220px]">
                {/* Image Background */}
                {recipe.image && recipe.image !== '/default_recipe.png' ? (
                    <div className="absolute inset-0 z-0">
                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover opacity-90 dark:opacity-70" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-orange-50/50 to-white dark:from-gray-800/40 dark:to-gray-900 flex items-center justify-center opacity-70">
                        <div className="text-orange-200 dark:text-gray-800 mb-8 transform hover:scale-105 transition-transform duration-700">
                            {getCategoryIcon(recipe.chapter, 160)}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => toggleFavorite(recipe.id)}
                    className="absolute top-4 right-4 p-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur shadow-sm hover:scale-110 active:scale-95 transition-all z-10"
                >
                    <Heart size={22} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'} />
                </button>

                {recipe.isCustom ? (
                    <div className="absolute top-4 right-20 flex gap-2 z-10">
                        <button
                            onClick={handlePropose}
                            className={`p-3 rounded-full backdrop-blur shadow-sm transition-all flex items-center justify-center ${copySuccess === 'propose' ? 'bg-green-500 text-white' : 'bg-white/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:text-orange-600 hover:scale-110'}`}
                            title="Proposer la recette"
                        >
                            {copySuccess === 'propose' ? <Check size={22} /> : <Send size={22} />}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur shadow-sm hover:text-red-600 hover:scale-110 active:scale-95 transition-all text-gray-500 dark:text-gray-400 ml-2"
                            title="Mettre à la corbeille"
                        >
                            <Trash2 size={22} />
                        </button>
                    </div>
                ) : (
                    <div className="absolute top-4 right-20 flex gap-2 z-10">
                        <button
                            onClick={handleShare}
                            className={`p-3 rounded-full backdrop-blur shadow-sm transition-all flex items-center justify-center ${copySuccess === 'share' ? 'bg-green-500 text-white' : 'bg-white/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:scale-110'}`}
                            title="Partager la recette"
                        >
                            {copySuccess === 'share' ? <Check size={22} /> : <Share size={22} />}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur shadow-sm hover:text-red-600 hover:scale-110 active:scale-95 transition-all text-gray-500 dark:text-gray-400 ml-2"
                            title="Mettre à la corbeille"
                        >
                            <Trash2 size={22} />
                        </button>
                    </div>
                )}

                <span className="inline-block px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full text-xs font-bold text-orange-800 dark:text-orange-400 mb-3 border border-orange-200 dark:border-gray-700 shadow-sm">
                    {recipe.chapter}
                </span>
                <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
                    {recipe.title}
                </h2>

                <div className="flex items-center justify-center gap-4 mt-4 text-xs font-bold text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md px-5 py-2 rounded-2xl border border-white dark:border-gray-700 shadow-xl overflow-hidden relative group/header">
                    {/* Subtle Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/header:translate-x-full transition-transform duration-1000 ease-in-out"></div>

                    {recipe.prepTime && (
                        <span className="flex items-center gap-2 group-hover/header:text-orange-600 dark:group-hover/header:text-orange-400 transition-colors">
                            <Clock size={14} className="opacity-70" /> {recipe.prepTime}
                        </span>
                    )}
                    {recipe.difficulty && (
                        <span className="flex items-center gap-2 group-hover/header:text-orange-600 dark:group-hover/header:text-orange-400 transition-colors border-l pl-4 dark:border-gray-700">
                            <ChefHat size={14} className="opacity-70" /> {recipe.difficulty}
                        </span>
                    )}
                </div>

                {recipe.tags && (
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {recipe.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded border bg-white/60 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700 backdrop-blur text-gray-600 border-gray-200">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-6 space-y-8">
                {/* PORTIONS */}
                <div className="flex items-center justify-between bg-orange-50 dark:bg-gray-800/50 p-4 rounded-xl border border-orange-100 dark:border-gray-800">
                    <span className="font-medium text-orange-900 dark:text-orange-100 text-sm">Portions</span>
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-700 rounded-full shadow-sm px-2 py-1 border border-orange-100 dark:border-gray-600">
                        <button
                            onClick={() => setPortions(p => Math.max(1, p - 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-600 active:scale-90 transition-all font-bold text-lg"
                        >-</button>
                        <span className="font-bold text-gray-800 dark:text-gray-200 w-4 text-center">{portions}</span>
                        <button
                            onClick={() => setPortions(p => p + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-600 active:scale-90 transition-all font-bold text-lg"
                        >+</button>
                    </div>
                </div>

                {/* INGREDIENTS */}
                <div>
                    <h3 className="flex items-center font-serif text-lg font-bold text-orange-800 dark:text-orange-400 mb-4 border-b border-orange-50 dark:border-gray-800 pb-2">
                        <span className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3 text-orange-600 dark:text-orange-500">
                            <Utensils size={16} />
                        </span>
                        Ingrédients
                    </h3>
                    <div className="bg-orange-50/50 dark:bg-gray-800/30 p-4 rounded-xl text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-light text-sm border-l-4 border-orange-300 dark:border-orange-500/50">
                        {calculateIngredients(recipe.ingredients, portions, 4)} {/* On suppose 4 portions de base */}
                    </div>
                </div>

                {/* PREPARATION */}
                <div>
                    <h3 className="flex items-center font-serif text-lg font-bold text-orange-800 dark:text-orange-400 mb-4 border-b border-orange-50 dark:border-gray-800 pb-2">
                        <span className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3 text-orange-600 dark:text-orange-500">
                            <BookOpen size={16} />
                        </span>
                        Préparation
                    </h3>
                    <ul className="space-y-4">
                        {recipe.instructions && recipe.instructions.map((step, idx) => (
                            <li key={idx} className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border dark:border-gray-700 font-bold text-xs flex items-center justify-center mt-0.5">
                                    {idx + 1}
                                </span>
                                <span className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* NOTES */}
                {recipe.notes && (
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-200 dark:border-gray-800">
                        <div className="relative pl-8 italic text-gray-600 dark:text-gray-400 font-serif">
                            <span className="absolute left-0 top-0 text-4xl text-orange-200 dark:text-gray-700">"</span>
                            {recipe.notes}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
