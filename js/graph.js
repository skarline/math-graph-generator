const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let func = x => Math.sin(x);

let viewport = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
  zoom: 1,
  scale: 100,
  getX: function(x) {
    return Math.round(
      canvas.width / 2 + viewport.x + x * viewport.zoom * viewport.scale
    );
  },
  getY: function(y) {
    return Math.round(
      canvas.height / 2 + viewport.y + y * viewport.zoom * viewport.scale
    );
  },
  getAt: function(clientX, clientY) {
    return {
      x:
        (clientX - (canvas.width / 2 + viewport.x)) /
        viewport.zoom /
        viewport.scale,
      y:
        (clientY - (canvas.height / 2 + viewport.y)) /
        viewport.zoom /
        viewport.scale
    };
  }
};

function resizeCanvas() {
  const newSize = canvas.getBoundingClientRect();

  canvas.width = newSize.width;
  canvas.height = newSize.height;

  viewport.width = newSize.width;
  viewport.height = newSize.height;

  render();
}

let pan = {
  active: false,
  viewportInitialX: 0,
  viewportInitialY: 0,
  fromX: 0,
  fromY: 0
};

function drawAxis() {
  ctx.beginPath();

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.font = "16px Source Sans Pro";
  ctx.textAlign = "center";

  ctx.moveTo(0, viewport.getY(0));
  ctx.lineTo(viewport.width, viewport.getY(0));
  ctx.stroke();

  ctx.moveTo(viewport.getX(0), 0);
  ctx.lineTo(viewport.getX(0), viewport.height);
  ctx.stroke();

  const from = viewport.getAt(0, 0);
  const to = viewport.getAt(viewport.width, viewport.height);

  // X axis
  for (let x = Math.round(from.x); x < to.x + 20; x++) {
    if (x === 0.0) continue;

    let gx = viewport.getX(x);
    let gy = viewport.getY(0);

    ctx.beginPath();
    ctx.strokeStyle = "#aaa";
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, viewport.height);

    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.moveTo(gx, gy - 5);
    ctx.lineTo(gx, gy + 5);

    ctx.stroke();

    ctx.fillText(x, gx, gy + 24);
  }

  // Y axis
  for (let y = Math.round(from.y); y < to.y + 20; y++) {
    if (y === 0.0) continue;

    let gx = viewport.getX(0);
    let gy = viewport.getY(y);

    ctx.beginPath();
    ctx.strokeStyle = "#aaa";
    ctx.moveTo(0, gy);
    ctx.lineTo(viewport.width, gy);

    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.moveTo(gx - 5, gy);
    ctx.lineTo(gx + 5, gy);

    ctx.stroke();

    ctx.fillText(-y, gx - 20, gy + 4);
  }

  ctx.fillText(0, viewport.getX(0) - 20, viewport.getY(0) + 24);
  ctx.fillText("x", viewport.width - 10, viewport.getY(0) - 10);
  ctx.fillText("y", viewport.getX(0) + 10, 10);
}

function drawFunction() {
  ctx.beginPath();

  ctx.strokeStyle = "#f00";
  ctx.lineWidth = 1;

  let step = viewport.zoom * 10;

  for (let i = 0; i < viewport.width + step; i += step) {
    let x = viewport.getAt(i).x;
    let y = viewport.getY(-func(x));

    if (i > 0) {
      ctx.lineTo(i, y);
      ctx.stroke();
    }

    ctx.moveTo(i, y);
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawAxis();
  drawFunction(x => Math.random(x));
}

window.addEventListener("mousemove", e => {
  if (pan.active) {
    // Pan view
    let x = e.screenX - pan.fromX;
    let y = e.screenY - pan.fromY;

    viewport.x = pan.viewportInitialX + x;
    viewport.y = pan.viewportInitialY + y;

    render();
  }
});

canvas.addEventListener("mousedown", e => {
  if (e.button !== 0) return;

  if (pan.active === false) {
    pan.fromX = e.screenX;
    pan.fromY = e.screenY;

    pan.viewportInitialX = viewport.x;
    pan.viewportInitialY = viewport.y;

    pan.active = true;
  }
});

window.addEventListener("mouseup", e => {
  if (e.button !== 0) return;

  pan.active = false;
});

window.addEventListener("wheel", e => {
  // Get current cursor position in canvas
  let cursorPositionX = e.clientX - canvas.getBoundingClientRect().x;
  let cursorPositionY = e.clientY - canvas.getBoundingClientRect().y;

  const prevPosition = viewport.getAt(cursorPositionX, cursorPositionY);

  // Apply zoom
  viewport.zoom *= 1 - e.deltaY / 1000;

  if (viewport.zoom < 0.5) {
    viewport.zoom = 0.5;
  }

  const newPosition = viewport.getAt(cursorPositionX, cursorPositionY);

  // Zoom into cursor position
  viewport.x +=
    (newPosition.x - prevPosition.x) * viewport.zoom * viewport.scale;
  viewport.y +=
    (newPosition.y - prevPosition.y) * viewport.zoom * viewport.scale;

  render();
});

window.addEventListener("resize", () => {
  resizeCanvas();
});

window.addEventListener("load", () => {
  resizeCanvas();
});

const functionInput = document.querySelector("#function-input > input");

functionInput.addEventListener("keypress", e => {
  if (e.keyCode === 13) {
    this.eval(`func = (x) => { return (${functionInput.value})}`);
    render();
  }
});
