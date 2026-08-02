# grasp-content

Static educational content served via GitHub + jsDelivr CDN.

## Structure

```
grasp-content/
├── content/
│   ├── domains.json          # Combined list of all domains (names, description, colors, icons, courseCount)
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
│   ├── courses/
│   │   ├── mathematics/
│   │   │   ├── courses.json  # Combined manifest of all course details for mathematics
│   │   │   └── ...
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
│   ├── compile-manifests.js  # Compiles domains.json and category-specific courses.json manifests
│   └── generate-latest.js    # Syncs version information
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

## Compilation & Optimization

To minimize network traffic, the content repository compiles domain indices and course cards into consolidated files. This reduces domain and course library discovery down to exactly 1 request each:

* **`content/domains.json`**: Generated from all active domain folders. Contains domain names, descriptions, metadata (icons/colors), and course counts.
* **`content/courses/[domainId]/courses.json`**: Consolidates all `index.json` and `latest.json` manifests for all courses inside a category.

These files are automatically updated and committed to `main` on every push via the GitHub Actions build workflow.

## CDN URLs

```dart
// Load latest course version
final response = await http.get(
  Uri.parse('https://cdn.jsdelivr.net/gh/gainandshine/grasp-content@main/content/domains/mathematics/courses/calculus/latest.json'),
);

// Load specific version
final response = await http.get(
  Uri.parse('https://cdn.jsdelivr.net/gh/gainandshine/grasp-content@v1.0.0/content/domains/mathematics/courses/calculus/versions/1.0.0/course.json'),
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
| **📚 Courses** | 9 |
| **📖 Chapters** | 111 |
| **💡 Concepts** | 811 |
| **❓ Quiz Questions** | 1622 |
| **🃏 Flashcards** | 1622 |
| **📝 Practice Exercises** | 1622 |
| **💡 Examples** | 811 |
| **🎨 Interactive Canvas Visuals** | 6488 |
<!-- STATS_END -->

## License

MIT
