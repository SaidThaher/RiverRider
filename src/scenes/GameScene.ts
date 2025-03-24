import * as THREE from 'three';
import { Engine } from '../core/engine';
import { InputManager } from '../core/input';
import { PhysicsSystem } from '../core/physics';
import { AudioManager } from '../core/audio';
import { Terrain } from '../components/environment/Terrain';
import { Skybox } from '../components/environment/Skybox';
import { Aircraft } from '../components/entities/Aircraft';
import { ObstacleGenerator } from '../components/entities/ObstacleGenerator';
import { FuelPickup } from '../components/entities/FuelPickup';
import { GameUI } from '../components/ui/GameUI';
import { EffectManager } from '../components/effects/EffectManager';

export class GameScene {
  private engine: Engine;
  private inputManager: InputManager;
  private physicsSystem: PhysicsSystem;
  private audioManager: AudioManager;
  private effectManager: EffectManager;
  
  // Use definite assignment assertion to tell TypeScript that these properties
  // will be initialized in the initialize method
  private terrain!: Terrain;
  private skybox!: Skybox;
  private player!: Aircraft;
  private obstacleGenerator!: ObstacleGenerator;
  private gameUI!: GameUI;
  
  private score: number = 0;
  private fuel: number = 100;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;
  private timeOfDay: number = 0.5; // Noon
  
  constructor(engine: Engine) {
    this.engine = engine;
    this.inputManager = new InputManager();
    this.physicsSystem = new PhysicsSystem();
    this.audioManager = new AudioManager(this.engine.getCamera());
    this.effectManager = new EffectManager(this.engine.getScene());
    
    // Initialize scene components
    this.initialize();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set up collision handlers
    this.setupCollisionHandlers();
  }
  
  private initialize(): void {
    const scene = this.engine.getScene();
    
    // Create skybox
    this.skybox = new Skybox();
    scene.add(this.skybox.getMesh());
    
    // Create terrain
    this.terrain = new Terrain(10, 100, 10);
    scene.add(this.terrain.getMesh());
    
    // Create player aircraft
    this.player = new Aircraft();
    scene.add(this.player.mesh);
    
    // Add player to physics system
    this.physicsSystem.addCollidable(this.player);
    
    // Create obstacle generator
    this.obstacleGenerator = new ObstacleGenerator(
      scene,
      this.physicsSystem,
      this.terrain.getRiverWidth(),
      100
    );
    
    // Create game UI
    this.gameUI = new GameUI();
    this.gameUI.updateScore(this.score);
    this.gameUI.updateFuel(this.fuel);
    
    // Set up camera to follow player
    this.setupCamera();
    
    // Load audio assets
    this.loadAudioAssets();
  }
  
  private loadAudioAssets(): void {
    // Note: In a real game, you would have actual audio files
    // For now, we'll just set up the audio manager without actual files
    
    try {
      // Background music
      this.audioManager.loadSound('music', 'assets/audio/background.mp3', {
        loop: true,
        volume: 0.5,
        autoplay: false
      });
      
      // Sound effects
      this.audioManager.loadSound('engine', 'assets/audio/engine.mp3', {
        loop: true,
        volume: 0.3
      });
      
      this.audioManager.loadSound('explosion', 'assets/audio/explosion.mp3', {
        volume: 0.8
      });
      
      this.audioManager.loadSound('splash', 'assets/audio/splash.mp3', {
        volume: 0.6
      });
      
      this.audioManager.loadSound('fuel', 'assets/audio/fuel.mp3', {
        volume: 0.5
      });
      
      // Start background music
      // this.audioManager.playMusic('music');
    } catch (error) {
      console.warn('Failed to load audio assets:', error);
      console.log('Game will continue without audio.');
    }
  }
  
  private setupCamera(): void {
    // Position camera behind and above player
    const camera = this.engine.getCamera();
    camera.position.set(0, 5, 10);
    camera.lookAt(this.player.mesh.position);
  }
  
  private setupEventListeners(): void {
    // Listen for game restart event
    document.addEventListener('restartGame', () => this.restartGame());
    
    // Listen for game resume event
    document.addEventListener('resumeGame', () => this.resumeGame());
    
    // Listen for pause key
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && !this.isGameOver) {
        this.togglePause();
      }
      
