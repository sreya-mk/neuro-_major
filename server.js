const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from repository root (so existing html/css/js work)
app.use(express.static(path.join(__dirname)));

// Data storage paths
const dataDir = path.join(__dirname, 'data');
const profilesPath = path.join(dataDir, 'profiles.json');
const learningPath = path.join(dataDir, 'learning.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

function readJson(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || 'null') || defaultValue;
  } catch (e) {
    console.error('readJson error', e);
    return defaultValue;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('writeJson error', e);
    return false;
  }
}

// Default profile endpoint (single sample profile)
app.get('/api/profile', (req, res) => {
  res.json({
    name: 'Sreya',
    title: 'Student / Developer',
    bio: 'This is placeholder profile data. Replace with real content or a database.',
    skills: ['JavaScript', 'HTML', 'CSS']
  });
});

// Learning resources (read from data/learning.json if available)
app.get('/api/learning', (req, res) => {
  const data = readJson(learningPath, {
    resources: [
      { id: 1, title: 'Workplace Communication Basics', url: './learning.html', description: 'Learn how to write clear, concise emails.' }
    ]
  });
  res.json(data);
});

// Interview questions (simple sample or can be extended)
app.get('/api/interview', (req, res) => {
  res.json({
    questions: [
      { id: 1, question: 'Tell me about this project.' }
    ]
  });
});

// Retrieve saved profiles
app.get('/api/profiles', (req, res) => {
  const profiles = readJson(profilesPath, []);
  res.json({ profiles });
});

// Accept submissions (profile completions, events, etc.) and persist profile completions
app.post('/api/submit', (req, res) => {
  const payload = req.body || {};
  // If this is a profile completion with answers, save it to profiles.json
  if (payload.event === 'profile_complete' || payload.type === 'profile') {
    const profiles = readJson(profilesPath, []);
    const entry = Object.assign({}, payload, { savedAt: Date.now() });
    profiles.push(entry);
    const ok = writeJson(profilesPath, profiles);
    if (!ok) return res.status(500).json({ error: 'Failed to save profile' });
    return res.json({ success: true, entry });
  }

  // For other events, just echo back
  res.json({ received: payload });
});

app.listen(port, () => {
  console.log(`Backend running: http://localhost:${port}`);
});
