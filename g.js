var canvas = document.getElementById('canvas');
canvas.style = `
  position: absolute;
  top: 0px;
  left: 0px;
`;
var ctx = canvas.getContext('2d');

window.onresize = function(event) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

var mouse = point(0,0);
mouse.grabbing = null;
mouse.initialPoint = null;
mouse.vector = null;
mouse.lastSelected = null;

var _mode = 'hand';
var construction = [];
var constructionTypes = [];
var constructionClass = null;

Object.defineProperty(window, 'nextObj', {
  get() {
    return constructionTypes[construction.length];
  }
});

Object.defineProperty(window, 'mode', {
  get() {
    return _mode;
  },
  set(mode) {
    _mode = mode;
    constructionTypes = argTypes[_mode];
    constructionClass = constructionClasses[_mode];
    construction = [];
  }
});

var argTypes = {
  hand: [],
  select: [],
  show: [],
  lock: [],
  point: ['point'],
  midpoint: ['point','point'],
  midpoint2: ['line'],
  line: ['point','point'],
  ray: ['point','point'],
  segment: ['point','point'],
  parallel: ['line','point'],
  perpendicular: ['line', 'point'],
  perpendicularbisector: ['point', 'point'],
  perpendicularbisector2: ['line'],
  anglebisector: ['point', 'point', 'point'],
  circletangent: ['circle','point'],
  externaltangent: ['circle','circle'],
  internaltangent: ['circle','circle'],
  circle: ['point', 'point'],
  compass: ['circle', 'point'],
  threepointcircle: ['point', 'point', 'point'],
  arc: ['point', 'point', 'point'],
  apollonius: ['circle', 'circle', 'circle'],
  apolloniuslll: ['line', 'line', 'line'],
  apolloniusllp: ['line', 'line', 'point'],
  parabola: ['point', 'point'],
  ellipse: ['point', 'point', 'point'],
  translation: ['any','point','point'],
  reflection: ['any','line'],
}

var constructionClasses = {
  hand: null,
  select: null,
  show: null,
  lock: null,
  point: Point,
  midpoint: Midpoint,
  midpoint2: Midpoint,
  line: Line,
  ray: Ray,
  segment: Segment,
  parallel: Parallel,
  perpendicular: Perpendicular,
  perpendicularbisector: PerpendicularBisector,
  perpendicularbisector2: PerpendicularBisector,
  anglebisector: AngleBisector,
  circletangent: CircleTangent,
  externaltangent: ExternalTangent,
  internaltangent: InternalTangent,
  circle: Circle,
  compass: Compass,
  threepointcircle: ThreePointCircle,
  arc: Arc,
  apollonius: Apollonius,
  apolloniuslll: ApolloniusLLL,
  apolloniusllp: ApolloniusLLP,
  parabola: Parabola,
  ellipse: Ellipse,
  translation: Translation,
  reflection: Reflection,
}

var toolTips = {
  hand: 'Hand',
  select: 'Select',
  show: 'Show/Hide',
  lock: 'Lock/Unlock',
  point: 'Point',
  midpoint: 'Midpoint (2 points)',
  midpoint2: 'Midpoint (segment)',
  line: 'Line',
  ray: 'Ray',
  segment: 'Line Segment',
  parallel: 'Parallel Line',
  perpendicular: 'Perpendicular Line',
  perpendicularbisector: 'Perpendicular Bisector (2 ponts)',
  perpendicularbisector2: 'Perpendicular Bisector (segment)',
  anglebisector: 'Angle Bisector',
  circletangent: 'Point-Circle Tangent',
  externaltangent: 'Circle-Circle External Tangent',
  internaltangent: 'Circle-Circle Internal Tangent',
  circle: 'Circle (center + radial point)',
  compass: 'Circle (segment + center)',
  threepointcircle: 'Three Point Circle',
  arc: 'Three Point Arc',
  apollonius: 'Circle Tangent to Three Circles',
  apolloniuslll: 'Circle Tangent to Three Lines',
  apolloniusllp: 'Circle Tangent to Two Lines and Point',
  parabola: 'Parabola',
  ellipse: 'Ellipse',
  translation: 'Translation',
  reflection: 'Reflection',
}

