var crypto = require('crypto');
var fs = require('fs');
var secret = '';

exports.getID = getID;

function getID(seed) {
    var base = getRandomString();
    var id = hash(base,seed); 
    return id;
}

function getRandomString() {
  var fd = fs.openSync('/dev/urandom', 'r');
  var str = fs.readSync(fd, 33, 0, 'base64')[0];
  fs.close(fd);
  return str;
}

function hash(base,seed) {
  return crypto.createHmac('sha256', secret)
    .update(base + seed)
    .digest('base64')
    .replace(/\+/g, ' ')
    .replace(/=*$/, '');
}

