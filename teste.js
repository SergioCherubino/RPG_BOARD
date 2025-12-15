function logMessage(text) {
  const box = document.getElementById("consoleBox");
  const line = document.createElement("div");
  line.className = "console-line";
  line.textContent = text;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

// ============================
// Player / Monster factories
// ============================
const PlayerClasses = {
  warrior: { sprite:"warrior.png", movementRange:3, attributes:{hp:20, armor:16, damageMin:3, damageMax:6}},
  rogue:   { sprite:"rogue.png",   movementRange:4, attributes:{hp:14, armor:14, damageMin:2, damageMax:4}},
  mage:    { sprite:"mage.png",    movementRange:3, attributes:{hp:12, armor:12, damageMin:4, damageMax:8}}
};

function createPlayer(type){
  const d = PlayerClasses[type] || PlayerClasses.warrior;
  return {
    type, sprite:d.sprite,
    movementRange:d.movementRange,
    hp:d.attributes.hp,
    armor:d.attributes.armor,
    damageMin:d.attributes.damageMin,
    damageMax:d.attributes.damageMax
  };
}

const MonsterClasses = {
  goblin:{sprite:"goblin.png", movementRange:2, attributes:{hp:6, armor:8, damageMin:1, damageMax:3}},
  orc:{sprite:"orc.png", movementRange:3, attributes:{hp:12, armor:12, damageMin:2, damageMax:5}},
  troll:{sprite:"troll.png", movementRange:2, attributes:{hp:20, armor:14, damageMin:3, damageMax:8}}
};

function createMonster(type, level){
  const d = MonsterClasses[type];
  return {
    type, sprite:d.sprite,
    movementRange:d.movementRange,
    hp:d.attributes.hp + level * 2,
    armor:d.attributes.armor + Math.floor(level / 2),
    damageMin:d.attributes.damageMin,
    damageMax:d.attributes.damageMax
  };
}

let highlightedCells = [];

function clearHighlights() {
  highlightedCells.forEach(c => c.classList.remove("move-option"));
  highlightedCells = [];
}

function highlightMovementRange(entity) {
  clearHighlights();
  if (!entity || entity.movementLeft <= 0) return;

  const adj = [
    {x: entity.x + 1, y: entity.y},
    {x: entity.x - 1, y: entity.y},
    {x: entity.x, y: entity.y + 1},
    {x: entity.x, y: entity.y - 1}
  ];

  for (const p of adj) {
    if (
      p.x >= 0 && p.x < boardSize &&
      p.y >= 0 && p.y < boardSize &&
      grid[p.y][p.x] === null
    ) {
      const cell = getCell(p.x, p.y);
      if (cell) {
        cell.classList.add("move-option");
        highlightedCells.push(cell);
      }
    }
  }
}

function updateTurnInfo() {
  turnInfo.textContent =
    `Fase ${currentLevel} — ` +
    (turn === "player"
      ? `Player | Movimentos: ${hero.movementLeft} | Ataque: ${hero.canAttack ? "Sim" : "Não"}`
      : "Turno dos Monstros");
}


// ============================
// Game State
// ============================
let currentLevel = 1;
const boardSize = 10;
const board = document.getElementById("board");
const turnInfo = document.getElementById("turnInfo");

const grid = Array.from({length:boardSize},()=>Array(boardSize).fill(null));
const monsters = [];

const hero = createPlayer(localStorage.getItem("playerCharacter") || "warrior");
hero.movementLeft = hero.movementRange;
hero.canAttack = true;

// ============================
// Board helpers
// ============================
function createBoard(){
  board.innerHTML = "";
  for(let y=0;y<boardSize;y++){
    for(let x=0;x<boardSize;x++){
      const c=document.createElement("div");
      c.className="cell";
      c.dataset.x=x; c.dataset.y=y;
      c.onclick=()=>onCellClicked(x,y);
      board.appendChild(c);
    }
  }
}

function getCell(x,y){
  return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

function clearBoard(){
  for(let y=0;y<boardSize;y++)
    for(let x=0;x<boardSize;x++)
      grid[y][x]=null;
  board.innerHTML="";
}

function placeEntity(e,x,y){
  const c=getCell(x,y);
  const img=document.createElement("img");
  img.src="Assets/Sprites/"+e.sprite;
  img.className="entity";
  const hp=document.createElement("div");
  hp.className="hp-bubble";
  hp.textContent=e.hp;
  c.append(img,hp);
  grid[y][x]=e;
  e.x=x; e.y=y;
}

function clearCell(x,y){
  const c=getCell(x,y);
  if(c) c.innerHTML="";
  grid[y][x]=null;
}

function getRandomFreeCell(){
  while(true){
    const x=Math.floor(Math.random()*boardSize);
    const y=Math.floor(Math.random()*boardSize);
    if(!grid[y][x]) return {x,y};
  }
}

// ============================
// Phase System
// ============================
function spawnMonsters(){
  monsters.length=0;
  const types=["goblin","orc","troll"];
  const count=2+currentLevel;

  for(let i=0;i<count;i++){
    const m=createMonster(types[Math.random()*3|0], currentLevel);
    m.movementLeft=m.movementRange;
    monsters.push(m);
    const p=getRandomFreeCell();
    placeEntity(m,p.x,p.y);
  }
}

function startLevel(){
  logMessage(`🏁 Iniciando fase ${currentLevel}`);
  clearBoard();
  createBoard();

  const hp=getRandomFreeCell();
  placeEntity(hero,hp.x,hp.y);

  hero.movementLeft=hero.movementRange;
  hero.canAttack=true;

  spawnMonsters();
  setTurn("player");
}

function nextLevel(){
  currentLevel++;
  setTimeout(startLevel,800);
}

// ============================
// Turn System
// ============================
let turn="player";

function setTurn(newTurn){
  turn = newTurn;

  if (turn === "player") {
    hero.movementLeft = hero.movementRange;
    hero.canAttack = true;

    highlightMovementRange(hero);
    updateTurnInfo();
  } else {
    clearHighlights();
    updateTurnInfo();

    setTimeout(() => {
      monsterTurn();
    }, 300);
  }
}


// ============================
// Combat
// ============================
function rollDice(s){return Math.floor(Math.random()*s)+1;}

function attack(attacker,target){
  const d20=rollDice(20);
  logMessage(`${attacker.type} attacks ${target.type}: ${d20} vs AC ${target.armor}`);

  if(d20>=target.armor){
    const dmg=rollDice(attacker.damageMax-attacker.damageMin+1)+attacker.damageMin-1;
    target.hp-=dmg;
    logMessage(`→ HIT! ${dmg} damage`);

    const c=getCell(target.x,target.y);
    if(c) c.querySelector(".hp-bubble").textContent=Math.max(0,target.hp);

    if(target.hp<=0){
      logMessage(`${target.type} slain!`);
      clearCell(target.x,target.y);
      const i=monsters.indexOf(target);
      if(i>-1) monsters.splice(i,1);

      if(monsters.length===0){
        logMessage(`✨ Fase ${currentLevel} concluída`);
        nextLevel();
      }
    }
  } else logMessage("→ MISS!");
}

// ============================
// Player input
// ============================
function isAdjacent(x1,y1,x2,y2){
  return Math.abs(x1-x2)+Math.abs(y1-y2)===1;
}

function onCellClicked(x,y){
  if(turn!=="player") return;
  const e=grid[y][x];

  if (e && monsters.includes(e) && isAdjacent(hero.x, hero.y, x, y)) {
    if (!hero.canAttack) {
      alert("Você já atacou neste turno.");
      return;
    }

    if (!confirm("Deseja atacar este monstro?")) return;

    attack(hero, e);
    hero.canAttack = false;
    clearHighlights(); // opcional, mas recomendado
    updateTurnInfo();
    return;
  }


  if (!e && hero.movementLeft > 0 && isAdjacent(hero.x, hero.y, x, y)) {
    clearCell(hero.x, hero.y);
    placeEntity(hero, x, y);
    hero.movementLeft--;

    // 🔥 ATUALIZA O HIGHLIGHT
    if (hero.movementLeft > 0) {
      highlightMovementRange(hero);
    } else {
      clearHighlights();
    }

    updateTurnInfo();
  }
}

// ============================
// Monster AI
// ============================

function delay(ms){return new Promise(r=>setTimeout(r,ms));}

function getAttackPositions() {
  return [
    { x: hero.x + 1, y: hero.y },
    { x: hero.x - 1, y: hero.y },
    { x: hero.x, y: hero.y + 1 },
    { x: hero.x, y: hero.y - 1 }
  ].filter(p =>
    p.x >= 0 && p.x < boardSize &&
    p.y >= 0 && p.y < boardSize &&
    grid[p.y][p.x] === null
  );
}

function getBestStepToward(monster, target) {
  const options = [
    { x: monster.x + 1, y: monster.y },
    { x: monster.x - 1, y: monster.y },
    { x: monster.x, y: monster.y + 1 },
    { x: monster.x, y: monster.y - 1 }
  ];

  return options
    .filter(p =>
      p.x >= 0 && p.x < boardSize &&
      p.y >= 0 && p.y < boardSize &&
      grid[p.y][p.x] === null
    )
    .map(p => ({
      ...p,
      dist: Math.abs(p.x - target.x) + Math.abs(p.y - target.y)
    }))
    .sort((a, b) => a.dist - b.dist)[0];
}

async function monsterTurn() {
  for (const m of monsters.slice()) {
    m.movementLeft = m.movementRange;

    // 🎯 1. Casas possíveis de ataque
    let attackPositions = getAttackPositions();

    // 🎯 2. Escolhe o melhor alvo (casa adjacente)
    let targetPos = attackPositions
      .map(p => ({ ...p, dist: Math.abs(m.x - p.x) + Math.abs(m.y - p.y) }))
      .sort((a, b) => a.dist - b.dist)[0];

    // 🚶 3. Movimento
    while (m.movementLeft > 0 && !isAdjacent(m.x, m.y, hero.x, hero.y)) {

      let stepTarget = targetPos || hero;
      const step = getBestStepToward(m, stepTarget);

      if (!step) break;

      clearCell(m.x, m.y);
      placeEntity(m, step.x, step.y);

      m.movementLeft--;
      await delay(200);
    }

    // ⚔️ 4. Ataque
    if (isAdjacent(m.x, m.y, hero.x, hero.y)) {
      attack(m, hero);
      if (hero.hp <= 0) {
        alert("Game Over");
        return;
      }
    }
  }
  setTurn("player");
}

const endTurnBtn = document.getElementById("endTurnBtn");

if (endTurnBtn) {
  endTurnBtn.addEventListener("click", () => {
    if (turn !== "player") return;

    clearHighlights();
    setTurn("monsters");
  });
}

// ============================
// Init
// ============================
createBoard();
startLevel();

window._GAME={hero,monsters,grid};

