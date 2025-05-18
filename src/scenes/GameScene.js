import playerSprite from '../../assets/herowalking.png';
import possumSprite from '../../assets/possum.png';
import heartSprite from '../../assets/heart.png';
import backgroundImage from '../../assets/background 2.png';
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
        
        // Adjust difficulty for level 2
        if (this.level === 2) {
            this.bossHealth = 7; // Make boss harder
            this.possumSpawnDelay = 3000; // Spawn possums faster
        } else {
            this.possumSpawnDelay = 5000; // Normal possum spawn rate
        }
    }

    preload() {
        // Create loading text
        this.loadingText = this.add.text(400, 300, 'Loading...', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.loadingText.setScrollFactor(0);

        // Add loading progress bar
        this.load.on('progress', (value) => {
            this.loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
        });

        try {
            // Load game assets
            this.load.spritesheet('player', playerSprite, {
                frameWidth: 44,
                frameHeight: 48
            });
            this.load.spritesheet('possum', possumSprite, {
                frameWidth: 55,
                frameHeight: 50
            });
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
            // Attempt to reload failed assets
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
            // Create a larger world bounds and set camera bounds
            this.physics.world.setBounds(0, 0, 4800, 600);
            this.cameras.main.setBounds(0, 0, 4800, 600);
            
            // Initialize cursor controls first
            this.cursors = this.input.keyboard.createCursorKeys();
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

            // Increase gravity for snappier jumps
            this.physics.world.gravity.y = 800;

            // Add background with tiling but fixed scrolling
            this.bg = this.add.tileSprite(0, 0, 4800, 600, 'background');
            this.bg.setOrigin(0, 0);
            this.bg.setScrollFactor(1);  // Fixed with the world
            this.bg.width = 4800;  // Ensure width matches world bounds

            // Create invisible ground platform
            this.ground = this.add.rectangle(2400, 550, 4800, 32, 0x000000, 0);
            this.physics.add.existing(this.ground, true);

            // Level-specific setup
            if (this.level === 2) {
                // Start player at a different position for level 2
                this.player = this.physics.add.sprite(100, 450, 'player');
                
                // Add final image for level 2
                this.final = this.add.image(4400, 340, 'final');
                const finalDesiredHeight = 300;
                const finalCurrentHeight = this.textures.get('final').getSourceImage().height;
                const finalScale = finalDesiredHeight / finalCurrentHeight;
                this.final.setScale(finalScale);
                this.final.setScrollFactor(1);

                // Different background tint for level 2
                this.bg.setTint(0xccccff); // Slight blue tint for evening feel
            } else {
                // Level 1 setup
                // Add the sign at the beginning of the level
                this.sign = this.add.image(200, 480, 'sign');
                this.sign.setScale(0.8);
                this.sign.setScrollFactor(1);

                // Add Popworks (first food truck)
                this.popworks = this.add.image(800, 400, 'popworks');
                this.popworks.setScale(0.72);
                this.popworks.setScrollFactor(1);

                // Add Spencer's
                this.spencers = this.add.image(1300, 440, 'spencers');
                this.spencers.setScale(0.72);
                this.spencers.setScrollFactor(1);

                // Add Wrap
                this.wrap = this.add.image(1800, 400, 'wrap');
                this.wrap.setScale(0.72);
                this.wrap.setScrollFactor(1);

                // Add Taco truck
                this.taco = this.add.image(2300, 440, 'taco');
                this.taco.setScale(0.72);
                this.taco.setScrollFactor(1);

                // Add baseball in the field after the food trucks
                this.baseball = this.add.image(2800, 440, 'baseball');
                const baseballDesiredHeight = 240;
                const baseballCurrentHeight = this.textures.get('baseball').getSourceImage().height;
                const baseballScale = baseballDesiredHeight / baseballCurrentHeight;
                this.baseball.setScale(baseballScale);
                this.baseball.setScrollFactor(1);

                // Add booths after the baseball field
                this.booths = this.add.image(3300, 440, 'booths');
                const boothsDesiredHeight = 240;
                const boothsCurrentHeight = this.textures.get('booths').getSourceImage().height;
                const boothsScale = boothsDesiredHeight / boothsCurrentHeight;
                this.booths.setScale(boothsScale);
                this.booths.setScrollFactor(1);

                // Add booth2 after the first booths
                this.booth2 = this.add.image(3800, 440, 'booth2');
                const booth2DesiredHeight = 240;
                const booth2CurrentHeight = this.textures.get('booth2').getSourceImage().height;
                const booth2Scale = booth2DesiredHeight / booth2CurrentHeight;
                this.booth2.setScale(booth2Scale);
                this.booth2.setScrollFactor(1);

                // Add the barn in the background
                this.barn = this.add.image(4400, 340, 'barn');
                const barnDesiredHeight = 300;
                const barnCurrentHeight = this.textures.get('barn').getSourceImage().height;
                const barnScale = barnDesiredHeight / barnCurrentHeight;
                this.barn.setScale(barnScale);
                this.barn.setScrollFactor(1);
                this.barn.setAlpha(1);

                // Create player for level 1
                this.player = this.physics.add.sprite(100, 450, 'player');
            }

            // Calculate scale to make player 100px tall
            const desiredHeight = 100;
            const currentHeight = 48; // Actual height of one frame
            const scale = desiredHeight / currentHeight;
            this.player.setScale(scale);
            this.player.setBounce(0.2);
            this.player.setCollideWorldBounds(true);

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

            // Create possum animation
            this.anims.create({
                key: 'possum-walk',
                frames: this.anims.generateFrameNumbers('possum', { start: 0, end: 1 }),
                frameRate: 6,
                repeat: -1
            });

            // Add boss if in level 1
            if (this.level === 1) {
                // Add boss at the end of the level
                this.boss = this.physics.add.sprite(4500, 450, 'fox');
                const foxDesiredHeight = 200;
                const foxCurrentHeight = this.textures.get('fox').getSourceImage().height;
                const foxScale = foxDesiredHeight / foxCurrentHeight;
                this.boss.setScale(foxScale);
                this.boss.setBounce(0.2);
                this.boss.setCollideWorldBounds(true);
                this.boss.setAlpha(0); // Start invisible

                // Add boss health bar (initially invisible)
                this.bossHealthBar = this.add.graphics();
                this.bossHealthBar.setScrollFactor(1);
                this.bossHealthBar.setAlpha(0);
                this.updateBossHealthBar();

                // Add boss music but don't play yet
                this.bossMusicTrack = this.sound.add('bossMusic', {
                    loop: true,
                    volume: 0
                });

                // Boss movement pattern (initially paused)
                this.bossTween = this.tweens.add({
                    targets: this.boss,
                    x: this.boss.x - 400, // Movement range
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

            // Start the game music with a fade in
            this.gameMusic = this.sound.add('gameMusic', {
                loop: true,
                volume: 0
            });

            if (this.shouldStartMusic) {
                this.gameMusic.play();
                this.tweens.add({
                    targets: this.gameMusic,
                    volume: 0.5,
                    duration: 1000
                });
            }

            // Create possum group
            this.possums = this.physics.add.group();
            this.spawnPossum();

            // Create heart pickups group
            this.heartPickups = this.physics.add.group();

            // Timer for spawning possums
            this.possumSpawnTimer = this.time.addEvent({
                delay: this.possumSpawnDelay,  // Use the new possumSpawnDelay
                callback: this.spawnPossum,
                callbackScope: this,
                loop: true
            });

            // Set up camera to follow player
            this.cameras.main.setBounds(0, 0, 4800, 600);
            this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
            this.cameras.main.setZoom(1);

            // Set up health display
            this.hearts = this.add.group();
            this.updateHealthDisplay();

            // Set up collisions
            this.physics.add.collider(this.player, this.ground);
            this.physics.add.collider(this.possums, this.ground);
            this.physics.add.collider(this.heartPickups, this.ground);
            this.physics.add.collider(this.boss, this.ground);
            this.physics.add.overlap(this.player, this.possums, this.handlePossumCollision, null, this);
            this.physics.add.overlap(this.player, this.heartPickups, this.handleHeartPickup, null, this);
            this.physics.add.overlap(this.player, this.boss, this.handleBossCollision, null, this);

            // Set up score
            this.scoreText = this.add.text(700, 16, 'Score: 0', {
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4,
                align: 'right'
            });
            this.scoreText.setScrollFactor(0);
            this.scoreText.setOrigin(1, 0);

        } catch (error) {
            console.error('Error creating scene:', error);
        }
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

    updateHealthDisplay() {
        // Clear existing hearts
        this.hearts.clear(true, true);
        
        // Add hearts based on current health
        for (let i = 0; i < this.health; i++) {
            const heart = this.add.image(50 + (i * 40), 50, 'heart');
            heart.setScrollFactor(0);
            heart.setScale(0.5);
            this.hearts.add(heart);
        }
    }

    handleHeartPickup(player, heart) {
        if (this.health < 5) { // Maximum 5 hearts
            this.health++;
            this.updateHealthDisplay();
            
            // Create pickup effect
            const sparkle = this.add.image(heart.x, heart.y, 'burst');
            sparkle.setScale(0.3);
            sparkle.setTint(0xffff00);
            
            this.tweens.add({
                targets: sparkle,
                scale: 1,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    sparkle.destroy();
                }
            });
            
            // Play pickup sound if we had one
            // this.sound.play('pickup');
        }
        
        // Destroy the heart pickup
        heart.destroy();
    }

    killPossum(possum) {
        possum.isDead = true;
        
        // Create burst effect at possum's position
        const burst = this.add.image(possum.x, possum.y, 'burst');
        burst.setScale(0.5);  // Start small
        
        // Add score (10 points per possum)
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        // 75% chance to drop a heart
        if (Math.random() < 0.75) {
            const heart = this.heartPickups.create(possum.x, possum.y, 'heart');
            heart.setBounce(0.4);
            heart.setCollideWorldBounds(true);
            heart.setVelocity(Phaser.Math.Between(-100, 100), -200); // Add some random bounce
            heart.setScale(0.4);
            
            // Add a gentle floating animation
            this.tweens.add({
                targets: heart,
                y: heart.y - 10,
                duration: 1000,
                ease: 'Sine.inOut',
                yoyo: true,
                repeat: -1
            });

            // Destroy heart if not collected after 10 seconds
            this.time.delayedCall(10000, () => {
                if (heart.active) {
                    const fadeOut = this.tweens.add({
                        targets: heart,
                        alpha: 0,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            heart.destroy();
                        }
                    });
                }
            });
        }

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
        
        // Change to hurt texture
        const currentScale = this.player.scale;
        this.player.setTexture('herohurt');
        
        // Flash red effect
        this.player.setTint(0xff0000);
        
        // Create rapid flashing effect for first 500ms
        this.playerPulseTween = this.tweens.add({
            targets: this.player,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2,
            ease: 'Linear',
            onComplete: () => {
                this.player.setAlpha(1);
                // Keep the hurt texture visible but stop flashing
                this.player.clearTint();
            }
        });
        
        // Return to normal texture after 1 second
        this.time.delayedCall(1000, () => {
            this.isInvulnerable = false;
            this.player.setTexture('player');
        }, [], this);
    }

    update() {
        try {
            if (!this.cursors || !this.player) {
                console.error('Required game objects not initialized');
                return;
            }

            const onGround = this.player.body.touching.down;

            // Check for boss reveal trigger - adjusted trigger point
            if (!this.bossRevealed && this.player.x > 3800) {
                this.startBossReveal();
            }

            // Only allow player movement if not in reveal sequence
            if (!this.isRevealSequence) {
                // Player movement and animation
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

                // Jump control with spacebar
                if (this.spaceKey && this.spaceKey.isDown && onGround) {
                    this.player.setVelocityY(-400);
                }
            } else {
                // During reveal sequence, keep player still
                this.player.setVelocityX(0);
                this.player.play('idle', true);
            }

            // Update boss health bar and interactions
            if (this.boss && !this.boss.isDead) {
                this.updateBossHealthBar();
                
                // Boss attack pattern - only if reveal sequence is complete
                if (!this.isRevealSequence && Math.abs(this.player.x - this.boss.x) < 300 && Math.random() < 0.01) {
                    this.boss.setVelocityY(-200);
                }
                
                // Check for player hitting boss from above - only if reveal sequence is complete
                if (!this.isRevealSequence && this.physics.overlap(this.player, this.boss)) {
                    // More forgiving hit detection - player just needs to be above the boss's center
                    const playerBottom = this.player.y + this.player.height / 2;
                    const bossTop = this.boss.y - this.boss.height / 3; // More forgiving top area
                    
                    // Player is falling and above the boss's center point
                    if (this.player.body.velocity.y > 0 && playerBottom < this.boss.y && !this.boss.isHurt) {
                        this.hitBoss();
                        // Give the player a bigger bounce for better control
                        this.player.setVelocityY(-500);
                    } else if (!this.isInvulnerable && playerBottom > bossTop && !this.boss.isHurt) {
                        // Only take damage if clearly below the safe hit zone and boss isn't in hurt state
                        this.takeDamage();
                        this.makePlayerInvulnerable();
                    }
                }
            }

            // Check for game over condition (falling too far)
            if (this.player.y > this.game.config.height) {
                this.takeDamage();
                this.player.setPosition(this.cameras.main.scrollX + 100, 450);
            }

            // Clean up and update possums
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

            // Clean up hearts that are too far off screen
            if (this.heartPickups) {
                this.heartPickups.children.iterate((heart) => {
                    if (heart && heart.x < this.cameras.main.scrollX - 200) {
                        heart.destroy();
                    }
                });
            }
        } catch (error) {
            console.error('Error in update:', error);
        }
    }

    takeDamage() {
        if (this.health > 0) {
            this.health--;
            const heartToRemove = this.hearts.getChildren()[this.health];
            if (heartToRemove) {
                heartToRemove.setVisible(false);
            }

            if (this.health === 0) {
                // Stop all music before game over
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

    hitBoss() {
        if (this.boss.isDead || this.boss.isHurt) return;
        
        this.bossHealth--;
        this.updateBossHealthBar();
        
        // Set hurt state and change texture
        this.boss.isHurt = true;
        this.boss.setTexture('foxhurt');
        
        // Create pulsating red effect
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
        
        // Draw background
        this.bossHealthBar.fillStyle(0x000000, 0.7);
        this.bossHealthBar.fillRect(this.boss.x - 50, this.boss.y - 80, 100, 10);
        
        // Draw health
        const healthPercentage = this.bossHealth / 5;
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(this.boss.x - 50, this.boss.y - 80, 100 * healthPercentage, 10);
    }
    
    startBossReveal() {
        if (this.bossRevealed) return;
        this.bossRevealed = true;
        this.isRevealSequence = true;

        // Lock camera to show both the barn and the battle arena
        this.cameras.main.stopFollow();
        this.cameras.main.pan(4200, 300, 2000, 'Power2', true, (camera, progress) => {
            if (progress === 1) {
                // Set fixed bounds for the battle arena - adjusted to include barn
                this.physics.world.setBounds(3800, 0, 800, 600);
                this.player.setCollideWorldBounds(true);
                this.boss.setCollideWorldBounds(true);
                
                // Stop spawning new possums
                if (this.possumSpawnTimer) {
                    this.possumSpawnTimer.destroy();
                }

                // Remove all existing possums with a fade out effect
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

                // Reveal boss with fade in
                this.tweens.add({
                    targets: [this.boss, this.bossHealthBar],
                    alpha: 1,
                    duration: 1500,
                    ease: 'Power2',
                    onComplete: () => {
                        // Start boss movement
                        this.bossTween.resume();
                        
                        // End reveal sequence, allow player movement
                        this.isRevealSequence = false;
                    }
                });
            }
        });
    }

    defeatBoss() {
        if (this.bossDefeated) return;
        this.bossDefeated = true;

        // Stop boss music and fade in victory music
        if (this.bossMusic && this.bossMusic.isPlaying) {
            this.tweens.add({
                targets: this.bossMusic,
                volume: 0,
                duration: 1000,
                onComplete: () => {
                    this.bossMusic.stop();
                }
            });
        }

        // Create victory effects
        this.createConfetti();
        
        // Fade to black after a delay
        this.time.delayedCall(3000, () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            
            this.cameras.main.once('camerafadeoutcomplete', () => {
                // If this is level 1, go to level 2
                if (this.level === 1) {
                    this.scene.start('GameScene', {
                        startMusic: true,
                        health: this.health,
                        score: this.score,
                        level: 2
                    });
                } else {
                    // If this is level 2, go to end scene
                    this.scene.start('EndScene', {
                        score: this.score
                    });
                }
            });
        });
    }

    createConfetti() {
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        const confettiCount = 50;
        const confettiParticles = [];

        // Create initial batch of confetti
        for (let i = 0; i < confettiCount; i++) {
            this.createConfettiParticle(colors, confettiParticles);
        }

        // Continuously check and replenish confetti
        this.time.addEvent({
            delay: 100,
            callback: () => {
                // Remove destroyed particles from array
                for (let i = confettiParticles.length - 1; i >= 0; i--) {
                    if (!confettiParticles[i].active) {
                        confettiParticles.splice(i, 1);
                    }
                }

                // Add new particles to maintain the count
                while (confettiParticles.length < confettiCount) {
                    this.createConfettiParticle(colors, confettiParticles);
                }
            },
            loop: true
        });
    }

    createConfettiParticle(colors, particleArray) {
        const x = Phaser.Math.Between(0, this.game.config.width);
        const y = -20;
        const color = Phaser.Utils.Array.GetRandom(colors);
        
        const particle = this.add.rectangle(x, y, 10, 10, color);
        particle.setScrollFactor(0);
        particle.setDepth(1002);
        particle.setAlpha(0.8);
        
        // Random rotation
        particle.angle = Phaser.Math.Between(0, 360);
        
        // Add falling and spinning animation
        this.tweens.add({
            targets: particle,
            y: this.game.config.height + 20,
            angle: particle.angle + Phaser.Math.Between(180, 360),
            duration: Phaser.Math.Between(4000, 6000),
            ease: 'Linear',
            onComplete: () => {
                particle.destroy();
            }
        });
        
        // Add swaying motion
        this.tweens.add({
            targets: particle,
            x: particle.x + Phaser.Math.Between(-100, 100),
            duration: Phaser.Math.Between(2000, 3000),
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        particleArray.push(particle);
        return particle;
    }

    shutdown() {
        try {
            // Clean up all timers
            this.time.removeAllEvents();
            
            // Stop all tweens
            this.tweens.killAll();
            
            // Stop all music
            if (this.gameMusic && this.gameMusic.isPlaying) {
                this.gameMusic.stop();
            }
            if (this.bossMusicTrack && this.bossMusicTrack.isPlaying) {
                this.bossMusicTrack.stop();
            }
            
            // Destroy groups
            if (this.possums) this.possums.destroy(true);
            if (this.hearts) this.hearts.destroy(true);
            if (this.heartPickups) this.heartPickups.destroy(true);
            
            // Remove all event listeners
            this.input.keyboard.shutdown();
            
            // Clear any remaining physics
            this.physics.world.shutdown();
            
        } catch (error) {
            console.error('Error during shutdown:', error);
        }
    }

    handleBossCollision(player, boss) {
        if (!this.bossRevealed || boss.isDead || this.isRevealSequence) return;

        // Calculate the collision points more accurately
        const playerBottom = player.y + (player.height * player.scale) / 2;
        const bossTop = boss.y - (boss.height * boss.scale) / 2;
        const safeHitZone = boss.height * boss.scale * 0.4; // More generous hit zone from above

        // Player is above the boss and falling
        if (player.body.velocity.y > 0 && playerBottom < bossTop + safeHitZone && !boss.isHurt) {
            this.hitBoss();
            player.setVelocityY(-500); // Bigger bounce off boss
        } else if (!this.isInvulnerable && !boss.isHurt && playerBottom > bossTop + safeHitZone) {
            this.takeDamage();
            this.makePlayerInvulnerable();
            
            // Knock player back
            const knockbackDirection = player.x < boss.x ? -1 : 1;
            player.setVelocityX(300 * knockbackDirection);
            player.setVelocityY(-200);
        }
    }
} 