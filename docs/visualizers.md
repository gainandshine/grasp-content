# Grasp Content and Visualizer Specification Guide

This guide details the curriculum schema format, Markdown parsing rules, and specifications for all visualizer engines in Grasp. It explains how to declare courses, structure topics, format assets, and write custom setup code for interactive elements.

---

## 1. Content Repository Architecture

Courses in Grasp are organized by domain under `content/courses/<domain>/`. For each domain, the directory structure is:

```
content/courses/<domain>/
├── domain.json                # Domain configuration and course listing
├── courses.json               # Recompiled manifest of all courses in the domain
└── <course-id>/
    ├── latest.json            # Version tracking metadata
    ├── index.json             # Discovery and status summary
    └── versions/
        └── 1.0.0/
            ├── course.json    # Full course structure (chapters, topics)
            └── chapters/
                └── chapter-01/
                    ├── chapter.json
                    └── topics/
                        └── topic-01/
                            ├── topic.json          # Main text content & viz markers
                            ├── visualizations.json # Visualization library specs
                            ├── examples.json       # Interactive examples
                            ├── flashcards.json     # Revision cards
                            ├── quiz.json           # Multiple-choice & TF questions
                            └── exercises.json      # Step-by-step challenges
```

### 1.1 Course Configurations & Manifests

#### `domain.json` (under `content/domains/<domain-id>/domain.json`)
Defines the domain metadata and lists the courses included in it:
```json
{
  "id": "physics",
  "name": "Physics",
  "description": "The natural science that studies matter, motion, energy, and force.",
  "courses": ["physics-foundations"],
  "metadata": {
    "icon": "atom",
    "color": "#DC2626",
    "order": 2
  }
}
```

#### `latest.json` (under `content/courses/<domain-id>/<course-id>/latest.json`)
Defines the latest version of the course content:
```json
{
  "latest": "1.0.0",
  "minimumSupported": "1.0.0",
  "schemaVersion": "1.0.0",
  "releasedAt": "2026-08-02T10:40:27.421Z"
}
```

#### `index.json` (under `content/courses/<domain-id>/<course-id>/index.json`)
Used for course discovery:
```json
{
  "id": "physics-foundations",
  "title": "Physics Foundations",
  "version": "1.0.0",
  "domain": "physics",
  "difficulty": "beginner",
  "estimatedHours": 20,
  "chapters": 10,
  "topics": 66,
  "updatedAt": "2026-08-02T10:40:27.421Z"
}
```

---

## 2. Topic Files Specification

Each topic requires a set of JSON files under `chapters/chapter-XX/topics/topic-XX/`.

### 2.1 `topic.json`
Houses the core text content of the topic. Inline visualizations are referenced using the `{{viz:visualizer-id}}` syntax.

```json
{
  "id": "topic-01",
  "name": "Introduction to Physics",
  "topicId": "physics.physics-foundations.chapter-01.topic-01",
  "description": "Learn the definition of physics and the scientific method.",
  "content": {
    "overview": "Physics is the fundamental science. {{viz:diagram-01}}",
    "explanation": "We describe nature using mathematical expressions like {{viz:formula-01}}. Interactive sandboxes {{viz:simulation-01}} allow us to tweak variables in real time.",
    "keyPoints": [
      "Physics studies matter and energy {{viz:diagram-02}}",
      "Observations lead to hypotheses",
      "Experiments must be repeatable"
    ],
    "whyItMatters": "Without physics, we cannot build modern engines, electronics, or space probes."
  }
}
```

#### Markdown Formatting Rules
The renderer parses basic Markdown tags from text sections:
*   **Headers**: `# Header 1`, `## Header 2`, `### Header 3` (supports optional leading whitespace).
*   **Blockquotes**: `> Text here` (supports optional leading whitespace).
*   **Styling**: `**bold**` and `*italic*`.
*   **Inline Code**: `` `code` ``.
*   **Block Code**: ` ```javascript\ncode\n``` ` (supports syntax highlighting).
*   **Links**: `[Label](url)`.
*   **Lists**: `- List item` or `* List item` or `1. List item`.

---

### 2.2 `visualizations.json`
Defines the visualizer specs referenced in the topic content.

