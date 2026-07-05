import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Utensils, BookOpen, Heart, ArrowLeft, Loader2, Carrot, Drumstick, Cookie, Coffee, Droplet, Martini, ChefHat, Trash2, Send, Share, Check, Clock, ScrollText, Square, CheckSquare, Sun, ShoppingCart, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ManuscriptViewer from '../components/ManuscriptViewer';
import ConfirmModal from '../components/ConfirmModal';
import StepTimer from '../components/StepTimer';

const getCategoryIcon = (chapter, size = 120) => {
    if (!chapter) return <ChefHat size={size} strokeWidth={1.5} />;
    if (chapter.includes('Sauces')) return <Droplet size={size} strokeWidth={1.5} />;
    if (chapter.includes('Entrées')) return <Martini size={size} strokeWidth={1.5} />;
    if (chapter.includes('Légumes')) return <Carrot size={size} strokeWidth={1.5} />;
    if (chapter.includes('Plats')) return <Drumstick size={size} strokeWidth={1.5} />;
    if (chapter.includes('Desserts')) return <Cookie size={size} strokeWidth={1.5} />;
    return <ChefHat size={size} strokeWidth={1.5} />;
};

// Decoupe le texte d'ingredients (souvent multi-lignes avec des sections type "Bechamel: ...")
// en groupes checkables pour le mode cuisine.
const parseIngredientGroups = (text) => {
    if (!text) return [];
    return text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
        const headerMatch = line.match(/^([^:]{1,30}):\s*(.+)$/);
        const header = headerMatch ? headerMatch[1] : null;
        const rest = headerMatch ? headerMatch[2] : line;
        const items = rest.split(/\s*\+\s*|\s*,\s*/).map((item) => item.trim().replace(/\.$/, '')).filter(Boolean);
        return { header, items };
    });
};

