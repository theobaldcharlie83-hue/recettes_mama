import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // 1. Theme (Dark Mode)
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        const html = document.documentElement;
        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    // 2. Favoris
    const [favorites, setFavorites] = useState(() => {
        const savedFavs = localStorage.getItem('favorites');
        return savedFavs ? JSON.parse(savedFavs) : [];
    });

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (recipeId) => {
        setFavorites(prev => {
            if (prev.includes(recipeId)) {
                return prev.filter(id => id !== recipeId);
            }
            return [...prev, recipeId];
        });
    };

    // 3. Portions par défaut
    const [defaultPortions, setDefaultPortions] = useState(4);

    // 4. Corbeille
    const [trashedRecipeIds, setTrashedRecipeIds] = useState(() => {
        const saved = localStorage.getItem('trashedRecipeIds');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('trashedRecipeIds', JSON.stringify(trashedRecipeIds));
    }, [trashedRecipeIds]);

    const moveToTrash = (id) => {
        setTrashedRecipeIds(prev => [...new Set([...prev, id])]);
    };

    const restoreFromTrash = (id) => {
        setTrashedRecipeIds(prev => prev.filter(tid => tid !== id));
    };

    const emptyTrash = () => {
        const persoIdsInTrash = customRecipes
            .filter(r => trashedRecipeIds.includes(r.id))
            .map(r => r.id);

        if (persoIdsInTrash.length > 0) {
            setCustomRecipes(prev => prev.filter(r => !persoIdsInTrash.includes(r.id)));
        }

        setTrashedRecipeIds([]);
    };

    // 4. Chargement des recettes
    const [officialRecipes, setOfficialRecipes] = useState([]);
    const [customRecipes, setCustomRecipes] = useState(() => {
        const saved = localStorage.getItem('customRecipes');
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/data/recipes.json')
            .then(res => res.json())
            .then(data => {
                setOfficialRecipes(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur chargement:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        localStorage.setItem('customRecipes', JSON.stringify(customRecipes));
    }, [customRecipes]);

    const addRecipe = (newRecipe) => {
        setCustomRecipes(prev => {
            const nextId = prev.length > 0
                ? Math.max(...prev.map(r => r.id), Math.max(...officialRecipes.map(r => r.id), 0)) + 1
                : Math.max(...officialRecipes.map(r => r.id), 0) + 1;

            return [...prev, { ...newRecipe, id: nextId, isCustom: true }];
        });
    };

    const allRecipes = React.useMemo(() => {
        return [...officialRecipes, ...customRecipes].sort((a, b) => a.title.localeCompare(b.title));
    }, [officialRecipes, customRecipes]);

    const recipes = React.useMemo(() => {
        return allRecipes.filter(r => !trashedRecipeIds.includes(r.id));
    }, [allRecipes, trashedRecipeIds]);

    const trashedRecipes = React.useMemo(() => {
        return allRecipes.filter(r => trashedRecipeIds.includes(r.id));
    }, [allRecipes, trashedRecipeIds]);

    const deleteRecipe = (recipeId) => {
        setCustomRecipes(prev => prev.filter(r => r.id !== recipeId));
    };

    return (
        <AppContext.Provider value={{
            theme,
            toggleTheme,
            favorites,
            toggleFavorite,
            defaultPortions,
            setDefaultPortions,
            recipes,
            trashedRecipes,
            loading,
            addRecipe,
            deleteRecipe,
            moveToTrash,
            restoreFromTrash,
            emptyTrash
        }}>
            {children}
        </AppContext.Provider>
    );
};
