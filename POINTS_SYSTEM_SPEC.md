# Kaio Points & AI Validation System - Specification

## Overview
This document outlines the complete points system, task validation, and multi-modal verification for the Kaio app. The system awards users points based on task completion, difficulty, and proof of completion (photo/video + device data).

---

## 1. Points Tier System

Tasks are categorized into 5 difficulty tiers. Points are determined by:
- **Task difficulty/time investment**
- **Ease of fraud detection** (harder to fake = fewer points)
- **User effort required**

### Points Tier Definitions

```json
{
  "pointsTiers": {
    "EASY": {
      "level": 1,
      "pointsValue": 25,
      "examples": ["Drink water", "Take vitamins", "Quick stretching"],
      "description": "Low effort, quick tasks, easy to verify"
    },
    "MEDIUM": {
      "level": 2,
      "pointsValue": 50,
      "examples": ["30-min walk", "Meal prep", "Read 15 pages"],
      "description": "Moderate effort, visual proof available, medium time investment"
    },
    "SLIGHTLY_HARD": {
      "level": 3,
      "pointsValue": 75,
      "examples": ["1-hour workout", "Study session", "Meal prep 3+ meals"],
      "description": "Significant effort, requires phone data validation or extended video"
    },
    "HARD": {
      "level": 4,
      "pointsValue": 100,
      "examples": ["2-hour study session", "Full workout routine", "Complex meal prep"],
      "description": "High effort, requires multi-modal validation and sustained proof"
    },
    "EXTREMELY_HARD": {
      "level": 5,
      "pointsValue": 150,
      "examples": ["8-hour sleep", "Full day productivity", "Complete weekly goal"],
      "description": "Extreme effort, requires advanced device data, sustained tracking"
    }
  }
}
```

---

## 2. Task Types & Validation Methods

Tasks fall into two categories: **Provable** (photo/video) and **Non-Provable** (device data).

### 2.1 Provable Tasks (Photo/Video Required)

These tasks require in-app photo or video capture:

```json
{
  "provableTasks": [
    {
      "taskType": "MEAL_PREP",
      "validationMethod": "PHOTO",
      "description": "User takes photo of prepared meals",
      "requirements": {
        "photoRequired": true,
        "videoRequired": false,
        "minPhotoQuality": "medium",
        "allowedFormats": ["jpg", "png", "webp"]
      },
      "aiValidationPrompt": "meal_prep_validation",
      "pointsTierRange": [25, 50, 75],
      "tips": "Show plated meals, ingredients, or meal prep containers with multiple meals visible"
    },
    {
      "taskType": "WORKOUT",
      "validationMethod": "VIDEO",
      "description": "User uploads video of at least one exercise set",
      "requirements": {
        "photoRequired": false,
        "videoRequired": true,
        "minVideoDuration": 10,
        "maxVideoDuration": 300,
        "allowedFormats": ["mp4", "mov", "webm"]
      },
      "aiValidationPrompt": "workout_validation",
      "pointsTierRange": [50, 75, 100],
      "tips": "Record yourself or the exercise being performed. Must show clear movement and effort."
    },
    {
      "taskType": "SHOPPING",
      "validationMethod": "PHOTO",
      "description": "User takes photo of receipt or shopping bags",
      "requirements": {
        "photoRequired": true,
        "videoRequired": false,
        "minPhotoQuality": "high",
        "allowedFormats": ["jpg", "png", "webp"]
      },
      "aiValidationPrompt": "shopping_validation",
      "pointsTierRange": [25, 50],
      "tips": "Show receipt with date/time or shopping bags with groceries visible"
    },
    {
      "taskType": "CUSTOM_VISUAL",
      "validationMethod": "PHOTO_OR_VIDEO",
      "description": "Custom task requiring photo or video proof",
      "requirements": {
        "photoRequired": false,
        "videoRequired": false,
        "userChooses": true
      },
      "aiValidationPrompt": "custom_visual_validation",
      "pointsTierRange": [25, 50, 75, 100, 150]
    }
  ]
}
```

