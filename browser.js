require('fastclick')(document.body);

var assign = require('object-assign');
var createConfig = require('./config');
var createRenderer = require('./lib/createRenderer');
var contrast = require('wcag-contrast');
var oflow = require('oflow');

var zoneSize = 6; //4;
var videoElement = document.getElementById('videoOut');

var canvas = document.querySelector('#canvas');
var background = new window.Image();
var context = canvas.getContext('2d');
var renderer = null;

var flow = new oflow.WebCamFlow(videoElement, zoneSize);
var seedContainer = document.querySelector('.seed-container');

var config = createConfig();

var isIOS = /(iPad|iPhone|iPod)/i.test(navigator.userAgent);

if (isIOS) { // iOS bugs with full screen ...
  const fixScroll = () => {
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 500);
  };

  fixScroll();
  window.addEventListener('orientationchange', () => {
    fixScroll();
  }, false);
}

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
canvas.style.position = 'absolute';

var opts = assign({
  context: context,
}, config);


var randomize = (ev) => {
  if (ev) ev.preventDefault();
  renderer = null;
};

// randomize();
reload();
resize();

function reload () {
  var pixelRatio = typeof opts.pixelRatio === 'number' ? opts.pixelRatio : 1;
  canvas.width = opts.width * pixelRatio;
  canvas.height = opts.height * pixelRatio;

  var init = function() {
    var stepCount;

    flow.onCalculated((direction) => {
      if(!renderer) {
        stepCount = 0;

        opts.videoWidth = videoElement.videoWidth;
        opts.videoHeight = videoElement.videoHeight;

        config = createConfig();

        opts = assign({
          context: context,
        }, config);

        setBackgroundColor();

        renderer = createRenderer(opts, direction);

        renderer.clear();
        renderer.clear();
        renderer.clear();
        renderer.clear();
      }

      // direction.zones[n] =
      // {
      //    x, y // zone center
      //    u, v // vector of flow in the zone
      // }

      renderer.step(opts.interval, direction);

      stepCount++;
      if (stepCount > opts.steps) {
        stepCount = 0;
        renderer = null;
      }
    });

    videoElement.removeEventListener('playing', init, false);
  };

  videoElement.addEventListener('playing', init, false);
  flow.startCapture();
}

function setBackgroundColor() {
  document.body.style.background = opts.palette[0];
  seedContainer.style.color = getBestContrast(opts.palette[0], opts.palette.slice(1));
  // seedText.textContent = opts.seedName;
}

function getBestContrast (background, colors) {
  var bestContrastIdx = 0;
  var bestContrast = 0;
  colors.forEach((p, i) => {
    var ratio = contrast.hex(background, p);
    if (ratio > bestContrast) {
      bestContrast = ratio;
      bestContrastIdx = i;
    }
  });
  return colors[bestContrastIdx];
}
