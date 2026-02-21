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

    // 4. Chargement des recettes
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/data/recipes.json')
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
                setRecipes(sorted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur chargement:", err);
                setLoading(false);
            });
    }, []);

    return (
        <AppContext.Provider value={{
            theme,
            toggleTheme,
            favorites,
            toggleFavorite,
            defaultPortions,
            setDefaultPortions,
            recipes,
            loading
        }}>
            {children}
        </AppContext.Provider>
    );
};
