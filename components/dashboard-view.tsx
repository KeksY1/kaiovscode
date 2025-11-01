"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Clock,
  Droplets,
  Utensils,
  Dumbbell,
  CheckCircle2,
  RefreshCw,
  Target,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react"
import { usePlanStore, DailyPlan } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { generateWeeklyPlan } from "@/app/actions/generate-plan"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function DashboardView() {
  const {
    weeklyPlan,
    currentDayIndex,
    setCurrentDayIndex,
    nextDay,
    previousDay,
    weeklyChecklistCompletion,
    toggleWeeklyChecklistItem,
    goals,
    setWeeklyPlan,
    setGroceryList,
    setLastGenerated,
  } = usePlanStore()
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showEventInput, setShowEventInput] = useState(false)
  const [eventText, setEventText] = useState("")
  const { toast } = useToast()

  const handleRegenerate = async () => {
    if (!goals) {
      toast({
        title: "No goals set",
        description: "Please set your goals first before generating a plan.",
        variant: "destructive",
      })
      return
    }

    setIsRegenerating(true)
    try {
      const result = await generateWeeklyPlan(goals)
      if (result.success && result.plan) {
        const { groceryList, ...weekDays } = result.plan
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7))

        setWeeklyPlan({
          startDate: startDate.toISOString(),
          days: weekDays as any,
        })

        const groceryItems = groceryList.map((item: any, index: number) => ({
          id: `grocery-${index}`,
          name: item.name,
          category: item.category,
          purchased: false,
        }))
        setGroceryList(groceryItems)

        setLastGenerated(new Date().toISOString())
        toast({
          title: "Plan regenerated!",
          description: "Your weekly plan has been updated.",
        })
      } else {
        toast({
          title: "Regeneration failed",
          description: result.error || "Failed to regenerate plan.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleAdjustDay = async () => {
    if (!eventText.trim() || !goals) {
      toast({
        title: "Please enter event details",
        description: "Describe what's happening and when.",
        variant: "destructive",
      })
      return
    }

    setIsRegenerating(true)
    try {
      const result = await generateWeeklyPlan(goals, eventText)
      if (result.success && result.plan) {
        const { groceryList, ...weekDays } = result.plan
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7))

        setWeeklyPlan({
          startDate: startDate.toISOString(),
          days: weekDays as any,
        })

        const groceryItems = groceryList.map((item: any, index: number) => ({
          id: `grocery-${index}`,
          name: item.name,
          category: item.category,
          purchased: false,
        }))
        setGroceryList(groceryItems)

        setLastGenerated(new Date().toISOString())
        setShowEventInput(false)
        setEventText("")
        toast({
          title: "Plan adjusted!",
          description: "Your plan has been updated to accommodate your event.",
        })
      } else {
        toast({
          title: "Adjustment failed",
          description: result.error || "Failed to adjust plan.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  if (!weeklyPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Welcome to Kaio</h2>
            <p className="text-muted-foreground mb-6">
              {goals
                ? "Ready to generate your personalized weekly plan!"
                : "Set your goals first to get started with your AI-powered weekly routine."}
            </p>
            <Button
              onClick={goals ? handleRegenerate : undefined}
              disabled={isRegenerating}
              className="w-full bg-primary hover:bg-primary-hover text-white"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : goals ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate My Weekly Plan
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Set My Goals
                </>
              )}
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  const currentDayName = DAYS[currentDayIndex]
  const currentPlan = weeklyPlan.days[currentDayName] as DailyPlan

  if (!currentPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No plan found for {currentDayName}. Try regenerating your plan.</p>
        </Card>
      </div>
    )
  }

  const completedChecklist = weeklyChecklistCompletion[currentDayName] || []
  const totalCalories = currentPlan.meals.reduce((sum, meal) => sum + meal.calories, 0)
  const totalProtein = currentPlan.meals.reduce((sum, meal) => sum + meal.protein, 0)
  const completedCount = completedChecklist.filter(Boolean).length
  const progressPercentage = (completedCount / currentPlan.checklist.length) * 100

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Your Weekly Plan</h1>
              <p className="text-muted-foreground">Let's make this week count!</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowEventInput(!showEventInput)} variant="outline" size="sm">
              <Calendar className="w-4 h-4" />
              Adjust for Event
            </Button>
            <Button onClick={handleRegenerate} disabled={isRegenerating} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Event Input */}
      {showEventInput && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Adjust Plan for Events</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tell me about any upcoming events (e.g., "I have a party tomorrow night" or "Going out with friends on
              Friday")
            </p>
            <Textarea
              value={eventText}
              onChange={(e) => setEventText(e.target.value)}
              placeholder="e.g., I'm going to a party tomorrow night and I want to work around it..."
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={handleAdjustDay} disabled={isRegenerating}>
                {isRegenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Adjusting...
                  </>
                ) : (
                  "Adjust Plan"
                )}
              </Button>
              <Button onClick={() => setShowEventInput(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Day Navigation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Button onClick={previousDay} variant="ghost" size="sm">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">{currentDayName}</h2>
            </div>
            <Button onClick={nextDay} variant="ghost" size="sm">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex gap-1 mt-4 justify-center">
            {DAYS.map((day, index) => (
              <button
                key={day}
                onClick={() => setCurrentDayIndex(index)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  index === currentDayIndex
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {day.substring(0, 1)}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Progress Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Daily Progress</h2>
            <span className="text-2xl font-bold text-primary">
              {completedCount}/{currentPlan.checklist.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedCount === currentPlan.checklist.length
              ? "Amazing! You've completed all tasks today!"
              : `${currentPlan.checklist.length - completedCount} tasks remaining`}
          </p>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Wake Time</span>
          </div>
          <p className="text-lg font-bold text-foreground">{currentPlan.wake_time}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Hydration</span>
          </div>
          <p className="text-lg font-bold text-foreground">{currentPlan.hydration}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Utensils className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Calories</span>
          </div>
          <p className="text-lg font-bold text-foreground">{totalCalories}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Protein</span>
          </div>
          <p className="text-lg font-bold text-foreground">{totalProtein}g</p>
        </Card>
      </motion.div>

      {/* Checklist */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Daily Checklist
            </h2>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {currentPlan.checklist.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => toggleWeeklyChecklistItem(currentDayName, index)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors text-left"
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      completedChecklist[index]
                        ? "bg-primary border-primary scale-110"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {completedChecklist[index] && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <span
                    className={`flex-1 transition-all ${
                      completedChecklist[index] ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {item}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {/* Meals */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Utensils className="w-5 h-5 text-primary" />
            Today's Meals
          </h2>
          <div className="space-y-4">
            {currentPlan.meals.map((meal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="border-l-4 border-primary pl-4 py-2 hover:bg-surface-secondary/50 transition-colors rounded-r-lg"
              >
                <h3 className="font-semibold text-foreground">{meal.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{meal.details}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="font-medium">{meal.calories} cal</span>
                  <span className="font-medium">{meal.protein}g protein</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Workout */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-foreground">
            <Dumbbell className="w-5 h-5 text-primary" />
            Workout
          </h2>
          <p className="text-foreground whitespace-pre-line">{currentPlan.workout}</p>
        </Card>
      </motion.div>

      {/* Optional sections */}
      {currentPlan.beard_care && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-3 text-foreground">Beard Care</h2>
            <p className="text-foreground">{currentPlan.beard_care}</p>
          </Card>
        </motion.div>
      )}

      {currentPlan.lifestyle_tips && currentPlan.lifestyle_tips.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-3 text-foreground">Lifestyle Tips</h2>
            <ul className="space-y-2">
              {currentPlan.lifestyle_tips.map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-2 text-foreground"
                >
                  <span className="text-primary mt-1">•</span>
                  <span>{tip}</span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
