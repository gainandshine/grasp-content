# grasp-content

Static educational content served via GitHub + jsDelivr CDN.

## Structure

```
grasp-content/
├── content/
│   ├── domains/              # Top-level subject folders
│   │   ├── mathematics/
│   │   │   ├── domain.json   # Domain metadata
│   │   │   ├── concepts/     # Atomic concepts
│   │   │   └── courses/      # All math courses
│   │   │       └── calculus/
│   │   │           ├── latest.json
│   │   │           └── versions/
│   │   │               └── 1.0.0/
│   │   │                   ├── course.json
│   │   │                   └── chapters/
│   │   │                       ├── chapter-01/
│   │   │                       │   ├── chapter.json
│   │   │                       │   └── topics/
│   │   │                       └── chapter-02/
│   │   ├── physics/
│   │   ├── chemistry/
│   │   └── ...
│   └── learning/             # Practice content
│       ├── quizzes/
│       ├── flashcards/
│       ├── exercises/
│       └── examples/
├── assets/                   # Static assets (by type)
│   ├── markdown/
│   ├── diagram/
│   ├── canvas/
│   ├── d3/
│   ├── formula/
│   ├── 3d/
│   └── images/
├── schemas/                  # JSON schemas
├── indexes/                  # Content indexes
├── search/                   # Search data
├── localization/             # i18n support
├── meta/                     # Lookup tables
├── scripts/                  # Build/validation scripts
└── docs/                     # Documentation
```

## Content Model

```
Domain (mathematics, physics, etc.)
  └── Concepts (atomic, reusable)
  └── Courses (structured learning paths)
       └── Chapters
            └── Topics
                 └── Concepts (referenced by ID)
```

## How It Works

```
GitHub → jsDelivr CDN → Flutter App → Render JSON
```

No SDK. No npm package. Just JSON over HTTP.

## CDN URLs

```dart
// Load latest course version
final response = await http.get(
  Uri.parse('https://cdn.jsdelivr.net/gh/loyality7/grasp-content@main/content/domains/mathematics/courses/calculus/latest.json'),
);

// Load specific version
final response = await http.get(
  Uri.parse('https://cdn.jsdelivr.net/gh/loyality7/grasp-content@v1.0.0/content/domains/mathematics/courses/calculus/versions/1.0.0/course.json'),
);

// Load concept
final response = await http.get(
  Uri.parse('https://cdn.jsdelivr.net/gh/loyality7/grasp-content@main/content/domains/physics/concepts/kinematics.json'),
);
```

## Statistics

<!-- STATS_START -->
| Content Type | Count |
| :--- | :--- |
| **📚 Courses** | 149 |
| **📖 Chapters** | 1902 |
| **💡 Concepts** | 13067 |
| **❓ Quiz Questions** | 26136 |
| **🃏 Flashcards** | 26136 |
| **📝 Practice Exercises** | 26134 |
| **💡 Examples** | 13069 |
| **🎨 Interactive Canvas Visuals** | 117589 |
<!-- STATS_END -->

## License

MIT
