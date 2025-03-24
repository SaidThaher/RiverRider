import * as THREE from 'three';

export interface Collidable {
  mesh: THREE.Mesh;
  boundingBox?: THREE.Box3;
  collisionRadius?: number;
  onCollision?: (other: Collidable) => void;
}

export class PhysicsSystem {
  private collidables: Collidable[] = [];
  
  constructor() {}
  
  public addCollidable(collidable: Collidable): void {
    this.collidables.push(collidable);
  }
  
  public removeCollidable(collidable: Collidable): void {
    const index = this.collidables.indexOf(collidable);
    if (index !== -1) {
      this.collidables.splice(index, 1);
    }
  }
  
  public update(): void {
    this.checkCollisions();
  }
  
  private checkCollisions(): void {
    // Update bounding boxes for all collidables
    for (const collidable of this.collidables) {
      if (!collidable.boundingBox) {
        collidable.boundingBox = new THREE.Box3().setFromObject(collidable.mesh);
      } else {
        collidable.boundingBox.setFromObject(collidable.mesh);
      }
    }
    
    // Check for collisions between all pairs of collidables
    for (let i = 0; i < this.collidables.length; i++) {
      const a = this.collidables[i];
      
      for (let j = i + 1; j < this.collidables.length; j++) {
        const b = this.collidables[j];
        
        // Skip if either object doesn't have a bounding box
        if (!a.boundingBox || !b.boundingBox) continue;
        
        // Check for collision
        if (a.boundingBox.intersectsBox(b.boundingBox)) {
          // If both objects have collision handlers, call them
          if (a.onCollision) a.onCollision(b);
          if (b.onCollision) b.onCollision(a);
        }
      }
    }
  }
  
  // Sphere-based collision detection (more efficient for many objects)
  public checkSphereCollisions(): void {
    for (let i = 0; i < this.collidables.length; i++) {
      const a = this.collidables[i];
      if (!a.collisionRadius) continue;
      
      const posA = a.mesh.position;
      
      for (let j = i + 1; j < this.collidables.length; j++) {
        const b = this.collidables[j];
        if (!b.collisionRadius) continue;
        
        const posB = b.mesh.position;
        const distance = posA.distanceTo(posB);
        
        if (distance < (a.collisionRadius + b.collisionRadius)) {
          // Collision detected
          if (a.onCollision) a.onCollision(b);
          if (b.onCollision) b.onCollision(a);
        }
      }
    }
  }
  
  // Ray casting for detecting collisions in front of an object
  public castRay(origin: THREE.Vector3, direction: THREE.Vector3, maxDistance: number = 100): Collidable | null {
    const raycaster = new THREE.Raycaster(origin, direction.normalize(), 0, maxDistance);
    
    const meshes = this.collidables.map(c => c.mesh);
    const intersects = raycaster.intersectObjects(meshes, false);
    
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      return this.collidables.find(c => c.mesh === hitMesh) || null;
    }
    
    return null;
  }
} 