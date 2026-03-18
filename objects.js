class Point extends point {

  static all = [];
  constructor(x, y) {
    super(x,y);
    this.types = ['point'];
    this.hidden = false;
    this.color = '#FF0';
    this.locked = false;
    this._moved = false;
    this._hash = null;
    this.parents = [];
    this.children = [];
    Point.all.push(this);
  }

  addChild(child) {
    this.children.push(child);
    child.parents.push(this);
  }

  hide() {this.hidden = true;}
  show() {this.hidden = false;}
  lock() {this.locked = true;}
  unlock() {this.locked = false;}

  _calculateHash() {
    return `${this.x},${this.y}`;
  }

  delete() {
    this.children.forEach(child => child.delete());
    var all = Point.all;
    all.splice(all.indexOf(this),1);
  }

  draw(ctx) {
    ctx.beginPath();
    if (!this.locked) {
      if (mouse.hovering !== this) ctx.globalAlpha = .5;
      ctx.arc(this.x, this.y, 12, 0, tau);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.arc(this.x, this.y, 4, 0, tau);
    ctx.fill();
  }

  static draw(ctx, x, y) {
    ctx.beginPath();
    ctx.globalAlpha = .5;
    ctx.arc(x, y, 12, 0, tau);
    ctx.fill();
    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.arc(x, y, 4, 0, tau);
    ctx.fill();
  }

  move(x,y) {
    if (this._moved) return;
    if (this.locked) return;
    this.x = x;
    this.y = y;
    this._moved = true;
  }

  moveBy(dx,dy) {
    if (this._moved) return;
    if (this.locked) return;
    this.x += dx;
    this.y += dy;
    this._moved = true;
  }
}

class Midpoint extends Point {
  constructor(p1, p2) {
    super();
    this.types.push('midpoint');
    if (arguments.length==1) {
      this.p1 = p1.p1;
      this.p2 = p1.p2;
    } else {
      this.p1 = p1;
      this.p2 = p2;
    }
    this.p1?.addChild?.(this);
    this.p2?.addChild?.(this);
  }

  _calculateHash() {
    return `${this.p1._calculateHash()},${this.p2._calculateHash()}`;
  }

  static draw(ctx, p1, p2) {
    Point.draw(ctx, (p1.x+p2.x)/2, (p1.y+p2.y)/2);
  }

  get x() {
    return (this.p1.x + this.p2.x) / 2;
  }

  set x(x) {}

  get y() {
    return (this.p1.y + this.p2.y) / 2;
  }

  set y(y) {}

  move(x,y) {
    var dx = x - this.x;
    var dy = y - this.y;
    this.p1.moveBy(dx,dy);
    this.p2.moveBy(dx,dy);
  }
}

class Glider extends Point {
  constructor(curve, t) {
    super();
    this.types.push('glider');
    this.curve = curve;
    this.t = t;
    var { x, y } = curve.parametric(t);
    this._x = x;
    this._y = y;
    this._initialPoint = false;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  set x(_) {}

  set y(_) {}

  _calculateHash() {
    return `${this.curve._calculateHash()},${this.t}`;
  }

  get x() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      const { x, y } = this.curve.parametric(this.t);
      this._x = x;
      this._y = y;
      this._hash = hash;
    }
    return this._x;
  }

  get y() {
    return this._y;
  }

  move(x,y) {
    if (this._moved) return;
    if (!this._initialPoint) this._initialPoint = {x: this.x, y: this.y};
    this.t = this.curve.closestT({
      x: this._initialPoint.x + mouse.vector.x,
      y: this._initialPoint.y + mouse.vector.y
    });
    this._moved = true;
  }

  moveBy(dx,dy) {
    if (this._moved) return;
    if (!this._initialPoint) this._initialPoint = {x: this.x, y: this.y};
    this.t = this.curve.closestT({
      x: this._initialPoint.x + mouse.vector.x,
      y: this._initialPoint.y + mouse.vector.y
    });
    this._moved = true;
  }
}

