import * as THREE from 'three';

export interface RendererConfig {
  container: HTMLElement;
  width: number;
  height: number;
  antialias?: boolean;
  shadows?: boolean;
  pixelRatio?: number;
}

export class Renderer {
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  
  constructor(config: RendererConfig) {
    this.container = config.container;
    
    // Create WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: config.antialias !== undefined ? config.antialias : true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    
    // Configure renderer
    this.renderer.setSize(config.width, config.height);
    this.renderer.setPixelRatio(config.pixelRatio || window.devicePixelRatio);
    
    // Setup shadows
    if (config.shadows !== false) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    // Add to DOM
    this.container.appendChild(this.renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  private onWindowResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.renderer.setSize(width, height);
  }
  
  public render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }
  
  public setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }
  
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
  
  public dispose(): void {
    this.renderer.dispose();
    
    // Remove from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', () => this.onWindowResize());
  }
} 