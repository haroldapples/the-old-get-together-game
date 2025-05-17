class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.load.image('gameover-bg', 'assets/gameoverscreen.png');
    }

    create() {
        // Just add the background image and restart text
        this.add.image(400, 300, 'gameover-bg').setDisplaySize(800, 600);

        const restartText = this.add.text(400, 400, 'Press SPACE to try again', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.tweens.add({
            targets: restartText,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });

        // Remove any existing keyboard listeners
        this.input.keyboard.removeAllKeys(true);
        
        // Add new space key listener
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Use update to check for space key instead of one-time event
        this.canRestart = true;
    }

    update() {
        if (this.canRestart && this.spaceKey.isDown) {
            this.canRestart = false;  // Prevent multiple restarts
            this.tweens.killAll();
            // Start GameScene directly with initial settings
            this.scene.start('GameScene', { 
                startMusic: true,
                health: 3,
                score: 0,
                level: 1
            });
        }
    }

    shutdown() {
        // Clean up resources
        this.tweens.killAll();
        this.input.keyboard.removeAllKeys(true);
    }
}

export default GameOverScene;