class Intersection extends Point {
  constructor(c1,c2,negroot=false) {
    super();
    this.c1 = c1;
    this.c2 = c2;
    this.negroot = negroot
    this.getIntersection = this._getIntersectFn();
    var intersection = this.getIntersection();
    var x = intersection ? intersection.x : null;
    var y = intersection ? intersection.y : null;
    this._hash = null;
    this._x = x;
    this._y = y;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  set x(_) {}

  set y(_) {}

  _calculateHash() {
    return `${this.c1._calculateHash()},${this.c2._calculateHash()}`;
  }

  get x() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      var intersection = this.getIntersection();
      var x = intersection ? intersection.x : null;
      var y = intersection ? intersection.y : null;
      this._x = x;
      this._y = y;
      this._hash = hash;
    }
    return this._x;
  }

  get y() {
    return this._y;
  }

  _getIntersectFn() {

    function getType(curve) {
      if (curve.types.includes('ray')) {
        return 'ray';
      } else if (curve.types.includes('segment')) {
        return 'segment';
      } else if (curve.types.includes('line')) {
        return 'line';
      } else if (curve.types.includes('arc')) {
        return 'arc';
      } else if (curve.types.includes('circle')) {
        return 'circle';
      } else if (curve.types.includes('parabola')) {
        return 'parabola';
      }
    }
  
    var t1 = getType(this.c1);
    var t2 = getType(this.c2);
  
    switch (t1) {
      case 'line':
        switch (t2) {
          case 'line': return () => lineLineIntersection(this.c1, this.c2);
          case 'ray': return () => lineRayIntersection(this.c1, this.c2);
          case 'segment': return () => lineSegmentIntersection(this.c1, this.c2);
          case 'circle': return () => lineCircleIntersection(this.c1, this.c2)[+this.negroot];
          case 'arc': return () => lineArcIntersection(this.c1, this.c2)[+this.negroot];
        }
      case 'ray':
        switch (t2) {
          case 'line': return () => lineRayIntersection(this.c1, this.c2);
          case 'ray': return () => rayRayIntersection(this.c1, this.c2);
          case 'segment': return () => raySegmentIntersection(this.c1, this.c2);
          case 'circle': return () => rayCircleIntersection(this.c1, this.c2)[+this.negroot];
          case 'arc': return () => rayArcIntersection(this.c1, this.c2)[+this.negroot];
        }
      case 'segment':
        switch (t2) {
          case 'line': return () => segmentLineIntersection(this.c1, this.c2);
          case 'ray': return () => segmentRayIntersection(this.c1, this.c2);
          case 'segment': return () => segmentSegmentIntersection(this.c1, this.c2);
          case 'circle': return () => segmentCircleIntersection(this.c1, this.c2)[+this.negroot];
          case 'arc': return () => segmentArcIntersection(this.c1, this.c2)[+this.negroot];
        }
      case 'circle':
        switch (t2) {
          case 'line': return () => circleLineIntersection(this.c1, this.c2)[+this.negroot];
          case 'ray': return () => circleRayIntersection(this.c1, this.c2)[+this.negroot];
          case 'segment': return () => circleSegmentIntersection(this.c1, this.c2)[+this.negroot];
          case 'circle': return () => circleCircleIntersection(this.c1, this.c2)[+this.negroot];
          case 'arc': return () => circleArcIntersection(this.c1, this.c2)[+this.negroot];
        }
      case 'arc':
        switch (t2) {
          case 'line': return () => arcLineIntersection(this.c1, this.c2)[+this.negroot];
          case 'ray': return () => arcRayIntersection(this.c1, this.c2)[+this.negroot];
          case 'segment': return () => arcSegmentIntersection(this.c1, this.c2)[+this.negroot];
          case 'circle': return () => arcCircleIntersection(this.c1, this.c2)[+this.negroot];
          case 'arc': return () => arcArcIntersection(this.c1, this.c2)[+this.negroot];
        }
    }
  }

  move(x,y) {
    if (this._moved) return;
    var dx = x - this.x;
    var dy = y - this.y;
    this.c1.move(dx,dy);
    this.c2.move(dx,dy);
    this._moved = true;
  }

  moveBy(dx,dy) {
    if (this._moved) return;
    this.c1.move(dx,dy);
    this.c2.move(dx,dy);
    this._moved = true;
  }

}

function getTransformedObject(object,transform) {
  var transformed;
  if (object.types.includes('line')) {
    if (object.types.includes('segment')) {
      transformed = new Segment();
    } else if (object.types.includes('ray')) {
      transformed = new Ray();
    } else {
      transformed = new Line();
    }
    Object.defineProperties(transformed, {
      p1: {
        get() {return transform(object.p1)},
        set() {}
      },
      p2: {
        get() {return transform(object.p2)},
        set() {}
      },
    });
  } else if (object.types.includes('circle')) {
    if (object.types.includes('arc')) {
      transformed = new Arc();
      Object.defineProperties(transformed, {
        p1: {
          get() {return transform(object.p1)},
          set() {}
        },
        p2: {
          get() {return transform(object.p2)},
          set() {}
        },
        p3: {
          get() {return transform(object.p3)},
          set() {}
        },
      });
    } else  {
      transformed = new Circle();
      Object.defineProperties(transformed, {
        p1: {
          get() {return transform(object.p1)},
          set() {}
        },
        p2: {
          get() {return transform(object.p2)},
          set() {}
        },
      });
    }
  }
  transformed.move = function(dx,dy) {
    var r = transform(point(dx,dy)).sub(transform(point(0,0)));
    object.move(r.x, r.y);
  }
  return transformed;
}

class Translation extends Point {
  constructor(object, from, to) {
    if (object.types[0] == 'curve') {
       return getTransformedObject(object, p => p.add(to.sub(from)));
    }
    super();
    this.object = object;
    this.from = from;
    this.to = to;
  }

  set x(_) {}
  set y(_) {}

  get x() {
    return this.object.x + this.to.x - this.from.x;
  }
  get y() {
    return this.object.y + this.to.y - this.from.y;
  }

  move(x,y) {
    var dx = x - this.x,
        dy = y - this.y;
    this.object.moveBy(dx,dy);
  }

  moveBy(dx,dy) {
    this.object.moveBy(dx,dy);
  }
}

class Reflection extends Point {
  constructor(object, line) {
    if (object.types[0] == 'curve') {
       return getTransformedObject(object, p => reflect(p,line));
    }
    super();
    this.object = object;
    this.line = line;
  }

  set x(_) {}
  set y(_) {}

  get x() {
    return reflect(this.object, this.line).x;
  }
  get y() {
    return reflect(this.object, this.line).y;
  }

  move(x, y) {
    var r = reflect(point(x,y),this.line);
    this.object.move(r.x,r.y);
  }

  moveBy(dx, dy) {
    var r = reflect(point(dx,dy),this.line);
    this.object.moveBy(dx, dy);
  }
}



class Curve {
  static all = [];

  constructor() {
    this.types = ['curve'];
    this.hidden = false;
    this.color = '#F80';
    this.children = [];
    this.parents = [];
    this._hash = null;
    Curve.all.push(this);
  }

  addChild(child) {
    this.children.push(child);
    child.parents.push(this);
  }

  delete() {
    this.children.forEach(child => child.delete());
    var all = Curve.all;
    all.splice(all.indexOf(this),1);
  }

  hide() {this.hidden = true;}
  show() {this.hidden = false;}
  lock() {this.locked = true;}
  unlock() {this.locked = false;}

  distToPoint(point) {
    return dist(this.closestPoint(point),point);
  }

