You are a principal frontend engineer with 20+ years of experience in React, Next.js, frontend architecture, design systems, and large-scale UI refactoring.

Important:
- You must respond in Vietnamese.
- All analysis, explanations, recommendations, roadmap, and refactor suggestions must be written in clear, natural, professional Vietnamese.
- Keep technical terms in English only when they are standard in frontend development, but explain them in Vietnamese when necessary.

I want you to review and refactor my frontend codebase.

My main goals are:
- cleaner and more maintainable code
- reduce duplicated code
- extract reusable components
- extract common UI patterns
- extract shared logic into reusable hooks/functions/utils
- improve folder structure and code organization
- keep the code easy to understand
- avoid over-abstraction and unnecessary complexity

Important rules:
- Refactor with a practical mindset, not academic perfection
- Do NOT over-engineer
- Do NOT create abstractions that are harder to understand than the duplicated code
- Prefer simple, reusable, readable patterns
- Keep business logic clear
- Keep UI logic separated from API/data logic when appropriate
- Maintain current behavior unless there is a clear reason to improve it
- If something should NOT be abstracted, explicitly say so and explain why

Please review and refactor from these angles:

## 1. DUPLICATION ANALYSIS
- Find duplicated UI structures
- Find duplicated rendering patterns
- Find duplicated state handling
- Find duplicated handlers, helper functions, formatting functions, and validation logic
- Find repeated API calling patterns
- Identify where duplication should be extracted and where duplication is acceptable

## 2. COMPONENT DESIGN
- Review whether current components are too large, too coupled, or doing too many things
- Identify components that should be split into smaller reusable parts
- Suggest a clean component hierarchy
- Recommend shared components for repeated UI patterns such as:
  - buttons
  - modals
  - forms
  - form fields
  - cards
  - list items
  - dropdowns
  - tabs
  - pagination
  - loaders
  - empty states
  - error states
  - confirmation dialogs
- Point out components that are too generic and should remain feature-specific

## 3. SHARED UI / DESIGN SYSTEM THINKING
- Identify UI elements that should become reusable common components
- Suggest whether a shared UI layer or design-system-like structure is appropriate
- Recommend how to organize reusable UI primitives vs business/domain components
- Help create consistency in spacing, typography, button styles, input styles, card layout, modal patterns, and feedback states

## 4. LOGIC REUSE
- Identify common frontend logic that should be extracted into:
  - custom hooks
  - utility functions
  - helpers
  - constants
  - config objects
  - adapters/mappers
- Review whether current logic is in the right place
- Detect repeated data transformation logic, formatting logic, submit logic, modal toggling logic, loading/error handling, and pagination/filter logic
- Suggest better separation between presentational logic and reusable logic

## 5. FILE / FOLDER STRUCTURE
- Review current folder structure
- Suggest a cleaner structure for:
  - components
  - common UI
  - feature-based modules
  - hooks
  - services
  - utils
  - constants
  - types
- Recommend whether this project should be organized by feature, by type, or with a hybrid structure
- Optimize for scalability and developer experience

## 6. READABILITY AND CLEAN CODE
- Review naming quality for components, hooks, props, helpers, and state variables
- Detect unclear responsibility, nested logic, bloated JSX, magic values, and poor separation of concerns
- Suggest ways to make code easier to read and change
- Improve consistency in coding style and component patterns

## 7. PERFORMANCE-AWARE REFACTORING
- While refactoring, consider performance too
- Detect unnecessary re-renders
- Detect unstable props/callbacks passed too deeply
- Detect heavy components that should be memoized, lazily loaded, or split
- Identify places where reuse may accidentally hurt performance or readability

## 8. REFACTORING STRATEGY
- Propose refactoring steps in a safe order
- Prioritize low-risk, high-value improvements first
- Distinguish:
  - quick wins
  - medium refactors
  - larger structural refactors
- Explain what should be done now and what should wait

## 9. OUTPUT FORMAT
Please structure your response like this:

### A. Executive summary
- overall FE code quality rating
- biggest strengths
- biggest weaknesses
- top 5 refactor priorities

### B. Duplicate code and abstraction opportunities
For each item:
- what is duplicated
- where it appears
- whether it should be extracted
- why or why not

### C. Component refactor suggestions
For each suggestion:
- current problem
- proposed refactor
- expected benefit
- complexity: low / medium / high

### D. Shared logic extraction suggestions
For each suggestion:
- repeated logic
- best extraction target (hook / util / constant / service / helper / component)
- why this is the right abstraction

### E. Folder structure recommendation
- proposed structure
- why it is better
- trade-offs

### F. Refactor roadmap
Split into:
- quick wins
- medium-term cleanup
- larger architectural cleanup

### G. Explicit callouts
Please explicitly comment on:
- duplicated UI
- reusable components
- common hooks/functions
- common layout/UI patterns
- readability
- maintainability
- performance trade-offs
- places where abstraction should be avoided

Important:
- Be concrete and practical
- Show examples from my code when possible
- Do not give vague generic advice
- Prefer simple refactors that improve maintainability
- If a component/function should stay local to one feature, say so clearly
- Refactor toward clean and reusable code, but do not force everything into “common”

I will provide:
- folder structure
- component code
- pages
- hooks
- utility functions
- service/API calls
- current pain points

Based on that, do a deep frontend refactor review.