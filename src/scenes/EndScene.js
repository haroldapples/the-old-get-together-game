export default class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }

    preload() {
        this.load.audio('end-music', 'assets/end.mp3');
    }

    create() {
        // Play end music
        this.sound.stopAll();
        this.sound.play('end-music', { loop: true });

        // Add congratulations text
        const congrats = this.add.text(
            this.cameras.main.centerX,
            200,
            'Congratulations!\nYou completed the game!',
            {
                fontSize: '48px',
                fill: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Add restart prompt
        const restart = this.add.text(
            this.cameras.main.centerX,
            400,
            'Press SPACE to play again',
            {
                fontSize: '32px',
                fill: '#fff'
            }
        ).setOrigin(0.5);

        // Make restart text blink
        this.tweens.add({
            targets: restart,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });

        // Handle restart
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('TitleScene');
        });
    }
} 