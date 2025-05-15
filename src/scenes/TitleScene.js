export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        // Load character sprites
        this.load.image('hero-idle', 'assets/hero 1.png');
        this.load.spritesheet('hero-walk', 'assets/herowalking.png', {
            frameWidth: 44,
            frameHeight: 48
        });
        
        // Load logo
        this.load.image('logo', 'assets/Logo.png');
        
        // Load music
        this.load.audio('soundtrack', 'assets/Soundtrack.mp3');
    }

    create() {
        // Add logo
        const logo = this.add.image(this.cameras.main.centerX, 200, 'logo');
        logo.setScale(0.5);
        
        // Add "Press Start" text
        const pressStart = this.add.text(
            this.cameras.main.centerX,
            400,
            'Press SPACE to Start',
            {
                fontSize: '32px',
                fill: '#fff'
            }
        ).setOrigin(0.5);

        // Make text blink
        this.tweens.add({
            targets: pressStart,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });

        // Start game on spacebar press
        this.input.keyboard.once('keydown-SPACE', () => {
            this.sound.play('soundtrack', { loop: true });
            this.scene.start('GameScene');
        });

        // Create walking animation
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('hero-walk', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        // Add demo character
        const hero = this.add.sprite(700, 500, 'hero-idle');
        hero.setScale(2);
        hero.play('walk');
    }
} 