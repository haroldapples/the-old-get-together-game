import TitleScene from './scenes/TitleScene.js';
import GameScene from './scenes/GameScene.js';
import EndScene from './scenes/EndScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import BarnScene from './scenes/BarnScene.js';
import Level2Scene from './scenes/Level2Scene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [TitleScene, GameScene, BarnScene, EndScene, GameOverScene, Level2Scene],
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

export default config; 