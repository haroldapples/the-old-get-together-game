import playerSprite from '../../assets/herowalking.png';
import possumSprite from '../../assets/possum.png';
import heartSprite from '../../assets/heart.png';
import backgroundImage from '../../assets/background2.png';
import burstImage from '../../assets/dead.png';
import gameMusic from '../../assets/Soundtrack.mp3';
import bossMusic from '../../assets/boss.mp3';
import introMusic from '../../assets/intro.mp3';
import signImage from '../../assets/sign.png';
import spencersImage from '../../assets/spencers.png';
import popworksImage from '../../assets/popworks.png';
import wrapImage from '../../assets/wrap.png';
import tacoImage from '../../assets/taco.png';
import baseballImage from '../../assets/baseball.png';
import boothsImage from '../../assets/booths.png';
import booth2Image from '../../assets/booth2.png';
import foxImage from '../../assets/fox.png';
import foxHurtImage from '../../assets/foxhurt.png';
import barnImage from '../../assets/barn.png';
import heroHurtImage from '../../assets/herohurt.png';
import ticketImage from '../../assets/ticket.png';
import finalImage from '../../assets/final.png';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.health = data.health || 3;
        this.isInvulnerable = false;
        this.shouldStartMusic = data && data.startMusic;
        this.score = data.score || 0;
        this.bossDefeated = false;
        this.bossHealth = 5;
        this.bossRevealed = false;
        this.isRevealSequence = false;
        this.level = data.level || 1;
        
        if (this.level === 2) {
            this.bossHealth = 7;
            this.possumSpawnDelay = 3000;
        } else {
            this.possumSpawnDelay = 5000;
        }
    }

    preload() {
        this.loadingText = this.add.text(400, 300, 'Loading...', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.loadingText.setScrollFactor(0);

        this.load.on('progress', (value) => {
            this.loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
        });

        try {
            this.load.spritesheet('player', playerSprite, { frameWidth: 44, frameHeight: 48 });
            this.load.spritesheet('possum', possumSprite, { frameWidth: 55, frameHeight: 50 });
            this.load.image('heart', heartSprite);
            this.load.image('background', backgroundImage);
            this.load.image('burst', burstImage);
            this.load.image('sign', signImage);
            this.load.image('spencers', spencersImage);
            this.load.image('taco', tacoImage);
            this.load.image('baseball', baseballImage);
            this.load.image('booths', boothsImage);
            this.load.image('booth2', booth2Image);
            this.load.image('fox', foxImage);
            this.load.image('foxhurt', foxHurtImage);
            this.load.image('barn', barnImage);
            this.load.image('herohurt', heroHurtImage);
            this.load.image('ticket', ticketImage);
            this.load.image('final', finalImage);
            this.load.image('popworks', popworksImage);
            this.load.image('wrap', wrapImage);
            this.load.audio('gameMusic', gameMusic);
            this.load.audio('bossMusic', bossMusic);
            this.load.audio('introMusic', introMusic);
        } catch (error) {
            console.error('Error loading assets:', error);
            this.loadingText.setText('Error loading assets. Retrying...');
            this.scene.restart();
        }

        this.load.on('complete', () => {
            if (this.loadingText) {
                this.loadingText.destroy();
            }
        });
    }

    create() {
        try {
            this.physics.world.setBounds(0, 0, 4800, 600);
            this.cameras.main.setBounds(0, 0, 4800, 600);
            this.cursors = this.input.keyboard.createCursorKeys();
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.physics.world.gravity.y = 800;

            // Background
            this.bg = this.add.tileSprite(0, 0, 4800, 600, 'background');
            this.bg.setOrigin(0, 0);
            this.bg.setScrollFactor(1);
            this.bg.width = 4800;

            // Ground
            this.ground = this.add.rectangle(2400, 550, 4800, 32, 0x000000, 0);
            this.physics.add.existing(this.ground, true);

            if (this.level === 2) {
                this.player = this.physics.add.sprite(100, 450, 'player');
                this.final = this.add.image(4400, 340, 'final');
                const finalScale = 300 / this.textures.get('final').getSourceImage().height;
                this.final.setScale(finalScale);
                this.final.setScrollFactor(1);
                this.bg.setTint(0xcccccc);
            } else {
                this.setupLevel1();
            }

            this.setupPlayer();
            this.setupBoss();
            this.setupUI();
            this.setupMusic();
            this.setupCollisions();
            this.setupCamera();

        } catch (error) {
            console.error('Error creating scene:', error);
        }
    }

    setupLevel1() {
        // Add level 1 specific elements (signs, buildings, etc.)
        this.sign = this.add.image(200, 480, 'sign');
        this.sign.setScale(0.8);
        this.sign.setScrollFactor(1);

        this.popworks = this.add.image(800, 400, 'popworks');
        this.popworks.setScale(0.72);
        this.popworks.setScrollFactor(1);

        this.spencers = this.add.image(1300, 440, 'spencers');
        this.spencers.setScale(0.72);
        this.spencers.setScrollFactor(1);

        this.wrap = this.add.image(1800, 400, 'wrap');
        this.wrap.setScale(0.72);
        this.wrap.setScrollFactor(1);

        this.taco = this.add.image(2300, 440, 'taco');
        this.taco.setScale(0.72);
        this.taco.setScrollFactor(1);

        this.baseball = this.add.image(2800, 440, 'baseball');
        const baseballScale = 240 / this.textures.get('baseball').getSourceImage().height;
        this.baseball.setScale(baseballScale);
        this.baseball.setScrollFactor(1);

        this.booths = this.add.image(3300, 440, 'booths');
        const boothsScale = 240 / this.textures.get('booths').getSourceImage().height;
        this.booths.setScale(boothsScale);
        this.booths.setScrollFactor(1);

        this.booth2 = this.add.image(3800, 440, 'booth2');
        const booth2Scale = 240 / this.textures.get('booth2').getSourceImage().height;
        this.booth2.setScale(booth2Scale);
        this.booth2.setScrollFactor(1);

        this.barn = this.add.image(4400, 340, 'barn');
        const barnScale = 300 / this.textures.get('barn').getSourceImage().height;
        this.barn.setScale(barnScale);
        this.barn.setScrollFactor(1);
        this.barn.setAlpha(1);

        this.player = this.physics.add.sprite(100, 450, 'player');
    }

    setupPlayer() {
        this.player.setScale(100/48);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 10
        });

        this.anims.create({
            key: 'possum-walk',
            frames: this.anims.generateFrameNumbers('possum', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });
    }

    setupBoss() {
        if (this.level === 1) {
            this.boss = this.physics.add.sprite(4500, 450, 'fox');
            const bossScale = 200 / this.textures.get('fox').getSourceImage().height;
            this.boss.setScale(bossScale);
            this.boss.setBounce(0.2);
            this.boss.setCollideWorldBounds(true);
            this.boss.setAlpha(0);

            this.bossHealthBar = this.add.graphics();
            this.bossHealthBar.setScrollFactor(1);
            this.bossHealthBar.setAlpha(0);
            this.updateBossHealthBar();

            this.bossMusicTrack = this.sound.add('bossMusic', { loop: true, volume: 0 });

            this.bossTween = this.tweens.add({
                targets: this.boss,
                x: this.boss.x - 400,
                duration: 3000,
                yoyo: true,
                repeat: -1,
                paused: true,
                onYoyo: () => {
                    this.boss.setFlipX(true);
                },
                onRepeat: () => {
                    this.boss.setFlipX(false);
                    if (Math.random() < 0.5 && !this.boss.isDead) {
                        this.boss.setVelocityY(-250);
                    }
                }
            });
        }
    }

    setupUI() {
        this.hearts = this.add.group();
        this.updateHealthDisplay();

        this.scoreText = this.add.text(700, 16, 'Score: ' + this.score, {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4,
            align: 'right'
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setOrigin(1, 0);
    }

    setupMusic() {
        this.gameMusic = this.sound.add('gameMusic', { loop: true, volume: 0 });
        if (this.shouldStartMusic) {
            this.gameMusic.play();
            this.tweens.add({
                targets: this.gameMusic,
                volume: 0.5,
                duration: 1000
            });
        }
    }

    setupCollisions() {
        this.possums = this.physics.add.group();
        this.spawnPossum();
        this.possumSpawnTimer = this.time.addEvent({
            delay: this.possumSpawnDelay,
            callback: this.spawnPossum,
            callbackScope: this,
            loop: true
        });

        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.possums, this.ground);
        this.physics.add.collider(this.boss, this.ground);
        this.physics.add.overlap(this.player, this.possums, this.handlePossumCollision, null, this);
        this.physics.add.overlap(this.player, this.boss, this.handleBossCollision, null, this);
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, 4800, 600);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1);
    }

    update() {
        try {
            if (!this.cursors || !this.player) {
                console.error('Required game objects not initialized');
                return;
            }

            const onGround = this.player.body.touching.down;

            if (!this.bossRevealed && this.player.x > 3800) {
                this.startBossReveal();
            }

            if (this.isRevealSequence) {
                this.player.setVelocityX(0);
                this.player.play('idle', true);
            } else {
                this.handlePlayerMovement(onGround);
            }

            this.handleBossLogic();
            this.handlePlayerDeath();
            this.cleanupEnemies();

        } catch (error) {
            console.error('Error in update:', error);
        }
    }

    handlePlayerMovement(onGround) {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300);
            this.player.setFlipX(true);
            if (onGround) {
                this.player.play('walk', true);
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(300);
            this.player.setFlipX(false);
            if (onGround) {
                this.player.play('walk', true);
            }
        } else {
            this.player.setVelocityX(0);
            if (onGround) {
                this.player.play('idle', true);
            }
        }

        if (this.spaceKey && this.spaceKey.isDown && onGround) {
            this.player.setVelocityY(-400);
        }
    }

    handleBossLogic() {
        if (this.boss && !this.boss.isDead) {
            this.updateBossHealthBar();

            if (!this.isRevealSequence && Math.abs(this.player.x - this.boss.x) < 300 && Math.random() < 0.01) {
                this.boss.setVelocityY(-200);
            }

            if (!this.isRevealSequence && this.physics.overlap(this.player, this.boss)) {
                const playerBottom = this.player.y + this.player.height / 2;
                const bossTop = this.boss.y - this.boss.height / 3;

                if (this.player.body.velocity.y > 0 && playerBottom < this.boss.y && !this.boss.isHurt) {
                    this.hitBoss();
                    this.player.setVelocityY(-500);
                } else if (!this.isInvulnerable && playerBottom > bossTop && !this.boss.isHurt) {
                    this.takeDamage();
                    this.makePlayerInvulnerable();
                }
            }
        }
    }

    handlePlayerDeath() {
        if (this.player.y > this.game.config.height) {
            this.takeDamage();
            this.player.setPosition(this.cameras.main.scrollX + 100, 450);
        }
    }

    cleanupEnemies() {
        if (this.possums) {
            this.possums.children.iterate((possum) => {
                if (possum && !possum.isDead) {
                    if (possum.x < this.cameras.main.scrollX - 100) {
                        possum.destroy();
                    } else if (possum.body.touching.down) {
                        possum.setVelocityX(-150);
                    }
                }
            });
        }
    }

    spawnPossum() {
        try {
            const possum = this.possums.create(this.cameras.main.scrollX + 900, 450, 'possum');
            possum.setVelocityX(-150);
            possum.play('possum-walk');
            possum.setScale(1.5);
            possum.setBounce(0.2);
            possum.setCollideWorldBounds(true);
            possum.checkWorldBounds = true;
            possum.outOfBoundsKill = true;

            this.time.addEvent({
                delay: 2000,
                callback: () => {
                    if (possum.active && !possum.isDead) {
                        possum.setVelocityY(-300);
                    }
                },
                loop: true
            });
        } catch (error) {
            console.error('Error spawning possum:', error);
        }
    }

    handlePossumCollision(player, possum) {
        if (player.body.velocity.y > 0 && player.y < possum.y && !possum.isDead) {
            this.killPossum(possum);
            player.setVelocityY(-300);
        } else if (!this.isInvulnerable && !possum.isDead) {
            this.takeDamage();
            this.makePlayerInvulnerable();
        }
    }

    killPossum(possum) {
        possum.isDead = true;
        const burst = this.add.image(possum.x, possum.y, 'burst');
        burst.setScale(0.5);

        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        this.tweens.add({
            targets: burst,
            scale: 2,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                burst.destroy();
            }
        });

        possum.setVelocity(0, 0);
        this.tweens.add({
            targets: possum,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                possum.destroy();
            }
        });
    }

    makePlayerInvulnerable() {
        this.isInvulnerable = true;
        this.player.setTexture('herohurt');
        this.player.setTint(0xff0000);

        this.playerPulseTween = this.tweens.add({
            targets: this.player,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2,
            ease: 'Linear',
            onComplete: () => {
                this.player.setAlpha(1);
                this.player.clearTint();
            }
        });

        this.time.delayedCall(1000, () => {
            this.isInvulnerable = false;
            this.player.setTexture('player');
        }, [], this);
    }

    takeDamage() {
        if (this.health > 0) {
            this.health--;
            this.updateHealthDisplay();

            if (this.health === 0) {
                if (this.gameMusic && this.gameMusic.isPlaying) {
                    this.gameMusic.stop();
                }
                if (this.bossMusicTrack && this.bossMusicTrack.isPlaying) {
                    this.bossMusicTrack.stop();
                }
                this.scene.start('GameOverScene', { score: this.score });
            }
        }
    }

    updateHealthDisplay() {
        this.hearts.clear(true, true);
        for (let i = 0; i < this.health; i++) {
            const heart = this.add.image(50 + i * 40, 50, 'heart');
            heart.setScrollFactor(0);
            heart.setScale(0.5);
            this.hearts.add(heart);
        }
    }

    hitBoss() {
        if (this.boss.isDead || this.boss.isHurt) return;

        this.bossHealth--;
        this.updateBossHealthBar();
        this.boss.isHurt = true;
        this.boss.setTexture('foxhurt');
        this.boss.setTint(0xff0000);

        this.tweens.add({
            targets: this.boss,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 4,
            ease: 'Linear',
            onComplete: () => {
                if (!this.boss.isDead) {
                    this.boss.setAlpha(1);
                    this.boss.clearTint();
                    this.boss.setTexture('fox');
                    this.boss.isHurt = false;
                }
            }
        });

        if (this.bossHealth <= 0) {
            this.defeatBoss();
        }
    }

    updateBossHealthBar() {
        if (!this.boss || this.boss.isDead) return;

        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0x000000, 0.7);
        this.bossHealthBar.fillRect(this.boss.x - 50, this.boss.y - 80, 100, 10);

        const healthPercentage = this.bossHealth / 5;
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(this.boss.x - 50, this.boss.y - 80, 100 * healthPercentage, 10);
    }

    startBossReveal() {
        if (this.bossRevealed) return;

        this.bossRevealed = true;
        this.isRevealSequence = true;
        this.cameras.main.stopFollow();

        this.cameras.main.pan(4200, 300, 2000, 'Power2', true, (camera, progress) => {
            if (progress === 1) {
                this.physics.world.setBounds(3800, 0, 800, 600);
                this.player.setCollideWorldBounds(true);
                this.boss.setCollideWorldBounds(true);

                if (this.possumSpawnTimer) {
                    this.possumSpawnTimer.destroy();
                }

                this.possums.getChildren().forEach((possum) => {
                    this.tweens.add({
                        targets: possum,
                        alpha: 0,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            possum.destroy();
                        }
                    });
                });

                this.tweens.add({
                    targets: this.gameMusic,
                    volume: 0,
                    duration: 2000,
                    ease: 'Power2'
                });

                this.bossMusicTrack.play();
                this.tweens.add({
                    targets: this.bossMusicTrack,
                    volume: 0.5,
                    duration: 2000,
                    ease: 'Power2'
                });

                this.tweens.add({
                    targets: [this.boss, this.bossHealthBar],
                    alpha: 1,
                    duration: 1500,
                    ease: 'Power2',
                    onComplete: () => {
                        this.bossTween.resume();
                        this.isRevealSequence = false;
                    }
                });
            }
        });
    }

    defeatBoss() {
        if (this.boss.isDead) return;

        this.boss.isDead = true;
        this.bossDefeated = true;
        this.bossTween && this.bossTween.stop();
        this.boss.setVelocity(0, 0);

        this.tweens.add({
            targets: this.bossMusicTrack,
            volume: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                this.bossMusicTrack.stop();
            }
        });

        this.score += 1000;
        this.scoreText.setText('Score: ' + this.score);

        const createBurst = (delay) => {
            const burst = this.add.image(
                this.boss.x + Phaser.Math.Between(-30, 30),
                this.boss.y + Phaser.Math.Between(-30, 30),
                'burst'
            );
            burst.setScale(0.5);
            burst.setAlpha(0.7);
            this.tweens.add({
                targets: burst,
                scale: 2,
                alpha: 0,
                duration: 800,
                delay: delay,
                ease: 'Power2',
                onComplete: () => burst.destroy()
            });
        };

        const colors = [0xffff00, 0x00ff00, 0x0000ff, 0xff00ff, 0xff0000];
        let colorIndex = 0;
        let burstCount = 0;

        const burstTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                if (!this.boss || this.boss.destroyed) return;

                this.boss.setTint(colors[colorIndex]);
                colorIndex = (colorIndex + 1) % colors.length;

                if (burstCount++ % 2 === 0) {
                    createBurst(0);
                }

                if (burstCount >= 10) {
                    burstTimer.destroy();

                    for (let i = 0; i < 5; i++) {
                        createBurst(i * 200);
                    }

                    const ticket = this.physics.add.sprite(this.boss.x, this.boss.y, 'ticket');
                    ticket.setScale(0.5);
                    ticket.setBounce(0.4);
                    ticket.setCollideWorldBounds(true);
                    ticket.setVelocityY(-200);

                    this.physics.add.collider(ticket, this.ground, () => {
                        ticket.setVelocity(0, 0);
                        ticket.setGravity(0);
                        this.tweens.add({
                            targets: ticket,
                            y: ticket.y - 15,
                            duration: 1500,
                            ease: 'Sine.inOut',
                            yoyo: true,
                            repeat: -1
                        });
                    }, null, this);

                    this.physics.add.overlap(this.player, ticket, () => {
                        if (!ticket.active) return;

                        this.physics.pause();
                        this.player.anims.pause();
                        this.player.setVelocity(0, 0);

                        const introMusic = this.sound.add('introMusic', { volume: 0.5 });
                        introMusic.play();

                        const blackOverlay = this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x000000);
                        blackOverlay.setOrigin(0, 0);
                        blackOverlay.setScrollFactor(0);
                        blackOverlay.setDepth(1000);
                        blackOverlay.alpha = 0;

                        this.tweens.add({
                            targets: [blackOverlay, ticket],
                            alpha: 1,
                            duration: 2000,
                            ease: 'Power2',
                            onComplete: () => {
                                this.sound.stopAll();
                                this.scene.start('Level2Scene', {
                                    health: this.health,
                                    score: this.score
                                });
                            }
                        });
                    }, null, this);

                    this.tweens.add({
                        targets: this.boss,
                        scaleX: 1.5,
                        scaleY: 0,
                        alpha: 0,
                        duration: 1000,
                        ease: 'Power2',
                        onComplete: () => {
                            if (this.boss) this.boss.destroy();
                            if (this.bossHealthBar) this.bossHealthBar.destroy();
                        }
                    });
                }
            },
            loop: true
        });
    }

    shutdown() {
        try {
            this.time.removeAllEvents();
            this.tweens.killAll();
            if (this.gameMusic && this.gameMusic.isPlaying) {
                this.gameMusic.stop();
            }
            if (this.bossMusicTrack && this.bossMusicTrack.isPlaying) {
                this.bossMusicTrack.stop();
            }
            if (this.possums) {
                this.possums.destroy(true);
            }
            if (this.hearts) {
                this.hearts.destroy(true);
            }
            this.input.keyboard.shutdown();
            this.physics.world.shutdown();
        } catch (error) {
            console.error('Error during shutdown:', error);
        }
    }

    handleBossCollision(player, boss) {
        if (!this.bossRevealed || boss.isDead || this.isRevealSequence) return;

        const playerBottom = player.y + player.height * player.scale / 2;
        const bossTop = boss.y - boss.height * boss.scale / 2;
        const hitboxOffset = boss.height * boss.scale * 0.4;

        if (player.body.velocity.y > 0 && playerBottom < bossTop + hitboxOffset && !boss.isHurt) {
            this.hitBoss();
            player.setVelocityY(-500);
        } else if (!this.isInvulnerable && !boss.isHurt && playerBottom > bossTop + hitboxOffset) {
            this.takeDamage();
            this.makePlayerInvulnerable();
            const knockbackDirection = player.x < boss.x ? -1 : 1;
            player.setVelocityX(300 * knockbackDirection);
            player.setVelocityY(-200);
        }
    }
} 