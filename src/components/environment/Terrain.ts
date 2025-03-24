import * as THREE from 'three';

export class Terrain {
  private terrainGroup: THREE.Group;
  private riverWidth: number;
  private terrainLength: number;
  private segments: number;
  
  constructor(riverWidth: number = 10, terrainLength: number = 100, segments: number = 10) {
    this.terrainGroup = new THREE.Group();
    this.riverWidth = riverWidth;
    this.terrainLength = terrainLength;
    this.segments = segments;
    
    this.initialize();
  }
  
  private initialize(): void {
    this.createRiver();
    this.createRiverBanks();
  }
  
  private createRiver(): void {
    // Create river surface with water-like material
    const riverGeometry = new THREE.PlaneGeometry(this.riverWidth, this.terrainLength, this.segments, this.segments);
    
    // Create a water-like material
    const riverMaterial = new THREE.MeshStandardMaterial({
      color: 0x0077be,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.8
    });
    
    const river = new THREE.Mesh(riverGeometry, riverMaterial);
    river.rotation.x = -Math.PI / 2;
    river.position.y = -0.1; // Slightly below ground level
    river.position.z = -this.terrainLength / 2;
    river.receiveShadow = true;
    
    this.terrainGroup.add(river);
  }
  
  private createRiverBanks(): void {
    // Create river banks (terrain on both sides of the river)
    const bankWidth = 20; // Width of each bank
    const bankGeometry = new THREE.PlaneGeometry(bankWidth, this.terrainLength, this.segments, this.segments);
    
    // Add some random height variation to the banks
    const positionAttribute = bankGeometry.getAttribute('position') as THREE.BufferAttribute;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      
      // Don't modify the edge that connects to the river
      if (Math.abs(vertex.x) > 2) {
        // Add random height variation
        vertex.z += Math.random() * 0.5;
      }
      
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    // Update normals after modifying the geometry
    bankGeometry.computeVertexNormals();
    
    // Create materials for the banks
    const bankMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.8,
      metalness: 0.1
    });
    
    // Left bank
    const leftBank = new THREE.Mesh(bankGeometry.clone(), bankMaterial);
    leftBank.rotation.x = -Math.PI / 2;
    leftBank.position.set(-this.riverWidth / 2 - bankWidth / 2, 0, -this.terrainLength / 2);
    leftBank.receiveShadow = true;
    
    // Right bank
    const rightBank = new THREE.Mesh(bankGeometry.clone(), bankMaterial);
    rightBank.rotation.x = -Math.PI / 2;
    rightBank.position.set(this.riverWidth / 2 + bankWidth / 2, 0, -this.terrainLength / 2);
    rightBank.receiveShadow = true;
    
    this.terrainGroup.add(leftBank, rightBank);
  }
  
  public getMesh(): THREE.Group {
    return this.terrainGroup;
  }
  
  public getRiverWidth(): number {
    return this.riverWidth;
  }
  
  public getTerrainLength(): number {
    return this.terrainLength;
  }
  
  // Method to move the terrain to create infinite scrolling effect
  public update(speed: number): void {
    // Move the entire terrain group forward
    this.terrainGroup.position.z += speed;
    
    // If the terrain has moved past the camera, reset its position
    if (this.terrainGroup.position.z > this.terrainLength / 2) {
      this.terrainGroup.position.z = 0;
    }
  }
} 