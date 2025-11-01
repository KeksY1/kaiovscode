"use client"

import { motion } from "framer-motion"
import { Home, Target, Calendar, Settings, Info, ShoppingCart } from "lucide-react"

interface BottomNavProps {
  activeView: "dashboard" | "goals" | "grocery" | "history" | "settings" | "about"
  onViewChange: (view: "dashboard" | "goals" | "grocery" | "history" | "settings" | "about") => void
}

export default function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  const navItems = [
    { id: "dashboard" as const, icon: Home, label: "Home" },
    { id: "goals" as const, icon: Target, label: "Goals" },
    { id: "grocery" as const, icon: ShoppingCart, label: "Grocery" },
    { id: "history" as const, icon: Calendar, label: "History" },
    { id: "settings" as const, icon: Settings, label: "Settings" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-lg border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="flex flex-col items-center gap-1 relative px-4 py-2 rounded-lg min-w-[60px]"
              whileTap={{ scale: 0.95 }}
            >
              <div className={`relative ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
