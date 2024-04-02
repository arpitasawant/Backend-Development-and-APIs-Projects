// Imports
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Database connection
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  exercises: [{
    description: String,
    duration: Number,
    date: { type: Date, default: Date.now }
  }]
}, { versionKey: false });

const User = mongoose.model('User', userSchema);

// Error message constant
const ERROR = { error: "There was an error while processing the request." };

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, _id: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json(ERROR);
  }
});

app.get('/api/users/:id/logs', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) return res.json({ error: "User not found." });

    let log = user.exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }));

    if (req.query.from && req.query.to) {
      const fromDate = new Date(req.query.from);
      const toDate = new Date(req.query.to);
      log = log.filter(exercise => {
        const exerciseDate = new Date(exercise.date);
        return exerciseDate >= fromDate && exerciseDate <= toDate;
      });
    }

    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      log = log.slice(0, limit);
    }

    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log
    });
  } catch (err) {
    res.status(500).json(ERROR);
  }
});


app.post('/api/users', async (req, res) => {
  try {
    const username = req.body.username;
    const user = await User.create({ username: username });
    res.json({ _id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json(ERROR);
  }
});

app.post('/api/users/:id/exercises', async (req, res) => {
  try {
    const id = req.params.id;
    const { description, duration, date } = req.body;

    const user = await User.findById(id);
    if (!user) return res.json({ error: "User not found." });

    const exercise = {
      description: description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    };

    user.exercises.push(exercise);
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    });
  } catch (err) {
    res.status(500).json(ERROR);
  }
});

// Start server
const port = process.env.PORT || 3000;
const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