  closestPoint(point) {
    return this.parametric(this.closestT(point));
  }

  drawObject(ctx, drawfn, args) {
    var alpha = ctx.globalAlpha;
    if (mouse.lastSelected === this) {
      ctx.lineWidth = 3;
      ctx.globalAlpha = alpha/2;
      drawfn(...args);
    }
  
    if (mouse.hovering === this) {
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha;
      drawfn(...args);
    }
  
    ctx.lineWidth = 1;
    ctx.globalAlpha = alpha;
    drawfn(...args);
  }
}



class Line extends Curve {
  constructor(p1, p2) {
    super();
    this.types.push('line');
    this.p1 = p1;
    this.p2 = p2;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  _calculateHash() {
    return `${this.p1.x},${this.p1.y},${this.p2.x},${this.p2.y}`;
  }

  get a() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateABC();
      this._hash = hash;
    }
    return this._a;
  }

  get b() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateABC();
      this._hash = hash;
    }
    return this._b;
  }

  get c() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateABC();
      this._hash = hash;
    }
    return this._c;
  }

  _calculateABC() {
    this._a = this.p2.y - this.p1.y,
    this._b = this.p1.x - this.p2.x,
    this._c = this.p2.x*this.p1.y - this.p1.x*this.p2.y;
  }

  set coefficients(_) {}

  move(dx, dy) {
    this.p1.moveBy(dx,dy);
    this.p2.moveBy(dx,dy);
  }

  draw(ctx) {
    var dx = this.p2.x - this.p1.x;
    var dy = this.p2.y - this.p1.y;
    var len = sqrt(dx * dx + dy * dy);
    var ux = dx / len;
    var uy = dy / len;
    var x1 = this.p1.x - ux * 10000;
    var y1 = this.p1.y - uy * 10000;
    var x2 = this.p2.x + ux * 10000;
    var y2 = this.p2.y + uy * 10000;

    this.drawObject(ctx, drawLine, [ctx, x1, y1, x2, y2]);
  }

  static draw(ctx, p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var len = sqrt(dx * dx + dy * dy);
    var ux = dx / len;
    var uy = dy / len;
    var x1 = p1.x - ux * 10000;
    var y1 = p1.y - uy * 10000;
    var x2 = p2.x + ux * 10000;
    var y2 = p2.y + uy * 10000;
    drawLine(ctx, x1, y1, x2, y2);
  }

  closestT(point) {
    const { x: x0, y: y0 } = point;
    const { x: x1, y: y1 } = this.p1;
    const { x: x2, y: y2 } = this.p2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    return ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy);
  }

  parametric(t) {
    return this.p1.add(this.p2.sub(this.p1).mul(t));
  }
}

class Segment extends Line {
  constructor(p1, p2) {
    super(p1, p2);
    this.types.push('segment');
  }

  delete() {
    super.delete();
    var all = Segment.all;
    all.splice(all.indexOf(this),1);
  }

  closestT(point) {
    return max(0,min(1,super.closestT(point)));
  }

  draw(ctx) {
    var x1 = this.p1.x;
    var y1 = this.p1.y;
    var x2 = this.p2.x;
    var y2 = this.p2.y;

    this.drawObject(ctx, drawLine, [ctx, x1, y1, x2, y2]);
  }

  static draw(ctx, p1, p2) {
    var x1 = p1.x;
    var y1 = p1.y;
    var x2 = p2.x;
    var y2 = p2.y;
    drawLine(ctx, x1, y1, x2, y2);
  }
}

class Ray extends Line {
  constructor(p1, p2) {
    super(p1, p2);
    this.types.push('ray');
  }

  closestT(point) {
    return max(0,super.closestT(point));
  }

  draw(ctx) {
    var dx = this.p2.x - this.p1.x;
    var dy = this.p2.y - this.p1.y;
    var len = sqrt(dx * dx + dy * dy);
    var ux = dx / len;
    var uy = dy / len;
    var x1 = this.p1.x;
    var y1 = this.p1.y;
    var x2 = this.p2.x + ux * 10000;
    var y2 = this.p2.y + uy * 10000;

    this.drawObject(ctx, drawLine, [ctx, x1, y1, x2, y2]);
  }

  static draw(ctx, p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var len = sqrt(dx * dx + dy * dy);
    var ux = dx / len;
    var uy = dy / len;
    var x1 = p1.x;
    var y1 = p1.y;
    var x2 = p2.x + ux * 10000;
    var y2 = p2.y + uy * 10000;
    drawLine(ctx, x1, y1, x2, y2);
  }
}

class Parallel extends Line {
  constructor(line, point) {
    super();
    this.types.push('parallel');
    this.line = line;
    this.p1 = point;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  static draw(ctx, line, point) {
    var p1 = point,
        p2 = {
          x: point.x + line.p2.x - line.p1.x,
          y: point.y + line.p2.y - line.p1.y
        };
    Line.draw(ctx,p1,p2);
  }

  move(dx, dy) {
    this.p1.moveBy(dx,dy);
  }

  get p2() {
    const dx = this.line.p2.x - this.line.p1.x;
    const dy = this.line.p2.y - this.line.p1.y;
    return this.p1.add(point(dx, dy));
  }

  set p2(_) {}
}

class Perpendicular extends Line {
  constructor(line, point) {
    super();
    this.types.push('perpendicular');
    this.line = line;
    this.p1 = point;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  static draw(ctx, line, point) {
    var p1 = point,
        p2 = {
          x: point.x + line.p2.y - line.p1.y,
          y: point.y + line.p1.x - line.p2.x
        };
    Line.draw(ctx,p1,p2);
  }

  move(dx, dy) {
    this.p1.moveBy(dx,dy);
  }

  get p2() {
    const dx = this.line.p2.y - this.line.p1.y;
    const dy = this.line.p1.x - this.line.p2.x;
    return this.p1.add(point(dx, dy));
  }

  set p2(_) {}
}

class PerpendicularBisector extends Perpendicular {
  constructor(point1, point2) {
    super();
    this.types.push('perpendicularbisector');
    if (arguments.length == 1) {
      this.point1 = point1.p1;
      this.point2 = point1.p2;
    } else {
      this.point1 = point1;
      this.point2 = point2;
    }
    for (let arg of arguments) arg?.addChild?.(this);
  }

