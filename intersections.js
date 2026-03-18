function _lineIntersection(p1, p2, p3, p4, cond = () => true) {
  var Ax = p2.x - p1.x,
      Ay = p2.y - p1.y,
      Bx = p3.x - p4.x,
      By = p3.y - p4.y,
      Cx = p1.x - p3.x,
      Cy = p1.y - p3.y,
      d = Bx * Ay - Ax * By,
      a = (Cx * By - Bx * Cy) / d,
      b = (Ax * Cy - Cx * Ay) / d;

  if (!cond(a, b)) return null;

  return point(p1.x + a * Ax, p1.y + a * Ay);
}

function lineLineIntersection(line1, line2) {
  return _lineIntersection(line1.p1, line1.p2, line2.p1, line2.p2);
}
function lineRayIntersection(line, ray) {
  return _lineIntersection(line.p1, line.p2, ray.p1, ray.p2, (a, b) => 0 <= b);
}
function lineSegmentIntersection(line, segment) {
  return _lineIntersection(line.p1, line.p2, segment.p1, segment.p2, (a, b) => 0 <= b && b <= 1);
}
function rayLineIntersection(ray, line) {
  return _lineIntersection(line.p1, line.p2, ray.p1, ray.p2, (a, b) => 0 <= b);
}
function rayRayIntersection(ray1, ray2) {
  return _lineIntersection(ray1.p1, ray1.p2, ray2.p1, ray2.p2, (a, b) => 0 <= a && 0 <= b);
}
function raySegmentIntersection(ray, segment) {
  return _lineIntersection(ray.p1, ray.p2, segment.p1, segment.p2, (a, b) => 0 <= a && 0 <= b && b <= 1);
}
function segmentLineIntersection(segment, line) {
  return _lineIntersection(line.p1, line.p2, segment.p1, segment.p2, (a, b) => 0 <= b && b <= 1);
}
function segmentRayIntersection(segment, ray) {
  return _lineIntersection(ray.p1, ray.p2, segment.p1, segment.p2, (a, b) => 0 <= a && 0 <= b && b <= 1);
}
function segmentSegmentIntersection(segment1, segment2) {
  return _lineIntersection(segment1.p1, segment1.p2, segment2.p1, segment2.p2, (a, b) => 0 <= a && a <= 1 && 0 <= b && b <= 1);
}

function _circleIntersection(p1, p2, c1, r1, dir, cond = () => true) {
  var dx = p2.x - p1.x,
      dy = p2.y - p1.y,
      fx = p1.x - c1.x,
      fy = p1.y - c1.y,
      a = dx * dx + dy * dy,
      b = 2 * (fx * dx + fy * dy),
      c = (fx * fx + fy * fy) - r1 * r1,
      d = b * b - 4 * a * c;

  if (d < 0) return [null, null];

  d = sqrt(d);
  var t1 = (-b - d) / (2 * a),
      t2 = (-b + d) / (2 * a),
      i1 = point(p1.x + t1 * dx, p1.y + t1 * dy),
      i2 = point(p1.x + t2 * dx, p1.y + t2 * dy);
  
  i1 = cond(t1,i1) ? i1 : null;
  i2 = cond(t2,i2) ? i2 : null;

  return dir == 1 ? [i1, i2] : [i2, i1];
}

