class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }

    init(data) {
        this.score = data.score || 0;
    }

    preload() {
        this.load.image('final', 'assets/final.png');
        this.load.audio('victory-music', 'assets/end.mp3');
    }

    create() {
        // Clean up any existing keyboard inputs
        this.input.keyboard.removeAllKeys(true);
        
        // Add final background
        const finalBg = this.add.image(400, 300, 'final');
        
        // Scale the background to fit the screen
        const scaleX = this.cameras.main.width / finalBg.width;
        const scaleY = this.cameras.main.height / finalBg.height;
        const scale = Math.max(scaleX, scaleY);  // Use max to cover the screen
        finalBg.setScale(scale);

        // Add victory music
        const victoryMusic = this.sound.add('victory-music', {
            loop: false,
            volume: 0.7
        });

        if (!this.sound.locked) {
            victoryMusic.play();
        }

        // Display final score with adjusted style for visibility
        const scoreStyle = {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 8,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 8,
                fill: true
            }
        };

        // Add score text near the bottom
        this.add.text(400, 450, `Final Score: ${this.score}`, scoreStyle)
            .setOrigin(0.5);

        // Add restart prompt with adjusted style
        const restartText = this.add.text(400, 500, 'Refresh page to play again', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 6,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);

        // Make text blink
        this.tweens.add({
            targets: restartText,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });

        // Add space key with proper handling
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.canRestart = true;

        // Store music reference for cleanup
        this.victoryMusic = victoryMusic;
    }

    update() {
        // Check for space key in update loop instead of one-time event
        if (this.canRestart && this.spaceKey && this.spaceKey.isDown) {
            this.canRestart = false;  // Prevent multiple restarts
            
            if (this.victoryMusic && this.victoryMusic.isPlaying) {
                this.tweens.add({
                    targets: this.victoryMusic,
                    volume: 0,
                    duration: 1000,
                    onComplete: () => {
                        this.victoryMusic.stop();
                        this.scene.start('TitleScene');
                    }
                });
            } else {
                this.scene.start('TitleScene');
            }
        }
    }

    shutdown() {
        // Clean up all resources
        if (this.victoryMusic && this.victoryMusic.isPlaying) {
            this.victoryMusic.stop();
        }
        this.tweens.killAll();
        this.input.keyboard.removeAllKeys(true);
    }
}

export default EndScene; 