  _calculateHash() {
    return `${this.point1.x},${this.point1.y},${this.point2.x},${this.point2.y}`;
  }

  _calculatePoints() {
    var P1 = this.point1,
        P2 = this.point2,
        {x: x1, y: y1} = P1,
        {x: x2, y: y2} = P2,
        p1 = P1.add(P2).div(2),
        p2 = point(
          p1.x + (y2 - y1),
          p1.y + (x1 - x2)
        );
    this._p1 = p1;
    this._p2 = p2;
  }

  set p1(_) {}
  set p2(_) {}

  get p1() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculatePoints();
      this._hash = hash;
    }
    return this._p1;
  }

  get p2() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculatePoints();
      this._hash = hash;
    }
    return this._p2;
  }


  static draw(ctx, point1, point2) {
    var P1 = point1,
        P2 = point2,
        {x: x1, y: y1} = P1,
        {x: x2, y: y2} = P2,
        p1 = P1.add(P2).div(2),
        p2 = {
          x: p1.x + (y2 - y1),
          y: p1.y + (x1 - x2)
        };
    Line.draw(ctx,p1,p2);
  }

  move(dx, dy) {
    this.point1.moveBy(dx,dy);
    this.point2.moveBy(dx,dy);
  }
}

class AngleBisector extends Line {
  static all = [];
  constructor(A, B, C) {
    super();
    this.A = A;
    this.B = B;
    this.C = C;
    this.types.push('anglebisector');
    for (let arg of arguments) arg?.addChild?.(this);
  }

  delete() {
    super.delete();
    var all = AngleBisector.all;
    all.splice(all.indexOf(this),1);
  }

  get p1() {return this.B;}

  set p1(_) {}

  get p2() {
    var {A, B, C} = this;
    if (!A) return null;
    var thetaA = atan2(A.y - B.y, A.x - B.x),
        thetaC = atan2(C.y - B.y, C.x - B.x),
        theta = (thetaA + thetaC)/2;
    return point(
      B.x + cos(theta),
      B.y + sin(theta)
    );
  }

  move(dx, dy) {
    this.A.moveBy(dx,dy);
    this.B.moveBy(dx,dy);
    this.C.moveBy(dx,dy);
  }

  set p2(_) {}

  static draw(ctx, A, B, C) {
    var p1 = B,
        thetaA = atan2(A.y - B.y, A.x - B.x),
        thetaC = atan2(C.y - B.y, C.x - B.x),
        theta = (thetaA + thetaC)/2,
        p2 = {
          x: B.x + cos(theta),
          y: B.y + sin(theta)
        };
     Line.draw(ctx, p1, p2);
  }
}

class CircleTangent extends Line {
  constructor(circle, point, neg=null) {
    super();
    this.types.push('circletangent');
    this.p1 = point;
    this._hash = null;
    this.circle = circle;
    for (let arg of arguments) arg?.addChild?.(this);
    if (neg === null) {
      this._neg = false;
      return [this, new CircleTangent(circle,point,true)];
    } else {
      this._neg = neg;
    }
  }

  set p2(_) {}

  _calculateHash() {
    return `${this.p1.x},${this.p1.y},${this.circle._calculateHash()}`;
  }

  _calculatePoints() {
    var P = this.p1,
        C = this.circle.center,
        {x: px, y: py} = P,
        {x: cx, y: cy} = C,
        r = this.circle.radius,
        neg = this._neg ? -1 : 1,
        gamma = -atan2(py-cy,px-cx),
        beta = neg*asin((-r)/dist(C,P)),
        alpha = gamma - beta,
        x = cx + neg*r*sin(alpha),
        y = cy + neg*r*cos(alpha);
    this._p2 = {x,y};
  }

  move(dx, dy) {
    this.p1.moveBy(dx,dy);
    this.circle.move(dx,dy);
  }

  get p2() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculatePoints();
      this._hash = hash;
    }
    return this._p2;
  }

}


class ExternalTangent extends Line {
  constructor(c1, c2, neg=null) {
    super();
    this.types.push('externaltangent');
    this._hash = null;
    this._p1 = null;
    this._p2 = null;
    for (let arg of arguments) arg?.addChild?.(this);
    if (neg) {
      this.c1 = c2;
      this.c2 = c1;
    } else {
      this.c1 = c1;
      this.c2 = c2;
    }
    if (neg === null) {
      return [this, new ExternalTangent(c1,c2,true)];
    }
  }

  set p1(_) {}
  set p2(_) {}

  _calculateHash() {
    return `${this.c1._calculateHash()},${this.c2._calculateHash()}`;
  }

  _calculatePoints() {
    var p1 = this.c1.center,
        p2 = this.c2.center,
        {x: x1, y: y1} = p1,
        {x: x2, y: y2} = p2,
        r1 = this.c1.radius,
        r2 = this.c2.radius,
        gamma = -atan2(y2-y1,x2-x1),
        beta = asin((r2-r1)/dist(p1,p2)),
        alpha = gamma - beta,
        x3 = x1 + r1*sin(alpha),
        y3 = y1 + r1*cos(alpha),
        x4 = x2 + r2*sin(alpha),
        y4 = y2 + r2*cos(alpha);
    this._p1 = {x: x3, y: y3};
    this._p2 = {x: x4, y: y4};
  }

