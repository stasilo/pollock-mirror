var newArray = require('new-array');
var lerp = require('lerp');
var randomRange = require('./random-range');
var mapRange = require('map-range');
var vec2 = require('gl-vec2');
var SimplexNoise = require('simplex-noise');
// var binarySearch = require('olical-binary-search');

module.exports = function createRenderer (opt, direction) {
  opt = opt || {};

  const deltaThreshold = 1;
  const maxParticleAmount = 150; //200;

  var randFunc = opt.random || Math.random;
  var random = randomRange(randFunc);

  var simplex = new SimplexNoise(randFunc);
  var ctx = opt.context;
  var dpr = typeof opt.pixelRatio === 'number' ? opt.pixelRatio : 1;
  var canvas = ctx.canvas;

  var width = canvas.width;
  var height = canvas.height;

  var palette = opt.palette || ['#fff', '#000'];

  var maxRadius = typeof opt.maxRadius === 'number' ? opt.maxRadius : 10;
  var startArea = typeof opt.startArea === 'number' ? opt.startArea : 0.5;
  var pointilism = lerp(0.000001, 0.5, opt.pointilism);
  var noiseScalar = opt.noiseScalar || [0.00001, 0.0001];
  var globalAlpha = typeof opt.globalAlpha === 'number' ? opt.globalAlpha : 1;

  var time = 0;
  var particles = [];

  return {
    clear: clear,
    step: step,
  };

  function generateNewParticles(direction) {
    let i = 0;
    let limit = maxParticleAmount - particles.length;
    for(let zone of direction.zones) {
      if(i > limit) {
        break;
      }

      if(Math.abs(zone.v) < deltaThreshold || Math.abs(zone.u) < deltaThreshold) {
        continue;
      }

      let particle = resetParticle(undefined, zone, direction);
      particles.push(particle);
    }
  }

  function clear () {
    ctx.fillStyle = palette[0];

    // palette.push(ctx.fillStyle);

    // palette.push(ctx.fillStyle);
    // palette.push(ctx.fillStyle);
    // palette.push(ctx.fillStyle);

    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function step (dt, direction) {
    time += dt;

    const halfWidth = (width / 2);
    let survivors = [];

    particles.forEach((p, i) => {
      var x = p.position[0];
      var y = p.position[1];

      direction.zones.forEach((zone, j) => {
        const maxDistance = 10; //8 <-- //10 //20;

        let distance = vec2.distance(p.position, [ halfWidth - zone.x*2, zone.y*1.42]);
        if(distance < maxDistance) {
          p.flow[0] = -(zone.u + direction.u);
          p.flow[1] = zone.v + direction.v;
          vec2.normalize(p.flow, p.flow);

          p.time -= (dt/3); //(dt/3);
          return false;
        }
      });

      var speed = p.speed + dt; //+ lerp(0.0, 2, 1 - heightValue);

      for(let renderC = 0; renderC < 2; renderC++) {
        vec2.add(p.velocity, p.velocity, p.flow);
        vec2.normalize(p.velocity, p.velocity);

        var move = vec2.scale([], p.velocity, speed);
        vec2.add(p.position, p.position, move);

        var s2 = pointilism;
        var r = p.radius * simplex.noise3D(x * s2, y * s2, (p.duration + (time/100)));

        ctx.beginPath();
        ctx.lineTo(x, y);
        ctx.lineTo(p.position[0], p.position[1]);
        ctx.lineWidth = r * (p.time / p.duration);
        ctx.lineCap = opt.lineStyle || 'square';
        ctx.lineJoin = opt.lineStyle || 'square';

        ctx.strokeStyle = p.color;
        ctx.globalAlpha = globalAlpha// + 0.2 - random(0.2, 0.4);
        ctx.stroke();
      }

      p.time += dt;
      if (p.time < p.duration) {
        survivors.push(p);
      }
    });

    particles = survivors;
    if(particles.length < maxParticleAmount) {
      generateNewParticles(direction);
    }
  }

  function resetParticle (p, zone, direction) {
    p = p || {};

    // var scale = Math.min(width, height) / 2;

    p.position = [];
    p.position[0] = (width / 2) - zone.x*2;
    p.position[1] = (zone.y*1.42);

    p.flow = [];
    p.flow[0] = -zone.u;
    p.flow[1] = zone.v;

    var flowLength = vec2.length([zone.u, zone.v]);
    p.velocity = [zone.u * (1/flowLength), zone.v * (1/flowLength)];
    vec2.normalize(p.velocity, p.velocity);

    p.duration = random(0.01, (0.05 + random(0.05, 0.4)));
    p.time = random(0, p.duration);

    p.radius = random(0.40 * maxRadius, maxRadius);
    p.speed = random(1, 2) * dpr * 2.5 * 0.65; //1; //0.8;

    // Note: We actually include the background color here.
    // This means some strokes may seem to "erase" the other
    // colours, which can add a nice effect.
    p.color = palette[Math.floor(random(palette.length))];
    return p;
  }

  function shadeColor(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
  }

  function blendColors(c0, c1, p) {
    var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
    return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
  }
};
