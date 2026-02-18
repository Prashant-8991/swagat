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
          <AppHeader />

          <div className="flex flex-col min-h-screen pt-0">
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
