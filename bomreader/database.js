
const http = require('http');
const parser = require('./parser');
const Storage = require('./simple-storage');

exports.getSong = getSong;
exports.getEvent = getEvent;

const _storage = new Storage();

const BOM_HOST = 'bandoff.info';

let CACHE_EXPIRE_SEC = Number(process.env.CACHE_EXPIRE);
if (isNaN(CACHE_EXPIRE_SEC) || CACHE_EXPIRE_SEC <= 0) {
  CACHE_EXPIRE_SEC = 300;
}


function _get(path, cb) {
  const options = {
    hostname: BOM_HOST,
    port: 80,
    path: path,
    agent: false,
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      'Cache-Control': 'max-age=0',
      Host: 'bandoff.info',
      'Upgrade-Insecure-Requests': 1,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
    },
  };
  http.get(options, res => {
    const { statusCode } = res;
    if (statusCode !== 200) {
      cb({error: true, statusCode: statusCode});
      return;
    }
    res.setEncoding('utf8');
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      cb({data: data});
    });
    res.on('error', e => {
      cb({error: true});
    });

  });
}

function getSong(eventID, songID, cb) {
  const path = '/' + eventID + '/song/' + songID;
  let result = _storage.get(path);

  // check if cache hits
  if (result) {
    cb({data: result});
    return;
  }

  // retrieve
  _get(path, res => {
    if (res.error) { return cb(res); }
    result = parser.parse_song(res.data);
    cb({data: result});
    _storage.set(path, result, CACHE_EXPIRE_SEC);
  });
}

function getEvent(eventID, cb) {
  const path = '/' + eventID;
  let result = _storage.get(path);

  // check if cache hits
  if (result) {
    cb({data: result});
    return;
  }

  console.log("retrieve: " + path);
  // retrieve
  _get(path, res => {
    if (res.error) { return cb(res); }
    result = parser.parse_event(res.data);
    cb({data: result});
    _storage.set(path, result, CACHE_EXPIRE_SEC);
  });
}
