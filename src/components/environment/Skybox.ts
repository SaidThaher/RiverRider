import * as THREE from 'three';

export class Skybox {
  private skyboxMesh: THREE.Mesh;
  
  constructor() {
    this.skyboxMesh = this.createSkybox();
  }
  
  private createSkybox(): THREE.Mesh {
    // Create a large sphere for the sky
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    // Flip the geometry inside out
    geometry.scale(-1, 1, 1);
    
    // Create a gradient material for the sky
    const uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };
    
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `;
    
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide
    });
    
    return new THREE.Mesh(geometry, material);
  }
  
  public getMesh(): THREE.Mesh {
    return this.skyboxMesh;
  }
  
  // Method to update the sky colors based on time of day
  public updateTimeOfDay(timeOfDay: number): void {
    // timeOfDay should be a value between 0 and 1 (0 = midnight, 0.5 = noon, 1 = midnight again)
    const material = this.skyboxMesh.material as THREE.ShaderMaterial;
    
    if (timeOfDay < 0.25) {
      // Night to dawn
      const t = timeOfDay / 0.25;
      material.uniforms.topColor.value.setRGB(
        0.0 * (1 - t) + 0.3 * t,
        0.0 * (1 - t) + 0.5 * t,
        0.3 * (1 - t) + 0.8 * t
      );
      material.uniforms.bottomColor.value.setRGB(
        0.0 * (1 - t) + 0.5 * t,
        0.0 * (1 - t) + 0.6 * t,
        0.2 * (1 - t) + 0.7 * t
      );
    } else if (timeOfDay < 0.5) {
      // Dawn to noon
      const t = (timeOfDay - 0.25) / 0.25;
      material.uniforms.topColor.value.setRGB(
        0.3 * (1 - t) + 0.0 * t,
        0.5 * (1 - t) + 0.7 * t,
        0.8 * (1 - t) + 1.0 * t
      );
      material.uniforms.bottomColor.value.setRGB(
        0.5 * (1 - t) + 0.9 * t,
        0.6 * (1 - t) + 0.9 * t,
        0.7 * (1 - t) + 1.0 * t
      );
    } else if (timeOfDay < 0.75) {
      // Noon to dusk
      const t = (timeOfDay - 0.5) / 0.25;
      material.uniforms.topColor.value.setRGB(
        0.0 * (1 - t) + 0.8 * t,
        0.7 * (1 - t) + 0.3 * t,
        1.0 * (1 - t) + 0.3 * t
      );
      material.uniforms.bottomColor.value.setRGB(
        0.9 * (1 - t) + 1.0 * t,
        0.9 * (1 - t) + 0.6 * t,
        1.0 * (1 - t) + 0.3 * t
      );
    } else {
      // Dusk to night
      const t = (timeOfDay - 0.75) / 0.25;
      material.uniforms.topColor.value.setRGB(
        0.8 * (1 - t) + 0.0 * t,
        0.3 * (1 - t) + 0.0 * t,
        0.3 * (1 - t) + 0.3 * t
      );
      material.uniforms.bottomColor.value.setRGB(
        1.0 * (1 - t) + 0.0 * t,
        0.6 * (1 - t) + 0.0 * t,
        0.3 * (1 - t) + 0.2 * t
      );
    }
  }
} 