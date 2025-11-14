"use client";

import { motion } from "framer-motion";
import {
  Home,
  Target,
  Calendar,
  Settings,
  Info,
  ShoppingCart,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SideNavProps {
  activeView:
    | "dashboard"
    | "goals"
    | "grocery"
    | "history"
    | "settings"
    | "about";
  onViewChange: (
    view: "dashboard" | "goals" | "grocery" | "history" | "settings" | "about",
  ) => void;
}

export default function SideNav({ activeView, onViewChange }: SideNavProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { id: "dashboard" as const, icon: Home, label: "Dashboard" },
    { id: "goals" as const, icon: Target, label: "Goals" },
    { id: "grocery" as const, icon: ShoppingCart, label: "Grocery List" },
    { id: "history" as const, icon: Calendar, label: "History" },
    { id: "settings" as const, icon: Settings, label: "Settings" },
    { id: "about" as const, icon: Info, label: "About" },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-[#D4C5F9] dark:bg-[#171717] border-r border-border z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            {mounted &&
              (theme === "dark" ? (
                <Image
                  src="/Dark Mode Phoenix.png"
                  alt="Kaio Logo"
                  width={40}
                  height={40}
                />
              ) : (
                <Image
                  src="/Light Mode Phoenix.png"
                  alt="Kaio Logo"
                  width={40}
                  height={40}
                />
              ))}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Kaio</h1>
            <p className="text-xs text-muted-foreground">AI Life Coach</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30 dark:hover:bg-muted"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © 2025 Kaio v1.0.0
        </p>
      </div>
    </nav>
  );
}
