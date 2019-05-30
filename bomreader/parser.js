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

  const complete = _parseTable(completeList);
  const waiting = _parseTable(waitingList);

  return {
    approved: complete,
    queuing: waiting
  };
}

function parse_song(html) {
  const dom = new JSDOM(html);
  const song_table = dom.window.document.querySelector("div.bomusic-info");
  const result = {
    url: "",
    songName: "",
    attributes: [],
  };

  const items = song_table.querySelectorAll('div.form-group');
  items.forEach(row => {
    const label = row.querySelector('label');
    if (label) {
      const attribute = label.getAttribute('for');
      const value = row.querySelector('div');
      if (attribute == "songName") {
        result.songName = value.textContent.trim();
      } else if (attribute == "url") {
        const rex = /^(https?\S+).*$/s;
        const url = value.textContent.trim().replace(rex, '$1');
        result.url = url;

        // check if url indicate youtube movie
        let m = /^https?:\/\/www\.youtube\.com\/watch\?v=(.*)$/.exec(url);
        if (m) {
          result.youtubeID = m[1];
        }

        // youtu.be support
        m = /^https?:\/\/youtu\.be\/(.*)$/.exec(url);
        if (m) {
          result.youtubeID = m[1];
        }

	// nicovideo support
        m = /^https?:\/\/www\.nicovideo\.jp\/watch\/(sm\d+)$/.exec(url);
        if (m) {
          result.nicovideoID = m[1];
        }

      } else {
        result.attributes.push({
          attribute: attribute,
          name: label.textContent.trim(),
          value: value.textContent.trim()
        });
      }
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
    const song = _parseTableRow(row, "td");
    const parts = [];
    for (let i = 0; i < result.parts.length; i++) {
      parts.push({
        part: result.parts[i].text,
        player: song.parts[i].text,
        status: song.parts[i].status,
      });
    }
    song.parts = parts;
    result.songs.push(song);
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

  var rs = it.next();
  while (!rs.done) {
    let el = rs.value.querySelector('div');
    if (!el) {
      el = rs.value;
    }
    let part = {
      text: el.textContent.trim(),
      status: (rs.value.getAttribute('class') || "").trim(),
    };
    result.parts.push(part);
    rs = it.next();
  }
    
  return result;
}