### 2.2 Non-Provable Tasks (Device Data Validation)

These tasks validate using phone/device data:

```json
{
  "nonProvableTasks": [
    {
      "taskType": "STUDY",
      "validationMethod": "DEVICE_DATA",
      "deviceDataType": "APP_USAGE",
      "description": "Validate study time via app usage tracking",
      "requirements": {
        "trackedApps": [
          "Google Chrome",
          "Safari",
          "Notion",
          "OneNote",
          "Apple Books",
          "Kindle",
          "Duolingo",
          "Khan Academy",
          "Coursera"
        ],
        "minDuration": 1800,
        "allowedInterruptions": 300,
        "description": "Tracks active usage of study apps. 5-min breaks allowed."
      },
      "validation": {
        "type": "PHONE_ACTIVE_TIME",
        "logic": "Sum active time on study apps during planned study period"
      },
      "pointsTierRange": [50, 75, 100, 150],
      "tips": "Use common study tools: Google Docs, Notion, educational apps"
    },
    {
      "taskType": "SLEEP",
      "validationMethod": "DEVICE_DATA",
      "deviceDataType": "PHONE_INACTIVITY + WEARABLE_OPTIONAL",
      "description": "Validate sleep by phone inactivity + optional wearable data",
      "requirements": {
        "baseValidation": "PHONE_INACTIVITY",
        "plannedSleepStart": "user_defined",
        "plannedSleepEnd": "user_defined",
        "allowedPhoneUsage": "5_percent",
        "example": "8-hour sleep (12 AM - 8 AM): user allowed 24 mins of phone time"
      },
      "validation": {
        "type": "COMBINED",
        "primary": "PHONE_INACTIVITY",
        "secondary": "WEARABLE_DATA",
        "logic": "Phone inactivity >95% during sleep window. If wearable connected, cross-validate."
      },
      "wearableIntegrations": [
        "Apple Watch",
        "Fitbit",
        "Garmin",
        "Oura Ring",
        "Google Fit"
      ],
      "pointsTierRange": [75, 100, 150],
      "tips": "Put phone on Do Not Disturb during sleep. Connect wearable for bonus accuracy."
    },
    {
      "taskType": "MEDITATION",
      "validationMethod": "DEVICE_DATA",
      "deviceDataType": "PHONE_INACTIVITY",
      "description": "Validate meditation by phone inactivity during meditation window",
      "requirements": {
        "minDuration": 600,
        "phoneActivityThreshold": "2_percent",
        "description": "Phone must be 98% inactive during session"
      },
      "validation": {
        "type": "PHONE_INACTIVE",
        "logic": "No screen on, no app usage during planned meditation time"
      },
      "pointsTierRange": [25, 50, 75],
      "tips": "Turn on Airplane Mode or Do Not Disturb. Use a timer if needed."
    },
    {
      "taskType": "NO_PHONE_TIME",
      "validationMethod": "DEVICE_DATA",
      "deviceDataType": "PHONE_INACTIVITY",
      "description": "Validate no-phone time during outdoor/social activities",
      "requirements": {
        "minDuration": 3600,
        "phoneActivityThreshold": "1_percent",
        "description": "Phone must be completely off or airplane mode"
      },
      "validation": {
        "type": "PHONE_INACTIVE",
        "logic": "Zero or near-zero phone usage during specified time window"
      },
      "pointsTierRange": [50, 75, 100],
      "tips": "Enable Airplane Mode completely or turn off phone"
    }
  ]
}
```

---

## 3. AI Validation Prompts

These are the exact prompts to send to OpenAI Vision API for photo/video validation.

### 3.1 Meal Prep Validation Prompt

