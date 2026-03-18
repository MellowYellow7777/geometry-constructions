function newel(tag,className='',parent=document.body) {
  var element = document.createElement(tag);
  element.className = className;
  parent.appendChild(element);
  return element;
}

var color = new Color();

var colorpicker = newel('div','color-picker');
colorpicker.style.left = '50px';
colorpicker.style.top = '50px';

function createInp() {
  var wrapper = newel('div','input-wrapper',colorpicker);
  var sliderwrapper = newel('div','input-slider-wrapper',wrapper);
  var canvas = newel('canvas','input-canvas',sliderwrapper);
  canvas.width = 250;
  canvas.height = 11;
  var slider = newel('input','input-slider',sliderwrapper);
  var thumb = newel('img','input-slider-thumb',sliderwrapper);
  thumb.src = './thumb.png';
  newel('div','',thumb);
  slider.type = 'range';
  var number = newel('input','input-number',wrapper);
  number.type = 'text';
  return{wrapper,sliderwrapper,canvas,slider,number,thumb};
}

var rgbinps = [createInp(),createInp(),createInp()],
    [rgbrinp,rgbginp,rgbbinp] = rgbinps;

rgbinps.forEach(inp => {
  inp.slider.min = .01;
  inp.slider.max = 255;
  inp.slider.step = .01;
});

var rgbrctx = rgbrinp.canvas.getContext('2d');
var rgbgctx = rgbginp.canvas.getContext('2d');
var rgbbctx = rgbbinp.canvas.getContext('2d');

rgbrinp.slider.oninput = function(event) {
  color.rgb.r = this.value;
  draw();
}
rgbginp.slider.oninput = function(event) {
  color.rgb.g = this.value;
  draw();
}
rgbbinp.slider.oninput = function(event) {
  color.rgb.b = this.value;
  draw();
}
function rgbrdraw() {
  var grad = rgbrctx.createLinearGradient(0, 0, 250, 0);
  grad.addColorStop(0, `rgba(0, ${color.rgb.g}, ${color.rgb.b})`);
  grad.addColorStop(1, `rgba(255, ${color.rgb.g}, ${color.rgb.b})`);
  rgbrctx.fillStyle = grad;
  rgbrctx.fillRect(0, 0, 250, 14);
}
function rgbgdraw() {
  var grad = rgbgctx.createLinearGradient(0, 0, 250, 0);
  grad.addColorStop(0, `rgba(${color.rgb.r}, 0, ${color.rgb.b})`);
  grad.addColorStop(1, `rgba(${color.rgb.r}, 255, ${color.rgb.b})`);
  rgbgctx.fillStyle = grad;
  rgbgctx.fillRect(0, 0, 250, 14);
}
function rgbbdraw() {
  var grad = rgbbctx.createLinearGradient(0, 0, 250, 0);
  grad.addColorStop(0, `rgba(${color.rgb.r}, ${color.rgb.g}, 0)`);
  grad.addColorStop(1, `rgba(${color.rgb.r}, ${color.rgb.g}, 255)`);
  rgbbctx.fillStyle = grad;
  rgbbctx.fillRect(0, 0, 250, 14);
}

newel('div','gap',colorpicker);

var hsbinps = [createInp(),createInp(),createInp()],
    [hsbhinp,hsbsinp,hsbbinp] = hsbinps;

hsbinps.forEach(inp => {
  inp.slider.min = .01;
  inp.slider.max = 99.99;
  inp.slider.step = .01;
});

hsbhinp.slider.max = 359.99;

var hsbhctx = hsbhinp.canvas.getContext('2d');
var hsbsctx = hsbsinp.canvas.getContext('2d');
var hsbbctx = hsbbinp.canvas.getContext('2d');

