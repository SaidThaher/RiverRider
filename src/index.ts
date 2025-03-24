import { Engine } from './core/engine';
import { GameScene } from './scenes/GameScene';

// Wait for the DOM to be fully loaded
window.addEventListener('load', () => {
  // Initialize the game engine
  const engine = new Engine({
    containerId: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Create and initialize the game scene
  const gameScene = new GameScene(engine);
  
  // Start the game loop
  engine.start();
  
  // Update the game scene in the animation loop
  engine.onUpdate = (deltaTime: number) => {
    gameScene.update(deltaTime);
  };
  
  // Log that the game has started
  console.log('River Ride 3D started successfully!');
});