//@ts-nocheck
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import LogoImage from '../assets/images/logo/swagat.png'

import {
 HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import {
 ChartBarIcon,
 TagIcon,
 ArrowUpCircleIcon,
 ChevronDownIcon,
 BarsArrowUpIcon,
} from "@heroicons/react/24/outline";
import { useAppSelector } from "../redux/hooks";

type NavItem = {
 name: string;
 icon: React.ReactNode;
 path?: string;
 subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
 {
 icon: <ChartBarIcon />,
 name: "Overview",
 path: "/overview",
 },
 {
 icon: <TagIcon />,
 name: "Subject Category",
 path: "/subject-category",
 },
 {
 icon: <BarsArrowUpIcon />,
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
 icon: <ArrowUpCircleIcon />,
 name: "Disposed Grievance",
 path: "/disposed-grievance",
 },
 {
 icon: <TagIcon />,
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
 <ul className="flex flex-col gap-1.5">
 {items.map((nav, index) => (
 <li key={nav.name}>
 {nav.subItems ? (
 <button
 onClick={() => handleSubmenuToggle(index, menuType)}
 className={`menu-item group rounded-xl transition-all duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index
 ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 shadow-sm"
 : "text-gray-600 hover:bg-white/30 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
 } cursor-pointer ${!isExpanded && !isHovered
 ? "lg:justify-center"
 : "lg:justify-start"
 }`}
 >
 <span
 className={`menu-item-icon-size ${openSubmenu?.type === menuType && openSubmenu?.index === index
 ? "text-orange-600 dark:text-orange-400"
 : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
 }`}
 >
 {nav.icon}
 </span>
 {(isExpanded || isHovered || isMobileOpen) && (
 <span className="menu-item-text">{nav.name}</span>
 )}
 {(isExpanded || isHovered || isMobileOpen) && (
 <ChevronDownIcon
 className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
 openSubmenu?.index === index
 ? "rotate-180 text-orange-500"
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
 ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 shadow-sm"
 : "text-gray-600 hover:bg-white/30 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
 }`}
 >
 <span
 className={`menu-item-icon-size ${isActive(nav.path)
 ? "text-orange-600 dark:text-orange-400"
 : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
 }`}
 >
 {nav.icon}
 </span>
 {(isExpanded || isHovered || isMobileOpen) && (
 <span className="menu-item-text">{nav.name}</span>
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
 className={`menu-dropdown-item rounded-lg transition-all duration-200 ${isActive(subItem.path)
 ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
 : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
 }`}
 >
 {subItem.name}
 <span className="flex items-center gap-1 ml-auto">
 {subItem.new && (
 <span
 className={`ml-auto ${isActive(subItem.path)
 ? "bg-orange-100 dark:bg-orange-500/20"
 : "bg-gray-100 group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-600"
 } menu-dropdown-badge`}
 >
 new
 </span>
 )}
 {subItem.pro && (
 <span
 className={`ml-auto ${isActive(subItem.path)
 ? "bg-orange-100 dark:bg-orange-500/20"
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
 className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-4 left-0 bg-white/70 backdrop-blur-xl dark:bg-gray-900/60 dark:border-gray-800/60 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200/30
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
 <img
 className="dark:hidden"
 src={LogoImage}
 alt="Logo"
 width={150}
 height={40}
 />
 <img
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
 className={`mb-3 text-[11px] uppercase flex leading-[20px] text-gray-400 font-semibold tracking-wider ${!isExpanded && !isHovered
 ? "lg:justify-center"
 : "justify-start"
 }`}
 >
 {shouldShowFullContent ? (
 "Menu"
 ) : (
 <HorizontaLDots className="size-6" />
 )}
 </h2>
 {renderMenuItems(navItems, "main")}
 </div>
 </div>
 </nav>
 </div>

 <div className="mt-auto mb-6 space-y-3">
 {(fromDate || toDate) && shouldShowFullContent && (
 <div className="relative overflow-hidden rounded-xl border border-green-200/60 dark:border-green-700/40 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-gray-800/80 dark:to-gray-900/80 p-4">
 <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/40 dark:bg-green-900/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
 <div className="relative z-10">
 <div className="flex items-center gap-2 mb-2">
 <svg
 className="w-4 h-4 text-green-600 dark:text-green-400"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
 Active Filter
 </span>
 </div>
 <div className="space-y-1">
 {fromDate && (
 <p className="text-xs text-gray-700 dark:text-gray-300">
 <span className="font-semibold">From:</span> {new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
 </p>
 )}
 {toDate && (
 <p className="text-xs text-gray-700 dark:text-gray-300">
 <span className="font-semibold">To:</span> {new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
 </p>
 )}
 </div>
 </div>
 </div>
 )}

 {(fromDate || toDate) && !shouldShowFullContent && (
 <div className="flex justify-center">
 <div className="relative group">
 <div className="w-12 h-12 rounded-xl border border-green-200/60 dark:border-green-700/40 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-gray-800/80 dark:to-gray-900/80 flex items-center justify-center">
 <div className="relative">
 <svg
 className="w-6 h-6 text-green-600 dark:text-green-400"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
 </div>
 </div>
 <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
 <div className="font-semibold mb-1">Active Date Filter</div>
 {fromDate && <div>From: {new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
 {toDate && <div>To: {new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
 <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
 </div>
 </div>
 </div>
 )}

 {shouldShowFullContent ? (
 <div className="relative overflow-hidden rounded-xl border border-gray-200/40 dark:border-gray-700/30 bg-gradient-to-br from-sky-50/80 to-blue-50/80 dark:from-gray-800/80 dark:to-gray-900/80 p-4">
 <div className="absolute top-0 right-0 w-20 h-20 bg-sky-200/40 dark:bg-sky-900/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
 <div className="relative z-10">
 <div className="flex items-center gap-2 mb-2">
 <svg
 className="w-4 h-4 text-sky-600 dark:text-sky-400"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
 />
 </svg>
 <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
 As On Date
 </span>
 </div>
 {loading ? (
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
 <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
 </div>
 ) : (
 <p className="text-lg font-bold text-gray-900 dark:text-white">
 {asonDate || 'N/A'}
 </p>
 )}
 </div>
 </div>
 ) : (
 <div className="flex justify-center">
 <div className="relative group">
 <div className="w-12 h-12 rounded-xl border border-gray-200/40 dark:border-gray-700/30 bg-gradient-to-br from-sky-50/80 to-blue-50/80 dark:from-gray-800/80 dark:to-gray-900/80 flex items-center justify-center">
 <svg
 className="w-6 h-6 text-sky-600 dark:text-sky-400"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
 />
 </svg>
 </div>
 {!loading && asonDate && (
 <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
 {asonDate}
 <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
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