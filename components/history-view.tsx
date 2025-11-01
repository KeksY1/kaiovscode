"use client"

import { motion } from "framer-motion"
import { Calendar, TrendingUp, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react"
import { usePlanStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import { format } from "date-fns"

export default function HistoryView() {
  const { history } = usePlanStore()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  if (history.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">No History Yet</h2>
            <p className="text-muted-foreground">
              Your completed daily plans will appear here. Start by generating your first plan!
            </p>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Calculate overall stats
  const totalDays = history.length
  const totalTasksCompleted = history.reduce((sum, entry) => {
    return sum + entry.completedChecklist.filter(Boolean).length
  }, 0)
  const totalTasks = history.reduce((sum, entry) => {
    return sum + entry.plan.checklist.length
  }, 0)
  const overallCompletionRate = totalTasks > 0 ? (totalTasksCompleted / totalTasks) * 100 : 0

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">History</h1>
            <p className="text-muted-foreground">Track your progress over time</p>
          </div>
        </div>
      </motion.div>

      {/* Overall Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Overall Progress</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Days</p>
              <p className="text-2xl font-bold text-foreground">{totalDays}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tasks Completed</p>
              <p className="text-2xl font-bold text-foreground">{totalTasksCompleted}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-primary">{overallCompletionRate.toFixed(0)}%</p>
            </div>
          </div>
          <Progress value={overallCompletionRate} className="h-3" />
        </Card>
      </motion.div>

      {/* History List */}
      <div className="space-y-4">
        {history.map((entry, index) => {
          const completedCount = entry.completedChecklist.filter(Boolean).length
          const totalCount = entry.plan.checklist.length
          const completionRate = (completedCount / totalCount) * 100
          const isExpanded = expandedIndex === index
          const entryDate = new Date(entry.date)

          return (
            <motion.div
              key={entry.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full p-6 text-left hover:bg-surface-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{format(entryDate, "EEEE, MMMM d, yyyy")}</h3>
                        <p className="text-sm text-muted-foreground">{format(entryDate, "h:mm a")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {completedCount}/{totalCount}
                        </p>
                        <p className="text-xs text-muted-foreground">{completionRate.toFixed(0)}% complete</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border"
                  >
                    <div className="p-6 space-y-4">
                      {/* Checklist */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Checklist</h4>
                        <div className="space-y-2">
                          {entry.plan.checklist.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center gap-2">
                              {entry.completedChecklist[itemIndex] ? (
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                              )}
                              <span
                                className={`text-sm ${
                                  entry.completedChecklist[itemIndex]
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Meals Summary */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Meals</h4>
                        <div className="space-y-2">
                          {entry.plan.meals.map((meal, mealIndex) => (
                            <div key={mealIndex} className="text-sm">
                              <span className="font-medium text-foreground">{meal.name}</span>
                              <span className="text-muted-foreground">
                                {" "}
                                - {meal.calories} cal, {meal.protein}g protein
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Workout */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Workout</h4>
                        <p className="text-sm text-muted-foreground">{entry.plan.workout}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
