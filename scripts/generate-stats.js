const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'courses');
const README_PATH = path.join(__dirname, '..', 'README.md');

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    return null;
  }
}

function generateStats() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('Content directory not found:', CONTENT_DIR);
    process.exit(1);
  }

  let totalCourses = 0;
  let totalChapters = 0;
  let totalConcepts = 0;
  let totalQuizzes = 0;
  let totalExamples = 0;
  let totalFlashcards = 0;
  let totalExercises = 0;
  let totalVisualizations = 0;

  const domains = fs.readdirSync(CONTENT_DIR);
  domains.forEach(domain => {
    const domainPath = path.join(CONTENT_DIR, domain);
    if (!fs.statSync(domainPath).isDirectory()) return;

    const courses = fs.readdirSync(domainPath);
    courses.forEach(courseId => {
      const coursePath = path.join(domainPath, courseId);
      if (!fs.statSync(coursePath).isDirectory()) return;

      const versionsPath = path.join(coursePath, 'versions');
      if (!fs.existsSync(versionsPath)) return;

      const versions = fs.readdirSync(versionsPath);
      versions.forEach(version => {
        const versionPath = path.join(versionsPath, version);
        if (!fs.statSync(versionPath).isDirectory()) return;

        const courseJsonPath = path.join(versionPath, 'course.json');
        const courseData = safeReadJson(courseJsonPath);
        if (!courseData) return;

        totalCourses++;

        // Chapters
        const chaptersDir = path.join(versionPath, 'chapters');
        if (!fs.existsSync(chaptersDir)) return;

        courseData.chapters.forEach(chRef => {
          totalChapters++;
          const chId = chRef.id;
          const chPath = path.join(chaptersDir, chId);
          const chJsonPath = path.join(chPath, 'chapter.json');
          const chData = safeReadJson(chJsonPath);
          if (!chData || !chData.topics) return;

          const topicsDir = path.join(chPath, 'topics');
          chData.topics.forEach(topicRef => {
            totalConcepts++;
            const tId = topicRef.id;
            const topicPath = path.join(topicsDir, tId);

            // Read child assets to compute stats
            const examplesData = safeReadJson(path.join(topicPath, 'examples.json'));
            if (examplesData && Array.isArray(examplesData.examples)) {
              totalExamples += examplesData.examples.length;
            }

            const flashcardsData = safeReadJson(path.join(topicPath, 'flashcards.json'));
            if (flashcardsData && Array.isArray(flashcardsData.flashcards)) {
              totalFlashcards += flashcardsData.flashcards.length;
            }

            const quizData = safeReadJson(path.join(topicPath, 'quiz.json'));
            if (quizData && Array.isArray(quizData.questions)) {
              totalQuizzes += quizData.questions.length;
            }

            const exercisesData = safeReadJson(path.join(topicPath, 'exercises.json'));
            if (exercisesData && Array.isArray(exercisesData.exercises)) {
              totalExercises += exercisesData.exercises.length;
            }

            const vizData = safeReadJson(path.join(topicPath, 'visualizations.json'));
            if (vizData && Array.isArray(vizData.visualizations)) {
              totalVisualizations += vizData.visualizations.length;
            }
          });
        });
      });
    });
  });

  const statsMarkdown = `
| Content Type | Count |
| :--- | :--- |
| **📚 Courses** | ${totalCourses} |
| **📖 Chapters** | ${totalChapters} |
| **💡 Concepts** | ${totalConcepts} |
| **❓ Quiz Questions** | ${totalQuizzes} |
| **🃏 Flashcards** | ${totalFlashcards} |
| **📝 Practice Exercises** | ${totalExercises} |
| **💡 Examples** | ${totalExamples} |
| **🎨 Interactive Canvas Visuals** | ${totalVisualizations} |
`;

  // Update README
  if (fs.existsSync(README_PATH)) {
    let readmeContent = fs.readFileSync(README_PATH, 'utf-8');
    const startTag = '<!-- STATS_START -->';
    const endTag = '<!-- STATS_END -->';

    const startIndex = readmeContent.indexOf(startTag);
    const endIndex = readmeContent.indexOf(endTag);

    if (startIndex !== -1 && endIndex !== -1) {
      const before = readmeContent.substring(0, startIndex + startTag.length);
      const after = readmeContent.substring(endIndex);
      const updatedReadme = before + '\n' + statsMarkdown.trim() + '\n' + after;
      fs.writeFileSync(README_PATH, updatedReadme);
      console.log('✅ README.md statistics successfully updated!');
    } else {
      console.warn('⚠️ Could not find "<!-- STATS_START -->" and "<!-- STATS_END -->" comment tags in README.md.');
    }
  } else {
    console.warn('⚠️ README.md not found at content root.');
  }
}

generateStats();
