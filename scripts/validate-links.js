const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'courses');

let errors = [];

function addError(file, message) {
  errors.push(`[LINK_ERROR] ${file}: ${message}`);
}

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    return null;
  }
}

function validateAllLinks() {
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
      if (!fs.existsSync(versionsPath)) return;

      const versions = fs.readdirSync(versionsPath);
      versions.forEach(version => {
        const versionPath = path.join(versionsPath, version);
        if (!fs.statSync(versionPath).isDirectory()) return;

        validateLinksForVersion(versionPath);
      });
    });
  });

  if (errors.length > 0) {
    console.error('\n❌ Link validation failed with the following errors:');
    errors.forEach(err => console.error(err));
    process.exit(1);
  } else {
    console.log('\n✅ All visualization and topic file references validated successfully.');
  }
}

function validateLinksForVersion(versionPath) {
  const courseJsonPath = path.join(versionPath, 'course.json');
  const courseData = safeReadJson(courseJsonPath);
  if (!courseData || !courseData.chapters) return;

  const chaptersDir = path.join(versionPath, 'chapters');

  courseData.chapters.forEach(chRef => {
    const chId = chRef.id;
    const chPath = path.join(chaptersDir, chId);
    const chJsonPath = path.join(chPath, 'chapter.json');
    const chData = safeReadJson(chJsonPath);

    if (!chData || !chData.topics) return;

    const topicsDir = path.join(chPath, 'topics');

    chData.topics.forEach(topicRef => {
      const tId = topicRef.id;
      const topicPath = path.join(topicsDir, tId);

      // Check if topic directory actually exists
      if (!fs.existsSync(topicPath)) {
        addError(topicPath.replace(CONTENT_DIR, ''), `Referenced topic folder does not exist`);
        return;
      }

      // Check topic files
      const topicJsonPath = path.join(topicPath, 'topic.json');
      const visualizationsJsonPath = path.join(topicPath, 'visualizations.json');

      const topicData = safeReadJson(topicJsonPath);
      const vizData = safeReadJson(visualizationsJsonPath);

      if (!topicData) return;

      // Extract all {{viz:id}} references in overview, explanation, keyPoints, whyItMatters
      const content = topicData.content || {};
      const fieldsToScan = [
        content.overview || '',
        content.explanation || '',
        content.whyItMatters || '',
        ...(content.keyPoints || [])
      ];

      const referencedVizIds = new Set();
      const vizRegex = /\{\{viz:([\w-]+)\}\}/g;

      fieldsToScan.forEach(text => {
        let match;
        while ((match = vizRegex.exec(text)) !== null) {
          referencedVizIds.add(match[1]);
        }
      });

      // Check if they exist in visualizations.json
      const availableVizIds = new Set();
      if (vizData && Array.isArray(vizData.visualizations)) {
        vizData.visualizations.forEach(viz => availableVizIds.add(viz.id));
      }

      referencedVizIds.forEach(vizId => {
        if (vizId.startsWith('example-')) return; // Skip example references for now

        if (!availableVizIds.has(vizId)) {
          addError(
            topicJsonPath.replace(CONTENT_DIR, ''),
            `Referenced visualization "{{viz:${vizId}}}" does not exist in visualizations.json`
          );
        }
      });
    });
  });
}

validateAllLinks();
