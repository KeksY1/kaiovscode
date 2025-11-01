"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Meal {
  name: string
  calories: number
  protein: number
  details: string
}

export interface DailyPlan {
  wake_time: string
  hydration: string
  meals: Meal[]
  workout: string
  checklist: string[]
  beard_care?: string
  lifestyle_tips?: string[]
}

export interface WeeklyPlan {
  startDate: string // ISO date string for the week start (Monday)
  days: {
    [key: string]: DailyPlan // key is day name: "Monday", "Tuesday", etc.
  }
}

export interface GroceryItem {
  id: string
  name: string
  category: string
  purchased: boolean
}

export interface PlanHistory {
  date: string
  plan: DailyPlan
  completedChecklist: boolean[]
}

export interface UserProfile {
  age?: string
  height?: string
  weight?: string
  gender?: string
  fitnessGoals?: string
  dietaryPreferences?: string
  supplements?: string
  hasBeard?: boolean
  beardLength?: string
  beardStyle?: string
  beardCarePreferences?: string
  otherPreferences?: string
  additionalInfo?: string
}

interface PlanStore {
  userProfile: UserProfile
  goals: string
  currentPlan: DailyPlan | null
  weeklyPlan: WeeklyPlan | null
  currentDayIndex: number // 0-6 for Monday-Sunday
  groceryList: GroceryItem[]
  lastGenerated: string | null
  history: PlanHistory[]
  completedChecklist: boolean[]
  weeklyChecklistCompletion: { [dayName: string]: boolean[] }
  resetTime: "00:00" | "06:00"
  autoRegenerateDay: number // 0 = Sunday, 1 = Monday, etc.
  autoRegenerateTime: string // HH:mm format
  userNotes: string

  setUserProfile: (profile: UserProfile) => void
  setGoals: (goals: string) => void
  setCurrentPlan: (plan: DailyPlan) => void
  setWeeklyPlan: (plan: WeeklyPlan) => void
  setCurrentDayIndex: (index: number) => void
  nextDay: () => void
  previousDay: () => void
  setGroceryList: (items: GroceryItem[]) => void
  toggleGroceryItem: (id: string) => void
  deleteGroceryItem: (id: string) => void
  updateGroceryItemCategory: (id: string, category: string) => void
  updateGroceryItemName: (id: string, name: string) => void
  setLastGenerated: (date: string) => void
  toggleChecklistItem: (index: number) => void
  toggleWeeklyChecklistItem: (dayName: string, index: number) => void
  addToHistory: (plan: DailyPlan, completed: boolean[]) => void
  checkAndRegeneratePlan: () => boolean
  regenerateWeeklyPlan: () => Promise<void>
  setResetTime: (time: "00:00" | "06:00") => void
  setAutoRegenerateDay: (day: number) => void
  setAutoRegenerateTime: (time: string) => void
  setUserNotes: (notes: string) => void
  clearAllData: () => void
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      userProfile: {},
      goals: "",
      currentPlan: null,
      weeklyPlan: null,
      currentDayIndex: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1, // Monday = 0
      groceryList: [],
      lastGenerated: null,
      history: [],
      completedChecklist: [],
      weeklyChecklistCompletion: {},
      resetTime: "06:00",
      autoRegenerateDay: 0, // Sunday
      autoRegenerateTime: "06:00",
      userNotes: "",

      setUserProfile: (profile) => set({ userProfile: profile }),

      setGoals: (goals) => set({ goals }),

      setCurrentPlan: (plan) =>
        set({
          currentPlan: plan,
          completedChecklist: new Array(plan.checklist.length).fill(false),
        }),

