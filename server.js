#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const database = require('./database');
const INDEX_HTML = 'index.html';

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
    return sendPage(INDEX_HTML, req, res);
  }

  if (path.search('.') == -1) {
    return sendPage(INDEX_HTML, req, res);
  }

  if (path.search('/') == -1) {
    return sendPage(path, req, res);
  }

  if (path.search('event/') == 0) {
    const eventID = /^event\/(.+)$/.exec(path);
    database.getEvent(eventID[1], result => {
      if (result.error) { return send404(req, res); }
      return sendJSON(result.data, req, res);
    });
    return;
  }
  if (path.search('song/' == 0)) {
    const songID = /song\/(.*)\/(\d+)$/.exec(path);
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

function sendPage(filepath, req, res) {
  fs.readFile(filepath, { encoding: 'utf8' }, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }

    const ext = path.extname(filepath);
    let contentType = 'text/html; charset=UTF-8';
    if (ext == '.html') {
      contentType = 'text/html; charset=UTF-8';
    } else if (ext == '.js') {
      contentType = 'text/javascript';
    } else if (ext == '.css') {
      contentType = 'text/css';
    } else if (ext == '.json') {
      contentType = 'application/json';
    }
    
    res.setHeader('Content-Type', contentType);
    res.writeHead(200);
    res.end(data);
  });
}

server.listen(1080, 'localhost', () => {
  console.log("start server: localhost:1080");
});
