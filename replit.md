# Kaio - AI Life Coach

## Overview

Kaio is a Next.js-based AI-powered life coach application that generates personalized weekly plans for fitness, nutrition, and lifestyle goals. The application provides users with daily schedules including meals, workouts, hydration reminders, beard care routines, and lifestyle tips. It features a full 7-day weekly planning system with automated grocery list generation from all meals, day-by-day navigation with independent progress tracking, event adjustment capabilities, and historical data persistence.

## Recent Updates (October 2025)

**Migration to Replit**
- Configured Next.js dev server to run on port 5000 with 0.0.0.0 binding for Replit compatibility
- Set up workflow for automatic server startup
- Configured OpenRouter API key via Replit Secrets

**Enhanced Questionnaire**
- Added "Do you take any supplements?" question to capture supplement intake for AI planning
- Added "Anything else you'd like to add?" open-ended question for additional context and upcoming events

**Weekly Planning Features**
- AI now generates complete 7-day plans (Monday through Sunday) in a single request
- Day-by-day navigation with arrows and day selector buttons
- Independent checklist completion tracking for each day of the week
- Event adjustment feature allowing users to modify plans for special occasions (e.g., "party tomorrow night")

**Grocery List Enhancements**
- Automatically generated from all meals across the entire week
- Dynamic category system: AI can create any category type (snacks, beverages, supplements, etc.)
- Predefined category colors for common types (produce, protein, dairy, grains, supplements, snacks, beverages) with fallback colors for new categories
- Individual items can be checked off as purchased
- Progress tracking shows percentage of items acquired
- Full item management: users can edit item names, change categories, or delete items
- Categories are normalized (lowercased and trimmed) to prevent duplicates from casing differences

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Rendering**
- Built on Next.js 16 (canary) with React 19
- Uses React Server Components (RSC) with TypeScript
- Client-side state management for interactive components
- App Router architecture with a single-page application feel

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style variant)
- Tailwind CSS 4.x for styling with custom OKLCH color system
- Framer Motion for animations and transitions
- Lucide React for iconography

**State Management**
- Zustand for global state management with persistence middleware
- LocalStorage-based persistence for offline-first functionality
- Stores user profiles, weekly plans, grocery lists, and historical data
- Automatic plan regeneration based on configurable reset times

**Navigation Pattern**
- Responsive dual-navigation: bottom nav for mobile, side nav for desktop
- Six main views: Dashboard, Goals, Grocery List, History, Settings, and About
- View-based routing without URL changes (SPA-style)
- AnimatePresence for smooth view transitions

### Backend Architecture

**API Layer**
- Next.js Server Actions for AI plan generation
- OpenRouter API integration for LLM-based plan creation
- Server-side validation using Zod schemas
- Structured JSON output from AI with type safety

**AI Integration**
- Uses OpenRouter API (configured via OPENROUTER_API_KEY environment variable)
- Generates weekly plans based on user questionnaire responses
- Includes meal planning with nutritional information
- Creates categorized grocery lists from meal plans
- Provides personalized workout routines and lifestyle recommendations

**Data Models**
- `WeeklyPlan`: Contains 7 daily plans (Monday-Sunday) with start date tracking
- `DailyPlan`: Wake time, hydration goals, meals, workout, checklist items
- `Meal`: Name, calories, protein, details
- `GroceryItem`: Name, category (string - any value), purchased status
- `UserProfile`: Comprehensive questionnaire data including fitness goals, dietary preferences, supplements, physical stats, beard care preferences, schedule, and additional context
- `WeeklyChecklistCompletion`: Map of day names to boolean arrays for independent per-day progress tracking

### Data Storage

**Client-Side Persistence**
- Zustand persist middleware with localStorage
- Stores: user goals, weekly plans, current day index, grocery lists, completion states, and historical data
- Automatic hydration on app initialization
- No backend database - fully client-side application

**Data Structure**
- Weekly plan regeneration triggered by date changes or manual refresh
- Historical tracking of completed daily plans with completion rates
- Configurable reset times (midnight or 6 AM)
- Grocery list with category grouping and purchase tracking

### External Dependencies

**AI Services**
- OpenRouter API for LLM access (requires OPENROUTER_API_KEY)
- Structured output generation with Zod schema validation
- Handles API errors gracefully with user feedback

**UI Libraries**
- @radix-ui components: dialog, checkbox, select, toast, progress, and more
- Framer Motion for declarative animations
- date-fns for date manipulation
- Geist fonts (Sans and Mono) from Google Fonts

**Development Tools**
- TypeScript for type safety
- ESLint for code quality
- Next.js development server on port 5000 (bound to 0.0.0.0 for Replit)
- PostCSS with Tailwind CSS processing
- pnpm for package management

**Replit Configuration**
- Dev server runs on port 5000 with 0.0.0.0 host binding
- Workflow configured for automatic server startup
- Environment secrets managed via Replit Secrets (OPENROUTER_API_KEY)

**Theme System**
- next-themes for dark/light mode support
- System preference detection
- CSS variable-based theming with OKLCH color space
- Persistent theme preference

### Key Architectural Decisions

**Why Client-Side Only Storage**
- Simplifies deployment and reduces infrastructure costs
- Provides instant data access without network latency
- Ensures user privacy with local-only data storage
- Suitable for personal use application without multi-device sync requirements

**Why Zustand Over Context API**
- Better performance for frequent state updates
- Built-in persistence middleware
- Simpler API with less boilerplate
- TypeScript-friendly with excellent type inference

**Why Server Actions Over API Routes**
- Simplified API creation without separate endpoint definitions
- Built-in TypeScript support and type safety
- Reduced client-side bundle size (code runs on server)
- Native Next.js integration for better DX

**Why Radix UI Primitives**
- Accessibility built-in (ARIA patterns, keyboard navigation)
- Unstyled components allow full design control
- Robust component behavior without implementation complexity
- Well-maintained with TypeScript support

**Why OpenRouter**
- Flexible LLM provider without vendor lock-in
- Single API for multiple AI models
- Cost-effective compared to direct provider APIs
- Standardized interface for model switching