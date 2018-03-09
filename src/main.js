let blobs;
let cells;
let cellSize = 15;
let blobX = 200;
let blobY = 200;

let pointOne;
let pointTwo;

let app;

function init() {
  let canvas = document.getElementById('game');

  app = new PIXI.Application({ 
    width: 400,         // default: 800
    height: 400,        // default: 600
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1,      // default: 1,
    backgroundColor: 0xFF809B, // default: 0
    view: canvas
  });

  app.stage.interactive = true;
  app.stage.hitArea = new PIXI.Rectangle(0, 0, 1000, 1000);
  app.stage.on('pointerdown', splitCells);

  app.ticker.add(delta => update(delta/1000));

  blobs = [new CellBlob(200, 200), new CellBlob(100, 100)];

  cells = [];
  let cellCount = 6;

  for (let x = -cellCount/2; x < cellCount/2; x++) {
    for (let y = -cellCount/2; y < cellCount/2; y++) {
      let cell = new Cell(blobX + cellSize * x, blobY + cellSize * y);

      cell.x += 20 * (Math.random()*2 - 1);
      cell.y += 20 * (Math.random()*2 - 1);

      if (Math.random() > 0.5) {
        cell.blob = 0;
      } else {
        cell.blob = 1;
      }

      cells.push(cell);

      app.stage.addChild(cell.g);
    }
  }
}

function splitCells(ev) {
  if (!pointOne) {
    pointOne = new Point(ev.data.global.x, ev.data.global.y);
    return;
  } else if (!pointTwo) {
    pointTwo = new Point(ev.data.global.x, ev.data.global.y);
  }

  let g = new PIXI.Graphics();
  g.lineStyle(2, 0xFF00FF);
  g.moveTo(pointOne.x, pointOne.y);
  g.lineTo(pointTwo.x, pointTwo.y);

  app.stage.addChild(g);

  for (let c of cells) {
    let x = c.x;
    let y = c.y;
    let x1 = pointOne.x;
    let y1 = pointOne.y;
    let x2 = pointTwo.x;
    let y2 = pointTwo.y;

    let d = (x - x1)*(y2 - y1) - (y - y1)*(x2 - x1);

    if (d > 0) {
      c.blob = 0;
      c.g.tint = 0xff00ff;
    } else {
      c.blob = 1;
      c.g.tint = 0x00ff00;
    }
  }

  pointOne = null;
  pointTwo = null;
}

function spawnPoison(ev) {
  let cell = new Cell(ev.data.global.x, ev.data.global.y);
  cell.poison = 0.9;

  cells.push(cell);
  app.stage.addChild(cell.g);
}

function update(dt) {
  blobs.forEach(e => e.tick(dt));

  for (let i = 0; i < blobs.length; i++) {
    if (i == 0) continue;

    let b = blobs[i];

    let push = new Point(b.x - 200, b.y - 200).unit();
    if (push !== null) { // this condition should never really be false
      b.velocity.x += push.x * 7;
      b.velocity.y += push.y * 7;
    }
  }

  for (let b of blobs) {
    b.x += Math.sin(app.ticker.lastTime);
    b.y += Math.cos(app.ticker.lastTime);
  }

  for (let c of cells) {
    let a = c;
    a.poison -= 0.01 * dt;

    a.poison = Math.max(a.poison, 0);

    let center = blobs[c.blob];

    let centerPull = new Point(c.x - center.x, c.y - center.y).unit();
    if (centerPull !== null) {
      a.velocity.x -= centerPull.x*7;
      a.velocity.y -= centerPull.y*7;
    }

    // find cells with which `cell` is overlapping with
    // calculate the vector p1 - p2, normalise it
    // and then move the cell in that direction;
    // calculate unit vector of vx and vy
    for (let b of cells) {
      if (b._id == a._id) {
        continue;
      }

      // find distance
      let d = Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));

      // check if intersecting
      if (d > cellSize*1.4) {
        continue;
      }

      if (a.poison > 0.8) {
        b.poison += a.poison * dt * 2;
        b.poison = Math.min(b.poison, 1);
      }

      let v = new Point(a.x - b.x, a.y - b.y).unit();

      if (v === null) continue;

      a.velocity.x += v.x*18;
      a.velocity.y += v.y*18;
    }

    c.tick(dt);
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  unit() {
    let u = this;

    let len = Math.sqrt(u.x*u.x + u.y*u.y); //calculating length

    if (isNaN(len)) return null;

    u.x /= len;
    u.y /= len;

    return u;
  }
}

class CellBlob {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.velocity = new Point(0, 0);
    this.drag = 0.97; 
  }

  tick(dt) {
    this.velocity.x *= this.drag;
    this.velocity.y *= this.drag;

    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;
  }

  unit() {
    return new Point(this.x, this.y).unit();
  }
}

let Cell_ID = 0;
class Cell {
  constructor(x, y) {
    this._id = Cell_ID++;

    this.g = new PIXI.Graphics();

    this.g.beginFill(0xFFFFFF);
    this.g.drawEllipse(0, 0, cellSize, cellSize);
    this.g.endFill();

    this.x = x;
    this.y = y;

    this.velocity = new Point(0, 0);

    this.drag = 0.99; 

    this.poison = 0.0;
  }

  get x() {
    return this.g.x;
  }

  set x(v) {
    this.g.x = v;
  }

  get y() {
    return this.g.y;
  }

  set y(v) {
    this.g.y = v;
  }

  tick(dt) {
    if (this.poison > 0) {
      // lmao this is so dumb
      this.g.tint = eval("0x" + tinycolor("white").darken(this.poison * 100).toHex());
    }

    this.velocity.x *= this.drag;
    this.velocity.y *= this.drag;

    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;
  }
}

init();
