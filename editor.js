const exportBtn = document.getElementById("exportBtn");

const BOARD_SIZE = 100;
const TILE_SIZE = 48;

const board = document.getElementById("board");
const wallBtn = document.getElementById("wallBtn");

let selectedTile = null;
let wallMode = false;
let doorMode = false;
let selectedColor = "normal";

const doorBtn = document.getElementById("doorBtn");

/* === TILE DEFINITIONS === */
const tiles = {
  floor: {
    normal: [
      "Assets/objects/tiles/tile1.png",
      "Assets/objects/tiles/tile2.png",
      "Assets/objects/tiles/tile3.png",
      "Assets/objects/tiles/tile4.png"
    ],
    red: [
      "Assets/objects/tiles_red/tile1.png",
      "Assets/objects/tiles_red/tile2.png",
      "Assets/objects/tiles_red/tile3.png",
      "Assets/objects/tiles_red/tile4.png"
    ],
    green: [
      "Assets/objects/tiles_green/tile1.png",
      "Assets/objects/tiles_green/tile2.png",
      "Assets/objects/tiles_green/tile3.png",
      "Assets/objects/tiles_green/tile4.png"
    ]
  }
};

const grid = [];

/* =========================
   INIT GRID
========================= */
for (let y = 0; y < BOARD_SIZE; y++) {
  grid[y] = [];
  for (let x = 0; x < BOARD_SIZE; x++) {

    grid[y][x] = {
      tile: null,
      img: null,
      walls: { top:"none", right:"none", bottom:"none", left:"none" }
    };

    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.x = x;
    cell.dataset.y = y;

    cell.addEventListener("dragover", e => e.preventDefault());

    cell.addEventListener("drop", e => {
      e.preventDefault();
      if (wallMode || !selectedTile) return;
      setTile(x, y, selectedTile);
    });

    cell.addEventListener("click", e => {
      if (!wallMode && !doorMode) return;
      const edge = getEdgeFromMouse(cell, e);
      if (!edge) return;

      if (wallMode) toggleBarrier(x, y, edge, "wall");
      if (doorMode) toggleBarrier(x, y, edge, "door");

    });

    board.appendChild(cell);
  }
}

/* =========================
   PALETTE
========================= */
document.querySelectorAll(".palette img").forEach(img => {
  img.addEventListener("dragstart", () => {
    selectedTile = img.dataset.tile;
    selectedColor = img.dataset.color;
  });
});

/* =========================
   TILE LOGIC
========================= */
function setTile(x, y, type) {
  const colorSet = tiles[type][selectedColor] || tiles[type].normal;
  const img = colorSet[Math.floor(Math.random() * colorSet.length)];

  grid[y][x] = {
    ...grid[y][x],
    tile: type,
    color: selectedColor,
    img
  };

  const cell = getCell(x, y);
  cell.style.backgroundImage = `url(${img})`;
  cell.className = `cell floor-${selectedColor}`;

  renderWalls(x, y);
}

/* =========================
   WALL LOGIC
========================= */
function getEdgeFromMouse(cell, event) {
  const r = cell.getBoundingClientRect();
  const x = event.clientX - r.left;
  const y = event.clientY - r.top;
  const m = 6;

  if (y < m) return "top";
  if (y > r.height - m) return "bottom";
  if (x < m) return "left";
  if (x > r.width - m) return "right";

  return null;
}

function toggleBarrier(x, y, edge, type) {
  const cell = grid[y][x];

  cell.walls[edge] = cell.walls[edge] === type ? "none" : type;

  const dx = edge === "left" ? -1 : edge === "right" ? 1 : 0;
  const dy = edge === "top" ? -1 : edge === "bottom" ? 1 : 0;

  const opposite = {
    left: "right",
    right: "left",
    top: "bottom",
    bottom: "top"
  }[edge];

  const nx = x + dx;
  const ny = y + dy;

  if (grid[ny] && grid[ny][nx]) {
    grid[ny][nx].walls[opposite] = cell.walls[edge];
    renderWalls(nx, ny);
  }

  renderWalls(x, y);
}

function renderWalls(x, y) {
  const cell = getCell(x, y);
  if (!cell) return;

  cell.querySelectorAll(".wall, .door").forEach(e => e.remove());

  const walls = grid[y][x].walls;

  for (const side in walls) {
    const type = walls[side];
    if (type === "none") continue;

    const el = document.createElement("div");
    el.className = `${type} ${side} ${
      side === "top" || side === "bottom" ? "horizontal" : "vertical"
    }`;

    cell.appendChild(el);
  }
}

/* =========================
   HELPERS
========================= */
function getCell(x, y) {
  return board.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

wallBtn.onclick = () => {
  wallMode = !wallMode;
  doorMode = false;

  wallBtn.textContent = `🧱 Modo Parede: ${wallMode ? "ON" : "OFF"}`;
  doorBtn.textContent = "🚪 Modo Porta: OFF";
};

doorBtn.onclick = () => {
  doorMode = !doorMode;
  wallMode = false;

  doorBtn.textContent = `🚪 Modo Porta: ${doorMode ? "ON" : "OFF"}`;
  wallBtn.textContent = "🧱 Modo Parede: OFF";
};

exportBtn.onclick = () => {
  const mapData = {
    boardSize: BOARD_SIZE,
    tileSize: TILE_SIZE,
    grid: []
  };

  for (let y = 0; y < BOARD_SIZE; y++) {
    const row = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = grid[y][x];

      row.push({
        tile: cell.tile,
        color: cell.color || null,
        img: cell.img || null,
        walls: { ...cell.walls }
      });
    }
    mapData.grid.push(row);
  }

  downloadJSON(mapData, "rpg_map.json");
};

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});

