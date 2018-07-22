#!/usr/bin/env node

const http = require('http');
const database = require('./database');

const CACHE_DURATION = 300;

const server = http.createServer((req, res) => {
  // add log handler
  res.on('close', () => {
    console.log(req.method +
                ":" + res.statusCode +
                " " + req.url +
                " - " + req.socket.remoteAddress +
                " - " + req.rawHeaders
               );
  });
  const path = req.url.substring(1);

  if (path.length === 0) {
    return send404(req, res);
  }

  if (path.search('/') == -1) {
    database.getEvent(path, result => {
      if (result.error) { return send404(req, res); }
      return sendJSON(result.data, req, res);
    });
    return;
  }
  if (path.search('song/' != -1)) {
    const songID = /(.*)\/song\/(\d+)$/.exec(path);
    if (!songID) { return send404(req, res); }
    database.getSong(songID[1], songID[2], result => {
      if (result.error) { return send404(req, res); }
      return sendJSON(result.data, req, res);
    });
    return;
  }
  send404(req, res);
});

function sendJSON(data, req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(data));
}

function send404(req, res) {
  res.writeHead(404);
  res.end("Not Found");
}

server.listen(1080, 'localhost', () => {
  console.log("start server: localhost:1080");
});
