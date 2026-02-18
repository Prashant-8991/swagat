//@ts-nocheck
import React, { createContext, useContext, useEffect } from "react";

type Theme = "light";

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // Always force light theme
    const theme: Theme = "light";

    useEffect(() => {
        // Ensure dark class is removed on mount and never added
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }, []);

    const toggleTheme = () => {
        // No-op: Dark mode is disabled
        console.log("Dark mode is disabled.");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
