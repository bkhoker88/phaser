let game;


let gameOptions = {
    platformSpeedRange: [300, 400],
    spawnRange: [80, 300],
    platformSizeRange: [100, 300],
    platformHeightRange: [-50, 50],
    platformHeighScale: 10,
    platformVerticalLimit: [0.2, 0.9],
    playerGravity: 900,
    jumpForce: 500,
    playerStartPosition: 200,
    jumps: 10
}

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        width: 1500,
        height: 750,
        scene: playGame,
        backgroundColor: 0x87CEEB,
        physics: {
            default: "arcade"
        }
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    resize();
    window.addEventListener("resize", resize, false);
}

class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    preload(){
        this.load.image("platform", "assets/hedge.png");
        // this.load.image('sky', 'assets/park.jpg');
        this.load.image('star', 'assets/chicken2.png');
        this.load.spritesheet("player", "assets/rocko.png", {
            frameWidth: 144,
            frameHeight: 192
        });

         this.load.image('grass', 'assets/grassfield.png');
    }
    create(){
        this.add.image(400, 300, 'star');
        this.add.image(400,300, "grass")
        this.add.image(1000, 300, 'grass');



        this.platformGroup = this.add.group({
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }
        });

        this.platformPool = this.add.group({
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform)
            }
        });

        this.playerJumps = 0;

        this.addPlatform(game.config.width, game.config.width / 2, game.config.height * gameOptions.platformVerticalLimit[1]);

        this.player = this.physics.add.sprite(gameOptions.

        playerStartPosition, game.config.height * 0.7, "player");

        this.player.setGravityY(gameOptions.playerGravity);

        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("player", {
                start: 0,
                end: 20
            }),
            frameRate: 25,
            repeat: -2
        });

        this.physics.add.collider(this.player, this.platformGroup, function(){

            if(!this.player.anims.isPlaying){
                this.player.anims.play("run");
            }
        }, null, this);

        this.input.on("pointerdown", this.jump, this);
    }

    addPlatform(platformWidth, posX, posY){
        let platform;
        if(this.platformPool.getLength()){
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
        }
        else{
            platform = this.physics.add.sprite(posX, posY, "platform");
            platform.setImmovable(true);
            platform.setVelocityX(Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) * -1);
            this.platformGroup.add(platform);
        }
        platform.displayWidth = platformWidth;
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
    }

    jump(){
            if(this.player.body.touching.down){
                this.playerJumps = 0;
            }
            this.player.setVelocityY(gameOptions.jumpForce * -1);
            this.playerJumps ++;

            this.player.anims.stop();

    }
    update(){

        if(this.player.y > game.config.height){
            this.scene.start("PlayGame");
        }
        this.player.x = gameOptions.playerStartPosition;

        let minDistance = game.config.width;
        let rightmostPlatformHeight = 0;
        this.platformGroup.getChildren().forEach(function(platform){
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            if(platformDistance < minDistance){
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if(platform.x < - platform.displayWidth / 2){
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        if(minDistance > this.nextPlatformDistance){
            let nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
            let platformRandomHeight = gameOptions.platformHeighScale * Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
            console.log(rightmostPlatformHeight)
            let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
            let minPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[0];
            let maxPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[1];
            let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2, nextPlatformHeight);
        }
    }
};
function resize(){
    let canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
