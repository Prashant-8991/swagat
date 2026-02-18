//@ts-nocheck
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import LogoImage from '../assets/images/logo/swagat.png'

import {
    HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import {
    BarChart3,
    Tag,
    TrendingUp,
    ChevronDown,
    ArrowUpCircle,
    CheckCircle,
    CalendarDays,
    Filter,
    MoreHorizontal,
} from "lucide-react";
import { useAppSelector } from "../redux/hooks";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
    {
        icon: <BarChart3 size={20} strokeWidth={1.8} />,
        name: "Overview",
        path: "/overview",
    },
    {
        icon: <Tag size={20} strokeWidth={1.8} />,
        name: "Subject Category",
        path: "/subject-category",
    },
    {
        icon: <TrendingUp size={20} strokeWidth={1.8} />,
        name: "Escalations",
        subItems: [
            {
                name: "Auto Escalated Grievance",
                path: "/level-wise-designation-analysis",
            },
            {
                name: "Escalated By Citizen",
                path: "/escalated-by-citizen",
            },
        ],
    },
    {
        icon: <ArrowUpCircle size={20} strokeWidth={1.8} />,
        name: "Disposed Grievance",
        path: "/disposed-grievance",
    },
    {
        icon: <CheckCircle size={20} strokeWidth={1.8} />,
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
                    const formatted = date.toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    setAsonDate(formatted);
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

const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();
    const { asonDate, loading } = useAsonDate();

    const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);

    const [openSubmenu, setOpenSubmenu] = useState<{
        type: "main" | "others";
        index: number;
    } | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
        {}
    );
    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const hoverTimeoutRef = useRef<NodeJS.Timeout>();

    const isActive = useCallback(
        (path: string) => location.pathname === path,
        [location.pathname]
    );

    const activeSubmenu = useMemo(() => {
        for (let index = 0; index < navItems.length; index++) {
            const nav = navItems[index];
            if (nav.subItems) {
                for (const subItem of nav.subItems) {
                    if (isActive(subItem.path)) {
                        return { type: "main" as const, index };
                    }
                }
            }
        }
        return null;
    }, [isActive]);

    useEffect(() => {
        setOpenSubmenu(activeSubmenu);
    }, [activeSubmenu]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            const element = subMenuRefs.current[key];
            if (element) {
                requestAnimationFrame(() => {
                    setSubMenuHeight((prevHeights) => ({
                        ...prevHeights,
                        [key]: element.scrollHeight,
                    }));
                });
            }
        }
    }, [openSubmenu]);

    const handleMouseEnter = useCallback(() => {
        if (!isExpanded) {
            hoverTimeoutRef.current = setTimeout(() => {
                setIsHovered(true);
            }, 100);
        }
    }, [isExpanded, setIsHovered]);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setIsHovered(false);
    }, [setIsHovered]);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    const handleSubmenuToggle = useCallback((index: number, menuType: "main" | "others") => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (
                prevOpenSubmenu &&
                prevOpenSubmenu.type === menuType &&
                prevOpenSubmenu.index === index
            ) {
                return null;
            }
            return { type: menuType, index };
        });
    }, []);

    const renderMenuItems = useCallback(
        (items: NavItem[], menuType: "main" | "others") => (
            <ul className="flex flex-col gap-1">
                {items.map((nav, index) => (
                    <li key={nav.name}>
                        {nav.subItems ? (
                            <button
                                onClick={() => handleSubmenuToggle(index, menuType)}
                                className={`menu-item group rounded-xl transition-all duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index
                                    ? "bg-brand-50/80 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 shadow-glass-sm"
                                    : "text-gray-600 hover:bg-white/40 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
                                    } cursor-pointer ${!isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "lg:justify-start"
                                    }`}
                            >
                                <span
                                    className={`menu-item-icon-size ${openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? "text-brand-600 dark:text-brand-400"
                                        : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                                        }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text text-[13px] font-medium tracking-tight">{nav.name}</span>
                                )}
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <ChevronDown
                                        size={16}
                                        strokeWidth={1.8}
                                        className={`ml-auto transition-transform duration-200 ${openSubmenu?.type === menuType &&
                                            openSubmenu?.index === index
                                            ? "rotate-180 text-brand-500"
                                            : "text-gray-400"
                                            }`}
                                    />
                                )}
                            </button>
                        ) : (
                            nav.path && (
                                <Link
                                    to={nav.path}
                                    className={`menu-item group rounded-xl transition-all duration-200 ${isActive(nav.path)
                                        ? "bg-brand-50/80 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 shadow-glass-sm"
                                        : "text-gray-600 hover:bg-white/40 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
                                        }`}
                                >
                                    <span
                                        className={`menu-item-icon-size ${isActive(nav.path)
                                            ? "text-brand-600 dark:text-brand-400"
                                            : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                                            }`}
                                    >
                                        {nav.icon}
                                    </span>
                                    {(isExpanded || isHovered || isMobileOpen) && (
                                        <span className="menu-item-text text-[13px] font-medium tracking-tight">{nav.name}</span>
                                    )}
                                </Link>
                            )
                        )}
                        {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                            <div
                                ref={(el) => {
                                    subMenuRefs.current[`${menuType}-${index}`] = el;
                                }}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                    height:
                                        openSubmenu?.type === menuType && openSubmenu?.index === index
                                            ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                            : "0px",
                                    willChange: openSubmenu?.type === menuType && openSubmenu?.index === index ? 'height' : 'auto',
                                }}
                            >
                                <ul className="mt-1.5 space-y-0.5 ml-9">
                                    {nav.subItems.map((subItem) => (
                                        <li key={subItem.name}>
                                            <Link
                                                to={subItem.path}
                                                className={`menu-dropdown-item rounded-lg transition-all duration-200 text-[13px] ${isActive(subItem.path)
                                                    ? "bg-brand-50/80 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                                                    : "text-gray-500 hover:bg-white/30 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
                                                    }`}
                                            >
                                                {subItem.name}
                                                <span className="flex items-center gap-1 ml-auto">
                                                    {subItem.new && (
                                                        <span
                                                            className={`ml-auto ${isActive(subItem.path)
                                                                ? "bg-brand-100 dark:bg-brand-500/20"
                                                                : "bg-gray-100 group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-600"
                                                                } menu-dropdown-badge`}
                                                        >
                                                            new
                                                        </span>
                                                    )}
                                                    {subItem.pro && (
                                                        <span
                                                            className={`ml-auto ${isActive(subItem.path)
                                                                ? "bg-brand-100 dark:bg-brand-500/20"
                                                                : "bg-gray-100 group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-600"
                                                                } menu-dropdown-badge`}
                                                        >
                                                            pro
                                                        </span>
                                                    )}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        ),
        [openSubmenu, isExpanded, isHovered, isMobileOpen, subMenuHeight, isActive, handleSubmenuToggle]
    );

    const shouldShowFullContent = useMemo(
        () => isExpanded || isHovered || isMobileOpen,
        [isExpanded, isHovered, isMobileOpen]
    );

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-4 left-0 glass-strong dark:bg-gray-900/70 dark:border-gray-800/60 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200/20
 ${isExpanded || isMobileOpen
                    ? "w-[290px]"
                    : isHovered
                        ? "w-[290px]"
                        : "w-[90px]"
                }
 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
 lg:translate-x-0`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className={`py-8 flex justify-center`}
            >
                <Link to="/">
                    {shouldShowFullContent ? (
                        <>
                            <motion.img
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="dark:hidden"
                                src={LogoImage}
                                alt="Logo"
                                width={150}
                                height={40}
                            />
                            <motion.img
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="hidden dark:block"
                                src={LogoImage}
                                alt="Logo"
                                width={150}
                                height={40}
                            />
                        </>
                    ) : (
                        <img
                            src={LogoImage}
                            alt="Logo"
                            width={80}
                            height={80}
                        />
                    )}
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`mb-3 text-[10px] uppercase flex leading-[20px] text-gray-400 font-semibold tracking-[0.12em] ${!isExpanded && !isHovered
                                    ? "lg:justify-center"
                                    : "justify-start"
                                    }`}
                            >
                                {shouldShowFullContent ? (
                                    "Menu"
                                ) : (
                                    <MoreHorizontal size={18} strokeWidth={1.5} className="text-gray-400" />
                                )}
                            </h2>
                            {renderMenuItems(navItems, "main")}
                        </div>
                    </div>
                </nav>
            </div>

            <div className="mt-auto mb-6 space-y-3">
                {(fromDate || toDate) && shouldShowFullContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative overflow-hidden rounded-xl border border-green-200/40 dark:border-green-700/40 glass p-4"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-100/30 dark:bg-green-900/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Filter size={14} className="text-green-600 dark:text-green-400" />
                                <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                                    Active Filter
                                </span>
                            </div>
                            <div className="space-y-1">
                                {fromDate && (
                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold">From:</span> {new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                )}
                                {toDate && (
                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold">To:</span> {new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {(fromDate || toDate) && !shouldShowFullContent && (
                    <div className="flex justify-center">
                        <div className="relative group">
                            <div className="w-12 h-12 rounded-xl border border-green-200/40 dark:border-green-700/40 glass flex items-center justify-center">
                                <div className="relative">
                                    <Filter size={20} className="text-green-600 dark:text-green-400" />
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                                </div>
                            </div>
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                <div className="font-semibold mb-1">Active Date Filter</div>
                                {fromDate && <div>From: {new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
                                {toDate && <div>To: {new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800 dark:border-r-gray-700"></div>
                            </div>
                        </div>
                    </div>
                )}

                {shouldShowFullContent ? (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="relative overflow-hidden rounded-xl border border-gray-200/30 dark:border-gray-700/30 glass p-4"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <CalendarDays size={14} className="text-gray-500 dark:text-gray-400" />
                                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    As On Date
                                </span>
                            </div>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm text-gray-400 dark:text-gray-400">Loading...</span>
                                </div>
                            ) : (
                                <p className="text-base font-bold text-gray-800 dark:text-white tracking-tight">
                                    {asonDate || 'N/A'}
                                </p>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex justify-center">
                        <div className="relative group">
                            <div className="w-12 h-12 rounded-xl border border-gray-200/30 dark:border-gray-700/30 glass flex items-center justify-center">
                                <CalendarDays size={20} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            {!loading && asonDate && (
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    {asonDate}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800 dark:border-r-gray-700"></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

        </aside>
    );
};

export default AppSidebar;