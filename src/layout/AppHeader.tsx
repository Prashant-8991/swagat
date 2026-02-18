import { useEffect, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { LogOut, Menu, X, Rocket, Search, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";

const AppHeader: React.FC = () => {
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
        <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 bg-background/80 px-6 backdrop-blur-xl transition-all">
            <div className="flex items-center gap-2 lg:hidden">
                <button
                    onClick={handleToggle}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
                >
                    {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    <span className="sr-only">Toggle Menu</span>
                </button>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-muted-foreground/80">
                    <Rocket className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-foreground">S.W.A.G.A.T</span>
                    <span className="mx-2 text-muted-foreground/30">/</span>
                    <span className="text-foreground">Overview</span>
                </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-4">
                <div className="relative hidden w-full max-w-sm lg:flex items-center">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        ref={inputRef}
                        type="search"
                        placeholder="Search grievances... (Ctrl + K)"
                        className="flex h-9 w-full rounded-md border border-input bg-background/50 pl-9 pr-10 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <kbd className="pointer-events-none absolute right-2.5 top-2.5 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">Ctrl</span>K
                    </kbd>
                </div>

                <ThemeToggleButton />

                <button className="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-background" />
                    <span className="sr-only">Notifications</span>
                </button>

                <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleLogoutClick}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
