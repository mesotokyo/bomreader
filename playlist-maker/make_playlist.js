#!/usr/bin/env node

const fs = require('fs');
const util = require('util');
const readline = require('readline');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const database = require('../bomreader/database');
const Cache = require('./cache').SongPropertyCache;

const SCOPES = ['https://www.googleapis.com/auth/youtube'];
const TOKEN_DIR = __dirname + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'cred.json';
const SECRET_PATH = TOKEN_DIR + 'client.json';

const config = require('./config').config;

// Load client secrets from a local file.
fs.readFile(SECRET_PATH, function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the YouTube API.
  authorize(JSON.parse(content), main);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
  console.log('Token stored to ' + TOKEN_PATH);
}

async function insert(service) {
  const cache = new Cache();
  const songs = cache.getAllSongs("gmp10");

  for (const song of songs) {
    if (!song.youtubeID || song.youtubeID.length == 0) {
      console.log(`${song.songName}: ${song.url} is not YouTube's URL.`);
      continue;
    }

    const param = {
      part: "snippet",
      resource: {
        snippet: {
          playlistId: config.playlistId,
          resourceId: { videoId: song.youtubeID,
                        kind: 'youtube#video' },
        }
      }
    }

    try {
      const resp = await service.playlistItems.insert(param);
      console.log(`insert ${song.songName} done`);
    } catch (err) {
      console.log(`insert ${song.youtubeID} (${song.songName}) failed.`);
      if (err.errors) {
        err.errors.forEach(e => {
          console.log(`${e.reason} (${e.message})`);
        });
      }
    }
  }
}

async function deleteAll(service) {
  let hasNext = true;
  let nextToken = "";
  let result;

  while(hasNext) {
    try {
      result = await service.playlistItems.list({ part: 'id',
                                                  playlistId: config.playlistId,
                                                  maxResults: 50,
                                                  pageToken: nextToken,
                                                });
    } catch (err) {
      console.log(err);
      return;
    }

    //console.log(result);
    for (let item of result.data.items) {
      try {
        const resp = await service.playlistItems.delete({ id: item.id });
        console.log(`${item.id} deleted`);
      } catch (err) {
        console.log(err);
      }
    }

    if (result.data.nextPageToken) {
      nextToken = result.data.nextPageToken;
    } else {
      hasNext = false;
    }
  }    
}

function main(auth) {
  const service = google.youtube({
    version: 'v3',
    auth: auth
  });

  //deleteAll(service);
  //insert(service);

}
