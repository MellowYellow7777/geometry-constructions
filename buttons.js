class Button {
  static all = [];
  static hovered = null;
  static active = null;

  static forEach(fn) {
    this.all.forEach(fn);
  }

  constructor(x, y, mode) {
    if (arguments.length == 1) {
      mode = x;
      x = null;
      y = null;
    }
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.visible = true;
    this.image = new Image();
    this.image.src = `./images3/${mode}.svg`;
    if (['hand','select','threepointparabola'].includes(mode)) {
      this.image.src = `./images2/${mode}.png`;
    }
    this.mode = mode;
    this.tip = toolTips[mode];
    this.hovered = false;
    this.active = false;
    Button.all.push(this);
  }

  action() {
    Button.selected?.deselect();
    Button.selected = this;
    Button.active = null;
    this.active = false;
    mode = this.mode;
  }

  draw(ctx) {
    if (!this.visible) return;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#222';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    if (this.hovered || Button.selected === this) {
      ctx.strokeStyle = 'blue';
    }
    if (this.active) {
      ctx.strokeStyle = 'red';
    }
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  isInside(x, y) {
    return this.visible && x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
  }
}

class ButtonGroup extends Button {
  constructor(x, y, children) {
    if (arguments.length == 1) {
      super(children[0].mode);
    } else {
      super(x, y, children[0].mode);
    }
    this.children = children;
    children.forEach((child, i) => {
      child.x = this.x;
      child.y = this.y + 60*(i + 1) ;
      child.action = () => this.selectChild(child);
    });
    this.setOpen(false);
  }

  setOpen(b) {
    this.open = b;
    this.children.forEach(child => child.visible = b);
  }

  deselect() {
    var child = this.children[0];
    this.mode = child.mode;
    this.image = child.image;
    this.tip = child.tip;
    this.setOpen(false);
  }

  action() {
    if (Button.selected === this) {
      this.setOpen(!this.open);
      Button.active = null;
      this.active = false;
    } else {
      super.action();
    }
  }

  selectChild(child) {
    this.mode = child.mode;
    this.image = child.image;
    this.tip = child.tip;
    Button.selected = this;
    Button.active = null;
    this.active = false;
    mode = this.mode;
    child.active = false;
    this.setOpen(false);
    draw();
  }

  draw(ctx) {
    if (!this.visible) return;
    super.draw(ctx);

    ctx.fillStyle = '#444';
    ctx.beginPath();
    if (this.open) {
      ctx.moveTo(this.x + this.width - 10, this.y + this.height - 10);
      ctx.lineTo(this.x + this.width - 5, this.y + this.height - 5);
      ctx.lineTo(this.x + this.width - 15, this.y + this.height - 5);
    } else {
      ctx.moveTo(this.x + this.width - 10, this.y + this.height - 5);
      ctx.lineTo(this.x + this.width - 5, this.y + this.height - 10);
      ctx.lineTo(this.x + this.width - 15, this.y + this.height - 10);
    }
    ctx.closePath();
    ctx.fill();
  }
}
