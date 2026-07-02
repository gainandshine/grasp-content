const fs = require('fs');
const path = require('path');

const NOTES_DIR = 'D:\\Projects\\Grasp\\notes';
const OUT = 'D:\\Projects\\Grasp\\grasp-content\\content';

// ─── Helpers ───────────────────────────────────────────────────────────
function slugify(s) {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').trim();
}
function pad(n) { return String(n).padStart(2, '0'); }
function writeJson(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

// ─── Parser ────────────────────────────────────────────────────────────
function parseNotes(content) {
  const courses = []; let cur = null, ch = null;
  for (const raw of content.split('\n')) {
    const t = raw.trim();
    if (!t || /^[-*_=]+$/.test(t)) continue;
    const cm = t.match(/^#+\s*Course\s+\d+:\s*(.+)$/);
    if (cm) { if (cur) courses.push(cur); cur = { title: cm[1].trim(), chapters: [] }; ch = null; continue; }
    const chm = t.match(/^##?\s*Chapter\s+\d+:\s*(.+)$/);
    if (chm && cur) { ch = { title: chm[1].trim(), topics: [] }; cur.chapters.push(ch); continue; }
    if (t.startsWith('*') && ch) { const topic = t.replace(/^\*\s*/, '').trim(); if (topic) ch.topics.push(topic); }
    if ((t.startsWith('This course') || t.startsWith('Kinematics is')) && cur && !cur.description) cur.description = t;
  }
  if (cur) courses.push(cur);
  return courses;
}

// ─── Build a single course ─────────────────────────────────────────────
function buildCourse(domain, course) {
  const courseId = slugify(course.title);
  const base = path.join(OUT, 'courses', domain, courseId);
  const ver  = path.join(base, 'versions', '1.0.0');
  const chDir = path.join(ver, 'chapters');

  fs.mkdirSync(ver, { recursive: true });
  fs.mkdirSync(chDir, { recursive: true });

  const chapters = [];
  course.chapters.forEach((ch, ci) => {
    const chId = `chapter-${pad(ci + 1)}`;
    const topicsDir = path.join(chDir, chId, 'topics');
    fs.mkdirSync(topicsDir, { recursive: true });

    const topics = ch.topics.map((name, ti) => {
      const tId = `topic-${pad(ti + 1)}`;
      const conceptId = `${domain}.${courseId}.${chId}.${tId}`;
      const topicDir = path.join(topicsDir, tId);
      fs.mkdirSync(topicDir, { recursive: true });

      // concept.json — inside topic folder
      writeJson(path.join(topicDir, 'concept.json'), {
        id: conceptId,
        name,
        subject: domain,
        summary: `${name} is a fundamental concept in ${domain}.`,
        definition: `${name} is a fundamental concept in ${domain}.`,
        explanation: `Learn about ${name} and its applications.`,
        prerequisites: [],
        relatedConcepts: [],
        visualizationIds: [],
        quizIds: [],
        flashcardIds: [],
        exampleIds: [],
        exerciseIds: [],
        difficulty: 'beginner',
        estimatedMinutes: 10,
        tags: [domain, slugify(name)],
        learningType: 'conceptual',
        whyItMatters: '',
        memoryHook: '',
      });

      // topic.json
      writeJson(path.join(topicDir, 'topic.json'), { id: tId, name, description: `Learn about ${name}`, conceptId });

      return { id: tId, name, conceptId };
    });

    writeJson(path.join(chDir, chId, 'chapter.json'), { id: chId, name: ch.title, description: ch.title, topics });
    chapters.push({ id: chId, name: ch.title, topics });
  });

  // course.json
  writeJson(path.join(ver, 'course.json'), {
    id: courseId,
    name: course.title,
    description: course.description || course.title,
    version: '1.0.0',
    domain,
    chapters: chapters.map(c => ({
      id: c.id, name: c.name,
      topics: c.topics.map(t => ({ id: t.id, name: t.name, conceptId: t.conceptId }))
    })),
    metadata: { difficulty: 'beginner', estimatedHours: chapters.length * 2, prerequisites: [], tags: [domain, slugify(course.title)] }
  });

  // latest.json
  writeJson(path.join(base, 'latest.json'), { latest: '1.0.0', minimumSupported: '1.0.0', schemaVersion: '1.0.0', releasedAt: new Date().toISOString() });

  // index.json
  writeJson(path.join(base, 'index.json'), { id: courseId, title: course.title, version: '1.0.0', difficulty: 'beginner', estimatedHours: chapters.length * 2, chapters: chapters.length, updatedAt: new Date().toISOString() });

  const conceptCount = chapters.reduce((s, c) => s + c.topics.length, 0);
  return { courseId, chapters: chapters.length, concepts: conceptCount };
}

// ─── Main ──────────────────────────────────────────────────────────────
const files = [
  { file: 'physics.txt', domain: 'physics' },
  { file: 'Maths.txt', domain: 'mathematics' },
  { file: 'chemistry.txt', domain: 'chemistry' },
  { file: 'biology.txt', domain: 'biology' },
  { file: 'ComputerScience.txt', domain: 'computer-science' },
  { file: 'economics.txt', domain: 'economics' },
  { file: 'philosphy.txt', domain: 'philosophy' },
  { file: 'psycology.txt', domain: 'psychology' },
  { file: 'gamethoery.txt', domain: 'game-theory' }
];

let totalConcepts = 0, totalCourses = 0;
files.forEach(({ file, domain }) => {
  const fp = path.join(NOTES_DIR, file);
  if (!fs.existsSync(fp)) { console.log(`SKIP ${file}`); return; }
  const courses = parseNotes(fs.readFileSync(fp, 'utf-8'));
  console.log(`\n${domain}: ${courses.length} courses`);
  courses.forEach(c => { const r = buildCourse(domain, c); totalConcepts += r.concepts; totalCourses++; console.log(`  ${r.courseId}: ${r.chapters} ch, ${r.concepts} concepts`); });
});
console.log(`\n✅ ${totalCourses} courses, ${totalConcepts} concepts`);

