"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  memo,
} from "react";
import { UI_CONSTANTS } from "@/lib/constants/ui";
import { CONTEXT_ERROR_MESSAGES } from "@/lib/constants/messages";
import { WINDOW_EVENTS } from "@/lib/constants/browser";
import { AppError, ERROR_CODES } from "@/lib/error-handler";

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new AppError(
      CONTEXT_ERROR_MESSAGES.SIDEBAR_PROVIDER,
      ERROR_CODES.PERMISSION,
    );
  }
  return context;
};

export const SidebarProvider = memo<{ children: React.ReactNode }>(
  ({ children }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    useEffect(() => {
      const handleResize = () => {
        const mobile = window.innerWidth < UI_CONSTANTS.BREAKPOINT.MD;
        setIsMobile(mobile);
        if (!mobile) {
          setIsMobileOpen(false);
        }
      };

      handleResize();
      window.addEventListener(WINDOW_EVENTS.RESIZE, handleResize);

      return () => {
        window.removeEventListener(WINDOW_EVENTS.RESIZE, handleResize);
      };
    }, []);

    const toggleSidebar = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const toggleMobileSidebar = useCallback(() => {
      setIsMobileOpen((prev) => !prev);
    }, []);

    const toggleSubmenu = useCallback((item: string) => {
      setOpenSubmenu((prev) => (prev === item ? null : item));
    }, []);

    return (
      <SidebarContext.Provider
        value={{
          isExpanded: isMobile ? false : isExpanded,
          isMobileOpen,
          isHovered,
          activeItem,
          openSubmenu,
          toggleSidebar,
          toggleMobileSidebar,
          setIsHovered,
          setActiveItem,
          toggleSubmenu,
        }}
      >
        {children}
      </SidebarContext.Provider>
    );
  },
);

SidebarProvider.displayName = "SidebarProvider";