hsbhinp.slider.oninput = function(event) {
  color.hsb.h = this.value;
  draw();
}
hsbsinp.slider.oninput = function(event) {
  color.hsb.s = this.value;
  draw();
}
hsbbinp.slider.oninput = function(event) {
  color.hsb.b = this.value;
  draw();
}
function hsbhdraw() {
  var grad = hsbhctx.createLinearGradient(0, 0, 250, 0);
  [0,1,2,3,4,5,6,7,8].forEach(i => {
    grad.addColorStop(i/8, `hsl(${i*360/8}, ${color.hsl.s}%, ${color.hsl.l}%)`);
  });
  hsbhctx.fillStyle = grad;
  hsbhctx.fillRect(0, 0, 250, 14);
}
function hsbsdraw() {
  var grad = hsbsctx.createLinearGradient(0, 0, 250, 0);
  var c0 = new Color;
  c0.setHSB(color.hsb.h,0,color.hsb.b);
  grad.addColorStop(0, c0.rgb.toString());
  var c1 = new Color;
  c1.setHSB(color.hsb.h,100,color.hsb.b);
  grad.addColorStop(1, c1.rgb.toString());
  hsbsctx.fillStyle = grad;
  hsbsctx.fillRect(0, 0, 250, 14);
}
function hsbbdraw() {
  var grad = hsbbctx.createLinearGradient(0, 0, 250, 0);
  var c0 = new Color;
  c0.setHSB(color.hsb.h,color.hsb.s,0);
  grad.addColorStop(0, c0.rgb.toString());
  var c1 = new Color;
  c1.setHSB(color.hsb.h,color.hsb.s,100);
  grad.addColorStop(1, c1.rgb.toString());
  hsbbctx.fillStyle = grad;
  hsbbctx.fillRect(0, 0, 250, 14);
}

newel('div','gap',colorpicker);

var hslinps = [createInp(),createInp(),createInp()],
    [hslhinp,hslsinp,hsllinp] = hslinps;

hslinps.forEach(inp => {
  inp.slider.min = .01;
  inp.slider.max = 99.99;
  inp.slider.step = .01;
});

hslhinp.slider.max = 359.99;

var hslhctx = hslhinp.canvas.getContext('2d');
var hslsctx = hslsinp.canvas.getContext('2d');
var hsllctx = hsllinp.canvas.getContext('2d');

hslhinp.slider.oninput = function(event) {
  color.hsl.h = this.value;
  draw();
}
hslsinp.slider.oninput = function(event) {
  color.hsl.s = this.value;
  draw();
}
hsllinp.slider.oninput = function(event) {
  color.hsl.l = this.value;
  draw();
}
function hslhdraw() {
  var grad = hslhctx.createLinearGradient(0, 0, 250, 0);
  [0,1,2,3,4,5,6,7,8].forEach(i => {
    grad.addColorStop(i/8, `hsl(${i*360/8}, ${color.hsl.s}%, ${color.hsl.l}%)`);
  });
  hslhctx.fillStyle = grad;
  hslhctx.fillRect(0, 0, 250, 14);
}
function hslsdraw() {
  var grad = hslsctx.createLinearGradient(0, 0, 250, 0);
  grad.addColorStop(0, `hsl(${color.hsl.h}, 0%, ${color.hsl.l}%)`);
  grad.addColorStop(1, `hsl(${color.hsl.h}, 100%, ${color.hsl.l}%)`);
  hslsctx.fillStyle = grad;
  hslsctx.fillRect(0, 0, 250, 14);
}
function hslldraw() {
  var grad = hsllctx.createLinearGradient(0, 0, 250, 0);
  grad.addColorStop(0, `hsl(${color.hsl.h}, ${color.hsl.s}%, 0%`);
  grad.addColorStop(.5, `hsl(${color.hsl.h}, ${color.hsl.s}%, 50%`);
  grad.addColorStop(1, `hsl(${color.hsl.h}, ${color.hsl.s}%, 100%`);
  hsllctx.fillStyle = grad;
  hsllctx.fillRect(0, 0, 250, 14);
}

newel('div','gap',colorpicker);

var hwbinps = [createInp(),createInp(),createInp()],
    [hwbhinp,hwbwinp,hwbbinp] = hwbinps;

hwbinps.forEach(inp => {
  inp.slider.min = .01;
  inp.slider.max = 99.99;
  inp.slider.step = .01;
});

hwbhinp.slider.max = 359.99;

var hwbhctx = hwbhinp.canvas.getContext('2d');
var hwbwctx = hwbwinp.canvas.getContext('2d');
var hwbbctx = hwbbinp.canvas.getContext('2d');