function lineCircleIntersection(line, circle) {
  return _circleIntersection(line.p1, line.p2, circle.center, circle.radius, circle.direction);
}
function rayCircleIntersection(ray, circle) {
  return _circleIntersection(ray.p1, ray.p2, circle.center, circle.radius, circle.direction, (a) => a >= 0);
}
function segmentCircleIntersection(segment, circle) {
  return _circleIntersection(segment.p1, segment.p2, circle.center, circle.radius, circle.direction, (a) => a >= 0 && a <= 1);
}
function circleLineIntersection(circle, line) {
  return _circleIntersection(line.p1, line.p2, circle.center, circle.radius, circle.direction);
}
function circleRayIntersection(circle, ray) {
  return _circleIntersection(ray.p1, ray.p2, circle.center, circle.radius, circle.direction, (a) => a >= 0);
}
function circleSegmentIntersection(circle, segment) {
  return _circleIntersection(segment.p1, segment.p2, circle.center, circle.radius, circle.direction, (a) => a >= 0 && a <= 1);
}
function lineArcIntersection(line, arc) {
  return _circleIntersection(line.p1, line.p2, arc.center, arc.radius, arc.direction, (a, point) => arc.containsPoint(point));
}
function rayArcIntersection(ray, arc) {
  return _circleIntersection(ray.p1, ray.p2, arc.center, arc.radius, arc.direction, (a, point) => a >= 0 && arc.containsPoint(point));
}
function segmentArcIntersection(segment, arc) {
  return _circleIntersection(segment.p1, segment.p2, arc.center, arc.radius, arc.direction, (a, point) => a >= 0 && a <= 1 && arc.containsPoint(point));
}
function arcLineIntersection(arc, line) {
  return _circleIntersection(line.p1, line.p2, arc.center, arc.radius, arc.direction, (a, point) => arc.containsPoint(point));
}
function arcRayIntersection(arc, ray) {
  return _circleIntersection(ray.p1, ray.p2, arc.center, arc.radius, arc.direction, (a, point) => a >= 0 && arc.containsPoint(point));
}
function arcSegmentIntersection(arc, segment) {
  return _circleIntersection(segment.p1, segment.p2, arc.center, arc.radius, arc.direction, (a, point) => a >= 0 && a <= 1 && arc.containsPoint(point));
}

function _circleCircleIntersection(c1, r1, c2, r2, dir, cond = () => true) {
  var d = dist(c1, c2);

  if (d > r1 + r2 || d < abs(r1 - r2)) {
    return [null, null];
  }

  var a = (r1 ** 2 - r2 ** 2 + d ** 2) / (2 * d);
  var h = sqrt(r1 ** 2 - a ** 2);
  var x0 = c1.x + (a / d) * (c2.x - c1.x);
  var y0 = c1.y + (a / d) * (c2.y - c1.y);

  var rx = -(c2.y - c1.y) * (h / d);
  var ry = (c2.x - c1.x) * (h / d);

  var i1 = point(x0 + rx, y0 + ry);
  var i2 = point(x0 - rx, y0 - ry);
  i1 = cond(i1) ? i1 : null;
  i2 = cond(i2) ? i2 : null;

  return dir == 1 ? [i1, i2] : [i2, i1];
}

function circleCircleIntersection(circle1, circle2) {
  return _circleCircleIntersection(circle1.center, circle1.radius, circle2.center, circle2.radius, circle1.direction*circle2.direction);
}

function circleArcIntersection(circle, arc) {
  return _circleCircleIntersection(circle.center, circle.radius, arc.center, arc.radius, circle.direction*arc.direction, (point) => arc.containsPoint(point));
}

function arcCircleIntersection(arc, circle) {
  return _circleCircleIntersection(circle.center, circle.radius, arc.center, arc.radius, circle.direction*arc.direction, (point) => arc.containsPoint(point));
}

function arcArcIntersection(arc1, arc2) {
  return _circleCircleIntersection(arc1.center, arc1.radius, arc2.center, arc2.radius, arc1.direction*arc2.direction, (point) => arc1.containsPoint(point) && arc2.containsPoint(point));
}

function intersection(c1,c2) {
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
    }
  }
  
  var t1 = getType(c1);
  var t2 = getType(c2);

  return window[t1+t2[0].toUpperCase()+t2.slice(1)+'Intersection'](c1,c2);
}

