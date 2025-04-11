const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

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

// Serve static files
app.use(express.static('public'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- View the website at: http://localhost:${PORT}`);
  console.log(`- n8n should call: http://localhost:${PORT}/api/trigger-chat`);
});