      setWeeklyPlan: (plan) => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        const newCompletion: { [key: string]: boolean[] } = {}
        days.forEach((day) => {
          const dayPlan = plan.days[day] as DailyPlan | undefined
          if (dayPlan) {
            newCompletion[day] = new Array(dayPlan.checklist.length).fill(false)
          }
        })
        set({ weeklyPlan: plan, weeklyChecklistCompletion: newCompletion })
      },

      setCurrentDayIndex: (index) => set({ currentDayIndex: index }),

      nextDay: () =>
        set((state) => ({
          currentDayIndex: (state.currentDayIndex + 1) % 7,
        })),

      previousDay: () =>
        set((state) => ({
          currentDayIndex: state.currentDayIndex === 0 ? 6 : state.currentDayIndex - 1,
        })),

      setGroceryList: (items) => set({ groceryList: items }),

      toggleGroceryItem: (id) =>
        set((state) => ({
          groceryList: state.groceryList.map((item) =>
            item.id === id ? { ...item, purchased: !item.purchased } : item,
          ),
        })),

      deleteGroceryItem: (id) =>
        set((state) => ({
          groceryList: state.groceryList.filter((item) => item.id !== id),
        })),

      updateGroceryItemCategory: (id, category) =>
        set((state) => ({
          groceryList: state.groceryList.map((item) =>
            item.id === id ? { ...item, category: category.trim().toLowerCase() } : item,
          ),
        })),

      updateGroceryItemName: (id, name) =>
        set((state) => ({
          groceryList: state.groceryList.map((item) =>
            item.id === id ? { ...item, name } : item,
          ),
        })),

      setLastGenerated: (date) => set({ lastGenerated: date }),

      toggleChecklistItem: (index) =>
        set((state) => {
          const newChecklist = [...state.completedChecklist]
          newChecklist[index] = !newChecklist[index]
          return { completedChecklist: newChecklist }
        }),

      toggleWeeklyChecklistItem: (dayName, index) =>
        set((state) => {
          const dayCompletion = [...(state.weeklyChecklistCompletion[dayName] || [])]
          dayCompletion[index] = !dayCompletion[index]
          return {
            weeklyChecklistCompletion: {
              ...state.weeklyChecklistCompletion,
              [dayName]: dayCompletion,
            },
          }
        }),

      addToHistory: (plan, completed) =>
        set((state) => ({
          history: [
            {
              date: new Date().toISOString(),
              plan,
              completedChecklist: completed,
            },
            ...state.history,
          ].slice(0, 30),
        })),

      checkAndRegeneratePlan: () => {
        const state = get()
        if (!state.lastGenerated || !state.goals) return false

        const now = new Date()
        const lastGenDate = new Date(state.lastGenerated)

        // Find the last time the regeneration should have occurred
        const lastScheduledRegen = new Date(now)
        const [hours, minutes] = state.autoRegenerateTime.split(":").map(Number)
        lastScheduledRegen.setHours(hours, minutes, 0, 0)

        const currentDay = now.getDay() // 0=Sun, 1=Mon...
        const daysToSubtract = (currentDay - state.autoRegenerateDay + 7) % 7
        lastScheduledRegen.setDate(lastScheduledRegen.getDate() - daysToSubtract)

        // If the last generation was before the last scheduled regeneration time,
        // and the current time is after it, then it's time to regenerate.
        if (lastGenDate < lastScheduledRegen && now >= lastScheduledRegen) {
          return true
        }

        return false
      },

      regenerateWeeklyPlan: async () => {
        const { goals, userNotes, setWeeklyPlan, setGroceryList, setLastGenerated } = get()
        if (!goals) {
          console.log("No goals set, skipping regeneration.")
          return
        }

        console.log("Regenerating weekly plan automatically...")
        try {
          const result = await (await import("@/app/actions/generate-plan")).generateWeeklyPlan(goals, userNotes) // No special events for auto-regen
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
            console.log("Weekly plan regenerated successfully.")
          } else {
            console.error("Regeneration failed:", result.error)
          }
        } catch (error) {
          console.error("An unexpected error occurred during regeneration:", error)
        }
      },

      setResetTime: (time) => set({ resetTime: time }),

      setAutoRegenerateDay: (day) => set({ autoRegenerateDay: day }),

      setAutoRegenerateTime: (time) => set({ autoRegenerateTime: time }),

      setUserNotes: (notes) => set({ userNotes: notes }),

      clearAllData: () =>
        set({
          userProfile: {},
          goals: "",
          currentPlan: null,
          weeklyPlan: null,
          currentDayIndex: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
          groceryList: [],
          lastGenerated: null,
          history: [],
          completedChecklist: [],
          weeklyChecklistCompletion: {},
          userNotes: "",
        }),
    }),
    {
      name: "kaio-plan-storage",
      getStorage: () =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            },
    },
  ),
)
