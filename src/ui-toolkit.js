/**
 * UI Toolkit
 * Comprehensive UI system with buttons, panels, sliders, text boxes, and styling
 */

class UIElement {
  constructor(x = 0, y = 0, width = 100, height = 40) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.visible = true;
    this.enabled = true;
    this.parent = null;
    this.children = [];
    this.style = {
      backgroundColor: '#333333',
      foregroundColor: '#FFFFFF',
      borderColor: '#555555',
      borderWidth: 1,
      borderRadius: 4,
      padding: 5,
      margin: 5,
      fontSize: 14,
      fontFamily: 'Arial'
    };
    this.interactive = false;
  }

  addChild(element) {
    element.parent = this;
    this.children.push(element);
  }

  removeChild(id) {
    this.children = this.children.filter(c => c.id !== id);
  }

  isPointInside(px, py) {
    return px >= this.x && px <= this.x + this.width &&
           py >= this.y && py <= this.y + this.height;
  }

  render(ctx) {
    if (!this.visible) return;

    // Draw background
    ctx.fillStyle = this.style.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw border
    ctx.strokeStyle = this.style.borderColor;
    ctx.lineWidth = this.style.borderWidth;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Render children
    for (let child of this.children) {
      child.render(ctx);
    }
  }

  update(deltaTime) {
    for (let child of this.children) {
      child.update(deltaTime);
    }
  }

  serialize() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      visible: this.visible,
      style: this.style
    };
  }
}

class Button extends UIElement {
  constructor(x, y, width, height, text = 'Button') {
    super(x, y, width, height);
    this.text = text;
    this.onClick = null;
    this.hovered = false;
    this.pressed = false;
    this.interactive = true;
    this.style.backgroundColor = '#667eea';
  }

  onMouseDown(x, y) {
    if (this.isPointInside(x, y) && this.enabled) {
      this.pressed = true;
    }
  }

  onMouseUp(x, y) {
    if (this.pressed && this.isPointInside(x, y) && this.enabled) {
      if (this.onClick) {
        this.onClick();
      }
    }
    this.pressed = false;
  }

  onMouseMove(x, _y) {
    this.hovered = this.isPointInside(x, _y) && this.enabled;
  }

  render(ctx) {
    if (!this.visible) return;

    // Adjust appearance for state
    ctx.fillStyle = this.pressed ? '#5566d2' : (this.hovered ? '#7b8ef0' : this.style.backgroundColor);
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.strokeStyle = this.style.borderColor;
    ctx.lineWidth = this.style.borderWidth;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Draw text
    ctx.fillStyle = this.style.foregroundColor;
    ctx.font = `${this.style.fontSize}px ${this.style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
  }
}

class TextField extends UIElement {
  constructor(x, y, width, height = 30) {
    super(x, y, width, height);
    this.text = '';
    this.placeholder = 'Enter text...';
    this.maxLength = 100;
    this.focused = false;
    this.cursorPosition = 0;
    this.interactive = true;
    this.style.backgroundColor = '#1a1a1a';
  }

  onFocus() {
    this.focused = true;
    this.cursorPosition = this.text.length;
  }

  onBlur() {
    this.focused = false;
  }

  onKeyDown(key) {
    if (!this.focused) return;

    if (key === 'Backspace' && this.cursorPosition > 0) {
      this.text = this.text.slice(0, this.cursorPosition - 1) + this.text.slice(this.cursorPosition);
      this.cursorPosition--;
    } else if (key.length === 1 && this.text.length < this.maxLength) {
      this.text = this.text.slice(0, this.cursorPosition) + key + this.text.slice(this.cursorPosition);
      this.cursorPosition++;
    }
  }

  onMouseDown(x, y) {
    if (this.isPointInside(x, y)) {
      this.onFocus();
    } else {
      this.onBlur();
    }
  }

  render(ctx) {
    if (!this.visible) return;

    // Background
    ctx.fillStyle = this.style.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Border
    ctx.strokeStyle = this.focused ? '#667eea' : this.style.borderColor;
    ctx.lineWidth = this.focused ? 2 : 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Text
    ctx.fillStyle = this.text ? this.style.foregroundColor : '#666666';
    ctx.font = `${this.style.fontSize}px ${this.style.fontFamily}`;
    ctx.textBaseline = 'middle';
    const displayText = this.text || this.placeholder;
    ctx.fillText(displayText, this.x + 5, this.y + this.height / 2);

    // Cursor
    if (this.focused) {
      ctx.strokeStyle = '#667eea';
      ctx.beginPath();
      ctx.moveTo(this.x + 7, this.y + 5);
      ctx.lineTo(this.x + 7, this.y + this.height - 5);
      ctx.stroke();
    }
  }

  getValue() {
    return this.text;
  }

  setValue(text) {
    this.text = text.slice(0, this.maxLength);
  }
}

class Slider extends UIElement {
  constructor(x, y, width = 150, height = 30, minValue = 0, maxValue = 100) {
    super(x, y, width, height);
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.value = minValue;
    this.onChange = null;
    this.interactive = true;
    this.dragging = false;
  }

  onMouseDown(x, y) {
    if (this.isPointInside(x, y)) {
      this.dragging = true;
      this.updateValue(x);
    }
  }

  onMouseUp() {
    this.dragging = false;
  }

  onMouseMove(x, _y) {
    if (this.dragging) {
      this.updateValue(x);
    }
  }

  updateValue(x) {
    const relativeX = x - this.x;
    const ratio = Math.max(0, Math.min(1, relativeX / this.width));
    this.value = this.minValue + ratio * (this.maxValue - this.minValue);
    if (this.onChange) {
      this.onChange(this.value);
    }
  }

  render(ctx) {
    if (!this.visible) return;

    const trackY = this.y + this.height / 2 - 2;
    const trackHeight = 4;

    // Track background
    ctx.fillStyle = '#444444';
    ctx.fillRect(this.x, trackY, this.width, trackHeight);

    // Track filled
    const fillWidth = ((this.value - this.minValue) / (this.maxValue - this.minValue)) * this.width;
    ctx.fillStyle = '#667eea';
    ctx.fillRect(this.x, trackY, fillWidth, trackHeight);

    // Thumb
    const thumbX = this.x + fillWidth;
    ctx.fillStyle = this.dragging ? '#7b8ef0' : '#667eea';
    ctx.beginPath();
    ctx.arc(thumbX, this.y + this.height / 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Value text
    ctx.fillStyle = this.style.foregroundColor;
    ctx.font = `${this.style.fontSize - 2}px ${this.style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(this.value), thumbX, this.y + this.height - 8);
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    this.value = Math.max(this.minValue, Math.min(this.maxValue, value));
  }
}

