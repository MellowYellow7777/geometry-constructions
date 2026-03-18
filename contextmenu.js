class ContextMenu {

  constructor(x,y) {
    var element = document.createElement('div');
    this.element = element;
    element.style.top = y + 'px';
    element.style.left = x + 'px';
    element.className = 'context-menu';
    document.body.appendChild(element);
    this.menuItems = [];
    element.onpointermove = function(event) {
      mouse.hovering = null;
      draw();
    }
  }

  addText(item) {
    var element = document.createElement('div');
    this.element.appendChild(element);
    element.innerText = item;
    element.className = 'context-menu-text';
  }

  addMenuItem(item,action) {
    var element = document.createElement('div');
    this.element.appendChild(element);
    element.className = 'context-menu-item';
    if (typeof item == 'function') {
      element.innerText = item();
      element.onmouseup = function(event) {
        action(this,contextMenu.element);
        this.innerText = item();
        draw();
      }
    } else {
      element.innerText = item;
      element.onmouseup = function(event) {
        action(this,contextMenu.element);
        draw();
      }
    }

  }

  addLine() {
    var element = document.createElement('div');
    this.element.appendChild(element);
    element.className = 'context-menu-hl';
  }

  destroy() {
    this.element.remove();
  }

}

var contextMenu = null;

function createContextMenu(event) {
  contextMenu = new ContextMenu(event.clientX, event.clientY);
  contextMenu.addMenuItem('Look Up "this.x"');
  contextMenu.addLine();
  contextMenu.addMenuItem('Search With Google');
  contextMenu.addLine();
  contextMenu.addMenuItem('Cut');
  contextMenu.addMenuItem('Copy');
  contextMenu.addMenuItem('Paste');
  contextMenu.addLine();
  contextMenu.addMenuItem('Share');
  contextMenu.addLine();
  contextMenu.addMenuItem('Font');
  contextMenu.addMenuItem('Spelling and Grammar');
  contextMenu.addMenuItem('Substitutions');
  contextMenu.addMenuItem('Transformations');
  contextMenu.addMenuItem('Speech');
  contextMenu.addMenuItem('Layout Orientation');
}

function createObjectContextMenu(event,object) {
  contextMenu = new ContextMenu(event.clientX, event.clientY);
  contextMenu.addText(object.types[object.types.length-1]);
  contextMenu.addLine();
  contextMenu.addMenuItem(() => object.hidden ? 'Show' : 'Hide', () => object.hidden = !object.hidden);
  contextMenu.addMenuItem(() => object.locked ? 'Unlock' : 'Lock', () => object.locked = !object.locked);
  contextMenu.addMenuItem('Set Color', (mi,cm) => createColorPicker(cm,mi,object));
}

function createColorPicker(contextMenu,menuItem,object) {
  var y = contextMenu.offsetTop + menuItem.offsetTop + 1;
  var x = contextMenu.offsetLeft + menuItem.offsetWidth + 1;
  new ColorPicker(x,y,color => {object.color = color; draw();},object.color);
}