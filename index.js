require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./localStorage');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post("/api/shorturl", function(req, res) {
  const shortUrls = JSON.parse(localStorage.getItem("shortUrls")) || {};
  const string = req.body.url;
  let shortId;

  //Now define the regular expression and test to match the string.
  let regex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)?([a-zA-Z0-9-]+\.)?(\w+)\.(com|net|org|ng|cc|co)(\/.+)?/i;

  if (!regex.test(string)) {
    //If the regex does not match the string, return an invalid url response.
    return res.json({
      "error": "invalid url"
    }).end();
  }

  // Next, check if the string already exists in the shortUrl object. 

  let count = 0;
  for (let k in shortUrls) {
    if (k == string) {
      count++;
    }
  }

  if (count !== 0) {
    return res.json({
      "original_url": string,
      "short_url": shortUrls[string]
    }).end();
  }

  // If the string does not, save it and a random number to the object, save the object to localhost, and then return both.
  shortId = Math.floor(Math.random() * 1000);
  shortUrls[string] = shortId;
  localStorage.setItem("shortUrls", JSON.stringify(shortUrls));

  res.json({
    "original_url": string,
    "short_url": shortId
  }).end();
})

app.get('/api/shorturl/:id', function(req, res) {
  const shortUrls = JSON.parse(localStorage.getItem("shortUrls")) || {};

  const id = req.params.id;

  const string = Object.keys(shortUrls).find(key => shortUrls[key] == id);

  if (string) {
    res.redirect(string);
  } else {
    res.status(404).send("URL not found");
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
