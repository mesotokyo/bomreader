/*
  parser.js - html parser for B_O_M
 */

const { JSDOM } = require('jsdom');

exports.parse_event = parse_event;
exports.parse_song = parse_song;

function parse_event(html) {
  const dom = new JSDOM(html);
  const completeList = dom.window.document.querySelector("table.completeTable");
  const waitingList = dom.window.document.querySelector("table.waitingTable");

  return _parseTable(completeList);
  //return rs;
}

function parse_song(html) {
  const dom = new JSDOM(html);
  const song_table = dom.window.document.querySelector("div.bomusic-info");
  const result = [];

  const items = song_table.querySelectorAll('div.form-group');
  items.forEach(row => {
    const label = row.querySelector('label');
    if (label) {
      const attribute = label.getAttribute('for');
      const value = row.querySelector('div');
      result.push({
        attibute: attribute,
        name: label.textContent.trim(),
        value: value.textContent.trim()
      });
    }
  });

  return result;
}

function _parseTable(elem) {
  const result = {};
  const header = _parseTableRow(elem.querySelector('thead'), 'th');
  result.parts = header.parts;
  const tbody = elem.querySelector('tbody');
  const rows = tbody.querySelectorAll('tr');
  result.songs = []
  rows.forEach(row => {
    result.songs.push(_parseTableRow(row, "td"));
  });

  return result;
}

function _parseTableRow(elem, target) {
  const items = elem.querySelectorAll(target);
  const it = items.values();
  const result = {};

  const songTitle = it.next().value;
  const childElem = songTitle.querySelector('a');
  if (childElem) {
    result.song = childElem.textContent.trim();
    result.songUrl = childElem.getAttribute('href');
    const songID = /(\d+)$/.exec(result.songUrl);
    if (songID) {
      result.songID = songID[0];
    }
  } else {
    result.song = songTitle.textContent.trim();
  }

  result.artist = it.next().value.textContent.trim();
  result.status = it.next().value.textContent.trim();
  result.parts = [];

  var rs = it.next()
  while (!rs.done) {
    result.parts.push(rs.value.textContent.trim());
    rs = it.next();
  }
    
  return result;
}

