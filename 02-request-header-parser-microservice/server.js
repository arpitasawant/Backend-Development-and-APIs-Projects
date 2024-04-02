// index.js
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));

// Basic routing
app.use(express.static('public'));

// API endpoint for greeting
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/api/hello", (req, res) => {
  res.json({ greeting: 'hello API' });
});

// API endpoint for /api/whoami
app.get("/api/whoami", (req, res) => {
  const ipAddress = req.ip; // Get IP address from request
  const language = req.headers['accept-language']; // Get preferred language from request headers
  const software = req.headers['user-agent']; // Get software information from request headers

  res.json({ ipaddress: ipAddress, language: language, software: software });
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
