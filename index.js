var BigInt = require('jsbn');

module.exports = Networker;

function Networker(address, prefixlength, networksize) {
  if (!(this instanceof Networker))
    return new Networker(address, prefixlength, networksize);
  
  this.buffer = address;
  
  if (Array.isArray(this.buffer)) {
    this.buffer = this.buffer.slice();
    this.bytesize = this.buffer.length === 4 ? 8 : 16;
  }
  else {
    parse.call(this);
  }
  
  this.prefixlength = prefixlength || 0;
  this.networksize = typeof networksize !== 'undefined' ? networksize 
                                                        : this.bytesize * this.buffer.length;
}

Networker.prototype.size = function() {
  var size = this.networksize - this.prefixlength;
  var bn = new BigInt('2');
  return bn.shiftLeft(size - 1).toString();
};

Networker.prototype.subnet = function(end) {
  var start = this.supernet ? this.supernet.networksize : this.prefixlength;
  if (end <= start) {
    throw new Error('not a valid subnet');
  }
  
  var n = new Networker(this.buffer, start, end);
  n.supernet = this;
  this.networksize = end;
  return n;
};

Networker.prototype.network = function(index) {
  var size = this.networksize - this.prefixlength;
  var zero = new BigInt('0');
  var one = new BigInt('1');
  var max = (new BigInt('2')).shiftLeft(size - 1).subtract(one);
  
  var lowerindex;
  var upperindex;
  
  if (typeof index === 'undefined') {
    lowerindex = new BigInt('0');
    upperindex = max;
  }
  else {
    lowerindex = upperindex = new BigInt(index.toString());
  }
  
  if (!lowerindex.equals(zero) && lowerindex.max(zero) === zero) {
    throw new RangeError('smallest address index for this network is 0');
  }
  else if (!upperindex.equals(max) && upperindex.max(max) === upperindex) {
    throw new RangeError('largest address index for this network is ' + max.toString());
  }
  
  var subnet = generateRandomAddress.call(this, lowerindex, upperindex);
  return subnet;
};

Networker.prototype.address = function(lowerindex, upperindex) {
  var size = this.networksize - this.prefixlength;
  var zero = new BigInt('0');
  var one = new BigInt('1');
  var max = (new BigInt('2')).shiftLeft(size - 1).subtract(one);
  
  lowerindex = new BigInt((lowerindex || 0).toString());
  upperindex = typeof upperindex !== 'undefined' ? new BigInt(upperindex.toString()) : max;
  
  if (lowerindex.max(upperindex) === lowerindex) {
    throw new RangeError('lower index cannot be greater than upper index');
  }
  else if (!lowerindex.equals(zero) && lowerindex.max(zero) === zero) {
    throw new RangeError('smallest address index for this network is 0');
  }
  else if (!upperindex.equals(max) && upperindex.max(max) === upperindex) {
    throw new RangeError('largest address index for this network is ' + max.toString());
  }
  
  var subnet = generateRandomAddress.call(this, lowerindex, upperindex);
  return subnet.toString();
};

Networker.prototype.toString = function() {
  var parts = [];
  for (var i = 0; i < this.buffer.length; i++) {
    parts[i] = this.buffer[i].toString(this.bytesize === 8 ? 10 : 16);
  }
  return parts.join(this.bytesize === 8 ? '.' : ':');
};

function parse() {
  this.bytesize = this.buffer.indexOf('.') > -1 ? 8 : 16;
  
  var parts;
  if (this.bytesize === 8) {
    parts = this.buffer.split('.');
    if (parts.length !== 4) {
      throw new Error('not a valid address');
    }
  }
  else {
    this.buffer = expandIPv6(this.buffer);
    parts = this.buffer.split(':');
    if (parts.length !== 8) {
      throw new Error('not a valid address');
    }
  }
  
  this.buffer = [];
  var max = (2 << this.bytesize - 1) - 1;
  for (var i = 0; i < parts.length; i++) {
    var bytevalue = parseInt(parts[i], this.bytesize === 8 ? 10 : 16);
    if (bytevalue > max) bytevalue = max;
    this.buffer[i] = bytevalue;
  }
}

function expandIPv6(address) {
  var i = address.indexOf('::');
  if (i > -1) {
    var colons = address.match(/:/g);
    if (!colons) {
      throw new Error('not a valid address');
    }
    var ending = address.slice(i + 2);
    var missing = 8 - colons.length;
    var expanded = '';
    while (missing--) expanded += ':0';
    address = address.slice(0, i) + expanded + ':' + (ending ? ending : '0');
  }
  return address;
}

function setbits(bits, start, end) {
  var size = end - start;
  for (var i = 0; i < this.buffer.length; i++) {
    var b = this.buffer[i];
    var pos = i * this.bytesize;
    for (var n = 0; n < this.bytesize; n++) {
      if (pos + n >= start) {
        if (bits.testBit(size - 1)) {
          b |= 1 << (this.bytesize - 1 - n);
        }
        else {
          b &= ~(1 << (this.bytesize - 1 - n));
        }
        size--;
      }
      if (size === 0) {
        break;
      }
    }
    this.buffer[i] = b;
    if (size === 0) {
      break;
    }
  }
}

function generateRandomAddress(lowerindex, upperindex) {
  var address;
  if (lowerindex.equals(upperindex)) {
    address = lowerindex;
  }
  else {
    var bits = upperindex.subtract(lowerindex).bitLength();
    while (address = randombits(bits).add(lowerindex),
           address.compareTo(upperindex) > 0 ||
           address.compareTo(lowerindex) < 0);
  }
  
  var subnet = new Networker(this.buffer, this.networksize);
  setbits.call(subnet, address, this.prefixlength, this.networksize);
  return subnet;
}

function randombits(bits) {
  var r = new BigInt('0');
  for (var i = 0; i < bits; i++) {
    if (Math.random() >= 0.5) {
      r = r.setBit(i);
    }
  }
  return r;
}
