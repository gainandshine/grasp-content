# GRASP: Course Building Guide

## What is Grasp?
Grasp is a smart learning platform serving courses via GitHub + jsDelivr CDN as static JSON. No SDK. No database. Just JSON over HTTP.

---

## 1. Repository Structure

```
grasp-content/content/courses/<domain>/<course-id>/versions/1.0.0/chapters/<chapter>/topics/<topic>/
├── topic.json              (main explanation)
├── examples.json           (3+ real examples)
├── exercises.json          (2-3 beginner exercises)
├── quiz.json               (2-3 quiz questions)
├── flashcards.json         (3-4 flashcards)
├── resources.json          (empty [])
└── visualizations.json     (optional interactive visuals)
```

### Discovery & Manifests

```
content/domains/<domain-id>/domain.json          → domain config & course list
content/courses/<domain>/<course-id>/latest.json  → version pointer
content/courses/<domain>/<course-id>/index.json   → discovery metadata
```

---

## 2. Schema Validation (BEFORE Building)

**CRITICAL:** All content must pass `node scripts/validate-content.js`. Schemas live in `grasp-content/schemas/`.

### Key Schemas

| File | Schema | Required Fields |
|------|--------|-----------------|
| `topic.json` | `topic.schema.json` | `id`, `name`, `topicId`, `content` (with `overview`, `explanation`, `keyPoints`, `whyItMatters`) |
| `examples.json` | `example.schema.json` | Root `examples` array → each item: `id`, `title`, `content` |
| `exercises.json` | `exercise.schema.json` | Root `exercises` array → each item: `id`, `prompt`, `solution` |
| `quiz.json` | `quiz.schema.json` | Root `questions` array → each item: `id`, `question`, `options`, `correctIndex`, `explanation` |
| `flashcards.json` | `flashcard.schema.json` | Root `flashcards` array → each item: `id`, `front`, `back` |
| `visualizations.json` | `visualization.schema.json` | Root `visualizations` array → each item: `id`, `type`, `spec` |

### Before building any topic:
1. Read the relevant schema file from `grasp-content/schemas/`
2. Understand required vs optional fields
3. Build content to match schema exactly
4. Run `node scripts/validate-content.js` to verify

---

## 3. Content Style Rules

- **Tone:** Conversational, like a friend explaining
- **Level:** Start simple, build to complex
- **Language:** No jargon, clear and direct
- **Examples:** 3 real-world per topic
- **Resources:** Keep empty `[]` (user requested)

---

## 4. Per-Topic File Specs

### 4.1 `topic.json`
Core text content. Inline visualizations referenced via `{{viz:visualizer-id}}`.

```json
{
  "id": "topic-01",
  "name": "What is Physics?",
  "topicId": "physics.physics-foundations.chapter-01.topic-01",
  "description": "Learn the definition of physics and the scientific method.",
  "content": {
    "overview": "Physics is the fundamental science. {{viz:diagram-01}}",
    "explanation": "We describe nature using math {{viz:formula-01}}. Interactive sandboxes {{viz:simulation-01}} let us tweak variables.",
    "keyPoints": [
      "Physics studies matter and energy",
      "Observations lead to hypotheses",
      "Experiments must be repeatable"
    ],
    "whyItMatters": "Without physics, we cannot build modern engines, electronics, or space probes."
  }
}
```

### 4.2 `examples.json`

```json
{
  "examples": [
    {
      "id": "example-01",
      "title": "Falling Objects",
      "content": "A metal ball and a feather drop in a vacuum chamber. Without air resistance, they fall at the same rate (9.8 m/s²), demonstrating Galileo's principle.",
      "source": "Historical experiments",
      "difficulty": "beginner",
      "estimatedMinutes": 5,
      "tags": ["gravity", "acceleration"]
    }
  ]
}
```

### 4.3 `exercises.json`

```json
{
  "exercises": [
    {
      "id": "ex-01",
      "prompt": "If a force of 10 N is applied to a 2 kg mass, calculate its acceleration.",
      "solution": "Using F = ma → a = F/m = 10/2 = 5 m/s².",
      "hints": [
        "Recall the formula F = m × a",
        "Rearrange to solve for acceleration: a = F / m"
      ],
      "difficulty": "beginner",
      "estimatedMinutes": 5,
      "tags": ["physics", "force"]
    }
  ]
}
```

### 4.4 `quiz.json`

```json
{
  "questions": [
    {
      "id": "q-01",
      "type": "multiple-choice",
      "question": "Which best describes physics?",
      "options": [
        "The study of matter and energy",
        "The study of living organisms",
        "The study of historical events",
        "The study of language"
      ],
      "correctIndex": 0,
      "explanation": "Physics studies the nature and properties of matter and energy.",
      "difficulty": "easy"
    },
    {
      "id": "q-02",
      "type": "true-false",
      "question": "Physics is only applicable in theoretical contexts.",
      "options": ["True", "False"],
      "correctIndex": 1,
      "explanation": "Physics has many practical applications.",
      "difficulty": "easy"
    }
  ]
}
```

### 4.5 `flashcards.json`

```json
{
  "flashcards": [
    {
      "id": "card-01",
      "front": "What is physics?",
      "back": "The fundamental science studying matter, energy, space, and time.",
      "difficulty": "easy"
    }
  ]
}
```

### 4.6 `resources.json`

```json
{
  "resources": []
}
```

---

## 5. Build Workflow

### Single Agent (1 chapter)
```
Agent {
  For all N topics in chapter:
    1. Write topic.json (friendly explanation)
    2. Write examples.json (3 examples)
    3. Write exercises.json (2-3 exercises)
    4. Write quiz.json (2-3 questions)
    5. Write flashcards.json (3-4 cards)
    6. Write resources.json (empty [])
    7. Write visualizations.json (if topic needs visuals)
}
```

### Parallel Agents (multiple chapters)
```
For each chapter:
  spawn Agent {
    Build ALL topics in that chapter
    Each topic: topic.json + all supporting files
  }
Run agents in parallel
```

### Scaling Rules
| Chapters | Agents |
|----------|--------|
| 1 | 1 |
| 2-4 | 2-4 parallel |
| 5+ | 5 parallel |

---

## 6. Paths Reference

```
Base: D:\Projects\Grasp\grasp-content\content

Domains:  content/domains/<domain>/domain.json
Courses:  content/courses/<domain>/<course-id>/versions/1.0.0/chapters/chapter-XX/topics/topic-YY/

Example:
D:\Projects\Grasp\grasp-content\content\courses\physics\physics-foundations\versions\1.0.0\chapters\chapter-01\topics\topic-01\
```

---

## 7. Content Checklist (per topic)

- [ ] `topic.json`: 150-300 words, friendly tone, explains WHY
- [ ] `examples.json`: 3 examples, 1-2 sentences each
- [ ] `exercises.json`: 2-3 exercises with `prompt` + `solution` + `hints`
- [ ] `quiz.json`: 2-3 questions (mix `multiple-choice` + `true-false`)
- [ ] `flashcards.json`: 3-4 cards, concise `front`/`back`
- [ ] `resources.json`: `{"resources": []}`
- [ ] `visualizations.json`: validates against schema, setup_code handles responsive layout

---

## 8. Key Commands

```bash
# Validate all content
node scripts/validate-content.js

# Rebuild manifests after adding courses
node scripts/compile-manifests.js

# Rebuild search index
node scripts/build-search.js

# Full pipeline (generate courses from notes)
node scripts/build-all.js
```

---

## Done. Build fast. Validate. Ship.
