#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const util = require('util');

const database = require('../bomreader/database');
const Cache = require('./cache').SongPropertyCache;

const config = require('./config').config;

function show_ids() {
  const event = config.eventId;
  const cache = new Cache();

  cache.forEach(song => {
    console.log(song.url);
    console.log(song.youtubeID);
  });
  
}


function main() {
  const event = config.eventId;

  database.getEvent(event, async result => {
    if (result.error) { return console.log(`event ${event} cannot retrieve`); }
    const waitMilSec = 1000;
    const cache = new Cache();

    for (const song of result.data.approved.songs) {
      const result = await cache.getSongWithWait("gmp10", song.songID, waitMilSec);
    };

    for (const song of result.data.queuing.songs) {
      const result = await cache.getSongWithWait("gmp10", song.songID, waitMilSec);
    };
    cache.save();

    show_ids();
  });
}

function retrieveRelatedUrl(song, cache) {
  const event = "gmp10";
  cache.getSong(event, song.songID).then(
    resp => {
      // cache.save();
    },
    err => {
      console.log(err);
    }
  );
}

main();