  move(dx, dy) {
    this.c1.move(dx,dy);
    this.c2.move(dx,dy);
  }

  get p1() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculatePoints();
      this._hash = hash;
    }
    return this._p1;
  }
  get p2() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculatePoints();
      this._hash = hash;
    }
    return this._p2;
  }

}


class InternalTangent extends Line {
  constructor(c1, c2, neg=null) {
    super();
    this.types.push('internaltangent');
    this._hash = null;
    this.c1 = c1;
    this.c2 = c2;
    for (let arg of arguments) arg?.addChild?.(this);
    if (neg === null) {
      this._neg = false;
      return [this, new InternalTangent(c1,c2,true)];
    } else {
      this._neg = neg;
    }
  }

  set p1(_) {}
  set p2(_) {}

  _calculateHash() {
    return `${this.c1._calculateHash()},${this.c2._calculateHash()}`;
  }

  _calculatePoints() {
    var p1 = this.c1.center,
        p2 = this.c2.center,
        neg = this._neg ? -1 : 1,
        {x: x1, y: y1} = p1,
        {x: x2, y: y2} = p2,
        r1 = this.c1.radius,
        r2 = this.c2.radius,
        gamma = -atan2(y2-y1,x2-x1),
        beta = neg*asin((r2+r1)/dist(p1,p2)),
        alpha = gamma - beta,
        x3 = x1 - neg*r1*sin(alpha),
        y3 = y1 - neg*r1*cos(alpha),
        x4 = x2 + neg*r2*sin(alpha),
        y4 = y2 + neg*r2*cos(alpha);
    this._p1 = {x: x3, y: y3};
    this._p2 = {x: x4, y: y4};
  }

  move(dx, dy) {
    this.c1.move(dx,dy);
    this.c2.move(dx,dy);
  }

  get p1() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculatePoints();
      this._hash = hash;
    }
    return this._p1;
  }
  get p2() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculatePoints();
      this._hash = hash;
    }
    return this._p2;
  }

}

class Circle extends Curve {
  constructor(p1, p2) {
    super();
    this.types.push('circle');
    this.p1 = p1;
    this.p2 = p2;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  parametric(t) {
    var {center,radius,direction} = this;
    return {
      x: center.x + radius*cos(t + direction),
      y: center.y + radius*sin(t + direction)
    }
  }

  closestT(point) {
    var {x,y} = this.center;
    return atan2(point.y - y, point.x - x) - this.direction;
  }

  move(dx, dy) {
    this.p1.moveBy(dx,dy);
    this.p2.moveBy(dx,dy);
  }

  _calculateHash() {
    return `${this.p1.x},${this.p1.y},${this.p2.x},${this.p2.y}`;
  }

  _calculateValues() {
    this._radius = dist(this.p1,this.p2);
    this._direction = atan2(this.p2.y-this.p1.y,this.p2.x-this.p1.x);
  }

  get radius() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateValues();
      this._hash = hash;
    }
    return this._radius;
  }

  get direction() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateValues();
      this._hash = hash;
    }
    return this._direction;
  }

  get center() {
    return this.p1;
  }

  distToPoint(point) {
    return abs(this.radius - dist(this.center,point));
  }

  draw(ctx) {
    var {x, y} = this.center,
        r = this.radius;

    if (r < 0) return;
    this.drawObject(ctx, drawCircle, [ctx, x, y, r]);
  }

  static draw(ctx, p1, p2) {
    var {x, y} = p1,
        r = dist(p1,p2);
    drawCircle(ctx, x, y, r);
  }
}

class Compass extends Circle {
  constructor(segment, center) {
    super();
    this.types.push('compass');
    this.p1 = center;
    this.segment = segment;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  _calculateHash() {
    return `${this.circle._calculateHash()},${this.p1}`;
  }

  move(dx, dy) {
    this.p1.moveBy(dx,dy);
  }

  get radius() {
    return dist(this.segment.p1, this.segment.p2);
  }

  static draw(ctx, circle, point) {
    var {x, y} = point,
        r = circle.radius;
    drawCircle(ctx, x, y, r);
  }
}

class ThreePointCircle extends Circle {
  constructor(p1, p2, p3) {
    super();
    this.types.push('threepointcircle');
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this._center = null;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  get direction() {return sign((this.p1.x - this.p2.x) * (this.p3.y - this.p2.y) - (this.p1.y - this.p2.y) * (this.p3.x - this.p2.x));}

  move(dx, dy) {
    this.p1.moveBy(dx,dy);
    this.p2.moveBy(dx,dy);
    this.p3.moveBy(dx,dy);
  }

  _calculateHash() {
    return `${this.p1.x},${this.p1.y},${this.p2.x},${this.p2.y},${this.p3.x},${this.p3.y}`;
  }

  _calculateCenterAndRadius() {
    const { p1, p2, p3 } = this;

    const D = 2 * (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));
    const Ux = ((p1.x * p1.x + p1.y * p1.y) * (p2.y - p3.y) + (p2.x * p2.x + p2.y * p2.y) * (p3.y - p1.y) + (p3.x * p3.x + p3.y * p3.y) * (p1.y - p2.y)) / D;
    const Uy = ((p1.x * p1.x + p1.y * p1.y) * (p3.x - p2.x) + (p2.x * p2.x + p2.y * p2.y) * (p1.x - p3.x) + (p3.x * p3.x + p3.y * p3.y) * (p2.x - p1.x)) / D;

    this._center = { x: Ux, y: Uy };
    this._radius = dist(this._center,p1);
  }



