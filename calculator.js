'use strict';

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> ',
});

rl.prompt();

const defaultNetValues = {
  hostNum: 256,
  subnetMask: 24,
};

const RANGES = {
  first: (num) => num >= 192 && num <= 223,
  middle: (num) => num >= 0 && num <= 255,
  fourth: (num) => num === 0,
};

const verify = (ip) => {
  ip = ip.split('.').map((num) => Number(num));
  const [first, second, third, fourth] = ip;
  if (
    RANGES.first(first) &&
    RANGES.middle(second) &&
    RANGES.middle(third) &&
    RANGES.fourth(fourth)
  )
    return true;
  return false;
};

const calcNetValues = (ip, subnetNum) => {
  const netValues = {};
  if (!verify(ip)) throw new Error('Incorrect ip');
  if (subnetNum > defaultNetValues.hostNum)
    throw new Error('Can not create so many subnets');

  for (let i = 0; i <= 8; i++) {
    let binaryNum = 2;
    binaryNum = Math.pow(binaryNum, i);
    if (binaryNum >= subnetNum) {
      netValues.hostNum = defaultNetValues.hostNum / binaryNum;
      netValues.subnetMask = defaultNetValues.subnetMask + i;
      return netValues;
    }
  }
};

const calcSubnets = (ip, netValues, subnetNum) => {
  const res = [];
  const hostNum = netValues.hostNum;
  const strHostNum = hostNum.toString();
  const subnetMask = `/${netValues.subnetMask}`;
  const slicedID = ip.slice(0, ip.lastIndexOf('.') + 1);

  let networkID = ip;
  let broadcastID = slicedID + (hostNum - 1).toString();
  let maxRange = slicedID + (hostNum - 2).toString()
  let rangeID = `${slicedID + 1}-${maxRange}`;

  if (hostNum === 1) rangeID = networkID;

  res.push({ networkID, subnetMask, rangeID, strHostNum, broadcastID });

  for (let i = 1; i < subnetNum; i++) {
    networkID = slicedID + (hostNum * i).toString();
    broadcastID = slicedID + (hostNum * (i + 1) - 1).toString();
    maxRange = slicedID + (hostNum * (i+1) - 2).toString();
    rangeID = `${(slicedID + ((hostNum * i) + 1))}-${maxRange}`;

    if (hostNum === 1) rangeID = networkID;

    res.push({ networkID, subnetMask, rangeID, strHostNum, broadcastID });
  }

  return res;
};

const question = (str) => new Promise((answer) => rl.question(str, answer));

const commands = {
  async ip() {
    const ip = await question('Enter your ip: ');
    const number = await question('Enter number of subnets: ');
    console.table(calcSubnets(ip, calcNetValues(ip, number), number));
  },

  exit() {
    rl.close();
  },
};

rl.on('line', async (line) => {
  try {
    line = line.trim();
    const command = commands[line];
    if (command) await command();
    rl.prompt();
  } catch (err) {
    console.log(err.message);
    process.exit();
  }
}).on('close', () => process.exit(0));
