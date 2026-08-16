const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from repository root (so existing html/css/js work)
app.use(express.static(path.join(__dirname)));

// Simple API endpoints with placeholder data
app.get('/api/profile', (req, res) => {
  res.json({
    name: 'Sreya',
    title: 'Student / Developer',
    bio: 'This is placeholder profile data. Replace with real content or a database.',
    skills: ['JavaScript', 'HTML', 'CSS']
  });
});

app.get('/api/learning', (req, res) => {
  res.json({
    resources: [
      { id: 1, title: 'Learning resource 1', url: './learning.html' }
    ]
  });
});

app.get('/api/interview', (req, res) => {
  res.json({
    questions: [
      { id: 1, question: 'Tell me about this project.' }
    ]
  });
});

app.post('/api/submit', (req, res) => {
  // echo back posted data for now
  res.json({ received: req.body });
});

app.listen(port, () => {
  console.log(`Backend running: http://localhost:${port}`);
});
