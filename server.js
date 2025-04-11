const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Store the trigger ID
let currentTriggerId = 0;

// Endpoint that n8n will call to trigger the chat
app.post('/api/trigger-chat', (req, res) => {
  currentTriggerId++;
  console.log(`Chat trigger received. New ID: ${currentTriggerId}`);
  res.json({ success: true, triggerId: currentTriggerId });
});

// Endpoint that the webpage polls to check if chat should open
app.get('/api/check-chat-trigger', (req, res) => {
  res.json({ triggerId: currentTriggerId });
});

// Explicitly serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
========================================
  Server running on port ${PORT}
========================================
  
  - View the website at: http://localhost:${PORT}
  - n8n should call: http://localhost:${PORT}/api/trigger-chat
  
  The server is now ready to accept connections.
  Press Ctrl+C to stop the server.
  
  Current working directory: ${__dirname}
  Files available: ${require('fs').readdirSync(__dirname).join(', ')}
========================================
`);
});