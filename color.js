class Color {
  constructor(r = 0, g = 0, b = 0) {
    var color = this;
    this.rgb = {
      _r: +r,
      _g: +g,
      _b: +b,
      get r() { return this._r; },
      get g() { return this._g; },
      get b() { return this._b; },
      set r(r) { this._r = r; color._setRGB(); },
      set g(g) { this._g = g; color._setRGB(); },
      set b(b) { this._b = b; color._setRGB(); },
      toString() { return `rgb(${this.r}, ${this.g}, ${this.b})`; },
      toArray() { return [this.r,this.g,this.b]; },
    };
    this.hsb = {
      _h: 0,
      _s: 0,
      _b: 0,
      get h() { return this._h; },
      get s() { return this._s; },
      get b() { return this._b; },
      get v() { return this._b; },
      set h(h) { this._h = h % 360; color._setHSB(); },
      set s(s) { this._s = s; color._setHSB(); },
      set b(b) { this._b = b; color._setHSB(); },
      set v(b) { this._b = b; color._setHSB(); },
      toString() {return color.hsl.toString(); },
      toArray() { return [this.h,this.s,this.b]; },
    };
    this.hsv = this.hsb;
    this.hsl = {
      _s: 0,
      _l: 0,
      get h() { return color.hsb._h; },
      get s() { return this._s; },
      get l() { return this._l; },
      set h(h) { color.hsb._h = h % 360; color._setHSB(); },
      set s(s) { this._s = s; color._setHSL(); },
      set l(l) { this._l = l; color._setHSL(); },
      toString() {return `hsl(${this.h}, ${this.s}%, ${this.l}%)`; },
      toArray() { return [this.h,this.s,this.v]; },
    };
    this.hwb = {
      _w: 0,
      _b: 0,
      get h() { return color.hsb._h; },
      get w() { return this._w; },
      get b() { return this._b; },
      set h(h) { color.hsb._h = h % 360; color._setHSB(); },
      set w(w) { this._w = w; color._setHWB(); },
      set b(b) { this._b = b; color._setHWB(); },
      toString() {return `hsl(${this.h} ${this.w}% ${this.b}%)`; },
      toArray() { return [this.h,this.w,this.b]; },
    };
    this.cmyk = {
      _c: 0,
      _m: 0,
      _y: 0,
      _k: 0,
      get c() { return this._c; },
      get m() { return this._m; },
      get y() { return this._y; },
      get k() { return this._k; },
      set c(c) { this._c = c; color._setCMYK(); },
      set m(m) { this._m = m; color._setCMYK(); },
      set y(y) { this._y = y; color._setCMYK(); },
      set k(k) { this._k = k; color._setCMYK(); },
      toString() {return color.rgb.toString(); },
      toArray() { return [this.c,this.m,this.y,this.k]; },
    };
    this.cie1931 = {
      _x: 0,
      _y: 0,
      _z: 0,
      get x() { return this._x; },
      get y() { return this._y; },
      get z() { return this._z; },
      set x(x) { this._x = x; color._setCIE1931(); },
      set y(y) { this._y = y; color._setCIE1931(); },
      set z(z) { this._z = z; color._setCIE1931(); },
      toArray() { return [this.x, this.y, this.z]; },
    };

    this._setRGB();
  }

  get hex() {return this._hex;}

  set hex(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length == 3) {
        hex = hex.split('').map(c => c+c).join('');
    }
    this.rgb._r = parseInt(hex[0]+hex[1], 16);
    this.rgb._g = parseInt(hex[2]+hex[3], 16);
    this.rgb._b = parseInt(hex[4]+hex[5], 16);
    this._setRGB();
  }

  setRGB(r,g,b) {
    this.rgb._r = r;
    this.rgb._g = g;
    this.rgb._b = b;
    this._setRGB();
  }

  setHSB(h,s,b) {
    this.hsb._h = h;
    this.hsb._s = s;
    this.hsb._b = b;
    this._setHSB();
  }

  setHSL(h,s,l) {
    this.hsb._h = h;
    this.hsl._s = s;
    this.hsl._l = l;
    this._setHSL();
  }

  setHWB(h,w,b) {
    this.hsb._h = h;
    this.hwb._w = w;
    this.hwb._b = b;
    this._setHWB();
  }

  setCMYK(c,m,y,k) {
    this.cmyk._c = c;
    this.cmyk._m = m;
    this.cmyk._y = y;
    this.cmyk._k = k
    this._setCMYK();
  }

  setCIE1931(x, y, z) {
    this.cie1931._x = x;
    this.cie1931._y = y;
    this.cie1931._z = z;
    this._setCIE1931();
  }

  _setRGB() {
    var R = this.rgb._r / 255,
      G = this.rgb._g / 255,
      B = this.rgb._b / 255,
      V = Math.max(R, G, B),
      W = Math.min(R, G, B),
      K = 1 - V,
      C = K == 1 ? this.cmyk._c / 100 : (1 - R - K) / (1 - K),
      M = K == 1 ? this.cmyk._m / 100 : (1 - G - K) / (1 - K),
      Y = K == 1 ? this.cmyk._y / 100 : (1 - B - K) / (1 - K),
      D = V - W,
      L = (V + W) / 2,
      Sb = V == 0 ? this.hsb._s / 100 : D / V,
      Sl = D == 0 ? this.hsl._s / 100 : D / (1 - Math.abs(2 * L - 1)),
      H = W == V ? this.hsb.h/60 :
        R == V ? (G - B) / D :
          G == V ? (B - R) / D + 2 :
            (R - G) / D + 4;
    H = H < 0 ? H + 6 : H;
    this.hsb._h = H * 60;
    this.hsb._s = Sb * 100;
    this.hsb._b = V * 100;
    this.hsl._s = Sl * 100;
    this.hsl._l = L * 100;
    this.hwb._w = W * 100;
    this.hwb._b = K * 100;
    this.cmyk._c = C * 100;
    this.cmyk._m = M * 100;
    this.cmyk._y = Y * 100;
    this.cmyk._k = K * 100;
    this._hex = '#' + this.rgb.toArray().map(c => Math.round(c).toString(16).padStart(2,'0')).join('').toUpperCase();
    this._setXYZFromRGB();
  }

  _setHSB() {
    var H = this.hsb._h / 60,
      S = this.hsb._s / 100,
      B = this.hsb._b / 100,
      V = B,
      C = V * S,
      X = C * (1 - Math.abs(H % 2 - 1)),
      m = V - C,
      r, g, b;
    if (0 <= H && H < 1) { r = C; g = X; b = 0; }
    else if (1 <= H && H < 2) { r = X; g = C; b = 0; }
    else if (2 <= H && H < 3) { r = 0; g = C; b = X; }
    else if (3 <= H && H < 4) { r = 0; g = X; b = C; }
    else if (4 <= H && H < 5) { r = X; g = 0; b = C; }
    else if (5 <= H && H < 6) { r = C; g = 0; b = X; }
    r = (r + m) * 255;
    g = (g + m) * 255;
    b = (b + m) * 255;
    this.rgb._r = r;
    this.rgb._g = g;
    this.rgb._b = b;
    this._setRGB();
  }

  _setHSL() {
    var H = this.hsb._h / 60,
      S = this.hsl._s / 100,
      L = this.hsl._l / 100,
      C = (1 - Math.abs(2 * L - 1)) * S,
      X = C * (1 - Math.abs(H % 2 - 1)),
      m = L - C / 2,
      r, g, b;
    if (0 <= H && H < 1) { r = C; g = X; b = 0; }
    else if (1 <= H && H < 2) { r = X; g = C; b = 0; }
    else if (2 <= H && H < 3) { r = 0; g = C; b = X; }
    else if (3 <= H && H < 4) { r = 0; g = X; b = C; }
    else if (4 <= H && H < 5) { r = X; g = 0; b = C; }
    else if (5 <= H && H < 6) { r = C; g = 0; b = X; }
    r = (r + m) * 255;
    g = (g + m) * 255;
    b = (b + m) * 255;
    this.rgb._r = r;
    this.rgb._g = g;
    this.rgb._b = b;
    this._setRGB();
  }

  _setHWB() {
    var H = this.hsb._h / 360,
        W = this.hwb._w / 100,
        B = this.hwb._b / 100,
        V = 1 - B,
        C = (1 - W - B),
        X = C * (1 - Math.abs((H * 6) % 2 - 1)),
        m = W,
        r, g, b;
    if (C < 0) {
        C = 0;
        X = 0;
    }
    if (0 <= H && H < 1 / 6) { r = C; g = X; b = 0; }
    else if (1 / 6 <= H && H < 1 / 3) { r = X; g = C; b = 0; }
    else if (1 / 3 <= H && H < 1 / 2) { r = 0; g = C; b = X; }
    else if (1 / 2 <= H && H < 2 / 3) { r = 0; g = X; b = C; }
    else if (2 / 3 <= H && H < 5 / 6) { r = X; g = 0; b = C; }
    else if (5 / 6 <= H && H < 1) { r = C; g = 0; b = X; }
    r = (r + m) * 255;
    g = (g + m) * 255;
    b = (b + m) * 255;
    this.rgb._r = r;
    this.rgb._g = g;
    this.rgb._b = b;
    this._setRGB();
  }

  _setCMYK() {
    var C = this.cmyk._c / 100,
      M = this.cmyk._m / 100,
      Y = this.cmyk._y / 100,
      K = this.cmyk._k / 100,
      R = (1 - C) * (1 - K),
      G = (1 - M) * (1 - K),
      B = (1 - Y) * (1 - K),
      V = Math.max(R, G, B),
      W = Math.min(R, G, B),
      D = V - W,
      L = (V + W) / 2,
      Sb = V == 0 ? this.hsb._s / 100 : D / V,
      Sl = D == 0 ? this.hsl._s / 100 : D / (1 - Math.abs(2 * L - 1)),
      H = W == V ? this.hsb.h/60 :
        R == V ? (G - B) / D :
          G == V ? (B - R) / D + 2 :
            (R - G) / D + 4;
    H = H < 0 ? H + 6 : H;
    this.rgb._r = R * 255;
    this.rgb._g = G * 255;
    this.rgb._b = B * 255;
    this.hsb._h = H * 60;
    this.hsb._s = Sb * 100;
    this.hsb._b = V * 100;
    this.hsl._s = Sl * 100;
    this.hsl._l = L * 100;
    this.hwb._w = W * 100;
    this.hwb._b = K * 100;
    this._hex = '#' + this.rgb.toArray().map(c => Math.round(c).toString(16).padStart(2,'0')).join('').toUpperCase();
    this._setXYZFromRGB();
  }


  _setXYZFromRGB() {
    let r = this.rgb._r / 255;
    let g = this.rgb._g / 255;
    let b = this.rgb._b / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    this.cie1931._x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    this.cie1931._y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    this.cie1931._z = r * 0.0193 + g * 0.1192 + b * 0.9505;
  }

  _setRGBFromXYZ() {
    let x = this.cie1931._x;
    let y = this.cie1931._y;
    let z = this.cie1931._z;

    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

    this.rgb._r = Math.max(0, Math.min(255, r * 255));
    this.rgb._g = Math.max(0, Math.min(255, g * 255));
    this.rgb._b = Math.max(0, Math.min(255, b * 255));
    this._setRGB();
  }

  _setCIE1931() {
    this._setRGBFromXYZ();
  }
}