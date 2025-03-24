import * as THREE from 'three';
import { Collidable } from '../../core/physics';

export class Aircraft implements Collidable {
  public mesh: THREE.Mesh;
  public boundingBox: THREE.Box3;
  public collisionRadius: number;
  
  private speed: number = 0;
  private maxSpeed: number = 2;
  private acceleration: number = 0.05;
  private deceleration: number = 0.03;
  private rotationSpeed: number = 0.05;
  
  constructor() {
    // Create a temporary aircraft mesh (will be replaced with a proper model later)
    this.mesh = this.createAircraftMesh();
    this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    this.collisionRadius = 1;
    
    // Set initial position
    this.mesh.position.set(0, 1, 0);
  }
  
  private createAircraftMesh(): THREE.Mesh {
    // Create a group to hold all aircraft parts
    const aircraft = new THREE.Group();
    
    // Create the main body (fuselage)
    const fuselageGeometry = new THREE.CylinderGeometry(0.2, 0.5, 2, 8);
    fuselageGeometry.rotateX(Math.PI / 2);
    const fuselageMaterial = new THREE.MeshStandardMaterial({ color: 0x3366ff });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.castShadow = true;
    
    // Create wings
    const wingGeometry = new THREE.BoxGeometry(3, 0.1, 0.8);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x3366ff });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = 0.1;
    wings.castShadow = true;
    
    // Create tail
    const tailGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.1);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0x3366ff });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.z = -0.9;
    tail.position.y = 0.3;
    tail.castShadow = true;
    
    // Create vertical stabilizer
    const stabilizerGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.6);
    const stabilizerMaterial = new THREE.MeshStandardMaterial({ color: 0x3366ff });
    const stabilizer = new THREE.Mesh(stabilizerGeometry, stabilizerMaterial);
    stabilizer.position.z = -0.9;
    stabilizer.position.y = 0.5;
    stabilizer.castShadow = true;
    
    // Create propeller
    const propellerGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.1);
    const propellerMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
    propeller.position.z = 1.1;
    propeller.castShadow = true;
    
    // Add all parts to the aircraft group
    aircraft.add(fuselage, wings, tail, stabilizer, propeller);
    
    // Convert the group to a mesh for collision detection
    // This is a simplification - in a real game, you'd use the group directly
    // and implement more sophisticated collision detection
    const box = new THREE.Box3().setFromObject(aircraft);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const boxMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3366ff,
      visible: false // Make the collision box invisible
    });
    const aircraftMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    
    // Add the detailed aircraft as a child of the collision box
    aircraftMesh.add(aircraft);
    
    return aircraftMesh;
  }
  
  public update(deltaTime: number, inputManager: any): void {
    // Handle aircraft movement based on input
    if (inputManager.isKeyPressed('KeyW') || inputManager.isKeyPressed('ArrowUp')) {
      // Accelerate
      this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration);
      
      // Tilt the aircraft up slightly
      this.mesh.rotation.x = -Math.PI * 0.05;
    } else if (inputManager.isKeyPressed('KeyS') || inputManager.isKeyPressed('ArrowDown')) {
      // Decelerate
      this.speed = Math.max(0, this.speed - this.deceleration);
      
      // Tilt the aircraft down slightly
      this.mesh.rotation.x = Math.PI * 0.05;
    } else {
      // Return to neutral position
      this.mesh.rotation.x = 0;
      
      // Gradually slow down
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - this.deceleration * 0.5);
      }
    }
    
    // Handle left/right movement
    if (inputManager.isKeyPressed('KeyA') || inputManager.isKeyPressed('ArrowLeft')) {
      // Move left
      this.mesh.position.x -= this.rotationSpeed * this.speed * 10 * deltaTime;
      
      // Bank the aircraft left
      this.mesh.rotation.z = Math.PI * 0.1;
    } else if (inputManager.isKeyPressed('KeyD') || inputManager.isKeyPressed('ArrowRight')) {
      // Move right
      this.mesh.position.x += this.rotationSpeed * this.speed * 10 * deltaTime;
      
      // Bank the aircraft right
      this.mesh.rotation.z = -Math.PI * 0.1;
    } else {
      // Return to level flight
      this.mesh.rotation.z = 0;
    }
    
    // Update the aircraft position based on speed
    this.mesh.position.z -= this.speed * deltaTime * 10;
    
    // Update the bounding box
    this.boundingBox.setFromObject(this.mesh);
  }
  
  public onCollision(other: Collidable): void {
    console.log('Aircraft collision detected!');
    // In a real game, you would implement explosion effects, game over logic, etc.
  }
  
  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
  
  public getSpeed(): number {
    return this.speed;
  }
  
  public setPosition(position: THREE.Vector3): void {
    this.mesh.position.copy(position);
    this.boundingBox.setFromObject(this.mesh);
  }
} 