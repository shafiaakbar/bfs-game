var tileSize = 50;
var xoff = 145;
var yoff = 100;

var humanPlaying = false;
var left = false;
var right = false;
var up = false;
var down = false;
var p;

var tiles = [];
var solids = [];
var dots = [];
var savedDots = [];

var showBest = true;

var winArea;
var replayGens = false;
var genPlayer;
var upToGenPos = 0;

var numberOfSteps = 10;
var testPopulation;
var winCounter = -1;
var img;
var flip = true;

var populationSize = 500;
var mutationRate = 0.04;
var evolutionSpeed = 1;

var increaseMovesBy = 5;
var increaseEvery = 5;

function setup() {
  var canvas = createCanvas(1200, 640);

  for (var i = 0; i < 22; i++) {
    tiles[i] = [];
    for (var j = 0; j < 10; j++) {
      tiles[i][j] = new Tile(i, j);
    }
  }

  setLevel1Walls();
  setLevel1Goal();
  setLevel1SafeArea();
  setEdges();
  setSolids();

  p = new Player();
  setDots();

  winArea = new Solid(tiles[17][1], tiles[20][2]);
  testPopulation = new Population(populationSize);

  bfsVisual(tiles[3][8], tiles[18][2]); // ✅ this line shows BFS path

  img = loadImage("https://i.imgur.com/QZf0d6r.gif");

  window.addEventListener("keydown", function (e) {
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
  }, false);
}

var showedCoin = false;

function draw() {
  showedCoin = false;
  background(230, 230, 255);
  drawTiles();
  writeShit();

  if (humanPlaying) {
    if ((p.dead && p.fadeCounter <= 0) || p.reachedGoal) {
      if (p.reachedGoal) {
        winCounter = 100;
      }
      p = new Player();
      p.human = true;
      resetDots();
    } else {
      moveAndShowDots();
      p.update();
      p.show();
    }
  } else if (replayGens) {
    if ((genPlayer.dead && genPlayer.fadeCounter <= 0) || genPlayer.reachedGoal) {
      upToGenPos++;
      if (testPopulation.genPlayers.length <= upToGenPos) {
        upToGenPos = 0;
        replayGens = false;
        loadDots();
      } else {
        genPlayer = testPopulation.genPlayers[upToGenPos].gimmeBaby();
        resetDots();
      }
    } else {
      moveAndShowDots();
      genPlayer.update();
      genPlayer.show();
    }
  } else {
    if (testPopulation.allPlayersDead()) {
      testPopulation.calculateFitness();
      testPopulation.naturalSelection();
      testPopulation.mutateDemBabies();
      resetDots();

      if (testPopulation.gen % increaseEvery == 0) {
        testPopulation.increaseMoves();
      }
    } else {
      for (var j = 0; j < evolutionSpeed; j++) {
        for (var i = 0; i < dots.length; i++) {
          dots[i].move();
        }
        testPopulation.update();
      }
      for (var i = 0; i < dots.length; i++) {
        dots[i].show();
      }
      testPopulation.show();
    }
  }
}

function drawTiles() {
  for (var i = 0; i < tiles.length; i++) {
    for (var j = 0; j < tiles[0].length; j++) {
      tiles[i][j].show();
    }
  }
  for (var i = 0; i < tiles.length; i++) {
    for (var j = 0; j < tiles[0].length; j++) {
      tiles[i][j].showEdges();
    }
  }
}

function moveAndShowDots() {
  for (var i = 0; i < dots.length; i++) {
    dots[i].move();
    dots[i].show();
  }
}

function resetDots() {
  for (var i = 0; i < dots.length; i++) {
    dots[i].resetDot();
  }
}

function loadDots() {
  for (var i = 0; i < dots.length; i++) {
    dots[i] = savedDots[i].clone();
  }
}

function saveDots() {
  for (var i = 0; i < dots.length; i++) {
    savedDots[i] = dots[i].clone();
  }
}

