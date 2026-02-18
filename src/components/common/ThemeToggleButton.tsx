import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export const ThemeToggleButton: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{
                    scale: theme === "dark" ? 0 : 1,
                    opacity: theme === "dark" ? 0 : 1,
                    rotate: theme === "dark" ? 90 : 0
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <Sun className="h-4 w-4" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{
                    scale: theme === "dark" ? 1 : 0,
                    opacity: theme === "dark" ? 1 : 0,
                    rotate: theme === "dark" ? 0 : -90
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <Moon className="h-4 w-4" />
            </motion.div>
            <span className="sr-only">Toggle theme</span>
        </button>
    );
};