// Detecte une duree ("10 min", "15'", "2'30", "1h30", "2h") dans le texte d'une etape pour proposer un minuteur.
const extractDurationSeconds = (text) => {
    if (!text) return null;

    // Notation courante en cuisine "2'30" = 2 min 30 sec
    const minSecMatch = text.match(/(\d+)'(\d{2})\b/);
    if (minSecMatch) {
        return parseInt(minSecMatch[1], 10) * 60 + parseInt(minSecMatch[2], 10);
    }

    let seconds = 0;
    let found = false;
    const hourMatch = text.match(/(\d+)\s*h(?:eure)?s?\b/i);
    if (hourMatch) {
        seconds += parseInt(hourMatch[1], 10) * 3600;
        found = true;
    }
    const minMatch = text.match(/(\d+)\s*(?:min(?:ute)?s?\b|')/i);
    if (minMatch) {
        seconds += parseInt(minMatch[1], 10) * 60;
        found = true;
    }
    return found && seconds > 0 ? seconds : null;
};

export default function RecipePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { recipes, loading, favorites, toggleFavorite, defaultPortions, moveToTrash, addToShoppingList } = useContext(AppContext);

    // State pour les portions dynamiques
    const [portions, setPortions] = useState(defaultPortions);
    const [copySuccess, setCopySuccess] = useState(null); // 'propose' or 'share'
    const [showViewer, setShowViewer] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // 'delete' | 'propose' | null
    const [pendingMailto, setPendingMailto] = useState(null);
    const [checkedIngredients, setCheckedIngredients] = useState(() => new Set());
    const [wakeLockActive, setWakeLockActive] = useState(false);
    const [addedToShoppingList, setAddedToShoppingList] = useState(false);
    const [loadedRecipeId, setLoadedRecipeId] = useState(null);

    const recipe = recipes.find(r => r.id === parseInt(id) || r.id === id);

    // Aligne les portions affichées sur la base de la recette et réinitialise les coches
    // dès qu'on change de recette (certaines recettes ne sont pas basées sur 4 portions,
    // ex: crêpes x30, cookies x12...). Ajustement pendant le rendu plutôt qu'un effet,
    // pour éviter un rendu supplémentaire à chaque changement de recette.
    if (recipe && recipe.id !== loadedRecipeId) {
        setLoadedRecipeId(recipe.id);
        setPortions(recipe.basePortions || defaultPortions);
        setCheckedIngredients(new Set());
    }

    // Mode cuisine : empêche l'écran de s'éteindre pendant qu'on consulte la recette
    useEffect(() => {
        if (!recipe) return;
        let wakeLock = null;
        let cancelled = false;

        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await navigator.wakeLock.request('screen');
                    if (cancelled) {
                        wakeLock.release().catch(() => { });
                        return;
                    }
                    setWakeLockActive(true);
                    wakeLock.addEventListener('release', () => setWakeLockActive(false));
                }
            } catch {
                // Silencieux : API non supportée ou permission refusée, pas bloquant
            }
        };

        requestWakeLock();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !wakeLock) {
                requestWakeLock();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            cancelled = true;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLock) wakeLock.release().catch(() => { });
            setWakeLockActive(false);
        };
    }, [recipe?.id]);

    const toggleIngredientChecked = (key) => {
        setCheckedIngredients(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleAddToShoppingList = () => {
        const groups = parseIngredientGroups(recipe.ingredients);
        const items = groups.flatMap(g => g.items.map(item => calculateIngredients(item, portions, recipe.basePortions)));
        if (items.length === 0) return;
        addToShoppingList(items, recipe.title);
        setAddedToShoppingList(true);
        setTimeout(() => setAddedToShoppingList(false), 2000);
    };

    const handleDelete = () => setPendingAction('delete');

    const confirmDelete = () => {
        moveToTrash(recipe.id);
        setPendingAction(null);
        navigate('/');
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

        setPendingMailto(mailto);
        setPendingAction('propose');
    };

    const confirmPropose = () => {
        if (pendingMailto) window.location.href = pendingMailto;
        setPendingAction(null);
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
    const hasCustomImage = recipe.image && recipe.image !== '/default_recipe.png';
    const manuscriptImages = recipe.manuscriptImages || [];
    const manuscriptSrc = manuscriptImages.length > 0 ? `/manuscript/full/${manuscriptImages[0]}` : null;

    // Fonction basique pour recalculer les ingrédients en fonction des portions
    const formatScaledNumber = (value) => {
        if (Number.isInteger(value)) return value.toString();
        return value.toFixed(2).replace(/0+$/, '').replace(/[.,]$/, '').replace('.', ',');
    };

    const calculateIngredients = (text, targetPortions, basePortions) => {
        if (!text) return text;
        const base = basePortions || 4;
        const ratio = targetPortions / base;
        if (ratio === 1) return text;

        // Une seule passe : gère les fractions ("1/2") comme un tout pour ne pas
        // scaler numérateur et dénominateur séparément, et ignore les pourcentages
        // (ex: "crème fraîche 15%") qui ne doivent jamais changer avec les portions.
        return text.replace(/(\d+)\s*\/\s*(\d+)|(\d+(?:[.,]\d+)?)(\s*%)?/g, (match, fracN, fracD, num, percent) => {
            if (percent) return match;
            if (fracN !== undefined) {
                const value = (parseInt(fracN, 10) / parseInt(fracD, 10)) * ratio;
                return formatScaledNumber(value);
            }
            const parsed = parseFloat(num.replace(',', '.'));
            // Evite de scaler les années ou gros nombres improbables
            if (parsed > 1000) return match;
            return formatScaledNumber(parsed * ratio);
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
                {hasCustomImage ? (
                    <div className="absolute inset-0 z-0">
                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover opacity-90 dark:opacity-70" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80"></div>
                    </div>
                ) : manuscriptSrc ? (
                    <button
                        type="button"
                        onClick={() => setShowViewer(true)}
                        className="absolute inset-0 z-0 cursor-zoom-in"
                        aria-label="Voir la page manuscrite originale"
                    >
                        <img src={manuscriptSrc} alt={recipe.title} className="w-full h-full object-cover opacity-90 dark:opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-gray-900 dark:via-gray-900/70"></div>
                    </button>
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
                    aria-label={isFavorite ? 'Retirer des coups de cœur' : 'Ajouter aux coups de cœur'}
                >
                    <Heart size={22} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'} />
                </button>

                {recipe.isCustom ? (
                    <div className="absolute top-4 right-20 flex gap-2 z-10">
                        <button
                            onClick={() => navigate(`/edit/${recipe.id}`)}
                            className="p-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur shadow-sm hover:text-orange-600 hover:scale-110 active:scale-95 transition-all text-gray-500 dark:text-gray-400"
                            title="Modifier la recette"
                            aria-label="Modifier la recette"
                        >
                            <Pencil size={22} />
                        </button>
                        <button
                            onClick={handlePropose}
                            className={`p-3 rounded-full backdrop-blur shadow-sm transition-all flex items-center justify-center ${copySuccess === 'propose' ? 'bg-green-500 text-white' : 'bg-white/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:text-orange-600 hover:scale-110'}`}
                            title="Proposer la recette"
                            aria-label="Proposer la recette au chef"
                        >
                            {copySuccess === 'propose' ? <Check size={22} /> : <Send size={22} />}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur shadow-sm hover:text-red-600 hover:scale-110 active:scale-95 transition-all text-gray-500 dark:text-gray-400 ml-2"
                            title="Mettre à la corbeille"
                            aria-label="Mettre la recette à la corbeille"
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
                            aria-label="Partager la recette"
                        >
                            {copySuccess === 'share' ? <Check size={22} /> : <Share size={22} />}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur shadow-sm hover:text-red-600 hover:scale-110 active:scale-95 transition-all text-gray-500 dark:text-gray-400 ml-2"
                            title="Mettre à la corbeille"
                            aria-label="Mettre la recette à la corbeille"
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

                {manuscriptSrc && (
                    <button
                        onClick={() => setShowViewer(true)}
                        className="relative z-10 mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-white dark:hover:bg-gray-700 active:scale-95 transition-all"
                    >
                        <ScrollText size={14} /> Voir la page originale{manuscriptImages.length > 1 ? ` (${manuscriptImages.length} pages)` : ''}
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showViewer && manuscriptImages.length > 0 && (
                    <ManuscriptViewer images={manuscriptImages} onClose={() => setShowViewer(false)} />
                )}
            </AnimatePresence>

            <ConfirmModal
                open={pendingAction === 'delete'}
                title="Mettre à la corbeille ?"
                message="Cette recette sera déplacée vers la corbeille. Tu pourras la restaurer plus tard si besoin."
                confirmLabel="Mettre à la corbeille"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setPendingAction(null)}
            />

            <ConfirmModal
                open={pendingAction === 'propose'}
                title="Ouvrir l'application e-mail ?"
                message="La recette a été copiée dans le presse-papiers. Veux-tu aussi ouvrir ton application e-mail pour l'envoyer au chef ?"
                confirmLabel="Ouvrir"
                onConfirm={confirmPropose}
                onCancel={() => setPendingAction(null)}
            />

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
                    <h3 className="flex items-center justify-between font-serif text-lg font-bold text-orange-800 dark:text-orange-400 mb-4 border-b border-orange-50 dark:border-gray-800 pb-2">
                        <span className="flex items-center">
                            <span className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3 text-orange-600 dark:text-orange-500">
                                <Utensils size={16} />
                            </span>
                            Ingrédients
                        </span>
                        {wakeLockActive && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-orange-500 dark:text-orange-400" title="L'écran reste allumé pendant la lecture de la recette">
                                <Sun size={12} /> Écran actif
                            </span>
                        )}
                    </h3>
                    <button
                        onClick={handleAddToShoppingList}
                        className={`w-full mb-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${addedToShoppingList
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                            }`}
                    >
                        {addedToShoppingList ? <Check size={14} /> : <ShoppingCart size={14} />}
                        {addedToShoppingList ? 'Ajouté à la liste !' : 'Ajouter à la liste de courses'}
                    </button>
                    <div className="bg-orange-50/50 dark:bg-gray-800/30 p-4 rounded-xl border-l-4 border-orange-300 dark:border-orange-500/50 space-y-3">
                        {parseIngredientGroups(recipe.ingredients).map((group, gIdx) => (
                            <div key={gIdx}>
                                {group.header && (
                                    <p className="text-xs font-bold uppercase tracking-wide text-orange-700 dark:text-orange-400 mb-1.5">{group.header}</p>
                                )}
                                <ul className="space-y-1.5">
                                    {group.items.map((item, iIdx) => {
                                        const key = `${gIdx}-${iIdx}`;
                                        const isChecked = checkedIngredients.has(key);
                                        const scaledItem = calculateIngredients(item, portions, recipe.basePortions);
                                        return (
                                            <li key={key}>
                                                <button
                                                    onClick={() => toggleIngredientChecked(key)}
                                                    className="flex items-start gap-2 text-left w-full group/ing"
                                                >
                                                    {isChecked ? (
                                                        <CheckSquare size={16} className="flex-shrink-0 mt-0.5 text-orange-500" />
                                                    ) : (
                                                        <Square size={16} className="flex-shrink-0 mt-0.5 text-gray-300 dark:text-gray-600 group-hover/ing:text-orange-300" />
                                                    )}
                                                    <span className={`text-sm leading-relaxed font-light transition-all ${isChecked ? 'text-gray-400 dark:text-gray-600 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {scaledItem}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
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
                        {recipe.instructions && recipe.instructions.map((step, idx) => {
                            const duration = extractDurationSeconds(step);
                            return (
                                <li key={idx} className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border dark:border-gray-700 font-bold text-xs flex items-center justify-center mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                        {step}
                                        {duration && <StepTimer seconds={duration} />}
                                    </span>
                                </li>
                            );
                        })}
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
