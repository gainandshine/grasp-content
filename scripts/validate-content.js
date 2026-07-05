const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'courses');

let errors = [];

function addError(file, message) {
  errors.push(`[ERROR] ${file}: ${message}`);
}

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    addError(filePath.replace(CONTENT_DIR, ''), 'File does not exist');
    return null;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    addError(filePath.replace(CONTENT_DIR, ''), `Invalid JSON: ${err.message}`);
    return null;
  }
}

// Recursively find all version folders
function validateAll() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('Content directory not found:', CONTENT_DIR);
    process.exit(1);
  }

  const domains = fs.readdirSync(CONTENT_DIR);
  domains.forEach(domain => {
    const domainPath = path.join(CONTENT_DIR, domain);
    if (!fs.statSync(domainPath).isDirectory()) return;

    const courses = fs.readdirSync(domainPath);
    courses.forEach(courseId => {
      const coursePath = path.join(domainPath, courseId);
      if (!fs.statSync(coursePath).isDirectory()) return;

      const versionsPath = path.join(coursePath, 'versions');
      if (!fs.existsSync(versionsPath)) {
        addError(coursePath.replace(CONTENT_DIR, ''), 'Missing versions directory');
        return;
      }

      const versions = fs.readdirSync(versionsPath);
      versions.forEach(version => {
        const versionPath = path.join(versionsPath, version);
        if (!fs.statSync(versionPath).isDirectory()) return;

        validateCourseVersion(domain, courseId, version, versionPath);
      });
    });
  });

  if (errors.length > 0) {
    console.error('\n❌ Content validation failed with the following errors:');
    errors.forEach(err => console.error(err));
    process.exit(1);
  } else {
    console.log('\n✅ All content JSON structures and schemas validated successfully.');
  }
}

function validateCourseVersion(domain, courseId, version, versionPath) {
  const relPath = versionPath.replace(CONTENT_DIR, '');
  const courseJsonPath = path.join(versionPath, 'course.json');
  const courseData = safeReadJson(courseJsonPath);

  if (!courseData) return;

  // Validate course.json schema
  if (courseData.id !== courseId) {
    addError(courseJsonPath.replace(CONTENT_DIR, ''), `ID mismatch: Expected "${courseId}", got "${courseData.id}"`);
  }
  if (!courseData.name || typeof courseData.name !== 'string') {
    addError(courseJsonPath.replace(CONTENT_DIR, ''), 'Missing or invalid course "name"');
  }
  if (!courseData.chapters || !Array.isArray(courseData.chapters)) {
    addError(courseJsonPath.replace(CONTENT_DIR, ''), 'Missing or invalid course "chapters" array');
    return;
  }

  if (courseData.chapters.length > 0) {
    const chaptersDir = path.join(versionPath, 'chapters');
    if (!fs.existsSync(chaptersDir)) {
      addError(relPath, 'Missing chapters directory');
      return;
    }

    courseData.chapters.forEach(chRef => {
      const chId = chRef.id;
      const chPath = path.join(chaptersDir, chId);
      const chJsonPath = path.join(chPath, 'chapter.json');
      const chData = safeReadJson(chJsonPath);

      if (!chData) return;

      // Validate chapter.json schema
      if (chData.id !== chId) {
        addError(chJsonPath.replace(CONTENT_DIR, ''), `ID mismatch: Expected "${chId}", got "${chData.id}"`);
      }
      if (!chData.name || typeof chData.name !== 'string') {
        addError(chJsonPath.replace(CONTENT_DIR, ''), 'Missing or invalid chapter "name"');
      }
      if (!chData.topics || !Array.isArray(chData.topics)) {
        addError(chJsonPath.replace(CONTENT_DIR, ''), 'Missing or invalid chapter "topics" array');
        return;
      }

      const topicsDir = path.join(chPath, 'topics');
      chData.topics.forEach(topicRef => {
        const tId = topicRef.id;
        const topicPath = path.join(topicsDir, tId);
        
        // Validate all topic files exist and have correct schema
        validateTopic(topicPath, tId, domain, courseId, chId);
      });
    });
  }
}

