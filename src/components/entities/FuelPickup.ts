import * as THREE from 'three';
import { Collidable } from '../../core/physics';

export class FuelPickup implements Collidable {
  public mesh: THREE.Mesh;
  public boundingBox: THREE.Box3;
  public collisionRadius: number;
  public isActive: boolean = true;
  
  private rotationSpeed: number = 0.01;
  private bobSpeed: number = 0.5;
  private bobHeight: number = 0.2;
  private initialY: number;
  private time: number = 0;
  
  constructor() {
    // Create fuel pickup mesh
    this.mesh = this.createFuelMesh();
    this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    this.collisionRadius = 1;
    this.initialY = this.mesh.position.y;
  }
  
  private createFuelMesh(): THREE.Mesh {
    // Create a group for the fuel pickup
    const group = new THREE.Group();
    
    // Create the fuel tank
    const tankGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    const tankMaterial = new THREE.MeshStandardMaterial({ color: '#ff0000' });
    const tank = new THREE.Mesh(tankGeometry, tankMaterial);
    tank.rotation.x = Math.PI / 2; // Lay the cylinder on its side
    tank.castShadow = true;
    
    // Create the fuel cap
    const capGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 16);
    const capMaterial = new THREE.MeshStandardMaterial({ color: '#333333' });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.set(0, 0, 0.6);
    cap.rotation.x = Math.PI / 2;
    cap.castShadow = true;
    
    // Add a point light to make it glow
    const light = new THREE.PointLight(0xff0000, 1, 3);
    light.position.set(0, 0, 0);
    
    // Add all parts to the group
    group.add(tank, cap, light);
    
    // Create a bounding box for the entire fuel pickup
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Create a mesh for collision detection
    const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const boxMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      visible: false // Make the collision box invisible
    });
    const fuelMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    
    // Add the detailed fuel pickup as a child of the collision box
    fuelMesh.add(group);
    
    // Set initial position
    fuelMesh.position.set(0, 1, 0);
    
    return fuelMesh;
  }
  
  public update(deltaTime: number): void {
    // Rotate the fuel pickup
    this.mesh.rotation.y += this.rotationSpeed;
    
    // Make the fuel pickup bob up and down
    this.time += deltaTime;
    this.mesh.position.y = this.initialY + Math.sin(this.time * this.bobSpeed) * this.bobHeight;
    
    // Update the bounding box
    this.boundingBox.setFromObject(this.mesh);
  }
  
  public onCollision(other: Collidable): void {
    // Handle collision logic in the game scene
    console.log('Fuel pickup collision detected');
  }
  
  public reset(position: THREE.Vector3): void {
    this.mesh.position.copy(position);
    this.initialY = position.y;
    this.boundingBox.setFromObject(this.mesh);
    this.isActive = true;
    this.mesh.visible = true;
  }
  
  public collect(): void {
    this.isActive = false;
    this.mesh.visible = false;
  }
} 