```json
{
  "prompt_id": "meal_prep_validation",
  "model": "gpt-4-vision",
  "system_message": "You are a nutrition and food verification AI for the Kaio fitness app. Your job is to verify if a photo shows genuine meal prep effort. Be fair but strict - catch obvious fakes.",
  "user_prompt": {
    "text": "Analyze this photo. Does it show genuine meal preparation? The user claims to have prepped meals for their fitness goals. Evaluate:",
    "criteria": [
      "Multiple meals/containers visible (at least 2)",
      "Food appears fresh and edible (not stock photos)",
      "Clear evidence of preparation (cooking, portioning, packaging)",
      "Alignment with fitness/nutrition (appears to be healthy food or portion-controlled)"
    ],
    "response_format": {
      "valid": "boolean - true if genuine meal prep evidence found",
      "confidence": "0.0-1.0 - how confident you are",
      "pointsTier": "EASY | MEDIUM | SLIGHTLY_HARD | HARD",
      "reasoning": "explain your decision",
      "redFlags": "list any signs of fraud or stock photo"
    },
    "rules": [
      "Confidence must be >0.8 to approve (reject if <0.8)",
      "Stock photos should be rejected (reverse image search obvious)",
      "Assign points tier based on quantity of meals and prep complexity",
      "1-2 meals = EASY (25 pts), 3-4 meals = MEDIUM (50 pts), 5+ meals = SLIGHTLY_HARD (75 pts)"
    ]
  },
  "example_response": {
    "valid": true,
    "confidence": 0.92,
    "pointsTier": "MEDIUM",
    "reasoning": "Photo shows 4 clearly packed meal containers with grilled chicken, rice, and vegetables. Fresh ingredients, recent preparation (still steam visible). Clear fitness-oriented meal prep.",
    "redFlags": []
  }
}
```

### 3.2 Workout Validation Prompt

```json
{
  "prompt_id": "workout_validation",
  "model": "gpt-4-vision",
  "system_message": "You are a fitness verification AI for the Kaio app. Analyze workout videos to confirm genuine exercise effort. Be fair but watch for obvious fakes.",
  "user_prompt": {
    "text": "Analyze this video. Does it show genuine exercise effort? The user claims to have completed this workout. Evaluate:",
    "criteria": [
      "Clear human movement visible",
      "Exercise form appears genuine (not random movement)",
      "Equipment or bodyweight work evident",
      "Effort/exertion visible (form suggests real workout, not lazy reps)"
    ],
    "response_format": {
      "valid": "boolean - true if genuine exercise visible",
      "confidence": "0.0-1.0",
      "pointsTier": "MEDIUM | SLIGHTLY_HARD | HARD",
      "exerciseType": "e.g., 'Bench Press', 'Bodyweight Push-ups', 'Cardio'",
      "estimatedReps": "approximate number of reps visible",
      "reasoning": "explain your decision",
      "redFlags": "any signs of cheating or fake"
    },
    "rules": [
      "Confidence must be >0.8 to approve",
      "Minimum 8 seconds of visible movement required",
      "Single set: MEDIUM (50 pts), Multiple sets/heavy load: SLIGHTLY_HARD (75 pts), Full workout: HARD (100 pts)",
      "Check for obvious green screen or video manipulation"
    ]
  },
  "example_response": {
    "valid": true,
    "confidence": 0.88,
    "pointsTier": "MEDIUM",
    "exerciseType": "Barbell Bench Press",
    "estimatedReps": 8,
    "reasoning": "Clear video of user performing bench press with proper form. 8 reps with controlled movement. Weight appears substantial. No signs of manipulation.",
    "redFlags": []
  }
}
```

### 3.3 Shopping Validation Prompt

```json
{
  "prompt_id": "shopping_validation",
  "model": "gpt-4-vision",
  "system_message": "You are a shopping verification AI. Verify that photos show legitimate grocery shopping for nutrition/fitness purposes.",
  "user_prompt": {
    "text": "Analyze this photo. Does it show legitimate grocery shopping? Evaluate:",
    "criteria": [
      "Receipt visible with date/time or shopping bags with groceries",
      "Grocery items visible (not random items)",
      "Items align with nutrition/fitness (fresh produce, protein, grains, etc.)",
      "Photo appears recent (not old/stock photo)"
    ],
    "response_format": {
      "valid": "boolean",
      "confidence": "0.0-1.0",
      "pointsTier": "EASY | MEDIUM",
      "shopType": "Grocery Store, Online, Farmers Market, etc.",
      "visibleItems": "list main food items visible",
      "reasoning": "explain decision",
      "redFlags": "any concerns"
    },
    "rules": [
      "Confidence >0.8 to approve",
      "Receipt/date proof required",
      "Small shopping trip: EASY (25 pts), Large multi-item trip: MEDIUM (50 pts)"
    ]
  }
}
```

