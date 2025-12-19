const exportBtn = document.getElementById("exportBtn");
const backBtn = document.getElementById("backBtn");

const BOARD_SIZE = 100;
const TILE_SIZE = 48;

const board = document.getElementById("board");
const wallBtn = document.getElementById("wallBtn");
const doorBtn = document.getElementById("doorBtn");

let selectedTile = null;
let selectedColor = "normal";
let selectedObject = null;
let wallMode = false;
let doorMode = false;

/* =========================
   TILE DEFINITIONS
========================= */
const tiles = {
  floor: {
    gray: [
      "Assets/objects/tiles/gray/tile1.png",
      "Assets/objects/tiles/gray/tile2.png",
      "Assets/objects/tiles/gray/tile3.png",
      "Assets/objects/tiles/gray/tile4.png"
    ],
    red: [
      "Assets/objects/tiles/red/tile1.png",
      "Assets/objects/tiles/red/tile2.png",
      "Assets/objects/tiles/red/tile3.png",
      "Assets/objects/tiles/red/tile4.png"
    ],
    green: [
      "Assets/objects/tiles/green/tile1.png",
      "Assets/objects/tiles/green/tile2.png",
      "Assets/objects/tiles/green/tile3.png",
      "Assets/objects/tiles/green/tile4.png"
    ],
    blue: [
      "Assets/objects/tiles/blue/tile1.png",
      "Assets/objects/tiles/blue/tile2.png",
      "Assets/objects/tiles/blue/tile3.png",
      "Assets/objects/tiles/blue/tile4.png"
    ],
    black: [
      "Assets/objects/tiles/black/tile1.png",
      "Assets/objects/tiles/black/tile2.png",
      "Assets/objects/tiles/black/tile3.png",
      "Assets/objects/tiles/black/tile4.png"
    ],
    yellow: [
      "Assets/objects/tiles/yellow/tile1.png",
      "Assets/objects/tiles/yellow/tile2.png",
      "Assets/objects/tiles/yellow/tile3.png",
      "Assets/objects/tiles/yellow/tile4.png"
    ]
  }
};

/* =========================
   OBJECTS DEFINITIONS
========================= */
const objects = {
  chest: {
    w: 1,
    h: 1,
    img: "Assets/objects/chest.png"
  },
  table: {
    w: 3,
    h: 2,
    img: "Assets/objects/table.png"
  },
  altar: {
    w: 2,
    h: 2,
    img: "Assets/objects/altar.png"
  },
  bookcase: {
    w: 3,
    h: 1,
    img: "Assets/objects/bookcase.png"
  },
  campfire: {
    w: 2,
    h: 2,
    img: "Assets/objects/campfire.png"
  },
  sorcerer_table: {
    w: 3,
    h: 2,
    img: "Assets/objects/sorcerer_table.png"
  },
  throne: {
    w: 1,
    h: 1,
    img: "Assets/objects/throne.png"
  },
  weapon_rack: {
    w: 3,
    h: 1,
    img: "Assets/objects/weapon_rack.png"
  },
  tortue_table: {
    w: 3,
    h: 2,
    img: "Assets/objects/torture_table.png"
  },
  hole: {
    w: 1,
    h: 1,
    img: "Assets/objects/hole.png"
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
      color: null,
      img: null,
      object: null,
      objectRoot: null,  // { x, y } do tile raiz
      walls: { top: "none", right: "none", bottom: "none", left: "none" }
    };

    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.x = x;
    cell.dataset.y = y;

    cell.addEventListener("dragover", e => e.preventDefault());

    cell.addEventListener("drop", e => {
      e.preventDefault();
      handleCellAction(x, y, e);
    });

    cell.addEventListener("click", e => {
      handleCellAction(x, y, e);
    });

    board.appendChild(cell);
  }
}

/* =========================
   CELL ACTION HANDLER
========================= */
function handleCellAction(x, y, event) {

  // WALL / DOOR MODE (prioridade máxima)
  if (wallMode || doorMode) {
    const edge = getEdgeFromMouse(getCell(x, y), event);
    if (!edge) return;

    if (wallMode) toggleBarrier(x, y, edge, "wall");
    if (doorMode) toggleBarrier(x, y, edge, "door");
    return;
  }

  // OBJETO
  if (selectedObject) {
    setObject(x, y, selectedObject);
    return;
  }

  // TILE
  if (selectedTile) {
    setTile(x, y, selectedTile);
  }
}

/* =========================
   PALETTE – TILES
========================= */
document.querySelectorAll(".palette img").forEach(img => {
  img.addEventListener("dragstart", () => selectTile(img));
  img.addEventListener("click", () => selectTile(img));
});

