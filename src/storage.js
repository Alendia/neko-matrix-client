const { existsSync, readFileSync } = require("fs");
const { writeFile } = require("fs/promises");
const path = require("path");

const storePath = path.join(__dirname, "./sessionStore.json");

const readContent = () => {
  if (existsSync(storePath) && Array.from(readFileSync(storePath)).length !== 0) {
    return new Storage(new Map(Object.entries(JSON.parse(readFileSync(storePath)))));
  } else {
    return new Storage();
  }
};

function Storage(content) {
  this._store = content || new Map();
  Object.defineProperty(this, "length", { get: () => this._store.size });
}

Storage.prototype.key = function key(index) {
  return Array.from(this._store.keys())[index];
};

Storage.prototype.getItem = function getItem(key) {
  return this._store.get(key);
};

Storage.prototype.setItem = function setItem(key, value) {
  this.length++;
  this._store.set(key, value);
  writeFile(storePath, JSON.stringify(content));
};

Storage.prototype.removeItem = function removeItem(key) {
  this.length--;
  this._store.delete(key);
  writeFile(storePath, JSON.stringify(content));
};

Storage.prototype.clear = function clear() {
  this.length = 0;
  this._store.clear();
  writeFile(storePath, JSON.stringify(content));
};

readContent();

module.exports = { Storage, readContent };
/* const a = new Storage();
console.log(a);
console.log(a.setItem("1", 233));
console.log(a.length);
console.log("key", a.key(0));
console.log(a.getItem("1"));
console.log(a.getItem("2"));
console.log(a.removeItem("1"));
console.log(a.getItem("1"));
console.log(a.length); */
