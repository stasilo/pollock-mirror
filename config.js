var seedRandom = require('seed-random');
var createRandomRange = require('./lib/random-range');

const generatePalette = require('./lib/generatePalette');

module.exports = function (seed) {
  if (typeof seed === 'undefined') {
    seed = String(Math.floor(Math.random() * 1000000));
  }

  var randomFunc = seedRandom(seed);
  var random = createRandomRange(randomFunc);

  return {
    // rendering options
    random: randomFunc,
    seedName: seed,
    pointilism: random(0.01, 0.1),
    noiseScalar: [ random(0.000001, 0.000001), random(0.0002, 0.004) ],
    globalAlpha: 0.5,
    maxRadius: random(15, 25),
    lineStyle: random(1) > 0.5 ? 'round' : 'square',
    interval: random(0.001, 0.01),
    steps: Math.floor(random(400, 800)),

    // browser/node options
    pixelRatio: 1,
    width: 1280 * 2,
    height: 720 * 2,
    palette: generatePalette(),
  };

  function arrayShuffle (arr) {
    var rand;
    var tmp;
    var len = arr.length;
    var ret = arr.slice();

    while (len) {
      rand = Math.floor(random(1) * len--);
      tmp = ret[len];
      ret[len] = ret[rand];
      ret[rand] = tmp;
    }

    return ret;
  }
};