```json
{
  "visualizations": [
    {
      "id": "formula-01",
      "type": "formula",
      "title": "Newton's Second Law",
      "description": "Relationship between force, mass, and acceleration",
      "spec": {
        "main_latex": "F = m \\cdot a",
        "steps": [
          { "latex": "F", "explanation": "Net force vector acting on the mass (Newtons)" },
          { "latex": "m", "explanation": "Inertial mass of the object (Kilograms)" },
          { "latex": "a", "explanation": "Acceleration vector (Meters per second squared)" }
        ]
      }
    }
  ]
}
```

---

### 2.3 Supporting Topic Assets

*   **`examples.json`**: Practical examples for student study.
*   **`flashcards.json`**: Quick review cards.
*   **`quiz.json`**: Assessment questions. Supports `multiple-choice` or `true-false`.
*   **`exercises.json`**: Step-by-step math or reasoning problems.

---

## 3. Visualizers Reference & Setup Code APIs

Visualizations in Grasp run inside isolated WebViews (with the exception of `formula` which uses native MathJax/KaTeX assets where possible, and text layouts). 

---

### 3.1 `3d` (WebGL 3D Engine)
Renders a 3D interactive view using **Three.js** and **OrbitControls**.

#### JSON Specification
```json
{
  "id": "3d-model-01",
  "type": "3d",
  "title": "Spinning Cube Model",
  "description": "An interactive 3D box demonstrating rotational frames",
  "spec": {
    "setup_code": "var geom = new api.THREE.BoxGeometry(1.5, 1.5, 1.5);\nvar mat = new api.THREE.MeshPhongMaterial({ color: 0xE8593C });\nvar mesh = new api.THREE.Mesh(geom, mat);\napi.group.add(mesh);\nreturn {\n  update: function(t) {\n    mesh.rotation.x = t * 1.5;\n    mesh.rotation.y = t * 2.0;\n  }\n};"
  }
}
```

#### API Environment (`api` object)
The environment injects a global `api` parameter containing:
*   `api.THREE`: Reference to the loaded `THREE` library object.
*   `api.scene`: The root `THREE.Scene` instance.
*   `api.camera`: The `THREE.PerspectiveCamera` instance.
*   `api.renderer`: The `THREE.WebGLRenderer` instance.
*   `api.controls`: The `THREE.OrbitControls` instance.
*   `api.group`: A `THREE.Group` pre-added to the scene. **Always add your meshes to this group** so the camera can auto-calculate bounding boxes and auto-center the view.
*   `api.document`: The HTML DOM Document.

#### Return Format
The setup code function must return an object with an optional `update` callback:
```javascript
return {
  update: function(t) {
    // Runs on every frame.
    // 't' is an incrementing timer (approx. 0.01 per frame).
  }
};
```

---

### 3.2 `2d-anim` (Canvas 2D Animation Engine)
Renders dynamic, high-performance 2D Canvas visualizations with **Anime.js** and **D3.js**.

#### JSON Specification
```json
{
  "id": "wave-animation",
  "type": "2d-anim",
  "title": "Sine Wave Propagation",
  "spec": {
    "setup_code": "return {\n  draw: function(ctx, W, H, t, dt) {\n    ctx.fillStyle = '#FFFFFF';\n    ctx.fillRect(0, 0, W, H);\n    ctx.strokeStyle = '#3B82F6';\n    ctx.lineWidth = 3;\n    ctx.beginPath();\n    for (var x = 0; x < W; x++) {\n      var y = H/2 + Math.sin(x * 0.03 + t * 0.05) * 50;\n      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n};"
  }
}
```

#### API Environment (`api` object)
*   `api.ctx`: The canvas `CanvasRenderingContext2D`.
*   `api.width`: The layout width (`W`).
*   `api.height`: The layout height (`H`).
*   `api.anime`: Reference to **Anime.js**.
*   `api.d3`: Reference to **D3.js**.
*   `api.Vector(x, y)`: 2D vector class. Includes `add(v)`, `sub(v)`, `mult(n)`, `div(n)`, `mag()`, `normalize()`, `dot(v)`.
*   `api.drawArrow(x1, y1, x2, y2, color, strokeWidth)`: Helper to draw mathematical vector arrows.
*   `api.drawLine(x1, y1, x2, y2, color, strokeWidth, dashed)`: Helper to draw grid lines.
*   `api.drawCircle(x, y, radius, color, isFilled)`: Helper to draw circular nodes or points.
*   `api.drawGrid(step, color)`: Helper to draw background grids.