### 3.4 Custom Visual Task Validation Prompt

```json
{
  "prompt_id": "custom_visual_validation",
  "model": "gpt-4-vision",
  "system_message": "You are a general task verification AI. The user has created a custom task. Verify the photo/video shows genuine completion of their stated task. Be fair.",
  "user_prompt": {
    "text": "The user claims to have completed this custom task: '{task_description}'. Does this photo/video show genuine evidence of task completion?",
    "context": {
      "taskName": "user_defined",
      "taskDescription": "user_defined",
      "userSetPointsTierHint": "EASY | MEDIUM | SLIGHTLY_HARD | HARD (user's suggestion, you can override)"
    },
    "response_format": {
      "valid": "boolean",
      "confidence": "0.0-1.0",
      "pointsTierOverride": "EASY | MEDIUM | SLIGHTLY_HARD | HARD (adjust if user's hint seems wrong)",
      "reasoning": "explain your assessment",
      "redFlags": "any concerns"
    },
    "rules": [
      "Confidence >0.8 to approve",
      "Match points tier to actual effort shown, not user's hint",
      "When in doubt, ask: 'Could this be faked easily?' If yes, lower tier"
    ]
  }
}
```

### 3.5 Task Difficulty & Points Auto-Assignment Prompt

This prompt runs when a user creates a task or when their completed task needs points assigned:

```json
{
  "prompt_id": "task_points_assignment",
  "model": "gpt-4",
  "system_message": "You are a fitness/productivity task evaluator. Assign Kaio points based on task difficulty and fraud risk.",
  "user_prompt": {
    "text": "Assign points tier and reasoning for this task completion",
    "task_data": {
      "taskName": "string",
      "taskDescription": "string",
      "plannedDuration": "minutes (or null if unknown)",
      "completionProof": "PHOTO | VIDEO | DEVICE_DATA | HONOR_SYSTEM",
      "fraudRisk": "LOW | MEDIUM | HIGH (based on proof type)",
      "userEffortEstimate": "string (user's own estimate)"
    },
    "response_format": {
      "recommendedTier": "EASY | MEDIUM | SLIGHTLY_HARD | HARD | EXTREMELY_HARD",
      "pointsValue": "25 | 50 | 75 | 100 | 150",
      "reasoning": "short explanation of tier choice",
      "fraudRiskAssessment": "how easy is this to fake?",
      "confidenceInAssignment": "0.0-1.0"
    },
    "tier_assignment_logic": {
      "EASY": "Quick tasks <30 min, minimal effort, high fraud risk (honor system). Examples: vitamins, water, stretching",
      "MEDIUM": "30-60 min tasks, moderate effort, visual proof available. Examples: walks, meal prep, reading",
      "SLIGHTLY_HARD": "1-2 hour tasks, significant effort, device data validates. Examples: workouts, study sessions",
      "HARD": "2+ hour tasks, high effort, multi-modal validation. Examples: long workouts, full-day productivity",
      "EXTREMELY_HARD": "Full sleep cycles, sustained 8+ hours, requires device integration. Examples: 8-hour sleep, full day tracking"
    },
    "rules": [
      "PHOTO/VIDEO proof = can assign up to HARD tier (100 pts)",
      "DEVICE_DATA proof = can assign SLIGHTLY_HARD to EXTREMELY_HARD (75-150 pts)",
      "HONOR_SYSTEM proof = only EASY tier (25 pts)",
      "Duration is primary factor: <15min = EASY, 15-60min = MEDIUM, 60-120min = SLIGHTLY_HARD, 120+ = HARD+",
      "Fraud risk lowers points: easy to fake = lower tier, hard to fake = higher tier"
    ]
  },
  "example_response": {
    "recommendedTier": "SLIGHTLY_HARD",
    "pointsValue": 75,
    "reasoning": "90-minute study session with study app tracking. Significant time investment, good fraud detection via device data.",
    "fraudRiskAssessment": "LOW - can verify via Google Docs / Notion activity timestamps",
    "confidenceInAssignment": 0.92
  }
}
```

