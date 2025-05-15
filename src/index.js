import 'phaser';
import TitleScene from './scenes/TitleScene.js';
import GameScene from './scenes/GameScene.js';
import EndScene from './scenes/EndScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,  // 4:3 ratio
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [TitleScene, GameScene, EndScene]
};

window.addEventListener('load', () => {
    new Phaser.Game(config);
}); 