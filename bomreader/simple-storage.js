
class CachedItem {
  constructor(expire, value) {
    this.expire = expire;
    this.value = value;
  }
}

class Storage {
  constructor(gcCount) {
    this._storage = {};
    this._keys = [];
    this._gcCount = gcCount || 100;
    this._counter = 0;
  }

  set(key, value, expire_sec) {
    const expire = Date.now() + expire_sec * 1000;
    const item = new CachedItem(expire, value);
    console.log("set item: " + key + " - " + expire);

    this._storage[key] = item;
    this._counter++;
    if (this.counter > this._gcCount) {
      this._executeGc();
    }
  }

  get(key) {
    const item = this._storage[key];
    console.log("get item: " + key);

    if (!item) { return; }

    if (item.expire < Date.now()) {
      // expired!
      console.log("expired!");
      delete this._storage[key];
      return;
    }
    return item.value;
  }
  
  _executeGc() {
    Object.keys(this._storage).forEach(k => {
      const item = this._storage[k];
      if (item.expire < Date.now()) {
        // expired!
        delete this._storage[k];
      }
    });
  }
}
    
module.exports = Storage;
