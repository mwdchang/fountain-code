'use strict'


let _ = require('lodash');

let c = 0;

function randomD(n) {
  c++;
  if (c % 4 === 0) {
    return 1;
  }
  return _.random(2, n);
}



let msg = process.argv[2];
let data = msg.split('').map((c,i) => { return {c:c, idx:i}});

let decodeMsg = new Array(msg.length);
let reserve = [];


function encode(data) {
  let sample = _.sampleSize(data, randomD(data.length));

  let packet = {
    data: 0,
    size: data.length
  };
  sample.forEach( s => packet.data ^= s.c.charCodeAt());
  packet.indicies = sample.map( s => s.idx);
  return packet;
}


function decode(packet) {
  if (packet.indicies.length === 1) {
    let idx = packet.indicies[0];
    if (decodeMsg[idx]) return;

    decodeMsg[idx] = String.fromCharCode(packet.data);
    console.log('length 1 packet', decodeMsg[idx]);
    resolve(packet.data, idx, 1);
  } else {
    reserve.push(packet);
  }
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
    console.log('\t'.repeat(iter) + 'resolved ', decodeMsg[pidx]);
    resolve(p.data, pidx, ++iter);
  });
}

let counter = 0;
while (decodeMsg.join('').localeCompare(msg) !== 0) {
  let packet = encode(data);
  console.log('receviing', packet,  decodeMsg.join(''));

  if (reserve.filter( p => p.data === packet.data).length > 0) {
    console.log('repeated...discard');
  } else {
    counter ++;
    decode(packet);
  }
}
console.log('Took ' + counter + ' packets.');