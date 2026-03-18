function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawArc(ctx, cx, cy, r, t0, t1, ccw=false) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, t0, t1, ccw);
  ctx.stroke();
}

function drawCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, tau);
  ctx.stroke();
}

function drawParabola(ctx, a, b, c) {
  ctx.beginPath();
  for (x = 0; x <= ctx.canvas.width; x += 1) {
    var y = a*x*x + b*x + c;
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
}

function distPointLine(point,line) {
  var {p1,p2} = line,
      p0 = point,
      a = p1.y-p2.y,
      b = p2.x-p1.x,
      c = p1.x*p2.y-p2.x*p1.y;
  return abs(a*p0.x + b*p0.y + c)/sqrt(a*a + b*b);
}

function plotEquation(ctx, eq, tolerance = 0.01) {


  var width = ctx.canvas.width;
  var height = ctx.canvas.height;
    function drawLine(x1, y1, x2, y2) {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    for (let px = 0; px < width - 1; px++) {
    for (let py = 0; py < height - 1; py++) {
    const x = px;
    const y = height - py;
    const f00 = eq(x, y);
    const f10 = eq(x + 1, y);
    const f01 = eq(x, y - 1);
    const f11 = eq(x + 1, y - 1);

    const squareIndex = (f00 < tolerance ? 1 : 0) |
            (f10 < tolerance ? 2 : 0) |
            (f11 < tolerance ? 4 : 0) |
            (f01 < tolerance ? 8 : 0);



    ctx.beginPath();
    switch (squareIndex) {
        case 1:
        case 14:
        drawLine(px, py + 0.5, px + 0.5, py);
        break;
        case 2:
        case 13:
        drawLine(px + 0.5, py, px + 1, py + 0.5);
        break;
        case 3:
        case 12:
        drawLine(px, py + 0.5, px + 1, py + 0.5);
        break;
        case 4:
        case 11:
        drawLine(px + 0.5, py + 1, px + 1, py + 0.5);
        break;
        case 5:
        drawLine(px, py + 0.5, px + 0.5, py);
        drawLine(px + 0.5, py + 1, px + 1, py + 0.5);
        break;
        case 6:
        case 9:
        drawLine(px + 0.5, py, px + 0.5, py + 1);
        break;
        case 7:
        case 8:
        drawLine(px, py + 0.5, px + 0.5, py + 1);
        break;
        case 10:
        drawLine(px + 0.5, py, px + 1, py + 0.5);
        drawLine(px, py + 0.5, px + 0.5, py + 1);
        break;
    }
    ctx.stroke();
    }
    }
}