//@ts-nocheck
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import {
    BarChart3,
    Tag,
    TrendingUp,
    ChevronDown,
    ChevronRight,
    ArrowUpCircle,
    CheckCircle,
    LayoutDashboard,
    PieChart,
    Settings,
    MoreHorizontal
} from "lucide-react";
import { useAppSelector } from "../redux/hooks";
import { motion, AnimatePresence } from "framer-motion";
import swagatLogo from '../assets/images/logo/swagat.png';

// Import Shadcn-like components (simulated with Tailwind)
const SidebarHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex h-[60px] items-center px-6 ${className}`}>{children}</div>
);

const SidebarContent = ({ children }: { children: React.ReactNode }) => (
    <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 gap-1 flex flex-col custom-scrollbar">
        {children}
    </div>
);

const SidebarFooter = ({ children }: { children: React.ReactNode }) => (
    <div className="p-4">{children}</div>
);

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string }[];
};

const navItems: NavItem[] = [
    {
        icon: <LayoutDashboard size={18} />,
        name: "Overview",
        path: "/overview",
    },
    {
        icon: <Tag size={18} />,
        name: "Subject Category",
        path: "/subject-category",
    },
    {
        icon: <TrendingUp size={18} />,
        name: "Escalations",
        subItems: [
            {
                name: "Auto Escalated",
                path: "/level-wise-designation-analysis",
            },
            {
                name: "Escalated By Citizen",
                path: "/escalated-by-citizen",
            },
        ],
    },
    {
        icon: <ArrowUpCircle size={18} />,
        name: "Disposed Grievance",
        path: "/disposed-grievance",
    },
    {
        icon: <CheckCircle size={18} />,
        name: "Reviewed",
        path: "/reviewed",
    },
];

const useAsonDate = () => {
    const [asonDate, setAsonDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAsonDate = async () => {
            try {
                const response = await fetch("https://swar-api.gujarat.gov.in/swagatapi/asondate");
                const data = await response.json();
                if (data.asondate) {
                    const date = new Date(data.asondate);
                    setAsonDate(date.toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch asondate:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAsonDate();
    }, []);

    return { asonDate, loading };
};

export default function AppSidebar() {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();
    const { asonDate } = useAsonDate();

    // Derived state for expansion (hover or toggle)
    const expanded = isExpanded || isHovered || isMobileOpen;

    const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

    // Auto-open submenu if active
    useEffect(() => {
        const activeIndex = navItems.findIndex(item =>
            item.subItems?.some(sub => sub.path === location.pathname)
        );
        if (activeIndex !== -1) setOpenSubmenu(activeIndex);
    }, [location.pathname]);

    const handleSubmenuClick = (index: number) => {
        setOpenSubmenu(openSubmenu === index ? null : index);
    };

    return (
        <aside
            className={`
                fixed top-0 left-0 z-40 h-screen border-r bg-sidebar border-sidebar-border
                transition-all duration-300 ease-in-out
                ${expanded ? "w-[290px]" : "w-[90px]"}
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                flex flex-col
            `}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header */}
            <SidebarHeader className="border-b border-sidebar-border/50">
                <div className={`flex items-center gap-3 transition-all duration-300 ${expanded ? "w-full" : "justify-center"}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shrink-0">
                        <img src={swagatLogo} alt="Logo" className="h-6 w-6 object-contain brightness-0 invert" />
                    </div>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col leading-none"
                        >
                            <span className="font-bold text-lg tracking-tight text-sidebar-foreground">SWAGAT</span>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Dashboard</span>
                        </motion.div>
                    )}
                </div>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent>
                {expanded && (
                    <div className="px-6 py-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Platform</h4>
                    </div>
                )}

                <nav className="px-4 space-y-1">
                    {navItems.map((item, index) => {
                        const isActive = item.path === location.pathname || item.subItems?.some(sub => sub.path === location.pathname);
                        const isSubmenuOpen = openSubmenu === index;

                        if (item.subItems) {
                            return (
                                <div key={index} className="overflow-hidden">
                                    <button
                                        onClick={() => handleSubmenuClick(index)}
                                        className={`
                                            w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                                            ${isActive ? "text-sidebar-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                                            ${!expanded && "justify-center px-0"}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`${isActive ? "text-primary" : "text-muted-foreground"}`}>{item.icon}</span>
                                            {expanded && <span>{item.name}</span>}
                                        </div>
                                        {expanded && (
                                            <ChevronRight
                                                size={14}
                                                className={`transition-transform duration-200 ${isSubmenuOpen ? "rotate-90" : ""}`}
                                            />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {expanded && isSubmenuOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden pl-9 pr-2 space-y-0.5 pt-1"
                                            >
                                                {item.subItems.map((subItem, idx) => {
                                                    const isSubActive = location.pathname === subItem.path;
                                                    return (
                                                        <Link
                                                            key={idx}
                                                            to={subItem.path}
                                                            className={`
                                                                flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                                                ${isSubActive
                                                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}
                                                            `}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                                            <span className="truncate">{subItem.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                to={item.path || "#"}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                                    ${isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border border-sidebar-border/50"
                                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                                    ${!expanded && "justify-center px-0"}
                                `}
                            >
                                <span className={`${isActive ? "text-primary" : "text-muted-foreground"}`}>{item.icon}</span>
                                {expanded && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter>
                {expanded ? (
                    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <PieChart size={16} />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-sidebar-foreground">Data Updated</div>
                                    <div className="text-[10px] text-muted-foreground font-mono">{asonDate || 'Loading...'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-muted-foreground" title={asonDate || ''}>
                            <PieChart size={16} />
                        </div>
                    </div>
                )}

                {expanded && (
                    <div className="mt-4 flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-500 to-brand-600 border-2 border-white shadow-sm"></div>
                        <div className="flex-1 overflow-hidden">
                            <div className="truncate text-sm font-medium text-sidebar-foreground">Admin User</div>
                            <div className="truncate text-xs text-muted-foreground">admin@gujarat.gov.in</div>
                        </div>
                        <button className="text-muted-foreground hover:text-foreground">
                            <Settings size={16} />
                        </button>
                    </div>
                )}
            </SidebarFooter>
        </aside>
    );
}
