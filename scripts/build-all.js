const fs = require('fs');
const path = require('path');

const NOTES_DIR = 'D:\\Projects\\Grasp\\notes';
const CONTENT_OUT = 'D:\\Projects\\Grasp\\grasp-content\\content';

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
  const courses = []; 
  let cur = null, ch = null;
  
  for (const raw of content.split('\n')) {
    const t = raw.trim();
    if (!t || /^[-*_=]+$/.test(t)) continue;
    
    // Match course headers: "# Course 1:" or "## Course 1:" with any number of #
    const cm = t.match(/^#+\s*Course\s+\d+:\s*(.+)$/i);
    if (cm) { 
      if (cur) courses.push(cur); 
      cur = { title: cm[1].trim(), chapters: [] }; 
      ch = null; 
      continue; 
    }
    
    // Match chapter headers: ACCEPT SINGLE # OR MORE
    const chm = t.match(/^#+\s*Chapter\s+\d+:\s*(.+)$/i);
    if (chm && cur) { 
      ch = { title: chm[1].trim(), topics: [] }; 
      cur.chapters.push(ch); 
      continue; 
    }
    
    // Match topics: lines starting with *
    if (t.startsWith('*') && ch) { 
      const topic = t.replace(/^\*\s*/, '').trim(); 
      if (topic) ch.topics.push(topic); 
    }
    
    // Capture course descriptions
    if ((t.startsWith('This course') || t.startsWith('Kinematics is')) && cur && !cur.description) {
      cur.description = t;
    }
  }
  
  if (cur) courses.push(cur);
  return courses;
}

// ─── Build a single course ─────────────────────────────────────────────
function buildCourse(domain, course) {
  const courseId = slugify(course.title);
  const base = path.join(CONTENT_OUT, 'courses', domain, courseId);
  const ver  = path.join(base, 'versions', '1.0.0');
  const chDir = path.join(ver, 'chapters');

  fs.mkdirSync(ver, { recursive: true });
  fs.mkdirSync(chDir, { recursive: true });

  const chapters = [];
  const allMaterials = []; // For mobile bundle
  let materialIndex = 0;

  course.chapters.forEach((ch, ci) => {
    const chId = `chapter-${pad(ci + 1)}`;
    const topicsDir = path.join(chDir, chId, 'topics');
    fs.mkdirSync(topicsDir, { recursive: true });

    const topics = ch.topics.map((name, ti) => {
      const tId = `topic-${pad(ti + 1)}`;
      const topicId = `${domain}.${courseId}.${chId}.${tId}`;
      const topicDir = path.join(topicsDir, tId);
      fs.mkdirSync(topicDir, { recursive: true });

      // topic.json - Topic metadata with content and inline viz references
      writeJson(path.join(topicDir, 'topic.json'), {
        id: tId,
        name: name,
        topicId: topicId,
        description: `Learn about ${name} and its applications in ${domain}.`,
        content: {
          // Text with INLINE visualization references
          overview: `${name} is a fundamental concept in ${domain}. {{viz:diagram-01}}`,
          
          explanation: `This topic covers the essential aspects of ${name}. Let's start with the basic definition {{viz:formula-01}} and then explore the interactive model {{viz:3d-01}}. 
          
As you can see from the animation {{viz:anim-01}}, the concept behaves in a specific way. The data visualization {{viz:chart-01}} shows real-world applications.

Understanding ${name} requires both theoretical knowledge {{viz:text-01}} and practical exploration {{viz:simulation-01}}.`,
          
          keyPoints: [
            `Understanding the basics {{viz:diagram-02}}`,
            `Practical applications {{viz:example-01}}`,
            `Common misconceptions`
          ],
          
          whyItMatters: `${name} is essential for mastering ${course.title}.`
        }
      });

      // lesson.json - NOT USED (removed, inline refs in topic.json instead)

      // examples.json - Practical examples
      writeJson(path.join(topicDir, 'examples.json'), {
        examples: [
          {
            id: 'example-01',
            title: `Example: ${name}`,
            content: `A practical example demonstrating ${name}`,
            source: 'Generated',
            difficulty: 'beginner',
            estimatedMinutes: 5,
            tags: [domain, slugify(name)]
          }
        ]
      });

      // flashcards.json - Study flashcards
      writeJson(path.join(topicDir, 'flashcards.json'), {
        flashcards: [
          {
            id: 'card-01',
            front: `What is ${name}?`,
            back: `${name} is a fundamental concept in ${domain}.`,
            difficulty: 'easy'
          },
          {
            id: 'card-02',
            front: `Why is ${name} important?`,
            back: `${name} is essential for understanding ${course.title}.`,
            difficulty: 'medium'
          }
        ]
      });

      // quiz.json - Assessment questions
      writeJson(path.join(topicDir, 'quiz.json'), {
        questions: [
          {
            id: 'q-01',
            type: 'multiple-choice',
            question: `Which statement best describes ${name}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0,
            explanation: 'Explanation of the correct answer',
            difficulty: 'medium'
          },
          {
            id: 'q-02',
            type: 'true-false',
            question: `${name} is only applicable in theoretical contexts.`,
            options: ['True', 'False'],
            correctIndex: 1,
            explanation: `${name} has many practical applications.`,
            difficulty: 'easy'
          }
        ]
      });

      // exercises.json - Practice problems
      writeJson(path.join(topicDir, 'exercises.json'), {
        exercises: [
          {
            id: 'ex-01',
            prompt: `Solve a problem related to ${name}.`,
            solution: `Step-by-step solution for ${name} problem.`,
            hints: [
              'Start by understanding the core concept',
              'Apply the formula or principle',
              'Check your answer'
            ],
            difficulty: 'intermediate',
            estimatedMinutes: 10,
            tags: [domain, slugify(name)]
          },
          {
            id: 'ex-02',
            prompt: `Advanced problem: Apply ${name} to a real-world scenario.`,
            solution: `Detailed solution with explanation.`,
            hints: [
              'Consider the practical constraints',
              'Break down the problem into steps'
            ],
            difficulty: 'advanced',
            estimatedMinutes: 15,
            tags: [domain, slugify(name)]
          }
        ]
      });

      // visualizations.json - Visualization library (referenced inline in text)
      writeJson(path.join(topicDir, 'visualizations.json'), {
        visualizations: [
          {
            id: 'diagram-01',
            type: 'diagram',
            title: `${name} Flowchart`,
            description: `Flowchart showing ${name} process`,
            spec: {
              diagramType: 'flowchart',
              nodes: [
                { id: 'start', label: 'Start', type: 'ellipse' },
                { id: 'process', label: name, type: 'rect' },
                { id: 'end', label: 'End', type: 'ellipse' }
              ],
              edges: [
                { from: 'start', to: 'process' },
                { from: 'process', to: 'end' }
              ]
            }
          },
          {
            id: 'formula-01',
            type: 'formula',
            title: `${name} Formula`,
            description: `Mathematical definition`,
            spec: {
              main_latex: 'f(x) = ax^2 + bx + c',
              steps: [
                { latex: 'a \\\\neq 0', explanation: 'Leading coefficient' }
              ]
            }
          },
          {
            id: '3d-01',
            type: '3d',
            title: `${name} 3D Model`,
            description: `Interactive 3D visualization`,
            spec: {
              setup_code: `
                var geometry = new api.THREE.BoxGeometry(1, 1, 1);
                var material = new api.THREE.MeshPhongMaterial({ color: 0xE8593C });
                var cube = new api.THREE.Mesh(geometry, material);
                api.group.add(cube);
                return {
                  update: function(t) {
                    cube.rotation.x = t * 0.02;
                    cube.rotation.y = t * 0.03;
                  }
                };
              `.trim()
            }
          },
          {
            id: 'anim-01',
            type: '2d-anim',
            title: `${name} Animation`,
            description: `Canvas animation`,
            spec: {
              setup_code: `
                return {
                  draw: function(ctx, W, H, t, dt) {
                    ctx.fillStyle = '#F5F0E8';
                    ctx.fillRect(0, 0, W, H);
                    var x = W/2 + Math.sin(t * 0.05) * 100;
                    var y = H/2 + Math.cos(t * 0.05) * 100;
                    ctx.fillStyle = '#E8593C';
                    ctx.beginPath();
                    ctx.arc(x, y, 20, 0, Math.PI * 2);
                    ctx.fill();
                  }
                };
              `.trim()
            }
          },
          {
            id: 'chart-01',
            type: 'd3',
            title: `${name} Chart`,
            description: `Data visualization`,
            spec: {
              chart_type: 'function',
              x_label: 'x',
              y_label: 'f(x)',
              data_json: JSON.stringify({
                fn: 'Math.sin(x)',
                x_min: -Math.PI * 2,
                x_max: Math.PI * 2,
                samples: 200
              })
            }
          },
          {
            id: 'text-01',
            type: '2d-text',
            title: 'Theoretical Background',
            description: 'Detailed text explanation',
            spec: {
              body_markdown: `## Background\\n\\nDetailed theoretical explanation of ${name}.`,
              citations: []
            }
          },
          {
            id: 'simulation-01',
            type: 'simulation',
            title: `${name} Simulation`,
            description: `Interactive simulation`,
            spec: {
              simulationType: 'physics',
              config: { gravity: 9.8, friction: 0.1 }
            }
          },
          {
            id: 'diagram-02',
            type: 'diagram',
            title: 'Concept Map',
            description: 'Visual concept relationships',
            spec: {
              diagramType: 'mindmap',
              nodes: [
                { id: 'center', label: name, type: 'circle' },
                { id: 'prop1', label: 'Property 1', type: 'rect' },
                { id: 'prop2', label: 'Property 2', type: 'rect' }
              ],
              edges: [
                { from: 'center', to: 'prop1' },
                { from: 'center', to: 'prop2' }
              ]
            }
          }
        ]
      });

      // Add to mobile materials array
      allMaterials.push({
        id: tId,
        concept_label: name,
        concept_description: `${name} is a fundamental concept in ${domain}. Learn about ${name} and its applications.`,
        order_index: materialIndex++,
        topicId: topicId
      });

      return { id: tId, name, topicId };
    });

    // Chapter metadata
    writeJson(path.join(chDir, chId, 'chapter.json'), {
      id: chId,
      name: ch.title,
      description: ch.title,
      overview: `This chapter covers the fundamental concepts of ${ch.title}.`,
      topics
    });

    chapters.push({ id: chId, name: ch.title, topics });
  });

  // ─── Write grasp-content structure ─────────────────────────────────────
  
  // course.json - Main course metadata
  writeJson(path.join(ver, 'course.json'), {
    id: courseId,
    name: course.title,
    description: course.description || course.title,
    version: '1.0.0',
    domain,
    chapters: chapters.map(c => ({
      id: c.id,
      name: c.name,
      topics: c.topics.map(t => ({ id: t.id, name: t.name, topicId: t.topicId }))
    })),
    metadata: {
      difficulty: 'beginner',
      estimatedHours: chapters.length * 2,
      prerequisites: [],
      tags: [domain, slugify(course.title)],
      learningOutcomes: []
    }
  });

  // latest.json - Version tracking
  writeJson(path.join(base, 'latest.json'), {
    latest: '1.0.0',
    minimumSupported: '1.0.0',
    schemaVersion: '1.0.0',
    releasedAt: new Date().toISOString()
  });

  // index.json - Course index for discovery
  writeJson(path.join(base, 'index.json'), {
    id: courseId,
    title: course.title,
    version: '1.0.0',
    domain,
    difficulty: 'beginner',
    estimatedHours: chapters.length * 2,
    chapters: chapters.length,
    topics: allMaterials.length,
    updatedAt: new Date().toISOString()
  });

  // Mobile app fetches directly from CDN - no local bundles needed

  const topicCount = chapters.reduce((s, c) => s + c.topics.length, 0);
  return { courseId, chapters: chapters.length, topics: topicCount };
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

let totalTopics = 0, totalCourses = 0;
files.forEach(({ file, domain }) => {
  const fp = path.join(NOTES_DIR, file);
  if (!fs.existsSync(fp)) { console.log(`SKIP ${file}`); return; }
  const courses = parseNotes(fs.readFileSync(fp, 'utf-8'));
  console.log(`\n${domain}: ${courses.length} courses`);
  courses.forEach(c => {
    const r = buildCourse(domain, c);
    totalTopics += r.topics;
    totalCourses++;
    console.log(`  ${r.courseId}: ${r.chapters} ch, ${r.topics} topics`);
  });
});
console.log(`\n✅ Generated:`);
console.log(`   - ${totalCourses} courses`);
console.log(`   - ${totalTopics} topics`);
console.log(`   - grasp-content: ${CONTENT_OUT}/courses/`);
console.log(`   - Mobile app fetches from CDN (no local bundles)`);

