"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Target, Sparkles, ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react"
import { usePlanStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { generateWeeklyPlan } from "@/app/actions/generate-plan"

interface QuestionnaireData {
  age?: string
  height?: string
  weight?: string
  gender?: string
  fitnessGoals?: string
  workoutFrequency?: string
  dietaryPreferences?: string
  supplements?: string
  hasBeard?: boolean
  beardLength?: string
  beardStyle?: string
  beardCarePreferences?: string
  wakeTime?: string
  sleepTime?: string
  lifestyleGoals?: string
  additionalInfo?: string
}

const questions = [
  {
    id: "age",
    question: "How old are you?",
    placeholder: "e.g., 25",
    type: "input" as const,
  },
  {
    id: "height",
    question: "What's your height?",
    placeholder: "e.g., 6'2\" or 188cm",
    type: "input" as const,
  },
  {
    id: "weight",
    question: "What's your current weight?",
    placeholder: "e.g., 180 lbs or 82 kg",
    type: "input" as const,
  },
  {
    id: "gender",
    question: "What's your gender?",
    placeholder: "e.g., Male, Female, Non-binary",
    type: "input" as const,
  },
  {
    id: "fitnessGoals",
    question: "What are your fitness goals?",
    placeholder: "e.g., Build muscle, lose weight, improve endurance, maintain fitness...",
    type: "textarea" as const,
  },
  {
    id: "workoutFrequency",
    question: "How often do you work out per week?",
    placeholder: "e.g., 4 times per week, Push/Pull/Legs split",
    type: "input" as const,
  },
  {
    id: "dietaryPreferences",
    question: "Any dietary preferences or restrictions?",
    placeholder: "e.g., High protein, vegetarian, no dairy, 3000 calories daily...",
    type: "textarea" as const,
  },
  {
    id: "supplements",
    question: "Do you take any supplements?",
    placeholder: "e.g., Protein powder, creatine, multivitamin, fish oil...",
    type: "textarea" as const,
  },
  {
    id: "hasBeard",
    question: "Do you have a beard?",
    type: "boolean" as const,
  },
  {
    id: "beardLength",
    question: "How long is your beard?",
    placeholder: "e.g., Short stubble, medium, long",
    type: "input" as const,
    conditional: (data: QuestionnaireData) => data.hasBeard === true,
  },
  {
    id: "beardStyle",
    question: "What style is your beard?",
    placeholder: "e.g., Full beard, goatee, Van Dyke",
    type: "input" as const,
    conditional: (data: QuestionnaireData) => data.hasBeard === true,
  },
  {
    id: "beardCarePreferences",
    question: "What are your beard care goals?",
    placeholder: "e.g., Keep it soft and healthy, promote growth, maintain shape...",
    type: "textarea" as const,
    conditional: (data: QuestionnaireData) => data.hasBeard === true,
  },
  {
    id: "wakeTime",
    question: "What time do you usually wake up?",
    placeholder: "e.g., 6:00 AM",
    type: "input" as const,
  },
  {
    id: "sleepTime",
    question: "What time do you usually go to sleep?",
    placeholder: "e.g., 10:30 PM",
    type: "input" as const,
  },
  {
    id: "lifestyleGoals",
    question: "Any other lifestyle goals or habits you want to build?",
    placeholder: "e.g., Read more, meditate daily, improve morning routine...",
    type: "textarea" as const,
  },
  {
    id: "additionalInfo",
    question: "Anything else you'd like to add?",
    placeholder: "e.g., Specific preferences, upcoming events, things I should know...",
    type: "textarea" as const,
  },
]

export default function GoalsView() {
  const { goals, setGoals, weeklyPlan, setWeeklyPlan, setGroceryList, setLastGenerated, setCurrentDayIndex } =
    usePlanStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>(() => {
    // Try to parse existing goals if they exist
    try {
      return goals && goals.trim() !== '' ? JSON.parse(goals) : {}
    } catch {
      return {}
    }
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  // Filter questions based on conditional logic
  const visibleQuestions = questions.filter((q) => !q.conditional || q.conditional(questionnaireData))

  const currentQuestion = visibleQuestions[currentStep]
  const isLastQuestion = currentStep === visibleQuestions.length - 1
  const currentValue = questionnaireData[currentQuestion?.id as keyof QuestionnaireData]

  const handleNext = () => {
    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleAnswer = (value: string | boolean) => {
    setQuestionnaireData((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }

  const handleGeneratePlan = async () => {
    setIsGenerating(true)

    // Convert questionnaire data to a formatted string for the AI
    const formattedGoals = Object.entries(questionnaireData)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => {
        const question = questions.find((q) => q.id === key)
        return `${question?.question} ${value}`
      })
      .join("\n")

    // Save the questionnaire data as JSON for future editing
    setGoals(JSON.stringify(questionnaireData))

    try {
      const result = await generateWeeklyPlan(formattedGoals)

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

        const today = new Date().getDay()
        setCurrentDayIndex(today === 0 ? 6 : today - 1)

        setLastGenerated(new Date().toISOString())
        toast({
          title: "Weekly plan generated!",
          description: "Your personalized weekly plan is ready.",
        })
      } else {
        toast({
          title: "Generation failed",
          description: result.error || "Failed to generate plan. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error in handleGeneratePlan:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#ffffff] dark:text-foreground">Tell Me About Yourself</h1>
            <p className="text-muted-foreground">Answer a few questions to personalize your plan</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentStep + 1} of {visibleQuestions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((currentStep + 1) / visibleQuestions.length) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 bg-white dark:bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / visibleQuestions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 mb-6">
            <div className="space-y-6">
              <div>
                <Label className="text-2xl font-semibold mb-4 block text-foreground">{currentQuestion?.question}</Label>
                <p className="text-sm text-muted-foreground mb-6">
                  This helps me create a better plan for you. Feel free to skip if you prefer.
                </p>
              </div>

              {currentQuestion?.type === "input" && (
                <Input
                  value={(currentValue as string) || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="text-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLastQuestion) {
                      handleNext()
                    }
                  }}
                />
              )}

              {currentQuestion?.type === "textarea" && (
                <Textarea
                  value={(currentValue as string) || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="min-h-[120px] text-lg resize-none"
                />
              )}

              {currentQuestion?.type === "boolean" && (
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      handleAnswer(true)
                      setTimeout(handleNext, 300)
                    }}
                    variant={currentValue === true ? "default" : "outline"}
                    className="flex-1 h-16 text-lg"
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => {
                      handleAnswer(false)
                      setTimeout(handleNext, 300)
                    }}
                    variant={currentValue === false ? "default" : "outline"}
                    className="flex-1 h-16 text-lg"
                  >
                    No
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleBack} disabled={currentStep === 0} variant="outline" className="flex-1 bg-transparent">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <Button onClick={handleSkip} variant="ghost" className="flex-1">
          Skip
        </Button>

        {!isLastQuestion ? (
          <Button onClick={handleNext} className="flex-1">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleGeneratePlan} disabled={isGenerating} className="flex-1">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Plan
              </>
            )}
          </Button>
        )}
      </div>

      {/* Current Plan Status */}
      {weeklyPlan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Active Weekly Plan</h3>
                <p className="text-sm text-muted-foreground">
                  You have an active weekly plan. Complete the questionnaire to regenerate it.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}