function lineParabolaIntersection(line, parabola) {
  var {focus: F, vertex: V} = parabola,
      {x: vx, y: vy} = V,
      {x: fx, y: fy} = F,
      a = vx - fx,
      b = vy - fy,
      c = 3*dot(V,F) - 2*norm(V) - norm(F);
      A1 = b*b,
      B1 = a*a,
      C1 = -2*(fx*(A1 + B1) + a*c),
      D1 = -2*(fy*(A1 + B1) + b*c),
      E1 = -2*a*b,
      F1 = norm(F)*(A1 + B1) - c*c,
      {p1, p2} = line,
      {x: x1, y: y1} = p1,
      {x: x2, y: y2} = p2,
      A2 = y2 - y1,
      B2 = x1 - x2,
      C2 = x2*y1 - x1*y2,
      det = -4*A1*B1*C2*C2
            -4*A1*B2*B2*F1
            +4*A1*B2*C2*D1
            -4*A2*A2*B1*F1
            +A2*A2*D1*D1
            +4*A2*B1*C1*C2
            -2*A2*B2*C1*D1
            +4*A2*B2*E1*F1
            -2*A2*C2*D1*E1
            +B2*B2*C1*C1
            -2*B2*C1*C2*E1
            +C2*C2*E1*E1;
      if (det < 0) return [null, null];
  var detr = sqrt(det),
      unum = -2*A2*B1*C2 + A2*B2*D1 - B2*B2*C1 + B2*C2*E1,
      vnum = -2*A1*B2*C2 - A2*A2*D1 + A2*B2*C1 + A2*C2*E1,
      den = 2*(A1*B2*B2 + A2*A2*B1 - A2*B2*E1),
      u1 = (unum + B2*detr)/den,
      v1 = (vnum - A2*detr)/den,
      u2 = (unum - B2*detr)/den,
      v2 = (vnum + A2*detr)/den;
  return [
    point(u1,v1), point(u2,v2)
  ];
}

function getParabolaEndpoints(parabola) {
  var w = canvas.width,
      h = canvas.height,
      {focus: F, vertex: V} = parabola,
      a = V.x - F.x,
      b = V.y - F.y,
      c = 3*dot(V,F) - 2*norm(V) - norm(F);
      I1 = lineParabolaIntersection(line(0,0,w,0),parabola),
      I2 = lineParabolaIntersection(line(w,0,w,h),parabola),
      I3 = lineParabolaIntersection(line(w,h,0,h),parabola),
      I4 = lineParabolaIntersection(line(0,h,0,0),parabola),
      I = [
        ...I1.filter(p => p && 0 < p.x && p.x < w),
        ...I2.filter(p => p && 0 <= p.y && p.y <= h),
        ...I3.filter(p => p && 0 < p.x && p.x < w),
        ...I4.filter(p => p && 0 <= p.y && p.y <= h)
      ],
      Ip = I.filter(I => cross(I.sub(V),F.sub(V)) > 0),
      In = I.filter(I => cross(I.sub(V),F.sub(V)) < 0);

  var maxIp = Ip[0];
  var maxdist = 0;

  for (let point of Ip.slice(1)) {
    var dist = hypot(point.x - V.x, point.y - V.y);
    if (dist > maxdist) {
      maxIp = point;
      maxdist = dist;
    }
  }

  var maxIn = In[0];
  maxdist = 0;

  for (let point of In.slice(1)) {
    var dist = hypot(point.x - V.x, point.y - V.y);
    if (dist > maxdist) {
      maxIn = point;
      maxdist = dist;
    }
  }

  var x0 = maxIn.x,
      y0 = maxIn.y,
      x1 = maxIp.x,
      y1 = maxIp.y,
      d = a*a + b*b,
      py0 = -(2*a*(a*x0 + b*y0 + c)/d - 2*(x0 - F.x)),
      px0 = 2*b*(a*x0 + b*y0 + c)/d - 2*(y0 - F.y),
      py1 = -(2*a*(a*x1 + b*y1 + c)/d - 2*(x1 - F.x)),
      px1 = 2*b*(a*x1 + b*y1 + c)/d - 2*(y1 - F.y),
      l1 = {p1: maxIn, p2: maxIn.sub(point(px0,py0))},
      l2 = {p1: maxIp, p2: maxIp.sub(point(px1,py1))},
      mp = lineLineIntersection(l1,l2);

  return [maxIn,mp,maxIp];

}