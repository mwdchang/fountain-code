/** Requires lodash **/
'use strict'

function Fountain() {
  this.distributionType = '';
  this.distribution = [];

  // Encoding
  this.message = '';
  this.messageData = null;

  // Decoding
  this.reserve = [];
  this.decodedData = null;


  // Tracking
  this.packetLog = [];
  this.resolveLog = [];
}

/**
 * Set message
 */
Fountain.prototype.set = function(msg) {
  this.message = msg;
  this.messageData = this.message.split('').map( (c, i) => {
    return {c: c, idx: i};
  });

  this.decodedData = this.message.split('').map( (c, i) => {
    return {c: null, idx:i}
  });

  this.computeDistribution();
}

/**
 * Recomputes distribution - basic soliton
 */
Fountain.prototype.computeDistribution = function() {
  let mLength = this.message.length;
  if (mLength === 0) return;

  let distribution = this.distribution;

  distribution.push(1 / mLength);
  let start = distribution[0]
  for (let i=2; i <= mLength; i++) {
    let v = start + ( 1 / (i*(i-1)) );
    distribution.push( v );
    start = v;
  }
  distribution[distribution.length-1] = 1.0;
}

/**
 * Degree function
 */
Fountain.prototype.degree = function() {
  let r = Math.random();
  for (let i=0; i < this.distribution.length; i++) {
    if (r <= this.distribution[i]) return i+1;
  }
}

/**
 * Returns an encoded packet
 */
Fountain.prototype.encode = function() {
  let degree = this.degree();
  let sample = _.sampleSize(this.messageData, degree);

  let d = 0;
  sample.forEach( s => {
    d ^= s.c.charCodeAt();
  })
  let idxList = sample.map(s => s.idx).sort();

  return { data: d, idxList: idxList, size: this.messageData.length };
}


Fountain.prototype.resolve = function(c, idx) {

  // Already resolved
  if (this.decodedData[idx].c !== null) return;

  this.decodedData[idx].c = c;
  this.reserve.forEach( p => {
    if (p.idxList.indexOf(idx) >= 0) {
      p.data ^= c.charCodeAt();
      p.idxList = _.difference(p.idxList, [idx]);
    }
  });

  let newResolve = _.remove(this.reserve, p => p.idxList.length === 1);
  newResolve.forEach( p=> {
    this.resolve(String.fromCharCode(p.data), p.idxList[0]);
  });
}


/**
 * decode
 */
Fountain.prototype.decode = function() {
  let packet = this.encode();
  let reserve = this.reserve;

  // Duplicate
  if (_.some(reserve, d => (d.data === packet.data))) return;

  this.packetLog.push( _.clone(packet) );

  // 0) Scrub
  let decoded = this.decodedData.filter( d => d.c !== null);
  decoded.forEach( d => {
    if (packet.idxList.indexOf(d.idx) >= 0) {
      packet.data ^= d.c.charCodeAt();
      packet.idxList = _.difference(packet.idxList, [d.idx]);
    }
  });

  // 1) Check if length 1
  if (packet.idxList.length === 1) {
    this.resolve(String.fromCharCode(packet.data), packet.idxList[0]);
  } else {
    this.reserve.push(packet);
  }

}