---

## 4. Device Data Collection & Validation Logic

### 4.1 Phone Activity Tracking

```json
{
  "deviceDataTracking": {
    "phoneInactivity": {
      "method": "Native iOS/Android API",
      "dataPoints": [
        "Screen on/off state",
        "Last activity timestamp",
        "App usage duration per app",
        "Lock screen time"
      ],
      "permissions": [
        "ios": "NSUserActivityTypes, app usage privacy",
        "android": "android.permission.PACKAGE_USAGE_STATS"
      ],
      "calculation": {
        "sleepValidation": {
          "formula": "If (phoneInactivePercentage >= 95%) during planned sleep window, approve",
          "example": "8-hour sleep (12 AM - 8 AM = 480 mins). Allowed phone use: 24 mins (5%). If actual use < 24 mins, valid."
        },
        "meditationValidation": {
          "formula": "If (phoneInactivePercentage >= 98%) during session window, approve",
          "example": "20-min meditation. Allowed use: 12 seconds (2%). If phone stays off, valid."
        },
        "studyValidation": {
          "formula": "Sum of active time on study apps >= plannedDuration * 0.9",
          "example": "Planned 60-min study. Need 54+ mins on study apps (allows 10% breaks)"
        }
      }
    },
    "appUsageTracking": {
      "method": "System app usage APIs",
      "trackedCategories": {
        "studyApps": [
          "Google Chrome",
          "Safari",
          "Google Docs",
          "Microsoft Office",
          "Notion",
          "OneNote",
          "Apple Books",
          "Kindle",
          "Khan Academy",
          "Coursera",
          "Udemy",
          "LinkedIn Learning",
          "Duolingo"
        ],
        "socialMediaApps": [
          "Instagram",
          "TikTok",
          "Facebook",
          "Twitter/X",
          "Snapchat"
        ],
        "productivityApps": [
          "Todoist",
          "Asana",
          "Monday.com"
        ]
      },
      "exclusions": {
        "allowedDuringStudy": [
          "Music apps (Spotify, Apple Music)",
          "Timer apps",
          "Calculator"
        ],
        "notCounted": [
          "Passive screen time (screen off)",
          "Locked phone"
        ]
      }
    },
    "wearableIntegration": {
      "supported": [
        "Apple Health",
        "Google Fit",
        "Fitbit API",
        "Garmin Connect",
        "Oura Ring API"
      ],
      "dataUsed": [
        "Sleep start/end times",
        "Sleep duration",
        "Sleep stages (if available)",
        "Heart rate (optional, for sleep quality)"
      ]
    }
  }
}
```

### 4.2 Validation Logic Flow

```json
{
  "validationLogicFlow": {
    "sleepTask": {
      "step1": "Get planned sleep time from task (e.g., 12 AM - 8 AM)",
      "step2": "Query phone inactivity data for that window",
      "step3": "Calculate phone usage percentage",
      "step4": "Check if usage <= 5% of sleep duration (24 mins for 8-hour sleep)",
      "step5": "If wearable connected, cross-validate with actual sleep data",
      "step6": "Approve if both conditions met, reject otherwise",
      "exampleLogic": "IF (phoneInactivePercentage >= 95%) AND (wearable confirms 7.5+ hours sleep) THEN approve AND assignPointsTier(HARD)"
    },
    "studyTask": {
      "step1": "Get planned study duration and start time",
      "step2": "Query app usage for study apps during that window",
      "step3": "Sum total active time on study apps",
      "step4": "Allow 10% breaks (if 60-min session, need 54 mins of app time)",
      "step5": "If threshold met, check for social media interruptions",
      "step6": "Approve if study app time sufficient and social media time < 5 mins",
      "exampleLogic": "IF (studyAppTime >= plannedDuration * 0.9) AND (socialMediaTime < 300s) THEN approve AND assignPointsTier(SLIGHTLY_HARD)"
    },
    "meditationTask": {
      "step1": "Get planned meditation duration",
      "step2": "Query phone inactivity for that window",
      "step3": "Check if phone completely off or Airplane Mode active",
      "step4": "Calculate inactivity percentage (must be >= 98%)",
      "step5": "Approve if threshold met",
      "exampleLogic": "IF (phoneInactivePercentage >= 98%) AND (plannedDuration met) THEN approve AND assignPointsTier(MEDIUM)"
    }
  }
}
```