  static draw(ctx, p1, p2, p3) {
    var {x: x1, y: y1} = p1,
        {x: x2, y: y2} = p2,
        {x: x3, y: y3} = p3,
        d12 = x1*x1 + y1*y1,
        d22 = x2*x2 + y2*y2,
        d32 = x3*x3 + y3*y3,
        x21 = x2 - x1, y12 = y1 - y2,
        x32 = x3 - x2, y23 = y2 - y3,
        x13 = x1 - x3, y31 = y3 - y1,
        d = 2*(x1*y23 + x2*y31 + x3*y12),
        cx = (d12*y23 + d22*y31 + d32*y12)/d,
        cy = (d12*x32 + d22*x13 + d32*x21)/d,
        r = dist({x: cx, y: cy}, p1);
    drawCircle(ctx, cx, cy, r);
  }

  get center() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateCenterAndRadius();
      this._hash = hash;
    }
    return this._center;
  }

  get radius() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateCenterAndRadius();
      this._hash = hash;
    }
    return this._radius;
  }
}

class Arc extends ThreePointCircle {
  constructor(p1, p2, p3) {
    super(p1, p2, p3);
    this.types.push('arc');
  }

  containsPoint(point) {
    var cpb = (this.p1.x - this.p2.x) * (this.p3.y - this.p2.y) - (this.p1.y - this.p2.y) * (this.p3.x - this.p2.x);
    var cpp = (this.p1.x - point.x) * (this.p3.y - point.y) - (this.p1.y - point.y) * (this.p3.x - point.x);

    return sign(cpb) == sign(cpp);
  }

  distToPoint(point) {
    return dist(this.closestPoint(point),point);
  }

  closestPoint(point) {
    var proj = this.parametric(super.closestT(point));
    
    if (this.containsPoint(proj)) return proj;

    var d1sq = dist2(point,this.p1);
    var d3sq = dist2(point,this.p3);

    return d1sq < d3sq ? {x:this.p1.x, y:this.p1.y} : {x:this.p3.x, y:this.p3.y};
  }

  closestT(point) {
    var center = this.center;
    var proj = this.closestPoint(point);
    return atan2(proj.y - center.y, proj.x - center.x);
  }

  draw(ctx) {
    var {x: cx, y: cy} = this.center,
        {x: x1, y: y1} = this.p1,
        {x: x2, y: y2} = this.p2,
        {x: x3, y: y3} = this.p3,
        r = this.radius,
        t0 = atan2(y1 - cy, x1 - cx),
        t1 = atan2(y3 - cy, x3 - cx),
        cp = (x1 - x2) * (y3 - y2) - (y1 - y2) * (x3 - x2),
        ccw = cp > 0;
    this.drawObject(ctx, drawArc, [ctx, cx, cy, r, t0, t1, ccw]);
  }

  static draw(ctx, p1, p2, p3) {
    var {x: x1, y: y1} = p1,
        {x: x2, y: y2} = p2,
        {x: x3, y: y3} = p3,
        d12 = x1*x1 + y1*y1,
        d22 = x2*x2 + y2*y2,
        d32 = x3*x3 + y3*y3,
        x21 = x2 - x1, y12 = y1 - y2,
        x32 = x3 - x2, y23 = y2 - y3,
        x13 = x1 - x3, y31 = y3 - y1,
        d = 2*(x1*y23 + x2*y31 + x3*y12),
        cx = (d12*y23 + d22*y31 + d32*y12)/d,
        cy = (d12*x32 + d22*x13 + d32*x21)/d,
        r = dist({x: cx, y: cy}, p1),
        t0 = atan2(y1 - cy, x1 - cx),
        t1 = atan2(y3 - cy, x3 - cx),
        cp = (x1 - x2) * (y3 - y2) - (y1 - y2) * (x3 - x2),
        ccw = cp > 0;
    drawArc(ctx, cx, cy, r, t0, t1, ccw);
  }
}

class Apollonius extends Circle {
  constructor(c1,c2,c3,i=null) {
    super();
    this.types.push('apollonius');
    this.c1 = c1;
    this.c2 = c2;
    this.c3 = c3;
    if (i === null) {
      i = 0;
      [1,2,3,4,5,6,7].forEach(i => new Apollonius(c1,c2,c3,i));
    }
    var b = i.toString(2).padStart(3,'0');
    this.s1 = 2*b[0]-1;
    this.s2 = 2*b[1]-1;
    this.s3 = 2*b[2]-1;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  _calculateHash() {
    return `${this.c1._calculateHash()},${this.c2._calculateHash()},${this.c3._calculateHash()}`;
  }

  _calculateCenterAndRadius() {
    var {s1,s2,s3,c1,c2,c3} = this,
        {x: x1, y: y1} = c1.center,
        {x: x2, y: y2} = c2.center,
        {x: x3, y: y3} = c3.center,
        r1 = c1.radius,
        r2 = c2.radius,
        r3 = c3.radius,
        N = ((r3*s3 - r1*s1)*(y1 - y2) + (r2*s2 - r1*s1)*(y3 - y1)) /
            ((x2 - x1)*(y3 - y1) - (x1 - x3)*(y1 - y2)),
        M = (((r1*r1*s1*s1 - r3*r3*s3*s3 - x1*x1 - y1*y1 + x3*x3 + y3*y3)*(y1 - y2)) +
            ((r1*r1*s1*s1 - r2*r2*s2*s2 - x1*x1 - y1*y1 + x2*x2 + y2*y2)*(y3 - y1))) /
            (2*((x2 - x1)*(y3 - y1) - (x1 - x3)*(y1 - y2))),
        Q = ((r3*s3 - r1*s1)*(x2 - x1) + (r2*s2 - r1*s1)*(x1 - x3)) /
            ((x2 - x1)*(y3 - y1) - (x1 - x3)*(y1 - y2)),
        P = (((r1*r1*s1*s1 - r3*r3*s3*s3 - x1*x1 - y1*y1 + x3*x3 + y3*y3)*(x2 - x1)) +
            ((r1*r1*s1*s1 - r2*r2*s2*s2 - x1*x1 - y1*y1 + x2*x2 + y2*y2)*(x1 - x3))) /
            (2*((y3 - y1)*(x2 - x1) - (y1 - y2)*(x1 - x3))),
        A = N*N + Q*Q - 1,
        B = 2*(N*M - N*x1 + s1*r1 + P*Q - Q*y1),
        C = M*M - 2*M*x1 + x1*x1 + P*P - 2*P*y1 + y1*y1 - s1*s1*r1*r1,
        r = (-B-sqrt(B*B-4*A*C))/(2*A),
        y = Q*r + P,
        x = N*r + M;
    this._center = {x,y};
    this._radius = r;
  }

  get center() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateCenterAndRadius();
      this._hash = hash;
    }
    return this._center;
  }

  get radius() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateCenterAndRadius();
      this._hash = hash;
    }
    return this._radius;
  }
}

