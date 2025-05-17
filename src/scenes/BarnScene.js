import woodBackgroundImage from '../../assets/woodbackground.png';
import playerSprite from '../../assets/herowalking.png';

export default class BarnScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BarnScene' });
    }

    init(data) {
        this.health = data.health || 3;
        this.score = data.score || 0;
    }

    preload() {
        this.load.image('woodbackground', woodBackgroundImage);
        this.load.spritesheet('player', playerSprite, {
            frameWidth: 44,
            frameHeight: 48
        });
    }

    create() {
        // Add the wood background first
        const bg = this.add.image(400, 300, 'woodbackground');
        bg.setScale(1.2);
        
        // Create black overlay for fade effects
        this.blackOverlay = this.add.rectangle(
            0,
            0,
            this.game.config.width,
            this.game.config.height,
            0x000000
        );
        this.blackOverlay.setOrigin(0, 0);
        this.blackOverlay.setDepth(1000);
        this.blackOverlay.alpha = 1;

        // Create player animations if they don't exist
        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: 10
            });
        }

        // Create player at the left side
        this.player = this.add.sprite(100, 450, 'player');
        const desiredHeight = 100;
        const currentHeight = 48;
        const scale = desiredHeight / currentHeight;
        this.player.setScale(scale);

        // Start the sequence
        this.startTransitionSequence();
    }

    startTransitionSequence() {
        // Step 1: Fade in from black
        this.tweens.add({
            targets: this.blackOverlay,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Step 2: Make player walk
                this.player.play('walk', true);
                this.tweens.add({
                    targets: this.player,
                    x: 600,
                    duration: 2000,
                    ease: 'Linear',
                    onComplete: () => {
                        // Stop walking animation
                        this.player.play('idle', true);
                        
                        // Step 3: Wait a moment then fade to black
                        this.time.delayedCall(1000, () => {
                            this.tweens.add({
                                targets: this.blackOverlay,
                                alpha: 1,
                                duration: 1000,
                                ease: 'Power2',
                                onComplete: () => {
                                    // Clean up
                                    this.tweens.killAll();
                                    
                                    // Transition to level 2
                                    this.scene.start('GameScene', {
                                        level: 2,
                                        health: this.health,
                                        score: this.score,
                                        startMusic: true
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    }

    shutdown() {
        // Clean up any remaining resources
        this.tweens.killAll();
        if (this.player) {
            this.player.destroy();
        }
    }
} 