class Panel extends UIElement {
  constructor(x, y, width, height, title = 'Panel') {
    super(x, y, width, height);
    this.title = title;
    this.draggable = true;
    this.minimized = false;
    this.style.backgroundColor = '#252525';
    this.titleBarHeight = 25;
  }

  onMouseDown(x, y) {
    if (this.draggable && y >= this.y && y <= this.y + this.titleBarHeight) {
      return true; // Signal that this is being dragged
    }
    for (let child of this.children) {
      if (child instanceof Button || child instanceof TextField || child instanceof Slider) {
        child.onMouseDown(x, y);
      }
    }
  }

  render(ctx) {
    if (!this.visible) return;

    // Panel background
    ctx.fillStyle = this.style.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Title bar
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(this.x, this.y, this.width, this.titleBarHeight);

    // Title
    ctx.fillStyle = this.style.foregroundColor;
    ctx.font = `bold ${this.style.fontSize}px ${this.style.fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(this.title, this.x + 10, this.y + this.titleBarHeight / 2);

    // Border
    ctx.strokeStyle = this.style.borderColor;
    ctx.lineWidth = this.style.borderWidth;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Render children
    if (!this.minimized) {
      for (let child of this.children) {
        child.render(ctx);
      }
    }
  }
}

class UIManager {
  constructor() {
    this.elements = [];
    this.focusedElement = null;
    this.canvas = null;
    this.ctx = null;
  }

  addElement(element) {
    this.elements.push(element);
    return element;
  }

  removeElement(id) {
    this.elements = this.elements.filter(e => e.id !== id);
  }

  createElement(type, properties = {}) {
    let element;
    switch (type) {
      case 'button':
        element = new Button(properties.x, properties.y, properties.width, properties.height, properties.text);
        break;
      case 'textfield':
        element = new TextField(properties.x, properties.y, properties.width, properties.height);
        break;
      case 'slider':
        element = new Slider(properties.x, properties.y, properties.width, properties.height, properties.min, properties.max);
        break;
      case 'panel':
        element = new Panel(properties.x, properties.y, properties.width, properties.height, properties.title);
        break;
      default:
        element = new UIElement(properties.x, properties.y, properties.width, properties.height);
    }

    if (properties.style) {
      Object.assign(element.style, properties.style);
    }

    return this.addElement(element);
  }

  handleMouseDown(x, y) {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const element = this.elements[i];
      if (element.isPointInside(x, y) && element.interactive) {
        if (element instanceof Button || element instanceof TextField || element instanceof Slider) {
          element.onMouseDown(x, y);
          if (element instanceof TextField) {
            this.focusedElement = element;
          }
          return;
        }
      }
    }
  }

  handleMouseUp(x, y) {
    for (let element of this.elements) {
      if (element instanceof Button) {
        element.onMouseUp(x, y);
      } else if (element instanceof Slider) {
        element.onMouseUp(x, y);
      }
    }
  }

  handleMouseMove(x, y) {
    for (let element of this.elements) {
      if (element instanceof Button) {
        element.onMouseMove(x, y);
      } else if (element instanceof Slider) {
        element.onMouseMove(x, y);
      }
    }
  }

  handleKeyDown(key) {
    if (this.focusedElement instanceof TextField) {
      this.focusedElement.onKeyDown(key);
    }
  }

  update(deltaTime) {
    for (let element of this.elements) {
      element.update(deltaTime);
    }
  }

  render(ctx) {
    for (let element of this.elements) {
      element.render(ctx);
    }
  }

  serialize() {
    return {
      elements: this.elements.map(e => e.serialize()),
      elementCount: this.elements.length,
      version: '1.0'
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UIElement, Button, TextField, Slider, Panel, UIManager };
}
