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
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        fetch('/data/recipes.json')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                setOfficialRecipes(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur chargement:", err);
                setFetchError(true);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        localStorage.setItem('customRecipes', JSON.stringify(customRecipes));
    }, [customRecipes]);

    // Les recettes perso utilisent un espace d'ID prefixe ("custom-...") distinct
    // des IDs numeriques des recettes officielles, pour ne jamais entrer en collision
    // si de nouvelles recettes officielles sont ajoutees plus tard au JSON.
    const addRecipe = (newRecipe) => {
        const uniqueId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setCustomRecipes(prev => [...prev, { ...newRecipe, id: uniqueId, isCustom: true }]);
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

    const updateRecipe = (recipeId, updatedFields) => {
        setCustomRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, ...updatedFields, id: recipeId, isCustom: true } : r));
    };

    // 5. Liste de courses
    const [shoppingList, setShoppingList] = useState(() => {
        const saved = localStorage.getItem('shoppingList');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    }, [shoppingList]);

    const addToShoppingList = (items, recipeTitle) => {
        const newItems = items.map(text => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            text,
            checked: false,
            recipeTitle,
        }));
        setShoppingList(prev => [...prev, ...newItems]);
    };

    const toggleShoppingItem = (itemId) => {
        setShoppingList(prev => prev.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item));
    };

    const removeShoppingItem = (itemId) => {
        setShoppingList(prev => prev.filter(item => item.id !== itemId));
    };

    const clearCheckedShoppingItems = () => {
        setShoppingList(prev => prev.filter(item => !item.checked));
    };

    const clearShoppingList = () => {
        setShoppingList([]);
    };

    // 6. Export / import de sauvegarde
    const exportBackup = () => ({
        version: 1,
        exportedAt: new Date().toISOString(),
        customRecipes,
        favorites,
        trashedRecipeIds,
        shoppingList,
    });

    const importBackup = (data) => {
        if (!data || typeof data !== 'object') return false;
        if (Array.isArray(data.customRecipes)) setCustomRecipes(data.customRecipes);
        if (Array.isArray(data.favorites)) setFavorites(data.favorites);
        if (Array.isArray(data.trashedRecipeIds)) setTrashedRecipeIds(data.trashedRecipeIds);
        if (Array.isArray(data.shoppingList)) setShoppingList(data.shoppingList);
        return true;
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
            fetchError,
            addRecipe,
            updateRecipe,
            deleteRecipe,
            moveToTrash,
            restoreFromTrash,
            emptyTrash,
            shoppingList,
            addToShoppingList,
            toggleShoppingItem,
            removeShoppingItem,
            clearCheckedShoppingItems,
            clearShoppingList,
            exportBackup,
            importBackup
        }}>
            {children}
        </AppContext.Provider>
    );
};
