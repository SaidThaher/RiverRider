import * as THREE from 'three';
import { Collidable, PhysicsSystem } from '../../core/physics';
import { FuelPickup } from './FuelPickup';

export interface Obstacle extends Collidable {
  isActive: boolean;
  reset(position: THREE.Vector3): void;
}

export class Island implements Obstacle {
  public mesh: THREE.Mesh;
  public boundingBox: THREE.Box3;
  public collisionRadius: number;
  public isActive: boolean = true;
  
  constructor(size: number = 1) {
    // Create island mesh
    const geometry = new THREE.CylinderGeometry(size, size * 1.2, 0.5, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xCD853F });
    this.mesh = new THREE.Mesh(geometry, material);
    
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Set up collision properties
    this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    this.collisionRadius = size;
  }
  
  public onCollision(other: Collidable): void {
    // Handle collision logic
    console.log('Island collision detected');
  }
  
  public reset(position: THREE.Vector3): void {
    this.mesh.position.copy(position);
    this.boundingBox.setFromObject(this.mesh);
    this.isActive = true;
  }
}

export class Bridge implements Obstacle {
  public mesh: THREE.Mesh;
  public boundingBox: THREE.Box3;
  public collisionRadius: number;
  public isActive: boolean = true;
  
  constructor(width: number = 10, height: number = 3) {
    // Create bridge group
    const bridgeGroup = new THREE.Group();
    
    // Create bridge deck
    const deckGeometry = new THREE.BoxGeometry(width, 0.5, 2);
    const deckMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = height - 0.25;
    deck.castShadow = true;
    deck.receiveShadow = true;
    
    // Create bridge supports
    const supportGeometry = new THREE.BoxGeometry(0.5, height, 0.5);
    const supportMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    
    const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
    leftSupport.position.set(-width / 2 + 0.5, height / 2, 0);
    leftSupport.castShadow = true;
    leftSupport.receiveShadow = true;
    
    const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
    rightSupport.position.set(width / 2 - 0.5, height / 2, 0);
    rightSupport.castShadow = true;
    rightSupport.receiveShadow = true;
    
    // Add all parts to the bridge group
    bridgeGroup.add(deck, leftSupport, rightSupport);
    
    // Create a bounding box for the entire bridge
    const box = new THREE.Box3().setFromObject(bridgeGroup);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Create a mesh for collision detection
    const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const boxMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      visible: false // Make the collision box invisible
    });
    this.mesh = new THREE.Mesh(boxGeometry, boxMaterial);
    
    // Add the detailed bridge as a child of the collision box
    this.mesh.add(bridgeGroup);
    
    // Set up collision properties
    this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    this.collisionRadius = Math.max(width, height) / 2;
  }
  
  public onCollision(other: Collidable): void {
    // Handle collision logic
    console.log('Bridge collision detected');
  }
  
  public reset(position: THREE.Vector3): void {
    this.mesh.position.copy(position);
    this.boundingBox.setFromObject(this.mesh);
    this.isActive = true;
  }
}

export class ObstacleGenerator {
  private obstacles: Obstacle[] = [];
  private fuelPickups: FuelPickup[] = [];
  private scene: THREE.Scene;
  private physicsSystem: PhysicsSystem;
  private riverWidth: number;
  private spawnDistance: number;
  private obstaclePool: Obstacle[] = [];
  private fuelPickupPool: FuelPickup[] = [];
  private lastFuelSpawnTime: number = 0;
  private fuelSpawnInterval: number = 10; // Seconds between fuel spawns
  private gameTime: number = 0;
  
  constructor(scene: THREE.Scene, physicsSystem: PhysicsSystem, riverWidth: number = 10, spawnDistance: number = 100) {
    this.scene = scene;
    this.physicsSystem = physicsSystem;
    this.riverWidth = riverWidth;
    this.spawnDistance = spawnDistance;
    
    // Initialize obstacle pool
    this.initializeObstaclePool();
    
    // Initialize fuel pickup pool
    this.initializeFuelPickupPool();
  }
  
  private initializeObstaclePool(): void {
    // Create a pool of reusable obstacles
    for (let i = 0; i < 10; i++) {
      // Create islands of different sizes
      const size = 0.5 + Math.random() * 1.5;
      const island = new Island(size);
      island.isActive = false;
      this.obstaclePool.push(island);
      
      // Add to scene but make inactive
      this.scene.add(island.mesh);
      island.mesh.visible = false;
    }
    
    // Add a few bridges
    for (let i = 0; i < 3; i++) {
      const bridge = new Bridge(this.riverWidth, 3 + Math.random() * 2);
      bridge.isActive = false;
      this.obstaclePool.push(bridge);
      
      // Add to scene but make inactive
      this.scene.add(bridge.mesh);
      bridge.mesh.visible = false;
    }
  }
  
