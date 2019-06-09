
const CACHE_FILE = './.cache.json';

const fs = require('fs');
const path = require('path');
const util = require('util');

const database = require('../bomreader/database');

class SongPropertyCache {
  constructor() {
    this._cacheFile = CACHE_FILE;
    this._cacheDict = {};
    this.load();
  }

  forEach(cb) {
    Object.values(this._cacheDict).forEach(cb);
  }

  getAllSongs(eventId) {
    let keys = Object.keys(this._cacheDict)
        .filter(x => x.match(`${eventId}:`))
        .sort();
    return keys.map(x => this._cacheDict[x]);
  }
    

  load() {
    let data;
    try {
      data = fs.readFileSync(this._cacheFile,
                             { encoding: 'utf8' });
    }
    catch (e) {
      this._cacheDict = {};
      return;
    }
    try {
      this._cacheDict = JSON.parse(data);
    }
    catch (e) {
      console.log(e);
      throw `${this._cacheFile}: invalid JSON!`;
    }
  }

  save() {
    const data = JSON.stringify(this._cacheDict);
    fs.writeFileSync(this._cacheFile, data);
  }

  async getSongWithWait(eventId, songId, waitMilSec) {
    const key = `${eventId}:${songId}`;
    if (this._cacheDict[key] !== undefined) {
      return this._cacheDict[key];
    }
    console.log(`retrieve ${eventId}:${songId}`);

    const setTimeoutPromise = util.promisify(setTimeout);
    await setTimeoutPromise(waitMilSec);
    return await this.getSong(eventId, songId);
  }

  getSong(eventId, songId) {
    return new Promise((resolve, reject) => {
      const key = `${eventId}:${songId}`;
      if (this._cacheDict[key] !== undefined) {
        resolve(this._cacheDict[key]);
        return;
      }
      database.getSong(eventId, songId, result => {
        if (result.error) {
          reject(`song ${songId} cannot retrieve`);
          return;
        }
        this._cacheDict[key] = result.data;
        resolve(result.data);
      });
    });
  }

}

exports.SongPropertyCache = SongPropertyCache;
