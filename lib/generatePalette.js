const hslToRgb = require('hsl-to-rgb-for-reals');
const randomRange = require('./random-range');
const rgbToHex = require('rgb-hex');
const random = randomRange(Math.random);

// http://devmag.org.za/2012/07/29/how-to-choose-colours-procedurally-algorithms/

module.exports = function () {
  const finalPaletteSize = random(4, 8);
  const generateTriads = random(0, 1) > 0.9 ? true : false;

  function generateBasePalette() {
    const paletteSize = generateTriads ? 3 : finalPaletteSize;
    let rgb = [];

    for(let i = 0; i < paletteSize; i++) {
      let hue = random(0, 360);
      let saturation = random(0, 1);
      let lightness = random(0, 1)

      var color = hslToRgb(hue, saturation, lightness);
      rgb.push(color);
    }

    return rgb;
  }

  function randomTriadMix(color1, color2, color3, greyControl) {
    let randomIndex = parseInt(random(0, 2));

    let mixRatio1 = (randomIndex == 0) ? random(0, 1) * greyControl : random(0, 1);
    let mixRatio2 = (randomIndex == 1) ? random(0, 1) * greyControl : random(0, 1);
    let mixRatio3 = (randomIndex == 2) ? random(0, 1) * greyControl : random(0, 1);

    let sum = mixRatio1 + mixRatio2 + mixRatio3;

    mixRatio1 /= sum;
    mixRatio2 /= sum;
    mixRatio3 /= sum;

    let r = (mixRatio1 * color1[0] + mixRatio2 * color2[0] + mixRatio3 * color3[0]);
    let b = (mixRatio1 * color1[1] + mixRatio2 * color2[1] + mixRatio3 * color3[1]);
    let g = (mixRatio1 * color1[2] + mixRatio2 * color2[2] + mixRatio3 * color3[2]);

    var hex = `#${rgbToHex(r, g, b)}`;
    return hex;
  };

  function generateTriadPalette(rgbs) {
    const grayControl = random(0, 1);
    let palette = [];
    for(let i = 0; i < finalPaletteSize; i++) {
      palette.push(randomTriadMix(rgbs[0], rgbs[1], rgbs[2], 0.01));
    }
    return palette;
  }

  function generateRandomPalette(rgbs) {
    let palette = [];
    for(let rgb of rgbs) {
      palette.push(`#${rgbToHex(rgb[0], rgb[1], rgb[2])}`);
    }
    return palette;
  }

  let rgb = generateBasePalette();
  return generateTriads ? generateTriadPalette(rgb) : generateRandomPalette(rgb);
}