---

## 5. UI/UX Changes Required

### 5.1 Task Display Updates

```json
{
  "uiChanges": {
    "taskListItem": {
      "fields": [
        "taskName: string",
        "taskDescription: string",
        "plannedDuration: number (minutes)",
        "pointsValue: number (display next to task)",
        "pointsTier: enum (EASY | MEDIUM | SLIGHTLY_HARD | HARD | EXTREMELY_HARD)",
        "validationMethod: enum (PHOTO | VIDEO | DEVICE_DATA | HONOR_SYSTEM)",
        "status: enum (INCOMPLETE | IN_PROGRESS | COMPLETED | PENDING_APPROVAL | APPROVED | REJECTED)"
      ],
      "displayFormat": "Task Name (50 pts) [MEDIUM DIFFICULTY] - Validation: PHOTO"
    },
    "taskCompletionFlow": {
      "step1": "User marks task complete",
      "step2": "System checks validationMethod",
      "step3a": "IF photo/video required: show camera capture screen",
      "step3b": "IF device data: request permission + collect data",
      "step4": "Send to AI for validation",
      "step5": "Show result: APPROVED / REJECTED with reason",
      "step6": "If approved: award points, add to history, show celebration"
    },
    "historyEntryUpdates": {
      "newFields": [
        "pointsEarned: number",
        "pointsTier: string",
        "validationStatus: APPROVED | REJECTED | PENDING",
        "proof: { type: PHOTO | VIDEO | DEVICE_DATA, data: {} }",
        "aiValidationDetails: { confidence, reasoning, flags }"
      ],
      "display": "Show points earned, validation method, and confidence score"
    },
    "pointsDisplay": {
      "locations": [
        "Header/Dashboard - total points accumulated",
        "History page - points per entry",
        "Task item - points available for that task",
        "Achievement badge - milestones (100 pts, 500 pts, 1000 pts)"
      ]
    }
  }
}
```

### 5.2 In-App Camera Component

```json
{
  "cameraComponent": {
    "name": "TaskProofCapture",
    "purpose": "Capture photo/video for task validation",
    "features": [
      "Live preview",
      "Front/back camera toggle",
      "Photo capture button",
      "Video record button with timer",
      "Retake option",
      "Upload to server"
    ],
    "requirements": {
      "photo": {
        "maxSize": "10 MB",
        "formats": ["jpg", "png", "webp"],
        "minResolution": "640x480"
      },
      "video": {
        "maxSize": "100 MB",
        "formats": ["mp4", "mov", "webm"],
        "maxDuration": "5 minutes",
        "minResolution": "480p"
      }
    },
    "flow": [
      "User taps 'Upload Proof' on completed task",
      "Camera screen opens with task description displayed",
      "User captures photo or records video",
      "Preview screen shows captured media",
      "User confirms or retakes",
      "Upload to server + send to AI for validation",
      "Show loading state while AI processes",
      "Display result (approved/rejected with explanation)"
    ]
  }
}
```

---

## 6. Backend API Endpoints Required