function validateTopic(topicPath, tId, domain, courseId, chId) {
  const relPath = topicPath.replace(CONTENT_DIR, '');
  
  // 1. topic.json
  const topicJson = safeReadJson(path.join(topicPath, 'topic.json'));
  if (topicJson) {
    if (topicJson.id !== tId) {
      addError(`${relPath}/topic.json`, `ID mismatch: Expected "${tId}", got "${topicJson.id}"`);
    }
    const expectedTopicId = `${domain}.${courseId}.${chId}.${tId}`;
    if (topicJson.topicId !== expectedTopicId) {
      addError(`${relPath}/topic.json`, `topicId mismatch: Expected "${expectedTopicId}", got "${topicJson.topicId}"`);
    }
    if (!topicJson.content || typeof topicJson.content !== 'object') {
      addError(`${relPath}/topic.json`, 'Missing or invalid "content" object');
    } else {
      const { overview, explanation } = topicJson.content;
      if (!overview) addError(`${relPath}/topic.json`, 'Missing content.overview');
      if (!explanation) addError(`${relPath}/topic.json`, 'Missing content.explanation');
    }
  }

  // 2. examples.json
  const examplesJson = safeReadJson(path.join(topicPath, 'examples.json'));
  if (examplesJson) {
    if (!Array.isArray(examplesJson.examples)) {
      addError(`${relPath}/examples.json`, 'Missing or invalid "examples" array');
    } else {
      examplesJson.examples.forEach((ex, idx) => {
        if (!ex.id) addError(`${relPath}/examples.json`, `Missing "id" at index ${idx}`);
        if (!ex.title) addError(`${relPath}/examples.json`, `Missing "title" at index ${idx}`);
        if (!ex.content) addError(`${relPath}/examples.json`, `Missing "content" at index ${idx}`);
      });
    }
  }

  // 3. flashcards.json
  const flashcardsJson = safeReadJson(path.join(topicPath, 'flashcards.json'));
  if (flashcardsJson) {
    if (!Array.isArray(flashcardsJson.flashcards)) {
      addError(`${relPath}/flashcards.json`, 'Missing or invalid "flashcards" array');
    } else {
      flashcardsJson.flashcards.forEach((fc, idx) => {
        if (!fc.id) addError(`${relPath}/flashcards.json`, `Missing "id" at index ${idx}`);
        if (!fc.front) addError(`${relPath}/flashcards.json`, `Missing "front" at index ${idx}`);
        if (!fc.back) addError(`${relPath}/flashcards.json`, `Missing "back" at index ${idx}`);
      });
    }
  }

  // 4. quiz.json
  const quizJson = safeReadJson(path.join(topicPath, 'quiz.json'));
  if (quizJson) {
    if (!Array.isArray(quizJson.questions)) {
      addError(`${relPath}/quiz.json`, 'Missing or invalid "questions" array');
    } else {
      quizJson.questions.forEach((q, idx) => {
        if (!q.id) addError(`${relPath}/quiz.json`, `Missing "id" at index ${idx}`);
        if (!q.question) addError(`${relPath}/quiz.json`, `Missing "question" at index ${idx}`);
        if (!Array.isArray(q.options) || q.options.length < 2) {
          addError(`${relPath}/quiz.json`, `Missing or invalid "options" array at index ${idx}`);
        }
        if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= (q.options ? q.options.length : 0)) {
          addError(`${relPath}/quiz.json`, `Invalid "correctIndex" at index ${idx}`);
        }
      });
    }
  }

  // 5. exercises.json
  const exercisesJson = safeReadJson(path.join(topicPath, 'exercises.json'));
  if (exercisesJson) {
    if (!Array.isArray(exercisesJson.exercises)) {
      addError(`${relPath}/exercises.json`, 'Missing or invalid "exercises" array');
    } else {
      exercisesJson.exercises.forEach((ex, idx) => {
        if (!ex.id) addError(`${relPath}/exercises.json`, `Missing "id" at index ${idx}`);
        if (!ex.prompt) addError(`${relPath}/exercises.json`, `Missing "prompt" at index ${idx}`);
        if (!ex.solution) addError(`${relPath}/exercises.json`, `Missing "solution" at index ${idx}`);
      });
    }
  }

  // 6. visualizations.json
  const visualizationsJson = safeReadJson(path.join(topicPath, 'visualizations.json'));
  if (visualizationsJson) {
    if (!Array.isArray(visualizationsJson.visualizations)) {
      addError(`${relPath}/visualizations.json`, 'Missing or invalid "visualizations" array');
    } else {
      visualizationsJson.visualizations.forEach((viz, idx) => {
        if (!viz.id) addError(`${relPath}/visualizations.json`, `Missing "id" at index ${idx}`);
        if (!viz.type) addError(`${relPath}/visualizations.json`, `Missing "type" at index ${idx}`);
        if (!viz.title) addError(`${relPath}/visualizations.json`, `Missing "title" at index ${idx}`);
      });
    }
  }
}

validateAll();