class ApolloniusLLL extends Circle {
  constructor(l1,l2,l3,i=null) {
    super();
    this.types.push('apolloniuslll');
    this.l1 = l1;
    this.l2 = l2;
    this.l3 = l3;
    if (i === null) {
      i = 0;
      [1,2,3].forEach(i => new ApolloniusLLL(l1,l2,l3,i));
    }
    var b = i.toString(2).padStart(2,'0');
    this.s1 = +b[0];
    this.s2 = +b[1];
    for (let arg of arguments) arg?.addChild?.(this);
  }
  move(dx,dy) {
    this.l1.move(dx,dy);
    this.l2.move(dx,dy);
    this.l3.move(dx,dy);
  }

  _calculateHash() {
    return `${this.l1._calculateHash()},${this.l2._calculateHash()},${this.l3._calculateHash()}`;
  }

  _calculateCenterAndRadius() {
    var {l1, l2, l3, s1, s2} = this,
        {x: x1, y: y1} = l1.p1,
        {x: x2, y: y2} = l1.p2,
        {x: x3, y: y3} = l2.p1,
        {x: x4, y: y4} = l2.p2,
        {x: x5, y: y5} = l3.p1,
        {x: x6, y: y6} = l3.p2,
        phi1 = atan2(y2-y1,x2-x1),
        phi2 = atan2(y4-y3,x4-x3),
        phi3 = atan2(y6-y5,x6-x5),
        theta1 = (phi1+phi2+pi*s1)/2,
        theta2 = (phi2+phi3+pi*s2)/2,
        I1 = lineLineIntersection(l1,l2),
        I2 = lineLineIntersection(l2,l3),
        I11 = {
          x: I1.x + cos(theta1),
          y: I1.y + sin(theta1)
        },
        I21 = {
          x: I2.x + cos(theta2),
          y: I2.y + sin(theta2)
        },
        center = lineLineIntersection({p1:I1, p2:I11},{p1:I2,p2:I21}),
        radius = distPointLine(center,l1);
    
    this._center = center;
    this._radius = radius;
  }

  get center() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateCenterAndRadius();
      this._hash = hash;
    }
    return this._center;
  }

  get radius() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateCenterAndRadius();
      this._hash = hash;
    }
    return this._radius;
  }
}


class ApolloniusLLP extends Circle {
  constructor(l1,l2,p,i=null) {
    super();
    this.types.push('apolloniuslll');
    this.l1 = l1;
    this.l2 = l2;
    this.p = p;
    if (i === null) {
      i = 0;
      new ApolloniusLLP(l1,l2,p,1);
    }
    this.s = i;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  move(dx,dy) {
    this.l1.move(dx,dy);
    this.l2.move(dx,dy);
    this.p.moveBy(dx,dy);
  }

  _calculateHash() {
    return `${this.l1._calculateHash()},${this.l2._calculateHash()},${this.p.x},${this.p.y}`;
  }

  _calculateCenterAndRadius() {
    var {l1, l2, p: P, s} = this,
        {p1, p2} = l1,
        {p1: p3, p2: p4} = l2,
        cpP = cross(P.sub(p1),p2.sub(p1))*cross(P.sub(p3),p4.sub(p3)),
        phi1 = atan2(p2.y-p1.y,p2.x-p1.x),
        phi2 = atan2(p4.y-p3.y,p4.x-p3.x),
        theta = (phi1+phi2+pi*(cpP > 0))/2,
        I = lineLineIntersection(l1,l2),
        I1 = I.add(point(cos(theta),sin(theta))),
        d = I1.sub(I),
        p = P.sub(I),
        T = dot(p,d)/norm(d),
        Q = P.add(d.mul(T).sub(p).mul(2)),
        G = lineLineIntersection(l1,{p1:P, p2:Q}),
        d1 = dist(G,P),
        d2 = dist(G,Q),
        d3 = sqrt(d1*d2),
        T1 = G.add(point(cos(phi1),sin(phi1)).mul((2*s-1)*d3)),
        D = 2*(P.x*(Q.y - T1.y) + Q.x*(T1.y - P.y) + T1.x*(P.y - Q.y)),
        h = ((P.x*P.x + P.y*P.y)*(Q.y - T1.y) + (Q.x*Q.x + Q.y*Q.y)*(T1.y - P.y) + (T1.x*T1.x + T1.y*T1.y)*(P.y - Q.y)) / D,
        k = ((P.x*P.x + P.y*P.y)*(T1.x - Q.x) + (Q.x*Q.x + Q.y*Q.y)*(P.x - T1.x) + (T1.x*T1.x + T1.y*T1.y)*(Q.x - P.x)) / D,
        center = point(h,k),
        radius = dist(center,P);
    
    this._center = center;
    this._radius = radius;
  }

  get center() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateCenterAndRadius();
      this._hash = hash;
    }
    return this._center;
  }

  get radius() {
    const hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateCenterAndRadius();
      this._hash = hash;
    }
    return this._radius;
  }
}

