"use server"

import { z } from "zod"

const MealSchema = z.object({
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  details: z.string(),
})

const DailyPlanSchema = z.object({
  wake_time: z.string(),
  hydration: z.string(),
  meals: z.array(MealSchema),
  workout: z.string(),
  checklist: z.array(z.string()),
  beard_care: z.string().optional(),
  lifestyle_tips: z.array(z.string()).optional(),
})

const WeeklyPlanSchema = z.object({
  Monday: DailyPlanSchema,
  Tuesday: DailyPlanSchema,
  Wednesday: DailyPlanSchema,
  Thursday: DailyPlanSchema,
  Friday: DailyPlanSchema,
  Saturday: DailyPlanSchema,
  Sunday: DailyPlanSchema,
  groceryList: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
    }),
  ),
})

export async function generateDailyPlan(goals: string) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("[v0] OPENROUTER_API_KEY is not set")
    return {
      success: false,
      error:
        "OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your environment variables in the Vars section.",
    }
  }

  console.log("[v0] OpenRouter API key is present, generating plan...")

  try {
    console.log("[v0] Calling OpenRouter API with model: openai/gpt-4o-mini")

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Kaio, an expert AI life coach specializing in fitness, nutrition, and lifestyle optimization for men. You always respond with valid JSON only, no markdown or code blocks.",
          },
          {
            role: "user",
            content: `Based on the following user goals, create a comprehensive, personalized daily plan:

${goals}

Generate a detailed daily plan that includes:
1. Optimal wake time based on their schedule
2. Daily hydration goal (in liters or ounces)
3. 3-5 meals with specific details, calories, and protein content that align with their goals
4. A workout plan for today (specific exercises, sets, reps if they're training today, or rest day activities)
5. A daily checklist of 5-8 actionable items to complete today
6. Beard care routine if mentioned in goals (optional)
7. 3-5 lifestyle tips relevant to their goals (optional)

Make the plan:
- Specific and actionable
- Aligned with their stated goals
- Realistic and achievable for one day
- Motivating and encouraging
- Personalized to their stats and preferences

Be direct and practical. Focus on what they need to do TODAY to move toward their goals.

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "wake_time": "6:00 AM",
  "hydration": "3 liters",
  "meals": [
    {
      "name": "Breakfast",
      "calories": 500,
      "protein": 30,
      "details": "Specific meal details"
    }
  ],
  "workout": "Push Day:\\n- Bench Press: 4 sets x 8 reps\\n- Incline Dumbbell Press: 3 sets x 10 reps\\n- Cable Flyes: 3 sets x 12 reps\\n- Tricep Dips: 3 sets x 10 reps\\n\\nNotes: Rest 90 seconds between sets. Focus on controlled movements.",
  "checklist": ["Item 1", "Item 2", "Item 3"],
  "beard_care": "Optional beard care routine",
  "lifestyle_tips": ["Tip 1", "Tip 2"]
}

CRITICAL: The "workout" field MUST be a single string with line breaks (\\n), NOT an object or array. Include exercise names, sets, reps, and any relevant notes all in one string.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenRouter API error:", response.status, errorText)
      return {
        success: false,
        error: `OpenRouter API error (${response.status}): ${errorText}`,
      }
    }

    const data = await response.json()
    console.log("[v0] API call successful")

    const messageContent = data.choices?.[0]?.message?.content
    if (!messageContent) {
      console.error("[v0] No content in response:", JSON.stringify(data, null, 2))
      return {
        success: false,
        error: "No content received from OpenRouter",
      }
    }

    console.log("[v0] Response content length:", messageContent.length)
    console.log("[v0] Raw response (first 500 chars):", messageContent.substring(0, 500))

    let jsonText = messageContent.trim()

    if (jsonText.startsWith("```")) {
      console.log("[v0] Removing markdown code blocks")
      jsonText = jsonText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
    }

    console.log("[v0] Cleaned JSON (first 500 chars):", jsonText.substring(0, 500))

    let parsedData
    try {
      parsedData = JSON.parse(jsonText)
      console.log("[v0] JSON parsed successfully")
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      console.error("[v0] Failed to parse text:", jsonText)
      return {
        success: false,
        error: "The AI returned invalid JSON format. Please try again.",
      }
    }

    let validatedPlan
    try {
      validatedPlan = DailyPlanSchema.parse(parsedData)
      console.log("[v0] Schema validation successful")
    } catch (validationError) {
      console.error("[v0] Schema validation error:", validationError)
      if (validationError instanceof z.ZodError) {
        console.error("[v0] Validation details:", JSON.stringify(validationError.errors, null, 2))
      }
      return {
        success: false,
        error: "The AI response didn't match the expected format. Please try again.",
      }
    }

    console.log("[v0] Plan generated and validated successfully")
    return {
      success: true,
      plan: validatedPlan,
    }
  } catch (error) {
    console.error("[v0] Error in generateDailyPlan:", error)
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate plan. Please try again.",
    }
  }
}
export async function generateWeeklyPlan(goals: string, userNotes?: string) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("[v0] OPENROUTER_API_KEY is not set")
    return {
      success: false,
      error:
        "OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your environment variables in the Vars section.",
    }
  }

  console.log("[v0] OpenRouter API key is present, generating weekly plan...")

  try {
    console.log("[v0] Calling OpenRouter API with model: openai/gpt-4o-mini")

    const notesContext = userNotes ? `\n\nADDITIONAL NOTES/GOALS:\n${userNotes}\n\nIncorporate these notes into the plan.` : ""

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Kaio, an expert AI life coach specializing in fitness, nutrition, and lifestyle optimization. You always respond with valid JSON only, no markdown or code blocks.",
          },
          {
            role: "user",
            content: `Based on the following user information, create a comprehensive, personalized WEEKLY plan (Monday through Sunday):

${goals}${notesContext}

Generate a detailed 7-day plan that includes for EACH DAY:
1. Optimal wake time based on their schedule
2. Daily hydration goal (in liters or ounces)
3. 3-5 meals with specific details, calories, and protein content that align with their goals
4. A workout plan (specific exercises, sets, reps if training, or rest day activities, or lighter activity if they have events)
5. A daily checklist of 5-8 actionable items to complete
6. Beard care routine if mentioned in goals (optional)
7. 3-5 lifestyle tips relevant to their goals (optional)

Additionally, generate a comprehensive grocery list with ALL ingredients needed for the entire week, categorized by type.

Make the plan:
- Specific and actionable
- Varied across the week (different meals, different workout focuses)
- Aligned with their stated goals
- Realistic and achievable
- Motivating and encouraging
- Personalized to their stats and preferences
- Adaptable to special events they mentioned

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "Monday": {
    "wake_time": "6:00 AM",
    "hydration": "3 liters",
    "meals": [
      {
        "name": "Breakfast",
        "calories": 500,
        "protein": 30,
        "details": "Specific meal details"
      }
    ],
    "workout": "Push Day:\\n- Bench Press: 4 sets x 8 reps\\n- Incline Dumbbell Press: 3 sets x 10 reps",
    "checklist": ["Item 1", "Item 2", "Item 3"],
    "beard_care": "Optional beard care routine",
    "lifestyle_tips": ["Tip 1", "Tip 2"]
  },
  "Tuesday": { ... },
  "Wednesday": { ... },
  "Thursday": { ... },
  "Friday": { ... },
  "Saturday": { ... },
  "Sunday": { ... },
  "groceryList": [
    {
      "name": "Chicken breast",
      "category": "protein"
    },
    {
      "name": "Broccoli",
      "category": "produce"
    },
    {
      "name": "Greek yogurt",
      "category": "dairy"
    },
    {
      "name": "Brown rice",
      "category": "grains"
    },
    {
      "name": "Olive oil",
      "category": "other"
    }
  ]
}

CRITICAL: The "workout" field MUST be a single string with line breaks (\\n), NOT an object or array.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenRouter API error:", response.status, errorText)
      return {
        success: false,
        error: `OpenRouter API error (${response.status}): ${errorText}`,
      }
    }

    const data = await response.json()
    console.log("[v0] API call successful")

    const messageContent = data.choices?.[0]?.message?.content
    if (!messageContent) {
      console.error("[v0] No content in response:", JSON.stringify(data, null, 2))
      return {
        success: false,
        error: "No content received from OpenRouter",
      }
    }

    console.log("[v0] Response content length:", messageContent.length)

    let jsonText = messageContent.trim()

    if (jsonText.startsWith("```")) {
      console.log("[v0] Removing markdown code blocks")
      jsonText = jsonText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
    }

    let parsedData
    try {
      parsedData = JSON.parse(jsonText)
      console.log("[v0] JSON parsed successfully")
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      return {
        success: false,
        error: "The AI returned invalid JSON format. Please try again.",
      }
    }

    let validatedPlan
    try {
      validatedPlan = WeeklyPlanSchema.parse(parsedData)
      console.log("[v0] Schema validation successful")
    } catch (validationError) {
      console.error("[v0] Schema validation error:", validationError)
      if (validationError instanceof z.ZodError) {
        console.error("[v0] Validation details:", JSON.stringify(validationError.errors, null, 2))
      }
      return {
        success: false,
        error: "The AI response didn't match the expected format. Please try again.",
      }
    }

    console.log("[v0] Weekly plan generated and validated successfully")
    return {
      success: true,
      plan: validatedPlan,
    }
  } catch (error) {
    console.error("[v0] Error in generateWeeklyPlan:", error)
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate weekly plan. Please try again.",
    }
  }
}
