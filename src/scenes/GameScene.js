export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Create player sprite
        this.player = this.physics.add.sprite(100, 450, 'hero-idle');
        this.player.setCollideWorldBounds(true);
        
        // Set up keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Handle horizontal movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.flipX = true;
            this.player.play('walk', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.flipX = false;
            this.player.play('walk', true);
        }
        else {
            this.player.setVelocityX(0);
            this.player.setTexture('hero-idle');
        }

        // Handle jumping
        if (this.cursors.space.isDown && this.player.body.onFloor()) {
            this.player.setVelocityY(-330);
        }
    }
} 