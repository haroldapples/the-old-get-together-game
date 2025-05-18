export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
        this.isTransitioning = false;
    }

    preload() {
        // Add loading text
        this.loadingText = this.add.text(400, 300, 'Loading...', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Show loading progress
        this.load.on('progress', (value) => {
            this.loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
        });

        try {
            this.load.image('title', 'Assets/title.png');
            this.load.audio('intro', 'Assets/intro.mp3');
        } catch (error) {
            console.error('Error in preload:', error);
            this.loadingText.setText('Error loading assets. Retrying...');
            this.scene.restart();
        }

        // Remove loading text when complete
        this.load.on('complete', () => {
            if (this.loadingText) {
                this.loadingText.destroy();
            }
        });
    }

    create() {
        try {
            // Create a simple title screen if image isn't available
            let titleScreen;
            if (this.textures.exists('title')) {
                titleScreen = this.add.image(400, 300, 'title');
                titleScreen.setDisplaySize(800, 600);
            } else {
                // Create a text-based title if image isn't available
                this.add.text(400, 200, 'The Old Get Together', {
                    fontSize: '48px',
                    fill: '#fff',
                    fontFamily: 'Arial',
                    align: 'center'
                }).setOrigin(0.5);
            }

            // Add and play intro music with error handling
            try {
                this.introMusic = this.sound.add('intro', {
                    loop: true,
                    volume: 0.7
                });

                // Play intro music when audio is ready
                if (this.sound.locked) {
                    this.sound.once('unlocked', () => {
                        this.playIntroMusic();
                    });
                } else {
                    this.playIntroMusic();
                }
            } catch (error) {
                console.error('Error setting up audio:', error);
                // Continue without music
            }

            // Add start text at bottom of the screen
            this.startText = this.add.text(400, 500, 'Press SPACE to Start', {
                fontSize: '24px',
                fill: '#fff',
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 4
            }).setOrigin(0.5);

            // Make text blink
            this.tweens.add({
                targets: this.startText,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                yoyo: true,
                repeat: -1
            });

            // Set up space key
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.canStart = true;

        } catch (error) {
            console.error('Error in create:', error);
            // Show error message to user
            this.add.text(400, 300, 'Error loading title screen\nPress SPACE to retry', {
                fontSize: '24px',
                fill: '#fff',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5);

            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.canStart = true;
        }
    }

    update() {
        if (this.canStart && this.spaceKey && this.spaceKey.isDown) {
            this.canStart = false;  // Prevent multiple transitions
            this.handleSceneTransition();
        }
    }

    playIntroMusic() {
        try {
            if (this.introMusic && !this.introMusic.isPlaying) {
                this.introMusic.play();
            }
        } catch (error) {
            console.error('Error playing intro music:', error);
        }
    }

    handleSceneTransition() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        try {
            // Fade out intro music if it exists
            if (this.introMusic && this.introMusic.isPlaying) {
                this.tweens.add({
                    targets: this.introMusic,
                    volume: 0,
                    duration: 1000,
                    onComplete: () => {
                        this.introMusic.stop();
                        this.startGameScene();
                    }
                });
            } else {
                // If no music is playing, just transition
                this.startGameScene();
            }
        } catch (error) {
            console.error('Error during scene transition:', error);
            // Fallback transition
            this.startGameScene();
        }
    }

    startGameScene() {
        try {
            // Fade out to black
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', { 
                    startMusic: true,
                    health: 3,
                    score: 0,
                    level: 1
                });
            });
        } catch (error) {
            console.error('Error starting game scene:', error);
            this.isTransitioning = false;
        }
    }

    shutdown() {
        try {
            // Clean up all resources
            this.isTransitioning = false;
            this.canStart = false;
            
            if (this.introMusic && this.introMusic.isPlaying) {
                this.introMusic.stop();
            }
            
            // Remove all event listeners
            this.input.keyboard.shutdown();
            
            // Stop all tweens
            this.tweens.killAll();
            
        } catch (error) {
            console.error('Error during shutdown:', error);
        }
    }
} 