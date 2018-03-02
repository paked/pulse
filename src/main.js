var cells = [];
var app;

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

  let cellCount = 10;
  let cellCutOff = 9;
  let cellSize = 20;

  for (let x = -cellCount/2; x < cellCount/2; x++) {
    for (let y = -cellCount/2; y < cellCount/2; y++) {
      if (x*x + y*y > cellCutOff) continue;

      let cell = new PIXI.Graphics();
      cell.beginFill(0xFFFFFF);
      cell.drawEllipse(0, 0, cellSize, cellSize);
      cell.endFill();

      cell.hsOx = cell.x = 200 + (cellSize + cellSize/2)*x;
      cell.hsOy = cell.y = 200 + (cellSize + cellSize/2)*y;

      cell.hsOffset = (0.3 + Math.random()/10 * 7) * 2;
      cell.hsOffset2 = Math.random();
      cell.hsDir = (Math.random() > 0.5) ? -1 : 1;

      app.stage.addChild(cell);
      cells.push(cell);
    }
  }
}

function update(dt) {
  let pulseSpeed = 2;
  for (let cell of cells) {
    let d = 1 + Math.cos(app.ticker.lastTime/1000 * cell.hsOffset * pulseSpeed)*0.05;
    cell.scale.x = d;
    cell.scale.y = d;

    d = 0.9 + Math.sin(app.ticker.lastTime/1000 * cell.hsOffset) * 0.1;

    cell.alpha = d;

    cell.x = cell.hsOx + Math.sin(app.ticker.lastTime/1000 * cell.hsOffset * cell.hsDir) * 3 * cell.hsOffset2;
    cell.y = cell.hsOy + Math.cos(app.ticker.lastTime/1000 * cell.hsOffset * cell.hsDir) * 3 * cell.hsOffset2;
  }
}

init();