var i = 0;
new ButtonGroup(5 + 60*i++, 5, [
  new Button('hand'),
  new Button('select'),
  new Button('show'),
  new Button('lock'),
]);
new ButtonGroup(5 + 60*i++, 5, [
  new Button('point'),
  new Button('midpoint'),
  new Button('midpoint2'),
]);
new ButtonGroup(5 + 60*i++, 5, [
  new Button('segment'),
  new Button('ray'),
  new Button('line'),
  new Button('parallel'),
  new Button('perpendicular'),
]);
new ButtonGroup(5 + 60*i++, 5, [
  new Button('perpendicularbisector'),
  new Button('perpendicularbisector2'),
  new Button('anglebisector'),
]);
new ButtonGroup(5 + 60*i++, 5, [
  new Button('circle'),
  new Button('threepointcircle'),
  new Button('arc'),
  new Button('compass'),
]);
new ButtonGroup(5 + 60*i++, 5, [
  new Button('circletangent'),
  new Button('externaltangent'),
  new Button('internaltangent'),
  new Button('apollonius'),
  new Button('apolloniuslll'),
  new Button('apolloniusllp'),
]);
new ButtonGroup(5 + 60*i++, 5, [
  new Button('translation'),
  new Button('reflection'),
]);

new ButtonGroup(5 + 60*i++, 5, [
  new Button('parabola'),
  new Button('ellipse'),
]);


function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  

  for (let curve of Curve.all) {
    ctx.globalAlpha = 1;
    if (curve.hidden) {
      if (mode != 'show') continue;
      ctx.globalAlpha = .5;
    }
    
    ctx.strokeStyle = curve.color;
    curve.draw(ctx);
  }

  for (let point of Point.all) {
    if (!point) continue;
    if (!point.x || !point.y) continue;
    if (point.hidden) continue;
    ctx.fillStyle = point.color;
    point.draw(ctx);
  }
  var hovering = mouse.hovering;

  if (nextObj == 'point') {
    var point = hovering;
    if (hovering) {
      if (Array.isArray(hovering)) {
        point = intersection(hovering[0],hovering[1]);
        if (Array.isArray(point)) {
          var [i1,i2] = point;
          if (i1 === null) {
            point = i2;
          } else if (i2 === null) {
            point = i1;
          } else {
            point = dist2(mouse,i1) < dist2(mouse,i2) ? i1 : i2;
          }
        }
      } else if (hovering.types[0] == 'curve') {
        point = hovering.closestPoint(mouse);
      }
    } else {
      point = mouse;
    }

    if (mode != 'point' && construction.length == constructionTypes.length - 1) {
      var args = [ctx, ...construction, point];
      ctx.lineWidth = 1;
      ctx.globalAlpha = .5;
      ctx.strokeStyle = 'orange';
      constructionClass.draw(...args);
    }
    if (!(point === null || (Array.isArray(point) && point[0] === null && point[1] === null))) {
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.globalAlpha = .5;
      ctx.arc(point.x, point.y, 12, 0, tau);
      ctx.fill();
      ctx.beginPath();
      ctx.globalAlpha = 1;
      ctx.arc(point.x, point.y, 4, 0, tau);
      ctx.fill();
    }
  }

  if (mode == 'select' && mouse.initialPoint) {
    ctx.strokeStyle = 'white';
    var xm =  - .5*((canvas.width-1) % 2),
        ym =  - .5*((canvas.height-1) % 2),
        x0 = floor(mouse.x) - .5,
        y0 = floor(mouse.y) - .5,
        x1 = floor(mouse.initialPoint.x) - .5,
        y1 = floor(mouse.initialPoint.y) - .5,
        w = x1 - x0,
        h = y1 - y0;
    ctx.globalAlpha = .0625;
    ctx.fillStyle = 'white';
    ctx.fillRect(x0,y0,w,h);
    ctx.lineWidth = 1;
    ctx.globalAlpha = .5;
    ctx.strokeRect(x0,y0,w,h);
    ctx.globalAlpha = 1;
  }

  Button.forEach(button => button.draw(ctx));
}