#### Return Format
The setup code must return an object with a `draw` function:
```javascript
return {
  draw: function(ctx, W, H, t, dt) {
    // ctx: CanvasRenderingContext2D
    // W, H: Dimensions
    // t: An incrementing frame count (increments by 1 each frame)
    // dt: Time elapsed since the last frame in seconds
  }
};
```

---

### 3.3 `simulation` (Interactive Sandbox Engine)
The most advanced engine. Generates interactive simulations with custom user controls (sliders, switches, dropdowns) and handles canvas drag/drop coordinates natively.

#### JSON Specification
```json
{
  "id": "mass-spring-sim",
  "type": "simulation",
  "title": "Spring Oscillation Sandbox",
  "spec": {
    "controls": [
      { "id": "gravity", "type": "slider", "label": "Gravity", "default": 9.8, "min": 0, "max": 20, "step": 0.1 },
      { "id": "damping", "type": "slider", "label": "Damping", "default": 0.2, "min": 0, "max": 1, "step": 0.05 },
      { "id": "runSim", "type": "toggle", "label": "Active", "default": true }
    ],
    "setup_code": "var pos = 100; var vel = 0;\nreturn {\n  init: function(api) {\n    pos = 100; vel = 0;\n  },\n  update: function(dt, t, controls) {\n    if (!controls.runSim) return;\n    var force = -0.5 * pos - controls.damping * vel;\n    vel += force * dt;\n    pos += vel * dt;\n  },\n  draw: function(api) {\n    var ctx = api.ctx; var W = api.width; var H = api.height;\n    ctx.fillStyle = '#FAFAFA'; ctx.fillRect(0, 0, W, H);\n    api.drawGrid(20, '#F3F4F6');\n    api.drawCircle(W/2, H/2 + pos, 20, '#EC4899', true);\n    api.drawLine(W/2, 0, W/2, H/2 + pos, '#9CA3AF', 2, true);\n  },\n  onControlChange: function(id, val, controls) {\n    if (id === 'damping') console.log('New damping:', val);\n  }\n};"
  }
}
```

#### Control Object Schema
Each control is defined as:
```typescript
interface SimulationControl {
  id: string;
  type: 'slider' | 'toggle' | 'button' | 'dropdown';
  label: string;
  default: number | boolean | string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}
```

#### API Environment (`api` object)
Extends the `2d-anim` canvas API:
*   `api.canvas`: The raw HTML Canvas element.
*   `api.ctx`: The context rendering state.
*   `api.width` / `api.height`: Boundaries of the simulation viewport.
*   `api.drag`: Live pointer tracking data structure:
    *   `api.drag.isDragging`: Boolean flag indicating if active touch/click is down.
    *   `api.drag.startX` / `api.drag.startY`: Where the drag began.
    *   `api.drag.x` / `api.drag.y`: Current coordinates of the pointer.
*   *Drawing Helpers*: Includes `Vector`, `drawArrow`, `drawLine`, `drawCircle`, and `drawGrid`.

#### Return Format
The setup code must return an object implementing any of these life-cycle hooks:
```javascript
return {
  init: function(api) {
    // Called when the simulation mounts or is reset
  },
  update: function(dt, time, controls) {
    // Called on every frame. Update variables here.
    // dt: seconds elapsed since last frame
    // time: accumulated elapsed seconds (factors in playback speed)
    // controls: map of control states keyed by control ID (e.g. controls.gravity)
  },
  draw: function(api) {
    // Renders visual shapes. Use api.ctx or helper methods.
  },
  onControlChange: function(id, value, controls) {
    // Triggers immediately when a user tweaks a slider/switch
  },
  onDragStart: function(x, y) {
    // Triggered when user touches or clicks the canvas
  },
  onDrag: function(x, y, dx, dy) {
    // Triggered as user moves pointer on canvas
  },
  onDragEnd: function() {
    // Triggered when pointer is released
  }
};
```

---

### 3.4 `d3` (Graph and Chart Engine)
Plots mathematical lines, scattered points, bar graphs, and Cartesian planes using **D3.js**.

#### JSON Specification
```json
{
  "id": "cartesian-plot-01",
  "type": "d3",
  "chart_type": "xy-graph",
  "x_label": "X Axis",
  "y_label": "Y Axis",
  "data_json": {
    "fn": "3 * Math.sin(x)",
    "x_min": -10,
    "x_max": 10,
    "samples": 300
  }
}
```

