let cells;
let cellSize = 20;
let blobX = 200;
let blobY = 200;
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

  app.ticker.add(delta => update(delta/1000));

  cells = [];
  let cellCount = 3;

  for (let x = -cellCount/2; x < cellCount/2; x++) {
    for (let y = -cellCount/2; y < cellCount/2; y++) {
      let cell = new Cell(blobX + cellSize * x, blobY + cellSize * y);

      if (x == 0 && y == 0) cell.poison = 0.1;

      cell.x += 100 * Math.random();
      cell.y += 100 * Math.random();

      cells.push(cell);

      app.stage.addChild(cell.g);
    }
  }
}

function update(dt) {
  for (let c of cells) {
    let a = c;

    // a.poison = Math.max(a.poison - 0.6 * dt, 0);

    let centerPull = new Point(c.x - blobX, c.y - blobY).unit();
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
      if (d > cellSize*1.9) {
        continue;
      }

      if (a.poison > 0) {
        b.poison += a.poison * dt * 2;
        b.poison = Math.min(b.poison, 1);
      }

      let v = new Point(a.x - b.x, a.y - b.y).unit();

      if (v === null) continue;

      a.velocity.x += v.x*15;
      a.velocity.y += v.y*15;
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

let ID = 0;

class Cell {
  constructor(x, y) {
    this._id = ID++;

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
      // console.log(this.poison);
      this.g.tint = eval("0x" + tinycolor("white").darken(this.poison * 100).toHex());
    // this.g.tint = 0x000000;
    }


    this.velocity.x *= this.drag;
    this.velocity.y *= this.drag;

    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;
  }
}

init();
