const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Enhanced logging
function logWithTimestamp(message, data = null) {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}

// Log all requests for debugging
app.use((req, res, next) => {
  logWithTimestamp(`${req.method} ${req.url}`);
  if (req.method === 'POST' && req.body) {
    logWithTimestamp('Request body:', req.body);
  }
  next();
});

// Store the trigger data
let triggerData = {
  triggerId: 0,
  n8n_executionID: null,
  n8n_resumeURL: null,
  timestamp: null
};

// Endpoint that n8n will call to trigger the chat
app.post('/api/trigger-chat', (req, res) => {
  logWithTimestamp('Received trigger-chat request');
  
  // Extract data from request body
  const { n8n_executionID, n8n_resumeURL } = req.body;
  
  // Increment trigger ID and store execution data
  triggerData = {
    triggerId: triggerData.triggerId + 1,
    n8n_executionID: n8n_executionID || null,
    n8n_resumeURL: n8n_resumeURL || null,
    timestamp: new Date().toISOString()
  };
  
  logWithTimestamp('Updated trigger data:', triggerData);
  
  // Send response
  res.json({ 
    success: true, 
    message: 'Trigger processed successfully',
    ...triggerData 
  });
});

// Endpoint that the webpage polls to check if chat should open
app.get('/api/check-chat-trigger', (req, res) => {
  logWithTimestamp('Check-chat-trigger request received');
  logWithTimestamp('Returning current trigger data:', triggerData);
  res.json(triggerData);
});

// Explicitly serve index.html for the root path
app.get('/', (req, res) => {
  logWithTimestamp('Serving index.html');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
========================================
  DIAGNOSTIC SERVER running on port ${PORT}
========================================
  
  - View the diagnostic page at: http://localhost:${PORT}
  - n8n should call: http://localhost:${PORT}/api/trigger-chat
    with JSON body: { "n8n_executionID": "your-execution-id", "n8n_resumeURL": "your-resume-url" }
  
  The server is now ready to accept connections.
  Press Ctrl+C to stop the server.
  
  Current working directory: ${__dirname}
  Files available: ${require('fs').readdirSync(__dirname).join(', ')}
========================================
`);
});