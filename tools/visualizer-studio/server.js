const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3333;
const ROOT_DIR = path.join(__dirname, '..', '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content', 'courses');

function getCoursesTree() {
  const tree = [];
  if (!fs.existsSync(CONTENT_DIR)) return tree;

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
        let courseName = courseId;
        if (fs.existsSync(courseJsonPath)) {
          try {
            const courseData = JSON.parse(fs.readFileSync(courseJsonPath, 'utf8'));
            courseName = courseData.name || courseId;
          } catch (e) {}
        }

        const chaptersDir = path.join(versionPath, 'chapters');
        const chapters = [];

        if (fs.existsSync(chaptersDir)) {
          const chDirs = fs.readdirSync(chaptersDir);
          chDirs.forEach(chId => {
            const chPath = path.join(chaptersDir, chId);
            if (!fs.statSync(chPath).isDirectory()) return;

            const chJsonPath = path.join(chPath, 'chapter.json');
            let chName = chId;
            if (fs.existsSync(chJsonPath)) {
              try {
                const chData = JSON.parse(fs.readFileSync(chJsonPath, 'utf8'));
                chName = chData.name || chId;
              } catch (e) {}
            }

            const topicsDir = path.join(chPath, 'topics');
            const topics = [];

            if (fs.existsSync(topicsDir)) {
              const tDirs = fs.readdirSync(topicsDir);
              tDirs.forEach(tId => {
                const tPath = path.join(topicsDir, tId);
                if (!fs.statSync(tPath).isDirectory()) return;

                const vizJsonPath = path.join(tPath, 'visualizations.json');
                const topicJsonPath = path.join(tPath, 'topic.json');

                let tName = tId;
                if (fs.existsSync(topicJsonPath)) {
                  try {
                    const tData = JSON.parse(fs.readFileSync(topicJsonPath, 'utf8'));
                    tName = tData.title || tId;
                  } catch (e) {}
                }

                let vizData = null;
                if (fs.existsSync(vizJsonPath)) {
                  try {
                    vizData = JSON.parse(fs.readFileSync(vizJsonPath, 'utf8'));
                  } catch (e) {
                    vizData = { error: e.message, raw: fs.readFileSync(vizJsonPath, 'utf8') };
                  }
                }

                topics.push({
                  id: tId,
                  name: tName,
                  path: vizJsonPath,
                  hasViz: !!vizData,
                  vizData,
                });
              });
            }

            chapters.push({
              id: chId,
              name: chName,
              topics,
            });
          });
        }

        tree.push({
          domain,
          courseId,
          version,
          name: courseName,
          chapters,
        });
      });
    });
  });

  return tree;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (pathname === '/api/courses' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getCoursesTree()));
    return;
  }

  if (pathname === '/api/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { targetPath, vizData } = payload;

        if (!targetPath || !fs.existsSync(targetPath)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid targetPath' }));
          return;
        }

        const formatted = JSON.stringify(vizData, null, 2);
        fs.writeFileSync(targetPath, formatted, 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Saved successfully' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Serve static files (index.html, etc.)
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🎨 Grasp Visualizer Studio is running live at:`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