window.onkeydown = function(event) {
  if (event.code == 'Backspace') {
    mouse.lastSelected?.delete();
    mouse.lastSelected = null;
    draw();
  }
}

window.oncontextmenu = function(event) {
  event.preventDefault();
  if (contextMenu) contextMenu.destroy();
  if (mouse.hovering) {
    createObjectContextMenu(event,mouse.hovering);
  } else {
    createContextMenu(event);
  }
}

canvas.onpointermove = (e) => {
  const { offsetX, offsetY } = e;

  if (Button.active) {
    canvas.style.cursor = 'pointer';
    return;
  }
  Button.hovered = null;
  Button.forEach(button => {
    button.hovered = button.isInside(offsetX, offsetY);
    if (button.hovered) Button.hovered = button;
    if (canvas.title !== button.tip) canvas.title = button.tip;
  });
  if (Button.hovered) {
    if (canvas.title !== Button.hovered.tip) {
      canvas.title = Button.hovered.tip;
    }
  } else {
    if (canvas.title) canvas.title = '';
  }

  if (Button.hovered) {
    canvas.style.cursor = 'pointer';
  } else {
    canvas.style.cursor = 'default';
  }

  if (mouse.grabbing && !['show','lock'].includes(mode)) {
    const dx = offsetX - mouse.x;
    const dy = offsetY - mouse.y;
    mouse.vector = {
      x: offsetX - mouse.initialPoint.x,
      y: offsetY - mouse.initialPoint.y,
    };
    if (mouse.grabbing.types[0] === 'point') {
      mouse.grabbing.move(offsetX, offsetY);
    } else if (mouse.grabbing.types[0] === 'curve') {
      mouse.grabbing.move(dx, dy);
    }
    Point.all.forEach(point => point._moved = false);
  } else {
    if (['hand','any','show','lock'].includes(mode) || nextObj == 'any') {
      handleDefaultHover(offsetX, offsetY);
    } else if (nextObj == 'point') {
      handlePointHover(offsetX, offsetY);
    } else {
      handleCurveHover(offsetX, offsetY);
    }
  }
  mouse.x = offsetX;
  mouse.y = offsetY;
  draw();
};

function handlePointHover(offsetX, offsetY) {
  mouse.hovering = null;
  var mindist = 10;

  var points = Point.all.filter(p => !p.hidden);
  for (let point of points) {
    const dist = hypot(point.x - offsetX, point.y - offsetY);
    if (dist < mindist) {
      mindist = dist;
      mouse.hovering = point;
    }
  }

  if (mindist < 10) return;

  var nearby = [];
  var curves = Curve.all.filter(p => !p.hidden);
  for (let curve of curves) {
    const dist = curve.distToPoint({ x: offsetX, y: offsetY });
    if (dist < mindist) {
      nearby.push(curve);
      if (nearby.length == 2) break;
    }
  }

  if (nearby.length == 2) {
    mouse.hovering = nearby;
  } else if (nearby.length == 1) {
    mouse.hovering = nearby[0];
  }
}

function handleCurveHover(offsetX, offsetY) {
  mouse.hovering = null;
  let minDist = 10;

  for (let curve of Curve.all.filter(c => !c.hidden && c.types.includes(nextObj))) {
    const dist = curve.distToPoint({ x: offsetX, y: offsetY });
    if (dist < minDist) {
      mouse.hovering = curve;
      minDist = dist;
    }
  }

  if (minDist == 10) mouse.hovering = null;
}