#### Supported Chart Types (`chart_type`)

1.  **`xy-graph`**: Renders a true mathematical Cartesian coordinate grid. Axes cross at `(0,0)`, and the plot supports auto-scaled curves or coordinate points.
    *   *Data Schema for `fn`*: `{ "fn": "string Math formula", "x_min": number, "x_max": number, "samples": number }`
    *   *Data Schema for `points`*: `{ "points": [[x1, y1], [x2, y2], ...] }`
2.  **`function`**: Renders a standard graph starting at the bottom-left axis.
    *   *Data Schema*: Same as `xy-graph` function mode.
3.  **`lines`**: Renders multiple lines/series on a single grid.
    *   *Data Schema*: `{ "series": [{ "name": "Series A", "color": "#HEX", "points": [[x1, y1], ...] }] }`
4.  **`points`**: Renders a scatter plot.
    *   *Data Schema*: `{ "points": [[x1, y1], [x2, y2], ...] }`
5.  **`bars`**: Renders a vertical column chart.
    *   *Data Schema*: `{ "bars": [{ "label": "A", "value": 50, "color": "#HEX" }, ...] }`
6.  **`grid`**: Displays a custom quad-plot layout.

---

### 3.5 `diagram` (Dagre-D3 Flow and Mindmap Engine)
Visualizes flowcharts, mindmaps, hierarchy structures, timelines, and state machines using Dagre layout pipelines.

#### JSON Specification
```json
{
  "id": "concept-hierarchy-01",
  "type": "diagram",
  "layout": "hierarchy",
  "direction": "TB",
  "spec": {
    "nodes": [
      { "id": "parent", "label": "Matter", "subtitle": "Parent State", "color": "#3B82F6" },
      { "id": "child1", "label": "Solid", "subtitle": "Ice", "color": "#10B981" },
      { "id": "child2", "label": "Liquid", "subtitle": "Water", "color": "#F59E0B" }
    ],
    "edges": [
      { "from": "parent", "to": "child1", "label": "Freezing" },
      { "from": "parent", "to": "child2", "label": "Melting" }
    ]
  }
}
```

#### Configuration Properties
*   `layout` / `diagramType`: Layout type. Choose between `tree`, `flowchart`, `graph`, `mindmap`, `hierarchy`, `timeline`, or `state-machine`.
*   `direction`: Flow orientation. Can be `TB` (top-to-bottom), `BT` (bottom-to-top), `LR` (left-to-right), or `RL` (right-to-left).
*   **Nodes Schema**:
    ```typescript
    interface DiagramNode {
      id: string;
      label: string;
      subtitle?: string;
      description?: string;
      icon?: string;
      color?: string; // Hex color code for header accent
      metadata?: string[]; // Small pills to display under description
    }
    ```
*   **Edges Schema**:
    ```typescript
    interface DiagramEdge {
      from: string; // Source node ID
      to: string;   // Target node ID
      label?: string; // Optional label displayed on connection line
      style?: string; // CSS style rules for path styling
    }
    ```

---

### 3.6 `formula` / `latex` (Mathematical Equation Engine)
Renders single equations or multi-step derivations with breakdown explanations.

#### JSON Specification
```json
{
  "id": "quadratic-formula",
  "type": "formula",
  "spec": {
    "main_latex": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    "steps": [
      { "latex": "b^2 - 4ac", "explanation": "The discriminant determines the number of real roots." },
      { "latex": "2a", "explanation": "Denominator scales the shift relative to the leading term coefficient." }
    ]
  }
}
```

---

### 3.7 `2d-text` (Markdown Document Engine)
Standard content renderer for detailed explanations, blockquotes, and listings.

#### JSON Specification
```json
{
  "id": "theory-doc-01",
  "type": "2d-text",
  "spec": {
    "body_markdown": "### Newtonian Relativity\n\nAccording to classical physics, **laws of motion** are identical in all inertial frames.\n\n> \"Relativity is key to space-time mechanics.\"\n\nWe calculate kinetic energy as follows:\n\n```javascript\nfunction calculateKE(mass, velocity) {\n  return 0.5 * mass * velocity * velocity;\n}\n```",
    "citations": [
      { "label": "Principia Mathematica", "source": "Sir Isaac Newton, 1687", "url": "https://archive.org" }
    ]
  }
}
```
