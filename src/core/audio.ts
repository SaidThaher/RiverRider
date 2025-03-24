import * as THREE from 'three';

export interface AudioConfig {
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
}

export class AudioManager {
  private listener: THREE.AudioListener;
  private sounds: Map<string, THREE.Audio | THREE.PositionalAudio>;
  private musicTrack: THREE.Audio | null = null;
  private masterVolume: number = 1.0;
  private sfxVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private muted: boolean = false;
  private audioEnabled: boolean = true;
  
  constructor(camera: THREE.Camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    this.sounds = new Map();
    
    // Check if audio is supported
    try {
      // Test audio context creation
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContext.close();
    } catch (error) {
      console.warn('WebAudio not supported:', error);
      this.audioEnabled = false;
    }
  }
  
  public loadSound(name: string, url: string, config: AudioConfig = {}): void {
    if (!this.audioEnabled) {
      console.log(`Audio disabled, skipping loading of ${name}`);
      return;
    }
    
    const audioLoader = new THREE.AudioLoader();
    const sound = new THREE.Audio(this.listener);
    
    audioLoader.load(
      url, 
      (buffer) => {
        sound.setBuffer(buffer);
        sound.setVolume(config.volume || 1.0);
        sound.setLoop(config.loop || false);
        
        this.sounds.set(name, sound);
        
        if (config.autoplay) {
          this.playSound(name);
        }
      },
      // onProgress callback
      (xhr) => {
        console.log(`${name} ${(xhr.loaded / xhr.total * 100)}% loaded`);
      },
      // onError callback
      (error) => {
        console.warn(`Error loading sound ${name}:`, error);
      }
    );
  }
  
  public loadPositionalSound(name: string, url: string, position: THREE.Vector3, config: AudioConfig = {}): void {
    if (!this.audioEnabled) {
      console.log(`Audio disabled, skipping loading of ${name}`);
      return;
    }
    
    const audioLoader = new THREE.AudioLoader();
    const sound = new THREE.PositionalAudio(this.listener);
    
    audioLoader.load(
      url,
      (buffer) => {
        sound.setBuffer(buffer);
        sound.setVolume(config.volume || 1.0);
        sound.setLoop(config.loop || false);
        sound.setRefDistance(20);
        sound.position.copy(position);
        
        this.sounds.set(name, sound);
        
        if (config.autoplay) {
          this.playSound(name);
        }
      },
      // onProgress callback
      (xhr) => {
        console.log(`${name} ${(xhr.loaded / xhr.total * 100)}% loaded`);
      },
      // onError callback
      (error) => {
        console.warn(`Error loading sound ${name}:`, error);
      }
    );
  }
  
  public playSound(name: string): void {
    if (!this.audioEnabled) return;
    
    const sound = this.sounds.get(name);
    if (sound && !sound.isPlaying && !this.muted) {
      try {
        sound.play();
      } catch (error) {
        console.warn(`Error playing sound ${name}:`, error);
      }
    }
  }
  
  public stopSound(name: string): void {
    const sound = this.sounds.get(name);
    if (sound && sound.isPlaying) {
      sound.stop();
    }
  }
  
  public playMusic(name: string): void {
    // Stop current music if playing
    if (this.musicTrack && this.musicTrack.isPlaying) {
      this.musicTrack.stop();
    }
    
    const music = this.sounds.get(name);
    if (music && !this.muted) {
      music.setLoop(true);
      music.setVolume(this.musicVolume * this.masterVolume);
      music.play();
      this.musicTrack = music as THREE.Audio;
    }
  }
  
  public stopMusic(): void {
    if (this.musicTrack && this.musicTrack.isPlaying) {
      this.musicTrack.stop();
    }
  }
  
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }
  
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }
  
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicTrack) {
      this.musicTrack.setVolume(this.musicVolume * this.masterVolume);
    }
  }
  
  public toggleMute(): boolean {
    this.muted = !this.muted;
    
    if (this.muted) {
      // Pause all sounds
      this.sounds.forEach(sound => {
        if (sound.isPlaying) {
          sound.pause();
        }
      });
    } else {
      // Resume music if it was playing
      if (this.musicTrack) {
        this.musicTrack.play();
      }
    }
    
    return this.muted;
  }
  
  private updateVolumes(): void {
    this.sounds.forEach((sound, name) => {
      // Don't adjust music volume here, it's handled separately
      if (sound !== this.musicTrack) {
        sound.setVolume(this.sfxVolume * this.masterVolume);
      }
    });
    
    if (this.musicTrack) {
      this.musicTrack.setVolume(this.musicVolume * this.masterVolume);
    }
  }
  
  public update(cameraPosition: THREE.Vector3): void {
    // Update listener position if needed
    this.listener.position.copy(cameraPosition);
  }
} 