```json
{
  "apiEndpoints": {
    "POST /api/tasks/complete": {
      "description": "Mark task as complete and initiate validation",
      "payload": {
        "taskId": "string",
        "validationMethod": "PHOTO | VIDEO | DEVICE_DATA",
        "proof": {
          "type": "PHOTO | VIDEO",
          "fileUrl": "string (S3 URL)",
          "fileName": "string"
        },
        "deviceData": {
          "type": "PHONE_INACTIVITY | APP_USAGE",
          "startTime": "ISO timestamp",
          "endTime": "ISO timestamp",
          "data": {}
        }
      },
      "response": {
        "taskId": "string",
        "validationStatus": "PENDING | APPROVED | REJECTED",
        "pointsEarned": "number (if approved)",
        "pointsTier": "string",
        "aiValidation": {
          "confidence": "0.0-1.0",
          "reasoning": "string",
          "redFlags": "string[]"
        }
      }
    },
    "POST /api/ai/validate-proof": {
      "description": "Send photo/video to AI for validation",
      "payload": {
        "taskType": "MEAL_PREP | WORKOUT | SHOPPING | CUSTOM",
        "proofType": "PHOTO | VIDEO",
        "fileUrl": "string",
        "taskDescription": "string (for custom tasks)"
      },
      "response": {
        "valid": "boolean",
        "confidence": "0.0-1.0",
        "pointsTier": "EASY | MEDIUM | SLIGHTLY_HARD | HARD | EXTREMELY_HARD",
        "reasoning": "string",
        "redFlags": "string[]"
      }
    },
    "POST /api/ai/validate-device-data": {
      "description": "Validate task using device data",
      "payload": {
        "taskType": "STUDY | SLEEP | MEDITATION | NO_PHONE_TIME",
        "startTime": "ISO timestamp",
        "endTime": "ISO timestamp",
        "plannedDuration": "number (minutes)",
        "deviceDataSummary": {
          "phoneInactivePercentage": "0.0-1.0",
          "appUsage": "{ appName: duration }",
          "wearableData": "{}"
        }
      },
      "response": {
        "valid": "boolean",
        "pointsTier": "string",
        "validationDetails": "string"
      }
    },
    "POST /api/ai/assign-points": {
      "description": "Auto-assign points tier to a task",
      "payload": {
        "taskName": "string",
        "taskDescription": "string",
        "plannedDuration": "number (minutes)",
        "completionProof": "PHOTO | VIDEO | DEVICE_DATA | HONOR_SYSTEM"
      },
      "response": {
        "pointsTier": "EASY | MEDIUM | SLIGHTLY_HARD | HARD | EXTREMELY_HARD",
        "pointsValue": "25 | 50 | 75 | 100 | 150",
        "reasoning": "string"
      }
    },
    "GET /api/user/points": {
      "description": "Get user's total points and breakdown",
      "response": {
        "totalPoints": "number",
        "pointsByTier": {
          "EASY": "number",
          "MEDIUM": "number",
          "SLIGHTLY_HARD": "number",
          "HARD": "number",
          "EXTREMELY_HARD": "number"
        },
        "recentEarnings": [
          {
            "taskName": "string",
            "pointsEarned": "number",
            "earnedAt": "ISO timestamp"
          }
        ]
      }
    }
  ]
}
```

---

## 7. Database Schema Updates

```json
{
  "databaseUpdates": {
    "Task": {
      "newFields": [
        "pointsTier: enum (EASY | MEDIUM | SLIGHTLY_HARD | HARD | EXTREMELY_HARD)",
        "pointsValue: number (25 | 50 | 75 | 100 | 150)",
        "validationMethod: enum (PHOTO | VIDEO | DEVICE_DATA | HONOR_SYSTEM)",
        "isProvable: boolean",
        "trackedApps: string[] (for study/device tasks)",
        "plannedDuration: number (minutes)"
      ]
    },
    "TaskCompletion": {
      "newFields": [
        "pointsEarned: number",
        "pointsTier: string",
        "validationStatus: enum (PENDING | APPROVED | REJECTED)",
        "proofType: enum (PHOTO | VIDEO | DEVICE_DATA | HONOR_SYSTEM)",
        "proofFileUrl: string (S3 URL)",
        "aiValidationResult: {",
        "  confidence: number,",
        "  reasoning: string,",
        "  redFlags: string[]",
        "}",
        "deviceDataSnapshot: { (for device-based validation)",
        "  phoneInactivePercentage: number,",
        "  appUsageSummary: object,",
        "  wearableData: object",
        "}"
      ]
    },
    "UserProfile": {
      "newFields": [
        "totalPoints: number",
        "pointHistory: [ { pointsEarned, taskId, earnedAt, tier } ]"
      ]
    }
  }
}
```

