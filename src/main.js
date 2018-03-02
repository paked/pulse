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

  app.ticker.add(delta => update(delta));

  cells = [];
  let cellCount = 4;
  let cellCutOff = 9;

  let ID = 0;

  for (let x = -cellCount/2; x < cellCount/2; x++) {
    for (let y = -cellCount/2; y < cellCount/2; y++) {
      if (x*x + y*y > cellCutOff) continue;

      let cell = new PIXI.Graphics();
      cell._id = ID;
      cell.beginFill(0xFFFFFF);
      cell.drawEllipse(0, 0, cellSize, cellSize);
      cell.endFill();

      cell.x = blobX + (cellSize) * x;
      cell.y = blobY + (cellSize) * y;

      app.stage.addChild(cell);
      cells.push(cell);

      ID++;
    }
  }
}

function update(dt) {
  for (let x of cells) {
    let vx = x.x - blobX;
    let vy = x.y - blobY;
    let len = Math.sqrt(vx*vx + vy*vy); //calculating length

    if (isNaN(len)) continue;

    vx /= len;
    vy /= len;

    x.x -= vx * dt / 10;// * (len/10000);
    x.y -= vy * dt / 10;// * (len/10000);

    x.x += Math.cos(app.ticker.lastTime/1000 * Math.random()) * Math.random();
    x.y += Math.sin(app.ticker.lastTime/1000 * Math.random()) * Math.random();
  }

  for (let a of cells) {
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
      if (d > cellSize*1.3) {
        continue;
      }

      let vx = a.x - b.x;
      let vy = a.y - b.y;

      // calculate unit vector of vx and vy
      let len = Math.sqrt(vx*vx + vy*vy); //calculating length
      if (isNaN(len)) continue;

      vx /= len;
      vy /= len;

      a.x += vx * dt;
      a.y += vy * dt;
    }
  }
}

init();
