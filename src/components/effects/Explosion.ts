import * as THREE from 'three';
import { ParticleSystem, ParticleOptions } from './ParticleSystem';

export class Explosion {
  private scene: THREE.Scene;
  private particleSystem: ParticleSystem;
  private active: boolean = false;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    
    // Create particle system for explosion
    const options: ParticleOptions = {
      count: 100,
      size: 0.5,
      color: '#ff5500',
      lifetime: 1.0,
      speed: 5.0,
      spread: 1.0,
      gravity: 2.0,
      fadeOut: true
    };
    
    this.particleSystem = new ParticleSystem(scene, options);
  }
  
  public explode(position: THREE.Vector3): void {
    // Emit particles at explosion position
    this.particleSystem.emit(position);
    this.active = true;
    
    // Create a point light at explosion position
    const light = new THREE.PointLight(0xff5500, 5, 10);
    light.position.copy(position);
    this.scene.add(light);
    
    // Remove light after a short delay
    setTimeout(() => {
      this.scene.remove(light);
    }, 200);
  }
  
  public update(deltaTime: number): boolean {
    if (!this.active) return false;
    
    // Update particle system
    this.active = this.particleSystem.update(deltaTime);
    
    return this.active;
  }
  
  public dispose(): void {
    this.particleSystem.dispose();
  }
} 