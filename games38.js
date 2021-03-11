var config = {
  type: Phaser.AUTO,
  width: 1500,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var highScore;
var chocolate;

// functions //
function movechocolate(chocolate, speed) {
  chocolate.y = speed;
  if(chocolate.y > 600)resetchocolate(chocolate)
}
function resetchocolate(chocolate) {
  chocolate.y = 0;
  var randomx = Phaser.Math.FloatBetween(0.5, 0.99);
  chocolate.x = randomx;
}
function collectStar(player, star) {
  star.disableBody(true, true);

  score += 1;
  if (score > 20) score += 1;
  if (score > 50) score += 3;
  if (score > 100) score += 15;
  if (score > 100) score += 100;

  scoreText.setText('Chomps: ' + score);

  if (stars.countActive(true) === 0) {
    //  A new batch of stars to collect
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 1000)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, 'bomb');

    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 400), 20);
    bomb.allowGravity = false;
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');
  this.add.image(565, 350, 'gameover');

  gameOver = true;
}
//////////////
var game = new Phaser.Game(config);

function preload() {
  this.load.image('sky', 'assets/livingroom.jpg');
  this.load.image('ground', 'assets/platform2.png');
  this.load.image('couch', 'assets/sofa3.png');
  this.load.image('shelf', 'assets/table.png');
  this.load.image('books', 'assets/books.png');
  this.load.image('lamp', 'assets/lamp.png');
  this.load.image('bookcase', 'assets/bookcase.png');
  this.load.image('art', 'assets/art.png');
  this.load.image('gameover', 'assets/gameover.png');
  this.load.image('realrocko', 'assets/realrocko.png');
  this.load.image('chocolate', 'assets/chocolate.png');
  this.load.image('star', 'assets/chicken2.png');
  this.load.image('bomb', 'assets/garbage.png');
  this.load.spritesheet('dude', 'assets/rocko.png', {
    frameWidth: 32,
    frameHeight: 48,
  });
}

var platforms;

function create() {
  this.add.image(400, 300, 'chocolate');
  this.add.image(1125, 300, 'sky');
  this.add.image(400, 300, 'star');
  this.add.image(400, 300, 'sky');
  this.add.image(1450, 220, 'bookcase');
  platforms = this.physics.add.staticGroup();

  platforms.create(700, 1150, 'ground').setScale(1.5).refreshBody();

  platforms.create(750, 480, 'couch');
  platforms.create(1400, 480, 'shelf');
  platforms.create(1000, 200, 'books');
  platforms.create(150, 170, 'art');

  platforms.create(500, 50, 'lamp');
  player = this.physics.add.sprite(200, 300, 'dude');

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 4, end: 7 }),
    frameRate: 25,
    repeat: -2,
  });

  this.anims.create({
    key: 'turn',
    frames: this.anims.generateFrameNumbers('dude', {
      start: 0,
      end: 100,
    }),
    frameRate: 100,
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', {
      start: 8,
      end: 11,
    }),
    frameRate: 25,
    repeat: -2,
  });
  cursors = this.input.keyboard.createCursorKeys();

  chocolate = this.physics.add.group({
    key: 'chocolate',
    repeat: 3,
    setXY: { x: 300, y: 0, stepX: 300 },
  });

   chocolate.children.iterate(function (child) {
         child.setVelocity(Phaser.Math.Between(-200, 400), 20);
         child.allowGravity = false;
   });

  stars = this.physics.add.group({
    key: 'star',
    repeat: 12,
    setXY: { x: 12, y: 0, stepX: 100 },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.5, 0.99));
  });

  scoreText = this.add.text(16, 16, 'Chomps: 0', {
    fontSize: '32px',
    fill: '#300',
  });

  bombs = this.physics.add.group();

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);

  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(player, bombs, hitBomb, null, this);
  this.physics.add.collider(player, chocolate, hitBomb, null, this);
}

function update() {
  movechocolate(chocolate, 50);

  if (gameOver) {
    return this.add.image(1340, 350, 'realrocko');
  }
  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-410);
  }
}