      // Toggle mute with 'M' key
      if (event.code === 'KeyM') {
        const isMuted = this.audioManager.toggleMute();
        console.log(`Sound ${isMuted ? 'muted' : 'unmuted'}`);
      }
    });
  }
  
  private setupCollisionHandlers(): void {
    // Override the player's onCollision method to handle collisions
    this.player.onCollision = (other) => {
      if (this.isGameOver) return;
      
      // Check if the collision is with a fuel pickup
      if (other instanceof FuelPickup) {
        this.collectFuel(other as FuelPickup);
      } else {
        // Create explosion effect
        this.effectManager.createExplosion(this.player.mesh.position.clone());
        
        // Play explosion sound
        this.audioManager.playSound('explosion');
        
        // Game over
        this.gameOver('Crashed into an obstacle!');
      }
    };
  }
  
  private collectFuel(fuelPickup: FuelPickup): void {
    // Add fuel to the player
    this.fuel = Math.min(100, this.fuel + 25);
    
    // Update UI
    this.gameUI.updateFuel(this.fuel);
    
    // Play fuel pickup sound
    this.audioManager.playSound('fuel');
    
    // Remove the fuel pickup
    this.obstacleGenerator.collectFuelPickup(fuelPickup);
    
    // Add points for collecting fuel
    this.score += 100;
    this.gameUI.updateScore(this.score);
  }
  
  public update(deltaTime: number): void {
    // Don't update if game is over or paused
    if (this.isGameOver || this.isPaused) return;
    
    // Update player
    this.player.update(deltaTime, this.inputManager);
    
    // Update terrain (scrolling effect)
    this.terrain.update(this.player.getSpeed() * deltaTime);
    
    // Update obstacles
    this.obstacleGenerator.update(this.player.getPosition(), this.player.getSpeed());
    
    // Update physics (collision detection)
    this.physicsSystem.update();
    
    // Update effects
    this.effectManager.update(deltaTime);
    
    // Update audio
    this.audioManager.update(this.engine.getCamera().position);
    
    // Update camera
    this.updateCamera(deltaTime);
    
    // Update game state
    this.updateGameState(deltaTime);
    
    // Update UI
    this.gameUI.updateScore(this.score);
    this.gameUI.updateFuel(this.fuel);
    
    // Update time of day (very slowly)
    this.timeOfDay = (this.timeOfDay + 0.0001) % 1;
    this.skybox.updateTimeOfDay(this.timeOfDay);
    
    // Create water splash effects occasionally when flying low
    if (this.player.mesh.position.y < 2 && Math.random() < 0.05) {
      const splashPosition = new THREE.Vector3(
        this.player.mesh.position.x,
        0.1, // Just above water level
        this.player.mesh.position.z - 2 // Behind the player
      );
      this.effectManager.createWaterSplash(splashPosition);
      
      // Play splash sound
      this.audioManager.playSound('splash');
    }
  }
  
  private updateCamera(deltaTime: number): void {
    // Camera follows player with slight lag
    const camera = this.engine.getCamera();
    const targetPosition = new THREE.Vector3(
      this.player.mesh.position.x * 0.5, // Offset to the side based on player position
      5, // Fixed height
      this.player.mesh.position.z + 10 // Behind player
    );
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPosition, 0.05);
    camera.lookAt(this.player.mesh.position);
  }
  
  private updateGameState(deltaTime: number): void {
    // Increase score based on distance traveled
    this.score += this.player.getSpeed() * 10 * deltaTime;
    
    // Decrease fuel over time
    this.fuel -= deltaTime * 5; // Adjust rate as needed
    
    // Check for game over conditions
    if (this.fuel <= 0) {
      this.gameOver('Out of fuel!');
    }
    
    // Check if player is out of bounds
    const playerPos = this.player.mesh.position;
    const riverWidth = this.terrain.getRiverWidth();
    
    if (Math.abs(playerPos.x) > riverWidth / 2) {
      // Create water splash at crash location
      const splashPosition = new THREE.Vector3(
        playerPos.x,
        0.1, // Just above water level
        playerPos.z
      );
      this.effectManager.createWaterSplash(splashPosition);
      
      // Play splash sound
      this.audioManager.playSound('splash');
      
      this.gameOver('Crashed into the riverbank!');
    }
  }
  
  private gameOver(message: string): void {
    if (this.isGameOver) return;
    
    this.isGameOver = true;
    console.log(`Game Over: ${message} Final Score: ${Math.floor(this.score)}`);
    
    // Stop engine sound
    this.audioManager.stopSound('engine');
    
    // Show game over message
    this.gameUI.showMessage(`Game Over: ${message}\nFinal Score: ${Math.floor(this.score)}`, true);
  }
  
  private restartGame(): void {
    // Reset game state
    this.score = 0;
    this.fuel = 100;
    this.isGameOver = false;
    
    // Reset player
    this.player.setPosition(new THREE.Vector3(0, 1, 0));
    
    // Reset obstacles
    this.obstacleGenerator.reset();
    
    // Reset UI
    this.gameUI.updateScore(this.score);
    this.gameUI.updateFuel(this.fuel);
    this.gameUI.hideMessage();
    
    // Restart engine sound
    this.audioManager.playSound('engine');
  }
  
  private togglePause(): void {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      // Pause engine sound
      this.audioManager.stopSound('engine');
      
      this.gameUI.showPauseMenu();
    } else {
      // Resume engine sound
      this.audioManager.playSound('engine');
      
      this.gameUI.hideMessage();
    }
  }
  
  private resumeGame(): void {
    this.isPaused = false;
    this.gameUI.hideMessage();
    
    // Resume engine sound
    this.audioManager.playSound('engine');
  }
  
  public dispose(): void {
    // Clean up resources
    this.gameUI.destroy();
    this.effectManager.dispose();
    
    // Stop all sounds
    this.audioManager.stopMusic();
    
    // Remove event listeners
    document.removeEventListener('restartGame', () => this.restartGame());
    document.removeEventListener('resumeGame', () => this.resumeGame());
  }
}