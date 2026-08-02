# Grasp Content Voice Guide

**Read `human.md` first.** Every rule in the BeHuman guide applies to Grasp content. This document builds on top of it — defining how course content should sound, section by section.

---

## The Grasp Voice

A sharp friend who knows this subject cold. Not a professor lecturing. Not a textbook being formal. Not a YouTuber being hyper. Someone sitting across from you who starts with something you already know, reframes it, and suddenly the concept clicks.

Three layers blended:

1. **Curiosity hooks** — overview sections open with a story, a historical moment, or a surprising observation that pulls the reader in. The kind of thing a great teacher would say before class starts.
2. **Direct, specific explanations** — the teaching body is clear, grounded in real-world things the student already touches and sees. No fluff, no padding, no "it is important to note."
3. **Warm encouragement** — not cheerleader energy. Just honest reassurance that the student can handle this, that we build from scratch, that understanding comes before formulas. Never condescending.

### What the voice is NOT

- Not a textbook. No "In this section, we shall examine..."
- Not a hype machine. No "This mind-blowing concept will change how you see the world!"
- Not dumbed down. We respect the student's intelligence — we just don't assume prior knowledge.
- Not formula-first. Never drop a symbol or equation name the student hasn't been introduced to yet.

---

## Section-by-Section Rules

### `overview` — The Hook (2-4 sentences)

**Job:** Make the student want to read the explanation. Period.

**How:**
- Open with a story, a historical moment, a surprising everyday observation, or a question that reframes something familiar.
- Never open with a definition. Definitions are the least interesting part of any concept.
- Never open with "In this topic, we will learn about..."
- End with or include a `{{viz:diagram-XX}}` if there's a concept map for this topic.

**Good:**
> In 1589, Galileo climbed the Leaning Tower of Pisa with two balls — one heavy, one light — and dropped them together. They hit the ground at the same time. Everyone watching expected the heavy one to win. That moment — testing what everyone assumed — is physics.

**Bad:**
> Physics is the branch of natural science that studies matter and energy. It is one of the oldest academic disciplines. In this topic, we will learn about what physics is and why it matters.

**Good (math):**
> You split a pizza into 8 slices and eat 3. Your friend splits an identical pizza into 4 slices and eats 2. Who ate more? You just did fractions without knowing it.

**Bad (math):**
> Fractions are a fundamental concept in mathematics that represent parts of a whole. They are used in everyday life and are essential for advanced mathematics.

**Good (biology):**
> Right now, without you thinking about it, your body is replacing about 3.8 million cells every second. Old ones die, new ones take their place. You are literally not the same person you were yesterday — at a cellular level.

**Bad (biology):**
> Cells are the basic structural and functional units of all living organisms. Understanding cell biology is crucial for understanding life itself.

### `explanation` — The Teaching Body (150-250 words)

**Job:** Make the concept understood. Not memorized — understood.

**How:**
- Start with what the student can see, touch, or feel. Build from there.
- One idea per paragraph. Short paragraphs. Each one lands a point before the next one starts.
- Use everyday comparisons the student already has — phones, cars, cooking, sports, weather. Not lab equipment.
- Equations and formulas appear only AFTER the idea they represent is already clear in plain language. Never introduce a symbol the student hasn't met in a previous topic.
- Embed `{{viz:...}}` markers where a visual would land at the right moment — after the idea, not before.
- Reassurance is fine but keep it brief and honest. One line, not a paragraph.

**Rhythm rule:** Vary sentence length. A long sentence that builds an idea. Then a short one that lands it. Read it out loud — if it drones, break it up.

**Good:**
> Physics is the study of how things move, why they stop, what holds them together, and what tears them apart. Matter, energy, forces, motion — the basic machinery of everything you see and a lot you don't.
>
> That sounds massive. But it starts with things you already notice. Drop your phone on your bed versus dropping it on concrete — same phone, same height, very different outcome. Physics explains the difference.

**Bad:**
> Physics is a comprehensive discipline encompassing the study of matter, energy, and the fundamental forces of nature. It plays a pivotal role in our understanding of the universe and has numerous applications in modern technology. The field of physics has evolved significantly over centuries, with contributions from many brilliant scientists.

### `keyPoints` — Memory Anchors (3-5 items)

**Job:** After the student closes the app, these are the three things that stick.

**How:**
- Each point is one clear sentence. Not a paragraph. Not a definition.
- Capture the *insight*, not the textbook phrasing.
- Avoid repeating the overview or explanation word-for-word. Compress the idea into its sharpest form.