hwbhinp.slider.oninput = function(event) {
  color.hwb.h = this.value;
  draw();
}
hwbwinp.slider.oninput = function(event) {
  color.hwb.w = this.value;
  draw();
}
hwbbinp.slider.oninput = function(event) {
  color.hwb.b = this.value;
  draw();
}
function hwbhdraw() {
  var grad = hwbhctx.createLinearGradient(0, 0, 250, 0);
  [0,1,2,3,4,5,6,7,8].forEach(i => {
    grad.addColorStop(i/8, `hsl(${i*360/8}, ${color.hsl.s}%, ${color.hsl.l}%)`);
  });
  hwbhctx.fillStyle = grad;
  hwbhctx.fillRect(0, 0, 250, 14);
}
function hwbwdraw() {
  var grad = hwbwctx.createLinearGradient(0, 0, 250, 0);
  grad.addColorStop(0, `hwb(${color.hwb.h} 0% ${color.hwb.b}%)`);
  grad.addColorStop(1, `hwb(${color.hwb.h} 100% ${color.hwb.b}%)`);
  hwbwctx.fillStyle = grad;
  hwbwctx.fillRect(0, 0, 250, 14);
}
function hwbbdraw() {
  var g = Math.round(Math.min(...color.rgb.toArray())).toString(16).padStart(2,'0');
  hwbbctx.fillStyle = '#' + g + g + g;
  hwbbctx.fillRect(0, 0, 250, 14);
  var grad = hwbbctx.createLinearGradient(0, 0, 250 * (1 - (color.hwb.w / 100)), 0);
  grad.addColorStop(0, `hwb(${color.hwb.h} ${color.hwb.w}% 0%)`);
  grad.addColorStop(1, `hwb(${color.hwb.h} ${color.hwb.w}% ${100 - color.hwb.w}%`);
  hwbbctx.fillStyle = grad;
  hwbbctx.fillRect(0, 0, 250 * (1 - (color.hwb.w / 100)), 14);
}

newel('div','gap',colorpicker);

var cmykinps = [createInp(),createInp(),createInp(),createInp()],
    [cmykcinp,cmykminp,cmykyinp,cmykkinp] = cmykinps;

cmykinps.forEach(inp => {
  inp.slider.min = .01;
  inp.slider.max = 99.99;
  inp.slider.step = .01;
});

var cmykcctx = cmykcinp.canvas.getContext('2d');
var cmykmctx = cmykminp.canvas.getContext('2d');
var cmykyctx = cmykyinp.canvas.getContext('2d');
var cmykkctx = cmykkinp.canvas.getContext('2d');

cmykcinp.slider.oninput = function(event) {
  color.cmyk.c = this.value;
  draw();
}
cmykminp.slider.oninput = function(event) {
  color.cmyk.m = this.value;
  draw();
}
cmykyinp.slider.oninput = function(event) {
  color.cmyk.y = this.value;
  draw();
}
cmykkinp.slider.oninput = function(event) {
  color.cmyk.k = this.value;
  draw();
}

function cmykcdraw() {
  var grad = cmykcctx.createLinearGradient(0, 0, 250, 0);
  var c0 = new Color;
  c0.setCMYK(0,color.cmyk.m,color.cmyk.y,color.cmyk.k);
  grad.addColorStop(0, c0.rgb.toString());
  var c1 = new Color;
  c1.setCMYK(100,color.cmyk.m,color.cmyk.y,color.cmyk.k);
  grad.addColorStop(1, c1.rgb.toString());
  cmykcctx.fillStyle = grad;
  cmykcctx.fillRect(0, 0, 250, 14);
}
function cmykmdraw() {
  var grad = cmykmctx.createLinearGradient(0, 0, 250, 0);
  var c0 = new Color;
  c0.setCMYK(color.cmyk.c,0,color.cmyk.y,color.cmyk.k);
  grad.addColorStop(0, c0.rgb.toString());
  var c1 = new Color;
  c1.setCMYK(color.cmyk.c,100,color.cmyk.y,color.cmyk.k);
  grad.addColorStop(1, c1.rgb.toString());
  cmykmctx.fillStyle = grad;
  cmykmctx.fillRect(0, 0, 250, 14);
}
function cmykydraw() {
  var grad = cmykyctx.createLinearGradient(0, 0, 250, 0);
  var c0 = new Color;
  c0.setCMYK(color.cmyk.c,color.cmyk.m,0,color.cmyk.k);
  grad.addColorStop(0, c0.rgb.toString());
  var c1 = new Color;
  c1.setCMYK(color.cmyk.c,color.cmyk.m,100,color.cmyk.k);
  grad.addColorStop(1, c1.rgb.toString());
  cmykyctx.fillStyle = grad;
  cmykyctx.fillRect(0, 0, 250, 14);
}
function cmykkdraw() {
  var grad = cmykcctx.createLinearGradient(0, 0, 250, 0);
  var c0 = new Color;
  c0.setCMYK(color.cmyk.c,color.cmyk.m,color.cmyk.y,0);
  grad.addColorStop(0, c0.rgb.toString());
  var c1 = new Color;
  c1.setCMYK(color.cmyk.c,color.cmyk.m,color.cmyk.y,100);
  grad.addColorStop(1, c1.rgb.toString());
  cmykkctx.fillStyle = grad;
  cmykkctx.fillRect(0, 0, 250, 14);
}

