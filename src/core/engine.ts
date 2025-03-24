import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface EngineConfig {
  containerId: string;
  width: number;
  height: number;
}

export class Engine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private controls: OrbitControls;
  
  // Add onUpdate callback property
  public onUpdate: ((deltaTime: number) => void) | null = null;
  
  constructor(config: EngineConfig) {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, config.width / config.height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.clock = new THREE.Clock();
    
    // Setup renderer
    this.renderer.setSize(config.width, config.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`Container with id '${config.containerId}' not found`);
    }
    container.appendChild(this.renderer.domElement);
    
    // Setup camera
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    
    // Setup controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Add a simple ground plane for testing
    this.addTestGround();
  }
  
  private addTestGround(): void {
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a6e1a,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }
  
  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  public start(): void {
    this.animate();
  }
  
  private animate(): void {
    requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();
    
    // Update controls
    this.controls.update();
    
    // Call the onUpdate callback if it exists
    if (this.onUpdate) {
      this.onUpdate(delta);
    }
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
  
  public getScene(): THREE.Scene {
    return this.scene;
  }
  
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
  
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
} 