// https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js

// menu toggle
document.querySelector('.menu-toggle').addEventListener('click', () => document.body.classList.toggle('menu-active'));

// header svg wave
const siteHeader = document.querySelector('#site-header');
const curvesSvg = siteHeader.querySelector('.site-header__curves-svg');
const curves = curvesSvg.querySelectorAll('.site-header__curves-svg path');

siteHeader.addEventListener('mouseenter', initCurveAnimation);
siteHeader.addEventListener('mousemove', _.throttle(animateCurves, 25));
siteHeader.addEventListener('mouseleave', resetCurves);

const state = {
  lastClientX: null,
  lastClientY: null,
  initialCurves: [
    'M-10 100 C-50 60 25 -35 100 100',
    'M-60 100 C90 70 50 -30 120 100',
    'M-20 100 C30 10 10 30 80 100'
  ]
}

const blendModes = [
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'lumnosity'
];

function initCurveAnimation(e) {
  curvesSvg.querySelector('g').style.mixBlendMode = _.sample(blendModes);
  state.lastClientX = e.clientX;
  state.lastClientY = e.clientY;
  [0, 1, 2].forEach(i => cancelAnimationFrame(window['frameID' + i]));
}

function move(dir, d, e, i) {
  if (e['client' + dir] !== state['lastClient' + dir]) {
    return d += ((e['client' + dir] - state['lastClient' + dir]) / (8 + i));
  }
  
  return d;
}

function animateCurves(e) {
  curves.forEach((curve, i) => {
    const d = curve.getAttribute('d').split(' ');    
    d.splice(4, 1, move('X', parseFloat(d[4]), e, i));
    d.splice(5, 1, move('Y', parseFloat(d[5]), e, i));
    curve.setAttribute('d', d.join(' '));
  });
  
  state.lastClientX = e.clientX;
  state.lastClientY = e.clientY;
}

function incAttr(initial, current) {
  initial = parseInt(initial);
  current = parseInt(current);
  
  if (initial < current) {
    return current--;
  } else if (initial > current) {
    return current++;
  }

  return current;
}

function reset(curve, i) {
  let d = curve.getAttribute('d');
  let initialD = state.initialCurves[i];
  
  if (d !== initialD) {
    d = d.split(' ');
    initialD = initialD.split(' ');
    d.splice(4, 1, incAttr(d[4], initialD[4]));
    d.splice(5, 1, incAttr(d[5], initialD[5]));
    curve.setAttribute('d', d.join(' '));
    window['frameID' + i] = requestAnimationFrame(() => reset(curve, i));
  } else {
    cancelAnimationFrame(window['frameID' + i]);
  }
}

function resetCurves() {
  curvesSvg.querySelector('g').style.mixBlendMode = _.sample(blendModes);
  curves.forEach((curve, i) => {
    window['frameID' + i] = requestAnimationFrame(() => reset(curve, i));
  });
}