---

## 8. Implementation Roadmap

### Phase 1: Core Setup (Week 1-2)
- [ ] Add points tier system to database
- [ ] Update Task schema with validation methods
- [ ] Create in-app camera component
- [ ] Set up OpenAI Vision API integration

### Phase 2: Photo/Video Validation (Week 2-3)
- [ ] Implement photo capture UI
- [ ] Add video recording UI (max 10s-5min)
- [ ] Wire up AI validation for MEAL_PREP, WORKOUT, SHOPPING
- [ ] Display validation results in UI

### Phase 3: Device Data Validation (Week 3-4)
- [ ] Request phone activity permissions
- [ ] Implement SLEEP validation (phone inactivity check)
- [ ] Implement STUDY validation (study app tracking)
- [ ] Add optional wearable integration (Apple Health, Google Fit)

### Phase 4: UI & Points Display (Week 4)
- [ ] Show points value next to each task
- [ ] Display points earned in history
- [ ] Create points dashboard with total + breakdown
- [ ] Add points to user profile header

### Phase 5: Testing & Refinement (Week 5)
- [ ] Beta test with 50-100 users
- [ ] Refine AI prompts based on feedback
- [ ] Adjust point values based on user behavior
- [ ] Handle edge cases and fraud attempts

---

## 9. Security & Fraud Prevention

```json
{
  "fraudPrevention": {
    "photoValidation": [
      "Reverse image search check (detect stock photos)",
      "EXIF metadata check (verify photo is recent, from device camera)",
      "Image hash check (prevent duplicate submissions)",
      "AI confidence threshold (reject low-confidence validations)"
    ],
    "videoValidation": [
      "Timestamp check (verify video is recent)",
      "Deep fake detection (use specialized model if needed)",
      "Green screen detection (check for artificial backgrounds)",
      "Frame analysis (detect video splicing or speed-ups)"
    ],
    "deviceDataValidation": [
      "Permission checks (ensure device data access is authorized)",
      "Timestamp cross-validation (compare device logs with task times)",
      "Anomaly detection (flag suspicious patterns: 12+ hours of sleep claimed)",
      "Manual review queue (flag high-risk submissions for human review)"
    ],
    "rateLimiting": [
      "Max 10 task completions per hour",
      "Max 5 proof rejections before cooldown",
      "Manual review required for users with >50% rejection rate"
    ]
  }
}
```

---

## 10. Coder Checklist

When handing this to your AI coder, provide this checklist:

- [ ] Database migrations for new Task/TaskCompletion fields
- [ ] Points tier enum + constants
- [ ] In-app camera component with preview
- [ ] OpenAI Vision API wrapper function
- [ ] Device data collection helpers (iOS + Android)
- [ ] AI validation prompt templates
- [ ] Task validation logic (photo/video/device-specific)
- [ ] Points calculation and assignment
- [ ] UI updates (task list, history, points display)
- [ ] API endpoints (/complete, /validate-proof, /assign-points, /points)
- [ ] Error handling (validation failures, network issues, permissions)
- [ ] Testing suite (mock AI responses, device data simulation)
- [ ] Loading states and progress indicators
- [ ] Toast notifications for approval/rejection

---

## Questions for Your AI Coder

1. What's your preference for storing proof files? (AWS S3, Firebase Storage, or other?)
2. Do you want real-time AI validation or batch processing?
3. Should failed validations be instantly rejected or queued for manual review?
4. Do you have existing wearable integration? (helps plan Phase 3)
5. What's your target response time for validation? (<5s, <30s, etc.?)

---

**End of Specification**

This should give your coder everything they need. Let me know if you want me to elaborate on any section!
