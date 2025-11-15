"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardView from "@/components/dashboard-view"
import GoalsView from "@/components/goals-view"
import HistoryView from "@/components/history-view"
import SettingsView from "@/components/settings-view"
import AboutView from "@/components/about-view"
import GroceryListView from "@/components/grocery-list-view"
import BottomNav from "@/components/bottom-nav"
import SideNav from "@/components/side-nav"
import { usePlanStore } from "@/lib/store"

export const maxDuration = 300;

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "goals" | "grocery" | "history" | "settings" | "about">(
    "dashboard",
  )
  const { checkAndRegeneratePlan, regenerateWeeklyPlan } = usePlanStore()

  useEffect(() => {
    const check = () => {
      if (checkAndRegeneratePlan()) {
        regenerateWeeklyPlan()
      }
    }
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [checkAndRegeneratePlan, regenerateWeeklyPlan])

  const renderView = () => {
    const views = {
      dashboard: <DashboardView />,
      goals: <GoalsView />,
      grocery: <GroceryListView />,
      history: <HistoryView />,
      settings: <SettingsView />,
      about: <AboutView />,
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {views[activeView]}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="hidden md:block">
        <SideNav activeView={activeView} onViewChange={setActiveView} />
      </div>
      <div className="md:ml-64 pb-20 md:pb-0">{renderView()}</div>
      <BottomNav activeView={activeView} onViewChange={setActiveView} />
    </main>
  )
}