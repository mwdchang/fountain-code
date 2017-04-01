'use strict'

function Fountain() {
  this.distributionType = '';
  this.distribution = [];
  this.message = '';
}

Fountain.prototype.set = function(msg) {
  this.message = msg;
  this.computeDistribution();
}

/**
 * Recomputes distribution
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
  let r = Math.random();
  let d = 0;

  for (let i=0; i < this.distribution.length; i++) {
    if (r <= this.distribution[i]) return i+1;
  }

}
