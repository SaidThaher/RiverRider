import * as THREE from 'three';
import { Explosion } from './Explosion';
import { WaterSplash } from './WaterSplash';

export class EffectManager {
  private scene: THREE.Scene;
  private explosion: Explosion;
  private waterSplash: WaterSplash;
  private activeEffects: { update: (deltaTime: number) => boolean }[] = [];
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.explosion = new Explosion(scene);
    this.waterSplash = new WaterSplash(scene);
  }
  
  public createExplosion(position: THREE.Vector3): void {
    this.explosion.explode(position);
    this.activeEffects.push(this.explosion);
  }
  
  public createWaterSplash(position: THREE.Vector3): void {
    this.waterSplash.splash(position);
    this.activeEffects.push(this.waterSplash);
  }
  
  public update(deltaTime: number): void {
    // Update all active effects and remove inactive ones
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      const isActive = effect.update(deltaTime);
      
      if (!isActive) {
        this.activeEffects.splice(i, 1);
      }
    }
  }
  
  public dispose(): void {
    this.explosion.dispose();
    this.waterSplash.dispose();
    this.activeEffects = [];
  }
} 