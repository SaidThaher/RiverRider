import * as THREE from 'three';

export class TextureLoader {
  private static instance: TextureLoader;
  private loader: THREE.TextureLoader;
  private textureCache: Map<string, THREE.Texture>;
  
  private constructor() {
    this.loader = new THREE.TextureLoader();
    this.textureCache = new Map();
  }
  
  public static getInstance(): TextureLoader {
    if (!TextureLoader.instance) {
      TextureLoader.instance = new TextureLoader();
    }
    return TextureLoader.instance;
  }
  
  public load(url: string, onLoad?: (texture: THREE.Texture) => void): THREE.Texture {
    // Check if texture is already cached
    if (this.textureCache.has(url)) {
      const texture = this.textureCache.get(url)!;
      if (onLoad) {
        onLoad(texture);
      }
      return texture;
    }
    
    // Load new texture
    const texture = this.loader.load(
      url,
      (loadedTexture) => {
        this.textureCache.set(url, loadedTexture);
        if (onLoad) {
          onLoad(loadedTexture);
        }
      }
    );
    
    return texture;
  }
  
  public loadAsync(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      // Check if texture is already cached
      if (this.textureCache.has(url)) {
        resolve(this.textureCache.get(url)!);
        return;
      }
      
      // Load new texture
      this.loader.load(
        url,
        (texture) => {
          this.textureCache.set(url, texture);
          resolve(texture);
        },
        undefined, // onProgress is not used
        (error) => {
          reject(error);
        }
      );
    });
  }
  
  public getFromCache(url: string): THREE.Texture | undefined {
    return this.textureCache.get(url);
  }
  
  public clearCache(): void {
    this.textureCache.forEach((texture) => {
      texture.dispose();
    });
    this.textureCache.clear();
  }
} 