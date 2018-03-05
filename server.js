const express = require('express');
const fs = require('fs');
const url = require('url');
const app = express();

const port = /*process.env.PORT*/ '1985';

const testURL = /^https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)*$/;

let short, shortURLs;

app.get('/new/*', (req, res) => {
  let longURL = req.params[0];
  if (testURL.test(longURL)) {
    short = [];
    fs.readFile('data-base.json', 'utf8', (e, data) => {
      if (e) throw e;
      shortURLs = JSON.parse(data);
      let i = 0;
      while (shortURLs.hasOwnProperty(String.fromCharCode(...short)) || short.length < 5) {
        short.push(Math.floor(Math.random() * 26 + 97))
      }
      short = String.fromCharCode(...short);
       shortURLs[short] = longURL;
       fs.writeFile('data-base.json', JSON.stringify(shortURLs), (e) => {
         if (e) throw e;
         res.json({
           original_url: longURL,
           short_url: req.protocol + '://' + req.hostname + '/' + short
         });
       });
    });
  } else {
    res.json({
      error: 'URL is invalid'
    });
  }
});

app.get('/:short', (req, res) => {
  short = req.params.short;
  fs.readFile('data-base.json', 'utf8', (e, data) => {
    if (e) throw e;
    shortURLs = JSON.parse(data);
    if (shortURLs.hasOwnProperty(short)) {
      res.redirect(shortURLs[short]);
    } else {
      res.json({
      error: 'URL is not in database'
      });
    }
    res.end();
  });
});

app.get('/*', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Add your URL after "/new/"');
});


app.listen(port);
