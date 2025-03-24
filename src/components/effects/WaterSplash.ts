import * as THREE from 'three';
import { ParticleSystem, ParticleOptions } from './ParticleSystem';

export class WaterSplash {
  private scene: THREE.Scene;
  private particleSystem: ParticleSystem;
  private active: boolean = false;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    
    // Create particle system for water splash
    const options: ParticleOptions = {
      count: 50,
      size: 0.3,
      color: '#0077be',
      lifetime: 0.8,
      speed: 3.0,
      spread: 0.5,
      gravity: 5.0,
      fadeOut: true
    };
    
    this.particleSystem = new ParticleSystem(scene, options);
  }
  
  public splash(position: THREE.Vector3): void {
    // Emit particles at splash position
    this.particleSystem.emit(position);
    this.active = true;
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