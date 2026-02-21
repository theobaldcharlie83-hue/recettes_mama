import React, { useState, useEffect, useMemo } from 'react';
import {
    BookOpen,
    Search,
    ChefHat,
    ArrowLeft,
    Utensils,
    XCircle,
    Home,
    Coffee,
    Carrot,
    Drumstick,
    Cookie
} from 'lucide-react';



const CHAPTERS = [
    "Bases & Sauces",
    "Apéritifs & Entrées",
    "Accompagnements & Légumes",
    "Plats de Résistance",
    "Desserts & Goûters",
    "Autre"
];



// --- COMPOSANT SPLASH SCREEN ---
const SplashScreen = () => (
    <div className="fixed inset-0 z-[200] bg-[#fdfbf7] flex flex-col items-center justify-center animate-fade-out pointer-events-none">
        <div className="scale-150 animate-bounce-gentle">
            <ChefHat className="text-orange-600 w-24 h-24 mb-6 mx-auto" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-orange-900 text-center px-4 leading-tight animate-slide-up">
            Les recettes de<br />Mama MATTIO
        </h1>
    </div>
);

// --- COMPOSANT SOMMAIRE ---
const SummaryGrid = ({ onSelectChapter }) => {
    const getIcon = (chapter) => {
        if (chapter.includes('Sauces')) return <Utensils size={24} />;
        if (chapter.includes('Entrées')) return <Carrot size={24} />;
        if (chapter.includes('Légumes')) return <Utensils size={24} />; // Fallback icon
        if (chapter.includes('Plats')) return <Drumstick size={24} />;
        if (chapter.includes('Desserts')) return <Cookie size={24} />;
        return <Coffee size={24} />;
    };

    return (
        <div className="mb-8">
            <h2 className="font-serif text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-orange-600" /> Sommaire
            </h2>
            <div className="grid grid-cols-2 gap-3">
                {CHAPTERS.map(chapter => (
                    <button
                        key={chapter}
                        onClick={() => onSelectChapter(chapter)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col items-center text-center gap-2 hover:bg-orange-50 hover:border-orange-200 transition-all active:scale-95"
                    >
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                            {getIcon(chapter)}
                        </div>
                        <span className="text-xs font-bold text-gray-700 leading-tight">{chapter}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- COMPOSANT PRINCIPAL ---
export default function RecipeApp() {
    const [user, setUser] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeChapter, setActiveChapter] = useState("Tous");
    const [showSplash, setShowSplash] = useState(true);

    // Splash Timer
    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    // 1. Chargement des données JSON statiques
    useEffect(() => {
        fetch('/data/recipes.json')
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
                setRecipes(sorted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur chargement des recettes:", err);
                setLoading(false);
            });
    }, []);

    // Filtrage
    const filteredRecipes = useMemo(() => {
        return recipes.filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.ingredients.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesChapter = activeChapter === "Tous" || r.chapter === activeChapter;
            return matchesSearch && matchesChapter;
        });
    }, [recipes, searchTerm, activeChapter]);

    // --- RENDU ---

    if (loading && recipes.length === 0) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#fdfbf7] text-orange-800">
                <Utensils className="animate-spin mb-4" size={48} />
                <p className="font-serif italic">Mise en place de la cuisine...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] text-gray-800 font-sans pb-24 relative overflow-hidden">

            {/* SPLASH SCREEN */}
            {showSplash && <SplashScreen />}

            {/* HEADER */}
            <header className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-40">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    {view === 'list' ? (
                        <div className="flex items-center gap-2">
                            <ChefHat className="text-orange-600" />
                            <h1 className="font-serif font-bold text-lg text-orange-900 leading-tight">
                                Les recettes de Mama MATTIO
                            </h1>
                        </div>
                    ) : (
                        <button onClick={() => setView('list')} className="flex items-center gap-2 text-orange-800 font-medium">
                            <ArrowLeft size={20} /> Retour
                        </button>
                    )}
                </div>

                {view === 'list' && (
                    <div className="max-w-md mx-auto px-4 pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher une recette..."
                                className="w-full bg-orange-50/50 border border-orange-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-md mx-auto p-4">

                {/* LISTE */}
                {view === 'list' && (
                    <>
                        {/* SOMMAIRE (Uniquement sur l'accueil par défaut) */}
                        {activeChapter === 'Tous' && !searchTerm && (
                            <SummaryGrid onSelectChapter={(chapter) => setActiveChapter(chapter)} />
                        )}

                        {/* FILTRES ACTIFS / NAVIGATION RAPIDE */}
                        {activeChapter !== 'Tous' && (
                            <div className="mb-4 flex items-center gap-2">
                                <button onClick={() => setActiveChapter("Tous")} className="p-1 rounded-full bg-gray-200 text-gray-600">
                                    <XCircle size={16} />
                                </button>
                                <span className="font-bold text-orange-800">{activeChapter}</span>
                            </div>
                        )}

                        {/* LISTE DES RECETTES */}
                        <div className="grid gap-4">
                            {filteredRecipes.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 italic">
                                    <p>Aucune recette trouvée.</p>
                                </div>
                            ) : (
                                filteredRecipes.map(recipe => (
                                    <div
                                        key={recipe.id}
                                        onClick={() => { setSelectedRecipe(recipe); setView('detail'); }}
                                        className="rounded-xl shadow-sm border p-4 flex flex-col active:scale-95 transition-transform cursor-pointer bg-white border-orange-50"
                                    >
                                        <span className="text-[10px] uppercase tracking-widest font-bold mb-1 text-orange-600">{recipe.chapter}</span>
                                        <h3 className="font-serif text-lg font-bold text-gray-800 leading-tight mb-2 flex justify-between">
                                            {recipe.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-1 mt-auto">
                                            {recipe.tags && recipe.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className={`text-[10px] px-2 py-0.5 rounded border ${tag === 'WW' ? 'bg-blue-50 text-blue-600 border-blue-100' : tag === 'Thermomix' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* DÉTAIL */}
                {view === 'detail' && selectedRecipe && (
                    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden min-h-[70vh] animate-fade-in relative">

                        <div className="bg-orange-100/50 p-6 text-center border-b border-orange-100 pt-12 transition-colors">
                            <span className="inline-block px-3 py-1 bg-white/80 rounded-full text-xs font-bold text-orange-800 mb-3 border border-orange-200 shadow-sm">{selectedRecipe.chapter}</span>
                            <h2 className="font-serif text-3xl font-bold text-gray-900 leading-tight">{selectedRecipe.title}</h2>
                        </div>

                        <div className="p-6 space-y-8">
                            <div>
                                <h3 className="flex items-center font-serif text-lg font-bold text-orange-800 mb-4 border-b border-orange-50 pb-2">
                                    <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3 text-orange-600"><Utensils size={16} /></span>
                                    Ingrédients
                                </h3>
                                <div className="bg-orange-50/30 p-4 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed font-light text-sm border-l-4 border-orange-200">
                                    {selectedRecipe.ingredients}
                                </div>
                            </div>

                            <div>
                                <h3 className="flex items-center font-serif text-lg font-bold text-orange-800 mb-4 border-b border-orange-50 pb-2">
                                    <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3 text-orange-600"><BookOpen size={16} /></span>
                                    Préparation
                                </h3>
                                <ul className="space-y-4">
                                    {selectedRecipe.instructions && selectedRecipe.instructions.map((step, idx) => (
                                        <li key={idx} className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center mt-0.5">{idx + 1}</span>
                                            <span className="text-gray-700 leading-relaxed text-sm">{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {selectedRecipe.notes && (
                                <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                                    <div className="relative pl-8 italic text-gray-600 font-serif">
                                        <span className="absolute left-0 top-0 text-4xl text-orange-200">"</span>
                                        {selectedRecipe.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>

            {/* NAVBAR */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    <button
                        onClick={() => { setSelectedRecipe(null); setView('list'); setActiveChapter("Tous"); }}
                        className={`flex flex-col items-center justify-center w-full h-full ${view === 'list' && !selectedRecipe ? 'text-orange-600' : 'text-gray-400'}`}
                    >
                        <Home size={24} />
                        <span className="text-[10px] mt-1 font-medium">Accueil</span>
                    </button>
                </div>
            </nav>

        </div>
    );
}
