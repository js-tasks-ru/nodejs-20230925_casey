const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.encoding = options.encoding;
    this.bytes = 0;
  }

  _transform(chunk, encoding, callback) {
    this.bytes += chunk.byteLength;
    try {
      if (this.bytes > this.limit) {
        callback(new LimitExceededError, null);
      } else {
        console.log(chunk);
        callback(null, chunk);
      }
    } catch (err) {
    }
  }
}

module.exports = LimitSizeStream;