function selectTile(img) {
  selectedTile = img.dataset.tile;
  selectedColor = img.dataset.color;
  selectedObject = null;

  document.querySelectorAll(".object-item")
    .forEach(o => o.classList.remove("selected-object"));

  highlightSelectedPalette(img);
}

function highlightSelectedPalette(selectedImg) {
  document.querySelectorAll(".palette img")
    .forEach(img => img.classList.remove("selected-palette"));

  selectedImg.classList.add("selected-palette");
}

/* =========================
   TILE LOGIC (TOGGLE)
========================= */
function setTile(x, y, type) {
  const cellData = grid[y][x];
  const cell = getCell(x, y);

  // TOGGLE: mesmo tile + mesma cor → remove
  if (cellData.tile === type && cellData.color === selectedColor) {
    cellData.tile = null;
    cellData.color = null;
    cellData.img = null;

    cell.style.backgroundImage = "";
    cell.className = "cell";
    renderWalls(x, y);
    return;
  }

  const colorSet = tiles[type][selectedColor] || tiles[type].normal;
  const img = colorSet[Math.floor(Math.random() * colorSet.length)];

  cellData.tile = type;
  cellData.color = selectedColor;
  cellData.img = img;

  cell.style.backgroundImage = `url(${img})`;
  cell.className = `cell floor-${selectedColor}`;
  renderWalls(x, y);
}

/* =========================
   OBJECT LOGIC (TOGGLE)
========================= */
function setObject(x, y, objectType) {
  const cellData = grid[y][x];

  // 🔁 SE já existe objeto nesse tile
  if (cellData.object) {
    const root = cellData.objectRoot;

    // 👉 Se for o MESMO objeto selecionado → REMOVE
    if (cellData.object === objectType && root) {
      removeObject(root.x, root.y);
      return;
    }

    // 👉 Outro objeto → não faz nada
    return;
  }

  const def = objects[objectType];
  if (!def) return;

  // ❌ Limite do board
  if (x + def.w > BOARD_SIZE || y + def.h > BOARD_SIZE) return;

  // ❌ Área ocupada
  for (let yy = y; yy < y + def.h; yy++) {
    for (let xx = x; xx < x + def.w; xx++) {
      if (grid[yy][xx].object) return;
    }
  }

  // ✅ Marca tiles ocupados
  for (let yy = y; yy < y + def.h; yy++) {
    for (let xx = x; xx < x + def.w; xx++) {
      grid[yy][xx].object = objectType;
      grid[yy][xx].objectRoot = { x, y };
    }
  }

  // ✅ Renderiza imagem (UMA vez)
  const cell = getCell(x, y);
  const img = document.createElement("img");

  img.src = def.img;
  img.className = "map-object";
  img.style.width = `${def.w * TILE_SIZE}px`;
  img.style.height = `${def.h * TILE_SIZE}px`;
  img.style.position = "absolute";
  img.style.left = "0";
  img.style.top = "0";
  img.style.pointerEvents = "none";

  cell.appendChild(img);
}


function removeObject(x, y) {
  const root = grid[y][x].objectRoot;
  if (!root) return;

  const def = objects[grid[y][x].object];

  for (let yy = root.y; yy < root.y + def.h; yy++) {
    for (let xx = root.x; xx < root.x + def.w; xx++) {
      grid[yy][xx].object = null;
      grid[yy][xx].objectRoot = null;
    }
  }

  const cell = getCell(root.x, root.y);
  const img = cell.querySelector(".map-object");
  if (img) img.remove();
}

/* =========================
   WALL / DOOR LOGIC
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

  const opposite = { left: "right", right: "left", top: "bottom", bottom: "top" }[edge];

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
  cell.querySelectorAll(".wall, .door").forEach(e => e.remove());

  const walls = grid[y][x].walls;
  for (const side in walls) {
    if (walls[side] === "none") continue;

    const el = document.createElement("div");
    el.className = `${walls[side]} ${side} ${
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

/* =========================
   BUTTONS
========================= */
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
    grid
  };
  downloadJSON(mapData, "rpg_map.json");
};

backBtn.onclick = () => {
  window.location.href = "index.html";
};

/* =========================
   OBJECT PALETTE
========================= */
document.querySelectorAll(".object-item").forEach(img => {
  img.addEventListener("dragstart", () => selectObject(img));
  img.addEventListener("click", () => selectObject(img));
});

function selectObject(img) {
  selectedObject = img.dataset.object;
  selectedTile = null;

  document.querySelectorAll(".palette img")
    .forEach(i => i.classList.remove("selected-palette"));

  highlightSelectedObject(img);
}

function highlightSelectedObject(selectedImg) {
  document.querySelectorAll(".object-item")
    .forEach(i => i.classList.remove("selected-object"));

  selectedImg.classList.add("selected-object");
}

/* =========================
   EXPORT
========================= */
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
