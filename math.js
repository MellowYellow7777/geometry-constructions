var pi = Math.PI,
    tau = 2*pi,
    pi2 = pi/2,
    pi3 = 3*pi2;

var sqrt = Math.sqrt,
    abs = Math.abs,
    hypot = Math.hypot,
    min = Math.min,
    max = Math.max,
    sin = Math.sin,
    cos = Math.cos,
    tan = Math.tan,
    csc = x => 1/Math.sin(x),
    sec = x => 1/Math.cos(x),
    cot = x => 1/Math.tan(x),
    asin = Math.asin,
    acos = Math.acos,
    atan = Math.atan,
    acsc = x => Math.asin(1/x),
    asec = x => Math.acos(1/x),
    acot = x => Math.atan(1/x),
    atan2 = Math.atan2,
    sign = Math.sign,
    floor = Math.floor,
    ceil = Math.ceil;

var dist2 = (p1,p2) => ((dx,dy) => dx*dx+dy*dy)(p2.x-p1.x,p2.y-p1.y);
var dist = (p1,p2) => sqrt(dist2(p1,p2));

var dot = (v1,v2) => v1.x*v2.x + v1.y*v2.y;
var norm = v => v.x*v.x + v.y*v.y;
var cross = (v1,v2) => v1.x*v2.y - v2.x*v1.y;

function point(x=0,y=0) {
  if (!new.target) return new point(x,y);
  this.x = +x;
  this.y = +y;
}

point.prototype.add = function(p) {
  return point(this.x + p.x, this.y + p.y);
}

point.prototype.sub = function(p) {
  return point(this.x - p.x, this.y - p.y);
}

point.prototype.mul = function(n) {
  return point(this.x * n, this.y * n);
}

point.prototype.div = function(n) {
  return point(this.x / n, this.y / n);
}

function reflect(p, l) {
  var {a,b,c} = l,
      {x: x1, y: y1} = p,
      d = a*a + b*b,
      l = a*x1 + b*y1 + c,
      f = 2*l/d,
      x2 = x1 - a*f,
      y2 = y1 - b*f;
  return point(x2,y2);
}

function line(x1,y1,x2,y2) {
  if (!new.target) return new line(x1,y1,x2,y2);
  this.p1 = point(x1,y1);
  this.p2 = point(x2,y2);
}

/*var dot = (v1,v2) => v1[0]*v2[0] + v1[1]*v2[1];
var cross(v1,v2) => v1[0]*v2[1] - v2[0]*v1[1];
var dot = v => v[0]*v[0] + v[1]*v[1];
var dist = (v1,v2) => Math.hypot(v1[0] - v2[0], v1[1] - v2[1]);

dist2(v1, v2) {
    var dx = v1[0] - v2[0],
        dy = v1[1] - v2[1];
    return dx*dx + dy*dy;
  }

class point extends Float32Array {
  constructor(x=0,y=0) {
    super(2);
    this[0] = +x;
    this[1] = +y;
  }

  addeq(p) {
    this[0] += p[0];
    this[1] += p[1];
    return this;
  }
  subeq(p) {
    this[0] -= p[0];
    this[1] -= p[1];
    return this;
  }
  muleq(n) {
    this[0] *= n;
    this[1] *= n;
    return this;
  }
  diveq(n) {
    this[0] /= n;
    this[1] /= n;
    return this;
  }

  add(p) {
    return new point(this[0] + p[0], this[1] + p[1]);
  }
  sub(p) {
    return new point(this[0] - p[0], this[1] - p[1]);
  }
  mul(n) {
    return new point(this[0] * n, this[1] * n);
  }
  div(n) {
    return new point(this[0] / n, this[1] / n);
  }

  get x() {return this[0]}
  get y() {return this[1]}
  set x(x) {this[0] = x}
  set y(y) {this[1] = y}
}
*/