  private initializeFuelPickupPool(): void {
    // Create a pool of reusable fuel pickups
    for (let i = 0; i < 5; i++) {
      const fuelPickup = new FuelPickup();
      fuelPickup.isActive = false;
      this.fuelPickupPool.push(fuelPickup);
      
      // Add to scene but make inactive
      this.scene.add(fuelPickup.mesh);
      fuelPickup.mesh.visible = false;
    }
  }
  
  public spawnObstacle(): void {
    // Find an inactive obstacle in the pool
    const inactiveObstacle = this.obstaclePool.find(obstacle => !obstacle.isActive);
    
    if (inactiveObstacle) {
      // Determine spawn position
      let x = 0;
      let y = 0;
      let z = -this.spawnDistance;
      
      if (inactiveObstacle instanceof Island) {
        // Random position within the river
        x = (Math.random() - 0.5) * (this.riverWidth - 2);
        y = 0.25; // Half height of the island
      } else if (inactiveObstacle instanceof Bridge) {
        // Bridges span the entire river
        x = 0;
        y = 0;
      }
      
      // Reset and activate the obstacle
      inactiveObstacle.reset(new THREE.Vector3(x, y, z));
      inactiveObstacle.isActive = true;
      inactiveObstacle.mesh.visible = true;
      
      // Add to active obstacles list
      this.obstacles.push(inactiveObstacle);
      
      // Add to physics system for collision detection
      this.physicsSystem.addCollidable(inactiveObstacle);
    }
  }
  
  public spawnFuelPickup(): void {
    // Find an inactive fuel pickup in the pool
    const inactiveFuelPickup = this.fuelPickupPool.find(pickup => !pickup.isActive);
    
    if (inactiveFuelPickup) {
      // Determine spawn position
      const x = (Math.random() - 0.5) * (this.riverWidth - 2);
      const y = 1.5; // Height above water
      const z = -this.spawnDistance;
      
      // Reset and activate the fuel pickup
      inactiveFuelPickup.reset(new THREE.Vector3(x, y, z));
      inactiveFuelPickup.isActive = true;
      inactiveFuelPickup.mesh.visible = true;
      
      // Add to active fuel pickups list
      this.fuelPickups.push(inactiveFuelPickup);
      
      // Add to physics system for collision detection
      this.physicsSystem.addCollidable(inactiveFuelPickup);
      
      // Update last spawn time
      this.lastFuelSpawnTime = this.gameTime;
    }
  }
  
  public update(playerPosition: THREE.Vector3, speed: number): void {
    // Update game time
    this.gameTime += 0.016; // Approximate for 60fps
    
    // Move obstacles and check if they're out of bounds
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      
      // If obstacle is too far behind the player, recycle it
      if (obstacle.mesh.position.z > playerPosition.z + 20) {
        // Remove from active obstacles
        this.obstacles.splice(i, 1);
        
        // Deactivate
        obstacle.isActive = false;
        obstacle.mesh.visible = false;
        
        // Remove from physics system
        this.physicsSystem.removeCollidable(obstacle);
      }
    }
    
    // Update and check fuel pickups
    for (let i = this.fuelPickups.length - 1; i >= 0; i--) {
      const fuelPickup = this.fuelPickups[i];
      
      // Update fuel pickup animation
      fuelPickup.update(0.016); // Approximate for 60fps
      
      // If fuel pickup is too far behind the player, recycle it
      if (fuelPickup.mesh.position.z > playerPosition.z + 20) {
        // Remove from active fuel pickups
        this.fuelPickups.splice(i, 1);
        
        // Deactivate
        fuelPickup.isActive = false;
        fuelPickup.mesh.visible = false;
        
        // Remove from physics system
        this.physicsSystem.removeCollidable(fuelPickup);
      }
    }
    
    // Spawn new obstacles based on player speed and position
    if (Math.random() < 0.01 * speed && this.obstacles.length < 15) {
      this.spawnObstacle();
    }
    
    // Spawn new fuel pickups at regular intervals
    if (this.gameTime - this.lastFuelSpawnTime > this.fuelSpawnInterval) {
      this.spawnFuelPickup();
    }
  }
  
  public collectFuelPickup(fuelPickup: FuelPickup): void {
    // Remove from active fuel pickups
    const index = this.fuelPickups.indexOf(fuelPickup);
    if (index !== -1) {
      this.fuelPickups.splice(index, 1);
    }
    
    // Deactivate
    fuelPickup.collect();
    
    // Remove from physics system
    this.physicsSystem.removeCollidable(fuelPickup);
  }
  
  public reset(): void {
    // Clear all active obstacles
    for (const obstacle of this.obstacles) {
      obstacle.isActive = false;
      obstacle.mesh.visible = false;
      this.physicsSystem.removeCollidable(obstacle);
    }
    
    // Clear all active fuel pickups
    for (const fuelPickup of this.fuelPickups) {
      fuelPickup.isActive = false;
      fuelPickup.mesh.visible = false;
      this.physicsSystem.removeCollidable(fuelPickup);
    }
    
    this.obstacles = [];
    this.fuelPickups = [];
    this.gameTime = 0;
    this.lastFuelSpawnTime = 0;
  }
} 