function handleLineHover(offsetX, offsetY) {
  mouse.hovering = null;
  let minDist = 10;
  for (let line of Line.all.filter(l => !l.hidden)) {
    const dist = line.distToPoint({ x: offsetX, y: offsetY });
    if (dist < minDist) {
      mouse.hovering = line;
      minDist = dist;
    }
  }
}

function handleCircleHover(offsetX, offsetY) {
  mouse.hovering = null;
  let minDist = 10;
  for (let circle of Circle.all.filter(c => !c.hidden)) {
    const dist = circle.distToPoint({ x: offsetX, y: offsetY });
    if (dist < minDist) {
      mouse.hovering = circle;
      minDist = dist;
    }
  }
}

function handleDefaultHover(offsetX, offsetY) {
  mouse.hovering = null;
  var mindist = 10;

  var points = Point.all;
  if (mode != 'show') points = points.filter(p => !p.hidden);
  for (let point of points) {
    const dist = hypot(point.x - offsetX, point.y - offsetY);
    if (dist < mindist) {
      mouse.hovering = point;
      mindist = dist;
    }
  }

  if (mindist == 10 && mode != 'lock') {
  var curves = Curve.all;
  if (mode != 'show') curves = curves.filter(p => !p.hidden);
  for (let curve of curves) {
    const dist = curve.distToPoint({ x: offsetX, y: offsetY });
    if (dist < mindist) {
      mouse.hovering = curve;
      mindist = dist;
    }
  }}

  if (mindist == 10) mouse.hovering = null;
}

canvas.onpointerdown = (e) => {
  if (e.button != 0) return;
  if (contextMenu) contextMenu.destroy();
  canvas.setPointerCapture(e.pointerId);
  const { offsetX, offsetY } = e;
  mouse.x = offsetX;
  mouse.y = offsetY;
  mouse.initialPoint = { x: offsetX, y: offsetY };
  mouse.vector = { x: 0, y: 0 };

  if (Button.hovered) {
    Button.active = Button.hovered;
    Button.hovered.active = true;
    draw();
    return;
  }

  if (nextObj == 'point') {
    handlePointCreation();
  }

  if (mouse.hovering) {
    if (!['point','hand','show','lock'].includes(mode)) {
      construction.push(mouse.hovering);
      if (construction.length == constructionTypes.length) {
        new constructionClass(...construction);
        construction = [];
      }
    }
  }

  mouse.grabbing = mouse.hovering;
  draw();
};

canvas.onpointerup = (e) => {
  canvas.releasePointerCapture(e.pointerId);
  const { offsetX, offsetY } = e;

  if (Button.active) Button.active.action();

  if (mode == 'hand') {
    mouse.lastSelected = mouse.grabbing;
  }
  if (mouse.grabbing) {
    if (mode == 'show') {
      mouse.grabbing.hidden = !mouse.grabbing.hidden;
    }
    if (mode == 'lock') {
      mouse.grabbing.locked = !mouse.grabbing.locked;
    }
  }

  mouse.grabbing = null;
  Glider.all.forEach(g => g._initialPoint = false);
  mouse.initialPoint = null;
  mouse.vector = null;
  draw();
};

function handlePointCreation() {
  var hovering = mouse.hovering;
  if (hovering) {
    if (Array.isArray(hovering)) {
      var point = intersection(hovering[0],hovering[1]);
      if (Array.isArray(point)) {
        var [i1,i2] = point, negroot;
        if (i1 === null) {
          negroot = true;
        } else if (i2 === null) {
          negroot = false;
        } else {
          negroot = dist2(mouse,i2) < dist2(mouse,i1);
        }
        mouse.hovering = new Intersection(hovering[0],hovering[1],negroot);
      } else {
        mouse.hovering = new Intersection(hovering[0],hovering[1]);
      }
    } else if (hovering.types[0] == 'curve') {
      mouse.hovering = new Glider(hovering, hovering.closestT(mouse));
    }
  } else {
    mouse.hovering = new Point(mouse.x, mouse.y);
  }
}


window.onresize();