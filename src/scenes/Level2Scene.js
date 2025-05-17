import playerSprite from '../../assets/herowalking.png';
import possumSprite from '../../assets/possum.png';
import heartSprite from '../../assets/heart.png';
import woodBackground from '../../assets/woodbackground.png';
import emptyStage from '../../assets/emptystage.png';
import gameMusic from '../../assets/Soundtrack.mp3';
import bossMusic from '../../assets/boss.mp3';
import raccoonSprite from '../../assets/racoon.png';
import burstImage from '../../assets/dead.png';
import ticketImage from '../../assets/ticket.png';

export default class Level2Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2Scene' });
    }

    init(data) {
        this.health = data.health || 3;
        this.score = data.score || 0;
        this.stageRevealed = false;
        this.bossDefeated = false;
        this.bossHealth = 7; // Make level 2 boss slightly harder
        this.bossRevealed = false;
    }

    preload() {
        // Load level 2 specific assets
        this.load.image('woodbackground', woodBackground);
        this.load.image('emptystage', emptyStage);
        this.load.image('raccoon', raccoonSprite);
        this.load.image('burst', burstImage);
        this.load.image('ticket', ticketImage);
        this.load.image('final', 'assets/final.png');
        this.load.image('bat', 'assets/bat.png');
        // Load animal band sprites
        this.load.image('animalband1', 'assets/animalband1.png');
        this.load.image('animalband2', 'assets/animalband2.png');
        this.load.spritesheet('player', playerSprite, {
            frameWidth: 44,
            frameHeight: 48
        });
        this.load.spritesheet('possum', possumSprite, {
            frameWidth: 55,
            frameHeight: 50
        });
        this.load.image('heart', heartSprite);
        this.load.audio('gameMusic', gameMusic);
        this.load.audio('bossMusic', bossMusic);
    }

    create() {
        // Create a fade-in effect
        const blackOverlay = this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x000000);
        blackOverlay.setOrigin(0, 0);
        blackOverlay.setScrollFactor(0);
        blackOverlay.setDepth(1000);

        this.tweens.add({
            targets: blackOverlay,
            alpha: 0,
            duration: 2000,
            ease: 'Power2'
        });

        // Set up the world and camera
        this.physics.world.setBounds(0, 0, 4800, 600);
        this.cameras.main.setBounds(0, 0, 4800, 600);
        
        // Increase gravity for snappier jumps to match Level 1
        this.physics.world.gravity.y = 800;

        // Add wood background with lowest depth
        this.bg = this.add.tileSprite(0, 0, 4800, 600, 'woodbackground');
        this.bg.setOrigin(0, 0);
        this.bg.setScrollFactor(1);
        this.bg.width = 4800;
        this.bg.setDepth(0);

        // Create animal band animation
        this.animalBand = this.add.sprite(4400, 250, 'animalband1');
        // Scale the band to fit the stage
        const bandDesiredHeight = 200;  // Adjust this value to fit your stage
        const bandCurrentHeight = this.textures.get('animalband1').getSourceImage().height;
        const bandScale = bandDesiredHeight / bandCurrentHeight;
        this.animalBand.setScale(bandScale);
        this.animalBand.setDepth(3);  // Same depth as player/boss so it's visible above stage
        this.animalBand.setVisible(false);  // Hide initially
        
        // Create the animation timeline
        this.bandTween = this.tweens.add({
            targets: this.animalBand,
            alpha: { from: 1, to: 1 },  // Keep fully visible
            duration: 500,
            repeat: -1,
            paused: true,  // Start paused
            onRepeat: () => {
                // Toggle between the two frames
                this.animalBand.setTexture(
                    this.animalBand.texture.key === 'animalband1' ? 'animalband2' : 'animalband1'
                );
            }
        });

        // Create ground with depth above background
        this.ground = this.add.rectangle(2400, 550, 4800, 32, 0x000000, 0);
        this.physics.add.existing(this.ground, true);
        this.ground.setDepth(1);

        // Create player with depth above stage
        this.player = this.physics.add.sprite(100, 450, 'player');
        const desiredHeight = 100;
        const currentHeight = 48;
        const scale = desiredHeight / currentHeight;
        this.player.setScale(scale);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(3);

        // Create player animations
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

        // Set up controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Create possum animation
        this.anims.create({
            key: 'possum-walk',
            frames: this.anims.generateFrameNumbers('possum', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });

        // Create possum group
        this.possums = this.physics.add.group();
        this.spawnPossum();

        // Timer for spawning possums
        this.possumSpawnTimer = this.time.addEvent({
            delay: 5000,
            callback: this.spawnPossum,
            callbackScope: this,
            loop: true
        });

        // Add empty stage at the end with depth above ground
        this.emptyStage = this.add.image(4400, 300, 'emptystage');
        this.emptyStage.setOrigin(0.5, 0.5);
        this.emptyStage.setScrollFactor(1);
        const stageDesiredHeight = 600;
        const stageCurrentHeight = this.textures.get('emptystage').getSourceImage().height;
        const stageScale = stageDesiredHeight / stageCurrentHeight;
        this.emptyStage.setScale(stageScale);
        this.emptyStage.setDepth(2);

        // Add boss at the end (initially not visible)
        this.boss = this.physics.add.sprite(4500, 450, 'raccoon');
        const bossDesiredHeight = 200;
        const bossCurrentHeight = this.textures.get('raccoon').getSourceImage().height;
        const bossScale = bossDesiredHeight / bossCurrentHeight;
        this.boss.setScale(bossScale);
        this.boss.setBounce(0.2);
        this.boss.setCollideWorldBounds(true);
        this.boss.setAlpha(0); // Start invisible
        this.boss.setDepth(3); // Same depth as player

        // Add boss health bar (initially invisible)
        this.bossHealthBar = this.add.graphics();
        this.bossHealthBar.setScrollFactor(1);
        this.bossHealthBar.setAlpha(0);
        this.bossHealthBar.setDepth(4); // Set depth above all other elements
        this.updateBossHealthBar();

        // Add boss music
        this.bossMusicTrack = this.sound.add('bossMusic', {
            loop: true,
            volume: 0
        });

        // Boss movement pattern (initially paused)
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

        // Set up health display
        this.hearts = this.add.group();
        this.updateHealthDisplay();

        // Set up score display with high depth
        this.scoreText = this.add.text(700, 16, 'Score: ' + this.score, {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4,
            align: 'right'
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1000);  // Set very high depth to appear above everything
        this.scoreText.setOrigin(1, 0);

        // Start game music
        this.gameMusic = this.sound.add('gameMusic', {
            loop: true,
            volume: 0
        });
        this.gameMusic.play();
        this.tweens.add({
            targets: this.gameMusic,
            volume: 0.5,
            duration: 2000
        });

        // Set up collisions
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.boss, this.ground);
        this.physics.add.collider(this.possums, this.ground);
        this.physics.add.overlap(this.player, this.boss, this.handleBossCollision, null, this);
        this.physics.add.overlap(this.player, this.possums, this.handlePossumCollision, null, this);

        // Set up camera
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Create bat group
        this.bats = this.physics.add.group();
        
        // Timer for spawning bats (only before stage reveal)
        this.batSpawnTimer = this.time.addEvent({
            delay: 3000,
            callback: () => {
                if (!this.stageRevealed && !this.isRevealSequence && this.bats) {
                    this.spawnBat();
                }
            },
            callbackScope: this,
            loop: true
        });

        // Add collider for bats
        this.physics.add.collider(this.bats, this.ground);
        this.physics.add.overlap(this.player, this.bats, this.handleBatCollision, () => {
            return !this.stageRevealed && !this.isRevealSequence && this.bats && this.bats.getChildren().length > 0;
        }, this);
    }

    spawnPossum() {
        try {
            // Create possum at the right side of the camera view
            const possum = this.possums.create(
                this.cameras.main.scrollX + 900,  // Spawn just off-screen to the right
                450,  // Y position - place on the road
                'possum'
            );
            possum.setVelocityX(-150);  // Move left
            possum.play('possum-walk');
            possum.setScale(1.5);  // Make possum a bit larger
            possum.setDepth(3);  // Same depth as player and boss
            
            // Set up possum physics
            possum.setBounce(0.2);
            possum.setCollideWorldBounds(true);
            
            // Remove possum when it goes off screen to the left
            possum.checkWorldBounds = true;
            possum.outOfBoundsKill = true;

            // Add jumping behavior
            this.time.addEvent({
                delay: 2000,  // Jump every 2 seconds
                callback: () => {
                    if (possum.active && !possum.isDead) {  // Only jump if possum is still alive
                        possum.setVelocityY(-300);  // Jump upward
                    }
                },
                loop: true
            });
        } catch (error) {
            console.error('Error spawning possum:', error);
        }
    }

    handlePossumCollision(player, possum) {
        // Check if player is falling and possum is alive
        if (player.body.velocity.y > 0 && player.y < possum.y && !possum.isDead) {
            // Player is above the possum and moving downward
            this.killPossum(possum);
            // Bounce the player
            player.setVelocityY(-300);
        } else if (!this.isInvulnerable && !possum.isDead) {
            // Player touched the possum from the side or below
            this.takeDamage();
            this.makePlayerInvulnerable();
        }
    }

    killPossum(possum) {
        possum.isDead = true;
        
        // Create burst effect at possum's position
        const burst = this.add.image(possum.x, possum.y, 'burst');
        burst.setScale(0.5);
        
        // Add score
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        // Animate the burst
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

        // Stop possum movement and fade out
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
        
        // Flash red effect
        this.player.setTint(0xff0000);
        
        // Create rapid flashing effect
        this.tweens.add({
            targets: this.player,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 4,
            ease: 'Linear',
            onComplete: () => {
                this.player.setAlpha(1);
                this.player.clearTint();
                this.isInvulnerable = false;
            }
        });
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
            const heart = this.add.image(50 + (i * 40), 50, 'heart');
            heart.setScrollFactor(0);
            heart.setDepth(1000);  // Set very high depth to appear above everything
            heart.setScale(0.5);
            this.hearts.add(heart);
        }
    }

    update() {
        const onGround = this.player.body.touching.down;

        // Update boss health bar position to follow boss
        if (this.boss && !this.boss.isDead) {
            this.updateBossHealthBar();
        }

        // Check for stage reveal
        if (!this.stageRevealed && this.player.x > 4000) {
            this.stageRevealed = true;
            this.revealStage();
        }

        // Allow player movement if not in reveal sequence
        if (!this.isRevealSequence) {
            // Player movement
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-300);
                this.player.setFlipX(true);
                if (onGround) {
                    this.player.play('walk', true);
                }
            } else if (this.cursors.right.isDown && (!this.stageRevealed || this.player.x < 4750)) {
                // Prevent moving past the right edge of the stage during boss fight
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

            // Jump control
            if (this.spaceKey && this.spaceKey.isDown && onGround) {
                this.player.setVelocityY(-400);
            }
        }

        // Only check for falling if not in reveal sequence
        if (!this.isRevealSequence && this.player.y > this.game.config.height) {
            this.takeDamage();
            // Reset player to a safe position
            this.player.setPosition(this.cameras.main.scrollX + 100, 450);
        }
    }

    revealStage() {
        this.isRevealSequence = true;

        // Properly clean up bats without destroying the group
        if (this.batSpawnTimer) {
            this.batSpawnTimer.destroy();
        }
        // Clear all bats but keep the group
        this.bats.clear(true, true);
        
        // Stop player movement immediately but keep their current position
        const playerX = this.player.x;
        const playerY = this.player.y;
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);

        // Lock camera on the stage
        this.cameras.main.stopFollow();
        this.cameras.main.pan(
            4400,
            300,
            2000,
            'Power2',
            true,
            (camera, progress) => {
                if (progress === 1) {
                    // Keep the player in their current position
                    this.player.x = playerX;
                    this.player.y = playerY;

                    // Set fixed bounds for the battle arena
                    this.physics.world.setBounds(4000, 0, 800, 600);
                    this.player.setCollideWorldBounds(true);
                    this.boss.setCollideWorldBounds(true);

                    // Show and start the animal band animation
                    this.animalBand.setVisible(true);
                    this.bandTween.play();

                    // Reposition boss to the right side of the arena
                    this.boss.x = 4700;
                    this.boss.y = 450;

                    // Stop spawning new possums
                    if (this.possumSpawnTimer) {
                        this.possumSpawnTimer.destroy();
                    }

                    // Remove all existing possums
                    this.possums.getChildren().forEach(possum => {
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

                    // Fade out current music
                    this.tweens.add({
                        targets: this.gameMusic,
                        volume: 0,
                        duration: 2000,
                        ease: 'Power2'
                    });

                    // Start boss music
                    this.bossMusicTrack.play();
                    this.tweens.add({
                        targets: this.bossMusicTrack,
                        volume: 0.5,
                        duration: 2000,
                        ease: 'Power2'
                    });

                    // Reveal boss
                    this.tweens.add({
                        targets: [this.boss, this.bossHealthBar],
                        alpha: 1,
                        duration: 1500,
                        ease: 'Power2',
                        onComplete: () => {
                            // Start boss movement
                            this.bossTween.stop();
                            this.bossTween = this.tweens.add({
                                targets: this.boss,
                                x: 4300,
                                duration: 3000,
                                yoyo: true,
                                repeat: -1,
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
                            this.isRevealSequence = false;
                        }
                    });
                }
            }
        );
    }

    handleBossCollision(player, boss) {
        if (!this.stageRevealed || boss.isDead || this.isRevealSequence) return;

        const playerBottom = player.y + (player.height * player.scale) / 2;
        const bossTop = boss.y - (boss.height * boss.scale) / 2;
        const safeHitZone = boss.height * boss.scale * 0.4;

        if (player.body.velocity.y > 0 && playerBottom < bossTop + safeHitZone && !boss.isHurt) {
            this.hitBoss();
            player.setVelocityY(-500);
        } else if (!this.isInvulnerable && !boss.isHurt && playerBottom > bossTop + safeHitZone) {
            this.takeDamage();
            this.makePlayerInvulnerable();
            
            const knockbackDirection = player.x < boss.x ? -1 : 1;
            player.setVelocityX(300 * knockbackDirection);
            player.setVelocityY(-200);
        }
    }

    hitBoss() {
        if (this.boss.isDead || this.boss.isHurt) return;
        
        this.bossHealth--;
        this.updateBossHealthBar();
        
        this.boss.isHurt = true;
        
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
        
        // Draw background
        this.bossHealthBar.fillStyle(0x000000, 0.7);
        this.bossHealthBar.fillRect(this.boss.x - 50, this.boss.y - 80, 100, 10);
        
        // Draw health
        const healthPercentage = this.bossHealth / 7;
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(this.boss.x - 50, this.boss.y - 80, 100 * healthPercentage, 10);
    }

    defeatBoss() {
        if (this.boss.isDead) return;
        
        this.boss.isDead = true;
        this.bossDefeated = true;
        
        if (this.bossTween) {
            this.bossTween.stop();
        }
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

        this.score += 2000; // Bigger bonus for final boss
        this.scoreText.setText('Score: ' + this.score);

        // Create multiple burst effects
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

        // Color cycling sequence
        const colors = [0xffff00, 0x00ff00, 0x0000ff, 0xff00ff, 0xff0000];
        let colorIndex = 0;
        let cycleCount = 0;
        
        const colorTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                if (this.boss && !this.boss.destroyed) {
                    this.boss.setTint(colors[colorIndex]);
                    colorIndex = (colorIndex + 1) % colors.length;
                    cycleCount++;

                    if (cycleCount % 2 === 0) {
                        createBurst(0);
                    }

                    if (cycleCount >= 10) {
                        colorTimer.destroy();
                        
                        for (let i = 0; i < 5; i++) {
                            createBurst(i * 200);
                        }

                        // Add final victory image
                        const finalImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'final');
                        finalImage.setScrollFactor(0);
                        finalImage.setDepth(1000);
                        finalImage.setAlpha(0);
                        
                        // Scale the final image to fit the screen
                        const scaleX = this.cameras.main.width / finalImage.width;
                        const scaleY = this.cameras.main.height / finalImage.height;
                        const scale = Math.min(scaleX, scaleY);
                        finalImage.setScale(scale);

                        // Fade in the final image
                        this.tweens.add({
                            targets: finalImage,
                            alpha: 1,
                            duration: 2000,
                            ease: 'Power2',
                            onComplete: () => {
                                // Wait a moment before transitioning to end scene
                                this.time.delayedCall(1000, () => {
                                    this.scene.start('EndScene', {
                                        score: this.score
                                    });
                                });
                            }
                        });

                        this.tweens.add({
                            targets: this.boss,
                            scaleX: 1.5,
                            scaleY: 0,
                            alpha: 0,
                            duration: 1000,
                            ease: 'Power2',
                            onComplete: () => {
                                if (this.boss) {
                                    this.boss.destroy();
                                }
                                if (this.bossHealthBar) {
                                    this.bossHealthBar.destroy();
                                }
                            }
                        });
                    }
                }
            },
            loop: true
        });
    }

    spawnBat() {
        // Don't spawn if in boss fight or reveal sequence or if bats group is gone
        if (this.stageRevealed || this.isRevealSequence || !this.bats) return;

        // Create bat at the right side of the camera view, at a random height
        const bat = this.bats.create(
            this.cameras.main.scrollX + 900,  // Spawn just off-screen to the right
            Phaser.Math.Between(50, 150),    // Start higher up
            'bat'
        );

        // Set bat properties
        const batDesiredHeight = 80;  // Desired height in pixels
        const batCurrentHeight = this.textures.get('bat').getSourceImage().height;
        const batScale = batDesiredHeight / batCurrentHeight;
        bat.setScale(batScale);
        bat.setBounce(0.2);
        bat.setCollideWorldBounds(true);
        bat.setVelocityX(-200);  // Move left
        bat.setDepth(3);  // Same depth as player and other enemies
        bat.alpha = 1;  // Ensure full opacity

        // Create swooping motion all the way to the ground
        this.tweens.add({
            targets: bat,
            y: 500,  // Swoop almost to the ground
            duration: 2000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        // Remove bat when it goes off screen
        bat.checkWorldBounds = true;
        bat.outOfBoundsKill = true;
    }

    handleBatCollision(player, bat) {
        // Prevent bat collisions during stage reveal or if bat is already dead
        if (bat.isDead || this.isRevealSequence || this.stageRevealed) return;

        const playerBottom = player.y + (player.height * player.scale) / 2;
        const batTop = bat.y - (bat.height * bat.scale) / 2;

        if (player.body.velocity.y > 0 && playerBottom < batTop + 30) {
            // Player is above the bat and moving downward
            this.killBat(bat);
            // Bounce the player
            player.setVelocityY(-300);
        } else if (!this.isInvulnerable) {
            // Player touched the bat from the side or below
            this.takeDamage();
            this.makePlayerInvulnerable();
        }
    }

    killBat(bat) {
        bat.isDead = true;
        
        // Create burst effect
        const burst = this.add.image(bat.x, bat.y, 'burst');
        burst.setScale(0.5);
        
        // Add score
        this.score += 15;  // More points than possums
        this.scoreText.setText('Score: ' + this.score);

        // Drop a heart
        const heart = this.physics.add.sprite(bat.x, bat.y, 'heart');
        heart.setScale(0.4);
        heart.setBounce(0.4);
        heart.setCollideWorldBounds(true);
        heart.setVelocity(Phaser.Math.Between(-100, 100), -200);

        // Add collision with ground for heart
        this.physics.add.collider(heart, this.ground);

        // Add collision with player for heart pickup
        this.physics.add.overlap(this.player, heart, () => {
            if (this.health < 3) {
                this.health++;
                this.updateHealthDisplay();
            }
            heart.destroy();
        }, null, this);

        // Destroy heart after 10 seconds if not collected
        this.time.delayedCall(10000, () => {
            if (heart.active) {
                heart.destroy();
            }
        });

        // Animate the burst
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

        // Stop bat movement and fade out
        bat.setVelocity(0, 0);
        this.tweens.add({
            targets: bat,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                bat.destroy();
            }
        });
    }
} 