newel('div','gap',colorpicker);

var cie1931inps = [createInp(),createInp(),createInp()],
    [cie1931xinp,cie1931yinp,cie1931zinp] = cie1931inps;

cie1931inps.forEach(inp => {
  inp.slider.min = .0001;
  inp.slider.max = 1;
  inp.slider.step = .0001;
});

var cie1931xctx = cie1931xinp.canvas.getContext('2d');
var cie1931yctx = cie1931yinp.canvas.getContext('2d');
var cie1931zctx = cie1931zinp.canvas.getContext('2d');

function cie1931xdraw() {
  var grad = cie1931xctx.createLinearGradient(0, 0, 250, 0);
  [0,1,2,3,4,5,6,7,8].forEach(i => {
    var c = new Color;
    c.setCIE1931(i/8, color.cie1931.y, color.cie1931.z);
    grad.addColorStop(i/8, c.rgb.toString());
  });  cie1931xctx.fillStyle = grad;
  cie1931xctx.fillRect(0, 0, 250, 14);
}
function cie1931ydraw() {
  var grad = cie1931yctx.createLinearGradient(0, 0, 250, 0);
  [0,1,2,3,4,5,6,7,8].forEach(i => {
    var c = new Color;
    c.setCIE1931(color.cie1931.x, i/8, color.cie1931.z);
    grad.addColorStop(i/8, c.rgb.toString());
  });
  cie1931yctx.fillStyle = grad;
  cie1931yctx.fillRect(0, 0, 250, 14);
}
function cie1931zdraw() {
  var grad = cie1931zctx.createLinearGradient(0, 0, 250, 0);
  [0,1,2,3,4,5,6,7,8].forEach(i => {
    var c = new Color;
    c.setCIE1931(color.cie1931.x, color.cie1931.y, i/8);
    grad.addColorStop(i/8, c.rgb.toString());
  });
  cie1931zctx.fillStyle = grad;
  cie1931zctx.fillRect(0, 0, 250, 14);
}

newel('div','gap',colorpicker);

cie1931xinp.slider.oninput = function(event) {
    color.cie1931.x = this.value;
    updateSliders();
    draw();
}
cie1931yinp.slider.oninput = function(event) {
    color.cie1931.y = this.value;
    updateSliders();
    draw();
}
cie1931zinp.slider.oninput = function(event) {
    color.cie1931.z = this.value;
    updateSliders();
    draw();
}

function findXRange(r, g, b, y, z) {
    let min = 0, max = 0.95047;
    min = Math.max(
        0,
        (1.5372 * y + 0.4986 * z) / 3.2406,
        (r / 255 + 1.5372 * y + 0.4986 * z - 1) / 3.2406,
        (r / 255 - 1.5372 * y - 0.4986 * z) / 3.2406
    );
    max = Math.min(
        0.95047,
        (1 + 1.5372 * y + 0.4986 * z) / 3.2406,
        (1 - 1.5372 * y - 0.4986 * z) / 3.2406
    );
    return { min, max };
}

function findYRange(r, g, b, x, z) {
    let min = 0, max = 1;
    min = Math.max(
        0,
        (0.9689 * x + 0.0415 * z) / 1.8758,
        (g / 255 - 0.9689 * x - 0.0415 * z) / 1.8758,
        (g / 255 + 0.9689 * x + 0.0415 * z - 1) / 1.8758
    );
    max = Math.min(
        1,
        (1 - 0.9689 * x - 0.0415 * z) / 1.8758,
        (1 + 0.9689 * x + 0.0415 * z - 1) / 1.8758
    );
    return { min, max };
}

function findZRange(r, g, b, x, y) {
    let min = 0, max = 1.08883;
    min = Math.max(
        0,
        (1.0570 * x - 0.2040 * y) / 0.0557,
        (b / 255 - 1.0570 * x + 0.2040 * y) / 0.0557,
        (b / 255 + 1.0570 * x - 0.2040 * y - 1) / 0.0557
    );
    max = Math.min(
        1.08883,
        (1 - 1.0570 * x + 0.2040 * y) / 0.0557,
        (1 + 1.0570 * x - 0.2040 * y - 1) / 0.0557
    );
    return { min, max };
}

