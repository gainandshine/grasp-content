const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'courses');

// Helper to compare semver versions
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }
  return 0;
}

function generateLatestManifests() {
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

      const versions = fs.readdirSync(versionsPath).filter(v => {
        return fs.statSync(path.join(versionsPath, v)).isDirectory() && /^\d+\.\d+\.\d+$/.test(v);
      });

      if (versions.length === 0) return;

      // Sort versions descending
      versions.sort((a, b) => compareVersions(b, a));
      const latestVersion = versions[0];

      const latestJsonPath = path.join(coursePath, 'latest.json');
      const latestData = {
        latest: latestVersion,
        minimumSupported: '1.0.0',
        schemaVersion: '1.0.0',
        releasedAt: new Date().toISOString()
      };

      fs.writeFileSync(latestJsonPath, JSON.stringify(latestData, null, 2));
      console.log(`[LATEST] Updated "${courseId}/latest.json" -> version: ${latestVersion}`);
    });
  });

  console.log('\n✅ Course version tracking (latest.json) synced successfully.');
}

generateLatestManifests();