**Good:**
```json
[
  "Physics studies matter, energy, force, and motion — the basic machinery behind everything",
  "It starts from everyday observations — things you already notice but haven't named yet",
  "Physics doesn't just explain what happened — it predicts what will happen next"
]
```

**Bad:**
```json
[
  "Physics is the study of matter and energy",
  "Physics is important for technology",
  "Physics uses the scientific method"
]
```

The bad version is technically correct but says nothing that would stick. The good version gives the student language they can actually think with.

### `whyItMatters` — The Motivation (2-3 sentences)

**Job:** Connect the concept to the student's actual life. Not "this is important for your career." Why should they care *right now*.

**How:**
- Ground it in something real and specific. Not "this has many applications."
- If possible, name a thing they used today that depends on this concept.
- Brief. Two to three sentences max. Don't re-explain the topic.

**Good:**
> You already do physics intuitively every time you catch a ball or guess that hot chai will cool down if you leave it. This course gives you the precise language for what you already feel — and the tools to predict things your intuition can't reach.

**Bad:**
> Physics is essential for understanding the world around us. It has applications in engineering, medicine, and technology. Studying physics will enhance your analytical thinking skills.

---

## Other Asset Files

### Quiz questions (`quiz.json`)

- Write questions a student can answer after reading the topic — not gotcha trivia.
- Wrong options should be plausible mistakes, not obviously silly.
- Explanations teach — don't just say "A is correct." Explain *why* the wrong answers fail.

**Good:**
```json
{
  "question": "You drop a bowling ball and a tennis ball from the same height in a vacuum. What happens?",
  "options": [
    "They hit the ground at the same time",
    "The bowling ball hits first because it's heavier",
    "The tennis ball hits first because it's lighter",
    "Neither falls because there's no air"
  ],
  "correctIndex": 0,
  "explanation": "In a vacuum, there's no air resistance. Gravity accelerates all objects at the same rate regardless of mass — exactly what Galileo demonstrated."
}
```

### Flashcards (`flashcards.json`)

- Front: a question a student would actually ask themselves when reviewing.
- Back: the answer in one or two sentences. Specific enough to be useful, short enough to scan.
- Never put the topic name as the question. "What is [Topic Name]?" is lazy.

**Good:**
```json
{
  "front": "What separates physics from just observing things?",
  "back": "Physics doesn't just describe what happens — it predicts what will happen next, using measurable quantities and mathematical rules."
}
```

**Bad:**
```json
{
  "front": "What is physics?",
  "back": "Physics is a branch of science that studies matter and energy."
}
```

### Exercises (`exercises.json`)

- Prompt should be a clear, specific problem. Not "discuss" or "explain."
- Solution walks through the thinking, not just the answer. Show the reasoning steps.
- Hints guide without giving it away — each hint gets closer.

### Examples (`examples.json`)

- Title names the real-world scenario, not the concept. "Catching a Cricket Ball" not "Example of Force."
- Content describes the scenario first, then reveals the physics inside it.
- Keep it to 2-3 sentences. The example is a window, not another lecture.

---

## Domain-Specific Notes

### Physics / Chemistry
- Lead with what they can observe — dropping things, mixing liquids, seeing colors.
- Equations earn their entrance. Concept first, math confirms.

### Mathematics
- Lead with a problem or puzzle they can attempt before knowing the method.
- "Here's a situation. Try to figure it out. Now here's the tool that makes it easy."

### Biology
- Lead with the student's own body or something alive near them.
- Numbers surprise people in biology — use them. "Your heart beats 100,000 times a day."

### Computer Science
- Lead with what they already use — apps, search engines, social media.
- Then pull back the curtain on how it works underneath.

### Economics / Psychology / Philosophy
- Lead with a decision they've made or a behavior they've noticed.
- These are "why do people do that?" subjects — start with the "that."

---

## The Read-Aloud Test

Before shipping any topic content, read the overview and first paragraph of the explanation out loud. Ask:

1. Would a sharp friend actually say this? Or does it sound like it's performing?
2. Does it start where the interesting part starts? Or is there throat-clearing?
3. Could this paragraph describe any topic if you swapped the nouns? If yes, it's too generic. Add the detail that makes it specific to *this* concept.
4. Did you name a formula or concept the student hasn't met yet? If yes, remove it or explain it from scratch in this topic.

If it passes all four, ship it.
