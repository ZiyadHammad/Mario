import maps from "./data/maps.js";
import { big } from "./data/utils.js";

// init Kaboom
kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  debug: true,
  clearColor: [0, 0, 0, 1],
});

// Create sprites
loadRoot("./assets/");
loadSprite("block", "block.png");
loadSprite("coin", "coin.png");
loadSprite("empty-block", "empty-block.png");
loadSprite("surprise-block", "surprise-block.png");
loadSprite("evil-shroom", "evil-shroom.png");
loadSprite("flower", "flower.png");
loadSprite("mario", "mario.png");
loadSprite("mushroom", "mushroom.png");
loadSprite("pipe-top-left", "pipe-top-left.png");
loadSprite("pipe-bottom-left", "pipe-bottom-left.png");
loadSprite("pipe-top-right", "pipe-top-right.png");
loadSprite("pipe-bottom-right", "pipe-bottom-right.png");
loadSprite("blue-brick-texture", "blue-brick-texture.png");
loadSprite("blue-brick", "blue-brick.png");
loadSprite("blue-evil-shroom", "blue-evil-shroom.png");
loadSprite("blue-steel", "blue-steel.png");
loadSprite("blue-surprise", "blue-surprise.png");

// Defining players animations
const PLAYER_SPEED = 120;
const ENEMY_SPEED = 20;
const JUMP = 400;
let CURRENT_JUMP = JUMP;
const FALL_DEATH = 400;
let isJumping = true;

// Add game scenes
scene("game", ({ level, score }) => {

  // init layers
  layers(["bg", "obj", "ui"], "obj");

  // Init Level Configuration & and define sprites properties
  const levelCfg = {
    width: 20,
    height: 20,
    "=": [sprite("block"), solid()],
    '_': [sprite("blue-brick-texture"), solid(), scale(0.5)],
    "|": [sprite("blue-brick"), solid(), scale(0.5)],
    "#": [sprite("empty-block"), solid()],
    "-": [sprite("blue-steel"), solid(), scale(0.5)],
    '$': [sprite("coin"), "coin"],
    "?": [sprite("surprise-block"), solid(), "coin-surprise"],
    "*": [sprite("surprise-block"), solid(), "mushroom-surprise"],
    "{": [sprite("pipe-top-left"), solid(), scale(0.5), "pipe"],
    "}": [sprite("pipe-top-right"), solid(), scale(0.5), "pipe"],
    "(": [sprite("pipe-bottom-left"), solid(), scale(0.5)],
    ")": [sprite("pipe-bottom-right"), solid(), scale(0.5)],
    "!": [sprite("evil-shroom"), solid(), "dangerous"],
    "x": [sprite("blue-evil-shroom"), solid(), "dangerous", scale(0.5)],
    "^": [sprite("mushroom"), solid(), "mushroom", body()],
  };

  // Adding/Init a game level
  const gameLevel = addLevel(maps[level], levelCfg);

  const levelLabel = add([
    text(`Level ${parseInt(level + 1)}`),
    pos(0, 0),
    layer("ui"),
  ]);


  const scoreLabel = add([

    text(`${score}`),
    pos(0,0),
    layer("ui"),
    {
      value: score,
    },
  ]);

  const scoreLabelText = add([
    text("Score"),
    pos(0,0),
    layer("ui"),
  ]);

  

  // Init Player(mario) and config
  const player = add([
    sprite("mario"),
    solid(),
    pos(30, 0),
    body(),
    big(),
    origin("bot"),
  ]);

  // Defining when mario hits on surprise block with a coin inside
  player.on("headbump", (obj) => {
    if (obj.is("coin-surprise")) {
      gameLevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("#", obj.gridPos.sub(0, 0));
    }
    if (obj.is("mushroom-surprise")) {
      gameLevel.spawn("^", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("#", obj.gridPos.sub(0, 0));
    }
  });

  // adding keyboard events to player

  keyDown("left", () => {
    player.move(-PLAYER_SPEED, 0);
  });
  keyDown("right", () => {
    player.move(PLAYER_SPEED, 0);
  });
  

  // Player loses when touching evil shroom
  player.collides("dangerous", (d) => {
    if (isJumping) {
      destroy(d);
    } else {
      go("lose", { score: scoreLabel.value });
    }
  });

  // Checking to see if mario is on ground or not, changing isJumping value to false
  player.action(() => {
    if (player.grounded()) {
      isJumping = false;
    }
  });

  keyPress("space", () => {
    if (player.grounded()) {
      isJumping = true;
      player.jump(CURRENT_JUMP);
    }
  });

  // making mushroom move.
  action("mushroom", (m) => {
    m.move(20, 0);
  });

  // evil shroom move
  action("dangerous", (es) => {
    es.move(-ENEMY_SPEED, 0);
  });

  player.action(() => {
    camPos(player.pos);
    if (player.pos.y >= FALL_DEATH) {
      go("lose", { score: scoreLabel.value });
    }

    const camPosition = camPos();
  scoreLabel.pos.x = camPosition.x + 7;
  scoreLabel.pos.y = camPosition.y - 180;
  scoreLabelText.pos.x = camPosition.x - 40;
  scoreLabelText.pos.y = camPosition.y - 180;
  levelLabel.pos.x = camPosition.x - 40;
  levelLabel.pos.y = camPosition.y - 200;
  });

  // mario consumes mushroom
  player.collides("mushroom", (m) => {
    destroy(m);
    player.biggify(10);
  });

  // mario gets coins! Update scoreboard
  player.collides("coin", (c) => {
    destroy(c);
    scoreLabel.value++;
    scoreLabel.text = scoreLabel.value;
  });

  // Mario goes down pipe which leads to next level
  player.collides("pipe", () => {
    keyPress("down", () => {
      go("game", {
        level: (level + 1) % maps.length,
        score: scoreLabel.value,
      });
    });
  });
});

// END OF GAME SCENE ^^^ _________________________

function restartGame() {
  go("game", { level: 0, score: 0 });
}

scene("lose", ({ score }) => {
  add([
    text(`  Final Score \n \n ${score} coins`, 26),
    origin("center"),
    pos(width() / 2, height() / 2 - 50),
    layer("ui"),
  ]);

  add([
    text("Try Again", 24),
    origin("center"),
    pos(width() / 2, height() / 2 + 50),
    layer("ui"),
    area({ cursor: "pointer" }),
    // handle the click event manually
    mouseClick(() => {
      restartGame();
    }),
  ]);
});

start("game", { level: 0, score: 0 });
