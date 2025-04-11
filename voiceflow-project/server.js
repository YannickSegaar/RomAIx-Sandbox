const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Store the latest payload data
let latestPayload = {
  n8n_executionID: null,
  n8n_resumeURL: null
};

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to receive the payload
app.post('/api/set-payload', (req, res) => {
  const { n8n_executionID, n8n_resumeURL } = req.body;
  
  if (!n8n_executionID || !n8n_resumeURL) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  // Update the stored payload
  latestPayload = {
    n8n_executionID,
    n8n_resumeURL
  };
  
  console.log('Received new payload:', latestPayload);
  
  // Return success response
  res.json({ 
    success: true, 
    message: 'Payload received', 
    launchUrl: `http://localhost:${port}/launch-chat`
  });
});

// Endpoint to get the latest payload
app.get('/api/get-payload', (req, res) => {
  res.json(latestPayload);
});

// Page specifically for launching the chat
app.get('/launch-chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'launch.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});