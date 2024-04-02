// index.js
require('dotenv').config(); // Import dotenv

// Init project
const express = require('express');
const app = express();

// Enable CORS
const cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));

// Handle static files
app.use(express.static('public'));

// Basic routing
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// API endpoint for greeting
app.get("/api/hello", (req, res) => {
  res.json({ greeting: 'hello API' });
});

// API endpoint for current time
app.get("/api", (req, res) => {
  const now = new Date();
  res.json({ unix: now.getTime(), utc: now.toUTCString() });
});

// API endpoint for specific date
app.get("/api/:date", (req, res) => {
  const { date } = req.params;

  let inputDate = new Date(date);

  if (isNaN(inputDate)) {
    inputDate = new Date(parseInt(date));
  }

  if (isNaN(inputDate)) {
    return res.json({ error: "Invalid Date" });
  }

  res.json({ unix: inputDate.getTime(), utc: inputDate.toUTCString() });
});

// Listen on port set in environment variable or default to 3000
const PORT = process.env.PORT || 3000;
const listener = app.listen(PORT, () => {
  console.log('Your app is listening on port ' + PORT);
});
