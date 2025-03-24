import * as THREE from 'three';

export interface ParticleOptions {
  count: number;
  size: number;
  color: THREE.Color | string;
  lifetime: number;
  speed: number;
  spread: number;
  gravity: number;
  fadeOut: boolean;
  texture?: THREE.Texture;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  
  private positions: Float32Array;
  private velocities: Float32Array;
  private lifetimes: Float32Array;
  private maxLifetimes: Float32Array;
  
  private count: number;
  private gravity: number;
  private fadeOut: boolean;
  private active: boolean = false;
  
  constructor(scene: THREE.Scene, options: ParticleOptions) {
    this.scene = scene;
    this.count = options.count;
    this.gravity = options.gravity;
    this.fadeOut = options.fadeOut;
    
    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    
    // Create arrays for positions, velocities, and lifetimes
    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    this.lifetimes = new Float32Array(this.count);
    this.maxLifetimes = new Float32Array(this.count);
    
    // Initialize positions and velocities
    for (let i = 0; i < this.count; i++) {
      // Set initial positions to origin
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = 0;
      this.positions[i * 3 + 2] = 0;
      
      // Set random velocities
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = options.speed * (0.5 + Math.random() * 0.5);
      
      this.velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed * options.spread;
      this.velocities[i * 3 + 1] = Math.cos(phi) * speed;
      this.velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed * options.spread;
      
      // Set random lifetimes
      this.maxLifetimes[i] = options.lifetime * (0.7 + Math.random() * 0.6);
      this.lifetimes[i] = this.maxLifetimes[i];
    }
    
    // Set geometry attributes
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    
    // Create material
    const color = options.color instanceof THREE.Color 
      ? options.color 
      : new THREE.Color(options.color);
    
    this.material = new THREE.PointsMaterial({
      color: color,
      size: options.size,
      transparent: true,
      opacity: 1.0,
      vertexColors: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });
    
    // Add texture if provided
    if (options.texture) {
      this.material.map = options.texture;
    }
    
    // Create points
    this.particles = new THREE.Points(this.geometry, this.material);
    this.particles.frustumCulled = false; // Prevent particles from disappearing when out of view
    
    // Don't add to scene yet - wait until emit is called
  }
  
  public emit(position: THREE.Vector3): void {
    // Reset particles
    for (let i = 0; i < this.count; i++) {
      // Reset positions to emission point
      this.positions[i * 3] = position.x;
      this.positions[i * 3 + 1] = position.y;
      this.positions[i * 3 + 2] = position.z;
      
      // Reset lifetimes
      this.lifetimes[i] = this.maxLifetimes[i];
    }
    
    // Update geometry
    this.geometry.attributes.position.needsUpdate = true;
    
    // Add to scene if not already active
    if (!this.active) {
      this.scene.add(this.particles);
      this.active = true;
    }
  }
  
  public update(deltaTime: number): boolean {
    if (!this.active) return false;
    
    let allDead = true;
    
    // Update particles
    for (let i = 0; i < this.count; i++) {
      // Decrease lifetime
      this.lifetimes[i] -= deltaTime;
      
      // Skip dead particles
      if (this.lifetimes[i] <= 0) continue;
      
      allDead = false;
      
      // Update position based on velocity
      this.positions[i * 3] += this.velocities[i * 3] * deltaTime;
      this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * deltaTime;
      this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * deltaTime;
      
      // Apply gravity
      this.velocities[i * 3 + 1] -= this.gravity * deltaTime;
      
      // Fade out if enabled
      if (this.fadeOut) {
        const normalizedLifetime = this.lifetimes[i] / this.maxLifetimes[i];
        this.material.opacity = normalizedLifetime;
      }
    }
    
    // Update geometry
    this.geometry.attributes.position.needsUpdate = true;
    
    // Remove from scene if all particles are dead
    if (allDead) {
      this.scene.remove(this.particles);
      this.active = false;
    }
    
    return this.active;
  }
  
  public dispose(): void {
    if (this.active) {
      this.scene.remove(this.particles);
      this.active = false;
    }
    
    this.geometry.dispose();
    this.material.dispose();
  }
} 