function writeShit() {
  fill(0, 0, 0);
  textSize(18);
  noStroke();
  text("Press P to play.", 560, 620);
  textSize(20);
  if (winCounter > 0) {
    if (flip) {
      push();
      scale(-1.0, 1.0);
      image(img, -300 - img.width + random(5), 100 + random(5));
      pop();
    } else {
      image(img, 300 + random(5), 100 + random(5));
    }
    winCounter--;
    if (winCounter % 10 == 0) flip = !flip;
  }
  if (replayGens) {
    text("Generation: " + genPlayer.gen, 240, 120);
    text("Moves: " + genPlayer.brain.directions.length, 950, 120);
  } else if (!humanPlaying) {
    text("Generation: " + testPopulation.gen, 240, 120);
    if (testPopulation.solutionFound) {
      text("Wins in " + testPopulation.minStep + " moves", 950, 120);
    } else {
      text("Moves: " + testPopulation.players[0].brain.directions.length, 950, 120);
    }
  } else {
    text("Solo Gameplay", 620, 130);
  }
}

function keyPressed() {
  if (humanPlaying) {
    switch (keyCode) {
      case UP_ARROW: case 87: up = true; break;
      case DOWN_ARROW: case 83: down = true; break;
      case RIGHT_ARROW: case 68: right = true; break;
      case LEFT_ARROW: case 65: left = true; break;
    }
    setPlayerVelocity();
  } else {
    if (key === ' ') showBest = !showBest;
    if (key === 'G') {
      if (replayGens) {
        upToGenPos = 0;
        replayGens = false;
        loadDots();
      } else if (testPopulation.genPlayers.length > 0) {
        replayGens = true;
        genPlayer = testPopulation.genPlayers[0].gimmeBaby();
        saveDots();
        resetDots();
      }
    }
  }

  if (key === 'P') {
    if (humanPlaying) {
      humanPlaying = false;
      loadDots();
    } else {
      if (replayGens) {
        upToGenPos = 0;
        replayGens = false;
      }
      humanPlaying = true;
      p = new Player();
      p.human = true;
      saveDots();
      resetDots();
    }
  }
}

function keyReleased() {
  if (humanPlaying) {
    switch (keyCode) {
      case UP_ARROW: case 87: up = false; break;
      case DOWN_ARROW: case 83: down = false; break;
      case RIGHT_ARROW: case 68: right = false; break;
      case LEFT_ARROW: case 65: left = false; break;
    }
    setPlayerVelocity();
  }
}

function setPlayerVelocity() {
  p.vel.x = 0;
  p.vel.y = 0;
  if (up) p.vel.y -= 1;
  if (down) p.vel.y += 1;
  if (left) p.vel.x -= 1;
  if (right) p.vel.x += 1;
}

// ---------------- BFS VISUALIZATION ----------------

function bfsVisual(startTile, endTile) {
  let queue = [];
  let visited = new Set();
  let parentMap = new Map();

  let startKey = `${startTile.matrixPos.x},${startTile.matrixPos.y}`;
  queue.push(startTile);
  visited.add(startKey);

  while (queue.length > 0) {
    let current = queue.shift();
    current.visitedByBFS = true;

    if (current === endTile) break;

    let neighbors = getWalkableNeighbors(current);
    for (let neighbor of neighbors) {
      let key = `${neighbor.matrixPos.x},${neighbor.matrixPos.y}`;
      if (!visited.has(key)) {
        visited.add(key);
        parentMap.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  let current = endTile;
  while (current !== startTile) {
    current.inShortestPath = true;
    current = parentMap.get(current);
    if (!current) break;
  }
  startTile.inShortestPath = true;
}

function getWalkableNeighbors(tile) {
  const dirs = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
  ];
  let neighbors = [];

  for (let dir of dirs) {
    let nx = tile.matrixPos.x + dir.x;
    let ny = tile.matrixPos.y + dir.y;
    if (nx >= 0 && nx < tiles.length && ny >= 0 && ny < tiles[0].length) {
      let neighbor = tiles[nx][ny];
      if (!neighbor.wall) {
        neighbors.push(neighbor);
      }
    }
  }
  return neighbors;
}
