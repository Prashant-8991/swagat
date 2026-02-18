//@ts-nocheck
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import LogoImage from '../assets/images/logo/swagat.png'

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
    LayoutDashboard
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
        icon: <LayoutDashboard size={20} strokeWidth={1.8} />,
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
            <ul className="flex flex-col gap-2">
                {items.map((nav, index) => (
                    <li key={nav.name}>
                        {nav.subItems ? (
                            <button
                                onClick={() => handleSubmenuToggle(index, menuType)}
                                className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                                    ? "bg-white shadow-sm"
                                    : "menu-item-inactive"
                                    } ${!isExpanded && !isHovered
                                        ? "justify-center px-2"
                                        : "justify-start"
                                    }`}
                            >
                                <span
                                    className={`transition-colors duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? "text-brand-600"
                                        : "text-gray-400 group-hover:text-gray-600"
                                        }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <>
                                        <span className={`text-[13px] font-medium tracking-tight whitespace-nowrap ${openSubmenu?.type === menuType && openSubmenu?.index === index ? 'text-gray-900' : ''}`}>{nav.name}</span>
                                        <ChevronDown
                                            size={16}
                                            className={`ml-auto transition-transform duration-300 ${openSubmenu?.type === menuType &&
                                                openSubmenu?.index === index
                                                ? "rotate-180 text-brand-500"
                                                : "text-gray-400"
                                                }`}
                                        />
                                    </>
                                )}
                            </button>
                        ) : (
                            nav.path && (
                                <Link
                                    to={nav.path}
                                    className={`menu-item group ${isActive(nav.path)
                                        ? "menu-item-active"
                                        : "menu-item-inactive"
                                        } ${!isExpanded && !isHovered ? "justify-center px-2" : ""}`}
                                >
                                    <span
                                        className={`transition-colors duration-200 ${isActive(nav.path)
                                            ? "text-white"
                                            : "text-gray-400 group-hover:text-gray-600"
                                            }`}
                                    >
                                        {nav.icon}
                                    </span>
                                    {(isExpanded || isHovered || isMobileOpen) && (
                                        <span className="text-[14px] font-medium tracking-tight whitespace-nowrap">{nav.name}</span>
                                    )}
                                </Link>
                            )
                        )}
                        {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                            <div
                                ref={(el) => {
                                    subMenuRefs.current[`${menuType}-${index}`] = el;
                                }}
                                className="overflow-hidden transition-all duration-300 ease-in-out"
                                style={{
                                    height:
                                        openSubmenu?.type === menuType && openSubmenu?.index === index
                                            ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                            : "0px",
                                }}
                            >
                                <ul className="mt-2 space-y-1 ml-4 border-l border-gray-200 pl-4 py-1">
                                    {nav.subItems.map((subItem) => (
                                        <li key={subItem.name}>
                                            <Link
                                                to={subItem.path}
                                                className={`block rounded-lg px-3 py-2 text-[13px] transition-all duration-200 font-medium ${isActive(subItem.path)
                                                    ? "bg-brand-50 text-brand-700"
                                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                    }`}
                                            >
                                                {subItem.name}
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
            className={`fixed flex flex-col top-0 left-0 h-screen transition-all duration-300 cubic-bezier(0.25, 1, 0.5, 1) z-50
            glass-strong border-r border-white/40
 ${isExpanded || isMobileOpen
                    ? "w-[290px]"
                    : isHovered
                        ? "w-[290px]"
                        : "w-[80px]"
                }
 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
 lg:translate-x-0`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Logo Area */}
            <div className={`h-[88px] flex items-center justify-center border-b border-gray-100/50`}>
                <Link to="/">
                    {shouldShowFullContent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img src={LogoImage} alt="Swagat Logo" className="h-12 w-auto object-contain" />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <img src={LogoImage} alt="S" className="h-10 w-10 object-contain" />
                        </motion.div>
                    )}
                </Link>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar py-6 px-4">
                <nav className="flex-1">
                    <div className="mb-6">
                        <div className={`mb-4 px-2 text-xs font-bold uppercase tracking-wider text-gray-400 ${!shouldShowFullContent && 'text-center'}`}>
                            {shouldShowFullContent ? 'Main Menu' : '•••'}
                        </div>
                        {renderMenuItems(navItems, "main")}
                    </div>
                </nav>

                {/* Bottom Widgets */}
                <div className="space-y-4 mt-auto">
                    {(fromDate || toDate) && shouldShowFullContent && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-4 rounded-xl shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-2 text-green-700">
                                <Filter size={14} />
                                <span className="text-xs font-bold uppercase">Active Filter</span>
                            </div>
                            <div className="space-y-1">
                                {fromDate && <div className="text-xs text-green-800"><span className="opacity-60">From:</span> {new Date(fromDate).toLocaleDateString('en-GB')}</div>}
                                {toDate && <div className="text-xs text-green-800"><span className="opacity-60">To:</span> {new Date(toDate).toLocaleDateString('en-GB')}</div>}
                            </div>
                        </motion.div>
                    )}

                    {shouldShowFullContent ? (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl"></div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                                    Last Updated
                                </span>
                                {loading ? (
                                    <div className="h-6 w-24 bg-blue-200/50 rounded animate-pulse"></div>
                                ) : (
                                    <p className="text-lg font-bold text-gray-800 font-outfit">
                                        {asonDate || 'N/A'}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center" title={asonDate || "Date"}>
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <CalendarDays size={18} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default AppSidebar;