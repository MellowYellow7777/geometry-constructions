class ColorPicker {
  constructor(x,y,submit,initial='#FF0000') {
    var screen = document.createElement('div');
    screen.style = `
      position: absolute;
      left: 0px;
      top: 0px;
      width: 100vw;
      height: 100vh;
      z-index: 2;
    `;
    screen.onpointerup = (event) => {
      event.stopPropagation();
      submit(this.color.hex);
      this.element.remove();
      screen.remove();
    }
    document.body.appendChild(screen);
    var color = new Color();
    this.color = color;
    color.hex = initial;
    this.element = document.createElement('div');
    this.element.style.zIndex = 3;
    document.body.appendChild(this.element);
    this.element.className = 'color-picker';
    this.element.style.left = x + 'px';
    this.element.style.top = y + 'px';
    var shadeCanvasWrapper = document.createElement('div');
    this.element.appendChild(shadeCanvasWrapper);
    shadeCanvasWrapper.className = 'shade-canvas-wrapper';
    var scanvas = document.createElement('canvas');
    var sctx = scanvas.getContext('2d');
    shadeCanvasWrapper.appendChild(scanvas);
    scanvas.width = 232;
    scanvas.height = 138;
    function sdraw(hue=0) {
      sctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      sctx.fillRect(0, 0, 232, 138);
      var gw = sctx.createLinearGradient(0, 0, 232, 0);
      gw.addColorStop(0, "rgba(255, 255, 255, 1)");
      gw.addColorStop(1, "rgba(255, 255, 255, 0)");
      sctx.fillStyle = gw;
      sctx.fillRect(0, 0, 232, 138);
      var gb = sctx.createLinearGradient(0, 0, 0, 138);
      gb.addColorStop(0, "rgba(0, 0, 0, 0)");
      gb.addColorStop(1, "rgba(0, 0, 0, 1)");
      sctx.fillStyle = gb;
      sctx.fillRect(0, 0, 232, 138);
    }
    var sbubble = document.createElement('div');
    shadeCanvasWrapper.appendChild(sbubble);
    sbubble.className = 'shade-bubble';
    shadeCanvasWrapper.onpointerdown = function(event) {
      var rect = shadeCanvasWrapper.getBoundingClientRect();
      function updPosition(event) {
        var x = (event.clientX - rect.left)/232*100;
        var y = 100-(event.clientY - rect.top)/138*100;
        var s = Math.max(0.001, Math.min(100, x));
        var b = Math.max(0.001, Math.min(100, y));
        color.setHSB(color.hsb.h,s,b);
        updateInputs();
      }
      updPosition(event);
      this.setPointerCapture(event.pointerId);
      this.onpointermove = updPosition;
      this.onpointerup = function(event) {
        this.releasePointerCapture(event.pointerId);
        this.onpointermove = null;
        this.onpointerup = null;
      }
    }
    sdraw();
    var hueCanvasWrapper = document.createElement('div');
    this.element.appendChild(hueCanvasWrapper);
    hueCanvasWrapper.className = 'hue-canvas-wrapper';
    var hcanvas = document.createElement('canvas');
    var hctx = hcanvas.getContext('2d');
    hueCanvasWrapper.appendChild(hcanvas);
    hcanvas.width = 130;
    hcanvas.height = 12;
    function hdraw() {
      var grad = hctx.createLinearGradient(0, 0, 130, 0);
      [0,1,2,3,4,5,6,7,8].forEach(i => {
        grad.addColorStop(i/8, `hsl(${i*360/8}, 100%, 50%)`);
      });
      hctx.fillStyle = grad;
      hctx.fillRect(0, 0, 130, 12);
    }
    var hbubble = document.createElement('div');
    hueCanvasWrapper.appendChild(hbubble);
    hbubble.className = 'hue-bubble';
    hueCanvasWrapper.onpointerdown = function(event) {
      var rect = hueCanvasWrapper.getBoundingClientRect();
      function updPosition(event) {
        var x = (event.clientX - rect.left)/130*360;
        var hue = Math.max(0, Math.min(359.99, x));
        color.hsb.h = hue;
        updateInputs();
      }
      updPosition(event);
      this.setPointerCapture(event.pointerId);
      this.onpointermove = updPosition;
      this.onpointerup = function(event) {
        this.releasePointerCapture(event.pointerId);
        this.onpointermove = null;
        this.onpointerup = null;
      }
    }
    hdraw();
    var colorbubble = document.createElement('div');
    this.element.appendChild(colorbubble);
    colorbubble.className = 'color-bubble';
    colorbubble.style.backgroundColor = 'red';
    var ns = 'http://www.w3.org/2000/svg';
    var dropper = document.createElementNS(ns,'svg');
    this.element.appendChild(dropper);
    dropper.style = `
      position: absolute;
      left: 14px;
      top: 154px;
    `;
    dropper.setAttribute('width','16');
    dropper.setAttribute('height','16');
    dropper.setAttribute('viewBox','0 0 512 512');
    var dropperpath = document.createElementNS(ns,'path');
    dropper.appendChild(dropperpath);
    dropperpath.setAttribute('d','M341.6 29.2L240.1 130.8l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4L482.8 170.4c39-39 39-102.2 0-141.1s-102.2-39-141.1 0zM55.4 323.3c-15 15-23.4 35.4-23.4 56.6l0 42.4L5.4 462.2c-8.5 12.7-6.8 29.6 4 40.4s27.7 12.5 40.4 4L89.7 480l42.4 0c21.2 0 41.6-8.4 56.6-23.4L309.4 335.9l-45.3-45.3L143.4 411.3c-3 3-7.1 4.7-11.3 4.7L96 416l0-36.1c0-4.2 1.7-8.3 4.7-11.3L221.4 247.9l-45.3-45.3L55.4 323.3z');
    var colorSwitcher = document.createElement('div');
    this.element.appendChild(colorSwitcher);
    colorSwitcher.className = 'color-switcher';
    var arrows = document.createElementNS(ns,'svg');
    colorSwitcher.appendChild(arrows);
    arrows.style = `
      position: absolute;
      left: 172px;
      top: 8px;
    `;
    arrows.setAttribute('width','5');
    arrows.setAttribute('height','8');
    arrows.setAttribute('viewBox','0 0 320 512');
    var arrowspath = document.createElementNS(ns,'path');
    arrows.appendChild(arrowspath);
    arrowspath.setAttribute('d','m159.95 0.025391c-8.2 0-16.398 3.125-22.648 9.375l-96 96c-12.5 12.5-12.5 32.799 0 45.299s32.799 12.5 45.299 0l73.451-73.449 73.35 73.35c12.5 12.5 32.799 12.5 45.299 0s12.5-32.799 0-45.299l-96-96-0.09961 0.099609c-6.25-6.25-14.45-9.375-22.65-9.375zm-96 352c-8.2 0-16.398 3.125-22.648 9.375-12.5 12.5-12.5 32.799 0 45.299l96 96c12.5 12.5 32.799 12.5 45.299 0l96-96c12.5-12.5 12.5-32.799 0-45.299s-32.799-12.5-45.299 0l-73.352 73.35-73.35-73.35c-6.25-6.25-14.45-9.375-22.65-9.375z');
    var rgbLabelWrapper = document.createElement('div');
    colorSwitcher.appendChild(rgbLabelWrapper);
    rgbLabelWrapper.className = 'label-wrapper';
    var rlab = document.createElement('div');
    rgbLabelWrapper.appendChild(rlab);
    rlab.className = 'color-label';
    rlab.innerText = 'R';
    var glab = document.createElement('div');
    rgbLabelWrapper.appendChild(glab);
    glab.className = 'color-label';
    glab.style.left = '59px';
    glab.innerText = 'G';
    var blab = document.createElement('div');
    rgbLabelWrapper.appendChild(blab);
    blab.className = 'color-label';
    blab.style.left = '119px';
    blab.style.width = '54px';
    blab.innerText = 'B';
    var rgbInpWrapper = document.createElement('div');
    this.element.appendChild(rgbInpWrapper);
    rgbInpWrapper.className = 'inp-wrapper';
    var rinp = document.createElement('input');
    rgbInpWrapper.appendChild(rinp);
    rinp.className = 'color-inp';
    var ginp = document.createElement('input');
    rgbInpWrapper.appendChild(ginp);
    ginp.className = 'color-inp';
    ginp.style.left = '59px';
    var binp = document.createElement('input');
    rgbInpWrapper.appendChild(binp);
    binp.className = 'color-inp';
    binp.style.left = '119px';
    binp.style. width = '54px';
    rinp.onchange = function(event) {
      var v = Math.max(0, Math.min(255, this.value));
      if (isNaN(v)) v = 0;
      color.rgb.r = v;
      updateInputs();
    }
    ginp.onchange = function(event) {
      var v = Math.max(0, Math.min(255, this.value));
      if (isNaN(v)) v = 0;
      color.rgb.g = v;
      updateInputs();
    }
    binp.onchange = function(event) {
      var v = Math.max(0, Math.min(255, this.value));
      if (isNaN(v)) v = 0;
      color.rgb.b = v;
      updateInputs();
    }
    var hslLabelWrapper = document.createElement('div');
    colorSwitcher.appendChild(hslLabelWrapper);
    hslLabelWrapper.className = 'label-wrapper';
    var hlab = document.createElement('div');
    hslLabelWrapper.appendChild(hlab);
    hlab.className = 'color-label';
    hlab.innerText = 'H';
    var slab = document.createElement('div');
    hslLabelWrapper.appendChild(slab);
    slab.className = 'color-label';
    slab.style.left = '59px';
    slab.innerText = 'S';
    var llab = document.createElement('div');
    hslLabelWrapper.appendChild(llab);
    llab.className = 'color-label';
    llab.style.left = '119px';
    llab.style.width = '54px';
    llab.innerText = 'L';
    var hslInpWrapper = document.createElement('div');
    this.element.appendChild(hslInpWrapper);
    hslInpWrapper.className = 'inp-wrapper';
    var hinp = document.createElement('input');
    hslInpWrapper.appendChild(hinp);
    hinp.className = 'color-inp';
    var sinp = document.createElement('input');
    hslInpWrapper.appendChild(sinp);
    sinp.className = 'color-inp';
    sinp.style.left = '59px';
    var linp = document.createElement('input');
    hslInpWrapper.appendChild(linp);
    linp.className = 'color-inp';
    linp.style.left = '119px';
    linp.style. width = '54px';
    hinp.onchange = function(event) {
      var v = Math.max(0, Math.min(359.99, this.value));
      if (isNaN(v)) v = 0;
      color.hsl.h = v;
      updateInputs();
    }
    sinp.onchange = function(event) {
      v = this.value;
      if (v.endsWith('%')) v = v.slice(0,-1);
      var v = Math.max(0, Math.min(100, v));
      if (isNaN(v)) v = 0;
      color.hsl.s = v;
      updateInputs();
    }
    linp.onchange = function(event) {
      v = this.value;
      if (v.endsWith('%')) v = v.slice(0,-1);
      var v = Math.max(0, Math.min(100, v));
      if (isNaN(v)) v = 0;
      color.hsl.l = v;
      updateInputs();
    }
    var hexLabelWrapper = document.createElement('div');
    colorSwitcher.appendChild(hexLabelWrapper);
    hexLabelWrapper.className = 'label-wrapper';
    var hexlab = document.createElement('div');
    hexLabelWrapper.appendChild(hexlab);
    hexlab.className = 'color-label';
    hexlab.style.width = '172px';
    hexlab.innerText = 'HEX';
    var hexInpWrapper = document.createElement('div');
    this.element.appendChild(hexInpWrapper);
    hexInpWrapper.className = 'inp-wrapper';
    var hexinp = document.createElement('input');
    hexInpWrapper.appendChild(hexinp);
    hexinp.className = 'color-inp';
    hexinp.style.width = '152px';
    hexinp.onchange = function(event) {
      color.hex = this.value;
      updateInputs();
    }
    var colorRotation = [[rgbInpWrapper,rgbLabelWrapper],[hslInpWrapper,hslLabelWrapper],[hexInpWrapper,hexLabelWrapper]];
    var colorRotationIndex = 0;
    colorSwitcher.onpointerup = function(event) {
      colorRotation[colorRotationIndex].forEach(el => el.setAttribute('hidden','true'));
      colorRotationIndex += 1;
      colorRotationIndex %= colorRotation.length;
      colorRotation[colorRotationIndex].forEach(el => el.removeAttribute('hidden'));
    }
    colorRotation.slice(1).forEach(r => r.forEach(el => el.setAttribute('hidden','true')));
    function updateInputs() {
      var hue = color.hsb.h;
      sdraw(hue);
      var x = color.hsb.s/100*232 - 6;
      var y = (1-color.hsb.b/100)*138 - 6;
      sbubble.style.left = x + 'px';
      sbubble.style.top = y + 'px';
      var hx = hue/360*130 - 8;
      hbubble.style.left = hx + 'px';
      hbubble.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
      colorbubble.style.backgroundColor = color.rgb.toString();
      rinp.value = Math.round(color.rgb.r);
      ginp.value = Math.round(color.rgb.g);
      binp.value = Math.round(color.rgb.b);
      hinp.value = Math.round(color.hsl.h);
      sinp.value = Math.round(color.hsl.s) + '%';
      linp.value = Math.round(color.hsl.l) + '%';
      hexinp.value = color.hex;
      submit(color.hex);
    }
    updateInputs();
  }
}