function updateSliders() {
    const rgb = color.rgb;

    const xRange = findXRange(rgb.r, rgb.g, rgb.b, color.cie1931.y, color.cie1931.z);
    const yRange = findYRange(rgb.r, rgb.g, rgb.b, color.cie1931.x, color.cie1931.z);
    const zRange = findZRange(rgb.r, rgb.g, rgb.b, color.cie1931.x, color.cie1931.y);

    cie1931xinp.slider.min = xRange.min;
    cie1931xinp.slider.max = xRange.max;
    cie1931yinp.slider.min = yRange.min;
    cie1931yinp.slider.max = yRange.max;
    cie1931zinp.slider.min = zRange.min;
    cie1931zinp.slider.max = zRange.max;

    cie1931xinp.thumb.style.left = color.cie1931.x * 240 / 0.95047 + 'px';
    cie1931yinp.thumb.style.left = color.cie1931.y * 240 / 1 + 'px';
    cie1931zinp.thumb.style.left = color.cie1931.z * 240 / 1.08883 + 'px';
}

function draw() {
    rgbrdraw();
    rgbgdraw();
    rgbbdraw();
    hsbhdraw();
    hsbsdraw();
    hsbbdraw();
    hslhdraw();
    hslsdraw();
    hslldraw();
    hwbhdraw();
    hwbwdraw();
    hwbbdraw();
    cmykcdraw();
    cmykmdraw();
    cmykydraw();
    cmykkdraw();
    cie1931xdraw();
    cie1931ydraw();
    cie1931zdraw();
    setSliders();
    setNumbers();
}

function setNumbers() {
  rgbrinp.number.value = Math.round(color.rgb.r);
  rgbginp.number.value = Math.round(color.rgb.g);
  rgbbinp.number.value = Math.round(color.rgb.b);
  hsbhinp.number.value = Math.round(color.hsb.h);
  hsbsinp.number.value = Math.round(color.hsb.s);
  hsbbinp.number.value = Math.round(color.hsb.b);
  hslhinp.number.value = Math.round(color.hsl.h);
  hslsinp.number.value = Math.round(color.hsl.s);
  hsllinp.number.value = Math.round(color.hsl.l);
  hwbhinp.number.value = Math.round(color.hwb.h);
  hwbwinp.number.value = Math.round(color.hwb.w);
  hwbbinp.number.value = Math.round(color.hwb.b);
  cmykcinp.number.value = Math.round(color.cmyk.c);
  cmykminp.number.value = Math.round(color.cmyk.m);
  cmykyinp.number.value = Math.round(color.cmyk.y);
  cmykkinp.number.value = Math.round(color.cmyk.k);
  cie1931xinp.number.value = Math.round(color.cie1931.x);
  cie1931yinp.number.value = Math.round(color.cie1931.y);
  cie1931zinp.number.value = Math.round(color.cie1931.z);
}

function setSliders() {
  rgbrinp.thumb.style.left = color.rgb.r * 240/255 + 'px';
  rgbginp.thumb.style.left = color.rgb.g * 240/255 + 'px';
  rgbbinp.thumb.style.left = color.rgb.b * 240/255 + 'px';
  hsbhinp.thumb.style.left = color.hsb.h * 240/360 + 'px';
  hsbsinp.thumb.style.left = color.hsb.s * 240/100 + 'px';
  hsbbinp.thumb.style.left = color.hsb.b * 240/100 + 'px';
  hslhinp.thumb.style.left = color.hsl.h * 240/360 + 'px';
  hslsinp.thumb.style.left = color.hsl.s * 240/100 + 'px';
  hsllinp.thumb.style.left = color.hsl.l * 240/100 + 'px';
  hwbhinp.thumb.style.left = color.hwb.h * 240/360 + 'px';
  hwbwinp.thumb.style.left = color.hwb.w * 240/100 + 'px';
  hwbbinp.thumb.style.left = color.hwb.b * 240/100 + 'px';
  cmykcinp.thumb.style.left = color.cmyk.c * 240/100 + 'px';
  cmykminp.thumb.style.left = color.cmyk.m * 240/100 + 'px';
  cmykyinp.thumb.style.left = color.cmyk.y * 240/100 + 'px';
  cmykkinp.thumb.style.left = color.cmyk.k * 240/100 + 'px';
  cie1931xinp.thumb.style.left = color.cie1931.x * 240/1 + 'px';
  cie1931yinp.thumb.style.left = color.cie1931.y * 240/1 + 'px';
  cie1931zinp.thumb.style.left = color.cie1931.z * 240/1 + 'px';
}

draw();