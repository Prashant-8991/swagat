//@ts-nocheck
import { useEffect, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { LogOut, Menu, X, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AppHeader: React.FC = () => {
    const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
    const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

    const handleLogoutClick = async () => {
        const response = await fetch(import.meta.env.VITE_LOGOUT_URL, {
            method: "POST",
            credentials: "include",
        });
        if (response.ok) {
            window.location.href = import.meta.env.VITE_SSO_LOGIN_URL;
        }
    };

    const handleToggle = () => {
        if (window.innerWidth >= 1024) {
            toggleSidebar();
        } else {
            toggleMobileSidebar();
        }
    };

    const toggleApplicationMenu = () => {
        setApplicationMenuOpen(!isApplicationMenuOpen);
    };

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "k") {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <header className="sticky top-0 flex w-full z-99999">
            <div className="flex items-center justify-between w-full px-3 py-3 lg:px-6 lg:py-4">
                {/* Left: Toggle button */}
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-xl border border-gray-200/50 dark:border-gray-700 dark:text-gray-400 lg:h-11 lg:w-11 hover:bg-white/60 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={handleToggle}
                        aria-label="Toggle Sidebar"
                    >
                        <AnimatePresence mode="wait">
                            {isMobileOpen ? (
                                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                    <X size={20} strokeWidth={1.8} />
                                </motion.div>
                            ) : (
                                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                    <Menu size={20} strokeWidth={1.8} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    <div className="lg:hidden text-xl font-bold text-gray-800 dark:text-white tracking-tight select-none whitespace-nowrap">
                        S.W.A.G.A.T
                    </div>
                </div>

                {/* Center: Full title (desktop only) */}
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="hidden lg:flex items-center flex-1 justify-center"
                >
                    <span className="text-2xl font-semibold text-gray-700 dark:text-white tracking-tight select-none whitespace-nowrap">
                        <span className="text-brand-500 font-bold">S</span>
                        <span className="text-gray-400 font-light">tate</span>{" "}
                        <span className="text-brand-500 font-bold">W</span>
                        <span className="text-gray-400 font-light">ide</span>{" "}
                        <span className="text-brand-500 font-bold">A</span>
                        <span className="text-gray-400 font-light">ttention on</span>{" "}
                        <span className="text-brand-500 font-bold">G</span>
                        <span className="text-gray-400 font-light">rievances by</span>{" "}
                        <span className="text-brand-500 font-bold">A</span>
                        <span className="text-gray-400 font-light">pplication of</span>{" "}
                        <span className="text-brand-500 font-bold">T</span>
                        <span className="text-gray-400 font-light">echnology</span>
                        <span className="ml-2 text-sm font-medium text-gray-400/80 tracking-wide">Dashboard</span>
                    </span>
                </motion.div>

                {/* Right: Logout + Mobile menu */}
                <div className="flex items-center gap-2">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleApplicationMenu}
                        className="flex items-center justify-center w-10 h-10 text-gray-600 rounded-xl hover:bg-white/60 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden transition-all duration-200"
                    >
                        <MoreHorizontal size={20} strokeWidth={1.8} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={handleLogoutClick}
                        className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white transition-all duration-200 shadow-sm"
                        aria-label="Logout"
                    >
                        <LogOut size={16} strokeWidth={2} />
                    </motion.button>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
