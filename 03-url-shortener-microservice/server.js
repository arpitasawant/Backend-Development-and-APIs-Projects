require('dotenv').config();
console.log(process.env.DB_URI);

const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Model
const schema = new mongoose.Schema({
  original: { type: String, required: true },
  short: { type: Number, required: true }
});
const Url = mongoose.model('Url', schema);

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Set up CORS
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve index.html
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Redirect short URLs to original URLs
app.get("/api/shorturl/:input", (req, res) => {
  const input = parseInt(req.params.input);
  Url.findOne({ short: input }).exec()
    .then(data => {
      if (!data) return res.json({ error: "URL not found" });
      return res.redirect(data.original);
    })
    .catch(err => res.status(500).json({ error: "Internal Server Error" }));
});

// Shorten a URL
app.post("/api/shorturl", async (req, res) => {
  const bodyUrl = req.body.url;
  const urlRegex = new RegExp(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/);

  if (!bodyUrl.match(urlRegex)) {
    return res.json({ error: "Invalid URL" });
  }

  let index = 1;
  try {
    const data = await Url.findOne({}).sort({ short: 'desc' }).exec();
    index = data !== null ? data.short + 1 : index;

    const newUrl = await Url.findOneAndUpdate(
      { original: bodyUrl },
      { original: bodyUrl, short: index },
      { new: true, upsert: true }
    ).exec();
    res.json({ original_url: bodyUrl, short_url: newUrl.short });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
