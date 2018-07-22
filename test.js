#!/usr/bin/env node

const fs = require('fs');
const parser = require('./parser');

const EVENT_HTML = 'test.html';
const SONG_HTML = 'song_sample.html';

function main() {
  const event_html = fs.readFileSync(EVENT_HTML, { encoding: 'utf8' });
  const event_result = parser.parse_event(event_html);
  console.log(event_result);

  const song_html = fs.readFileSync(SONG_HTML, { encoding: 'utf8' });
  const song_result = parser.parse_song(song_html);
  console.log(song_result);
}


main();
