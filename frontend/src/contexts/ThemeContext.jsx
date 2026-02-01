
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "system",
    setTheme: () => null,
});

export function ThemeProvider({ children }) {
    // 1. Initialize state from localStorage or system preference
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("vite-ui-theme") || "system";
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // 2. Remove old class
        root.classList.remove("light", "dark");

        // 3. Determine the actual theme to apply
        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";

            root.classList.add(systemTheme);
            return;
        }

        // 4. Apply manual theme
        root.classList.add(theme);
    }, [theme]);

    const value = {
        theme,
        setTheme: (newTheme) => {
            localStorage.setItem("vite-ui-theme", newTheme);
            setTheme(newTheme);
        },
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
