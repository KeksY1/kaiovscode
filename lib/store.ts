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
  setResetTime: (time: "00:00" | "06:00") => void
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
        if (!state.lastGenerated) return true

        const lastGen = new Date(state.lastGenerated)
        const now = new Date()
        const resetHour = Number.parseInt(state.resetTime.split(":")[0])

        const lastResetTime = new Date(lastGen)
        lastResetTime.setHours(resetHour, 0, 0, 0)
        if (lastGen < lastResetTime) {
          lastResetTime.setDate(lastResetTime.getDate() - 1)
        }

        const nextResetTime = new Date(lastResetTime)
        nextResetTime.setDate(nextResetTime.getDate() + 1)

        if (now >= nextResetTime) {
          if (state.currentPlan) {
            get().addToHistory(state.currentPlan, state.completedChecklist)
          }
          return true
        }

        return false
      },

      setResetTime: (time) => set({ resetTime: time }),

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
        }),
    }),
    {
      name: "kaio-plan-storage",
    },
  ),
)