class Parabola extends Curve {
  constructor(vertex, focus) {
    super();
    this.types.push('parabola');
    this.vertex = vertex;
    this.focus = focus;
    this._coefficients = null;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  _calculateCoefficients() {
    const V = this.vertex;
    const F = this.focus;
    
    const a = V.x - F.x;
    const b = V.y - F.y;
    const c = 3 * (V.x * F.x + V.y * F.y) - 2 * (V.x ** 2 + V.y ** 2) - (F.x ** 2 + F.y ** 2);

    this._coefficients = { a, b, c };
  }

  get coefficients() {
    if (!this._coefficients) {
      this._calculateCoefficients();
    }
    return this._coefficients;
  }

  get f0() {return this.vertex}
  get f1() {
    return point(
      2*(this.focus.y - this.vertex.y),
      2*(this.vertex.x - this.focus.x),
    );
  }
  get f2() {
    return this.focus.sub(this.vertex);
  }

  get p0() {return this.vertex}
  get p1() {return this.f0.add(this.f1.div(2))}
  get p2() {return this.f0.add(this.f1).add(this.f2)}

  parametric(t) {
    var {p0,p1,p2} = this;
    return p0.add(p1.mul(t)).add(p2.mul(t*t));
  }

  closestT(point) {
    // Implement the logic to find the closest t value for the given point
    const { x, y } = point;
    const { x: xF, y: yF } = this.focus;

    // Finding the parameter t for the closest point on the parabola
    const t = ((x - xF) ** 2 + (y - yF) ** 2) ** 0.5;
    return t;
  }

  closestPoint(point) {
    const t = this.closestT(point);
    return this.parametric(t);
  }

  move(dx, dy) {
    this.vertex.moveBy(dx, dy);
    this.focus.moveBy(dx, dy);
  }

  distToPoint(point) {
    return dist(this.closestPoint(point), point);
  }

  draw(ctx) {
    var [p0,p1,p2] = getParabolaEndpoints(this);
    function draw(ctx,p0,p1,p2) {
      ctx.beginPath();
      ctx.moveTo(p0.x,p0.y);
      ctx.quadraticCurveTo(p1.x,p1.y,p2.x,p2.y);
      ctx.stroke();
    }
    this.drawObject(ctx, draw, [ctx,p0,p1,p2]);
  }

  static draw(ctx, vertex, focus) {return;
    var [p0,p1,p2] = getParabolaEndpoints({vertex, focus});
    function draw(ctx,p0,p1,p2) {
      ctx.beginPath();
      ctx.moveTo(p0.x,p0.y);
      ctx.quadraticCurveTo(p1.x,p1.y,p2.x,p2.y);
      ctx.stroke();
    }
    this.drawObject(ctx, draw, [ctx,p0,p1,p2]);
  }
}

class Ellipse extends Curve {
  constructor(p0, p1, p2) {
    super();
    this.types.push('ellipse');
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    for (let arg of arguments) arg?.addChild?.(this);
  }

  _calculateHash() {
    return `${this.p0.x},${this.p0.y},${this.p1.x},${this.p1.y},${this.p2.x},${this.p2.y}`;
  }

  _calculateParameters() {
    var {f0,f1,f2} = this,
        t0 = acot((norm(f1)-norm(f2))/(2*dot(f1,f2)))/2,
        v1 = this.parametric(t0),
        v2 = this.parametric(t0+pi2),
        v3 = this.parametric(t0+pi),
        v4 = this.parametric(t0-pi2),
        a = dist(f0,v1),
        b = dist(f0,v2),
        theta = atan2(v1.y-f0.y,v1.x-f0.x);
    this._a = a;
    this._b = b;
    this._verticies = [v1,v2,v3,v4];
    this._theta = theta;
  }

  get verticies() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateParameters();
      this._hash = hash;
    }
    return this._verticies;
  }
  get a() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateParameters();
      this._hash = hash;
    }
    return this._a;
  }
  get b() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateParameters();
      this._hash = hash;
    }
    return this._b;
  }
  get theta() {
    var hash = this._calculateHash();
    if (this._hash !== hash) {
      this._calculateParameters();
      this._hash = hash;
    }
    return this._theta;
  }
  get f0() {
    return this.p0;
  }
  get f1() {
    return this.p1.sub(this.p0);
  }
  get f2() {
    return this.p2.sub(this.p0);
  }

  parametric(t) {
    var {f0,f1,f2} = this;
    return f0.add(f1.mul(cos(t))).add(f2.mul(sin(t)));
  }

  closestT(point) {
    return 0;
  }

  closestPoint(point) {
    const t = this.closestT(point);
    return this.parametric(t);
  }

  move(dx, dy) {
    this.f0.moveBy(dx, dy);
    this.f1.moveBy(dx, dy);
    this.f2.moveBy(dx, dy);
  }

  distToPoint(point) {
    return dist(this.closestPoint(point), point);
  }

  draw(ctx) {
    var {f0,a,b,theta} = this;
    function draw(ctx,f0,a,b,theta) {
      ctx.beginPath();
      ctx.ellipse(f0.x,f0.y,a,b,theta,0,tau);
      ctx.stroke();
    }
    this.drawObject(ctx, draw, [ctx,f0,a,b,theta]);
  }

  static draw(ctx, vertex, focus) {return;
    var [p0,p1,p2] = getParabolaEndpoints({vertex, focus});
    function draw(ctx,p0,p1,p2) {
      ctx.beginPath();
      ctx.moveTo(p0.x,p0.y);
      ctx.quadraticCurveTo(p1.x,p1.y,p2.x,p2.y);
      ctx.stroke();
    }
    this.drawObject(ctx, draw, [ctx,p0,p1,p2]);
  }
}
