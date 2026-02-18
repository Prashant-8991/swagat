//@ts-nocheck
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useFetchGSwagatData, useGSwagat } from "../hooks/usegSwagat";
import { useEffect } from "react";
import SessionTimer from "../components/SessionTimer";

const LayoutContent: React.FC = () => {

  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  return (
    <>
      <div className="min-h-screen xl:flex overflow-x-hidden">
        <div>
          <AppSidebar />
          <Backdrop />
        </div>
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
            } ${isMobileOpen ? "ml-0" : ""}`}
        >
          <div className={`fixed top-0 right-0 z-[999] bg-white/70 backdrop-blur-xl border-b border-gray-200/30 dark:bg-gray-900/60 dark:border-gray-700/40 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:left-[290px]" : "lg:left-[90px]"
            } left-0`}>
            <AppHeader />
          </div>

          <div className="flex flex-col min-h-screen pt-[88px]">
            {/* <div className="absolute left-0 bottom-[100px] z-[111111]">
 <SessionTimer />
 </div> */}
            <div className="flex-1">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AppLayout: React.FC = () => {
  return (
    <>
      <SidebarProvider>
        <LayoutContent />
      </SidebarProvider>
    </>
  );
};

export default AppLayout;
