'use strict'


let _ = require('lodash');

let c = 0;


function basicSoliton(n) {
  let r = Math.random();
  for (let i=0; i < distribution.length; i++) {
    if (r <= distribution[i]) return i+1;
  }
}

function randomD(n) {
  return basicSoliton(n);

  /*
  c++;
  if (c % 5 === 0) {
    return 1;
  }
  return _.random(2, n);
  */
}



let msg = process.argv[2];
let msgLength = msg.length;
let data = msg.split('').map((c,i) => { return {c:c, idx:i}});
let distribution = [];

distribution.push(1 / msgLength);
let start = distribution[0]
for (let i=2; i <= msgLength; i++) {
  let v = start + ( 1 / (i*(i-1)) );
  distribution.push( v );
  start = v;
}
console.log('final start', start);
console.log(distribution);



let decodeMsg = new Array(msg.length);
let reserve = [];


function encode(data) {
  let sample = _.sampleSize(data, randomD(data.length));
  // console.log('encode', sample.length);

  let packet = {
    data: 0,
    size: data.length
  };
  sample.forEach( s => packet.data ^= s.c.charCodeAt());
  packet.indicies = sample.map( s => s.idx);
  return packet;
}


function decode(packet) {

  // 0) Strip the packet of any already decoded symbols
  // console.log('raw', packet);
  for (let i=0; i < decodeMsg.length; i++) {
    if (! decodeMsg[i] || packet.indicies.indexOf(i) === -1) continue;

    let c = decodeMsg[i].charCodeAt();
    packet.data ^= c;
    _.remove(packet.indicies, (d) => d === i);
  }
  // console.log('stripped', packet);


  // 1) Either resolve (length = 1) or put it into reserve for later
  if (packet.indicies.length === 1) {
    let idx = packet.indicies[0];

    decodeMsg[idx] = String.fromCharCode(packet.data);
    // console.log('length 1 packet', decodeMsg[idx]);
    // console.log('going to resolve');
    resolve(packet.data, idx, 1);
  } else if (packet.indicies.length > 1) {
    reserve.push(packet);
  }
  // console.log('');
}


function resolve(data, idx, iter) {

  reserve.forEach( packet => {
    if (packet.indicies.indexOf(idx) !== -1) {
      packet.data ^= data;
      _.remove(packet.indicies, (d)=> d === idx);
    }
  });

  let rlist = _.remove(reserve, p => p.indicies.length === 1);
  rlist.forEach(p => {
    let pidx = p.indicies[0];
    decodeMsg[pidx] = String.fromCharCode(p.data);
    // console.log('\t'.repeat(iter) + 'resolved ', decodeMsg[pidx]);
    resolve(p.data, pidx, ++iter);
  });
}

let counter = 0;
while (decodeMsg.join('').localeCompare(msg) !== 0 && c < 100) {
  let packet = encode(data);
  // console.log('receviing', packet,  decodeMsg.join(''));

  if (reserve.filter( p => p.data === packet.data).length > 0) {
  } else {
    counter ++;
    decode(packet);
  }
}
console.log('Took ' + counter + ' packets. Original message lenth ' + msgLength);
