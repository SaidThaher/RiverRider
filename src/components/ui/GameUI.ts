export class GameUI {
  private container: HTMLElement;
  private scoreElement: HTMLElement;
  private fuelElement: HTMLElement;
  private messageElement: HTMLElement;
  
  constructor() {
    // Create UI container
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.padding = '10px';
    this.container.style.boxSizing = 'border-box';
    this.container.style.fontFamily = 'Arial, sans-serif';
    this.container.style.color = 'white';
    this.container.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
    this.container.style.pointerEvents = 'none'; // Allow clicks to pass through
    
    // Create score display
    this.scoreElement = document.createElement('div');
    this.scoreElement.style.fontSize = '24px';
    this.scoreElement.style.marginBottom = '10px';
    this.scoreElement.textContent = 'Score: 0';
    
    // Create fuel gauge
    this.fuelElement = document.createElement('div');
    this.fuelElement.style.width = '200px';
    this.fuelElement.style.height = '20px';
    this.fuelElement.style.border = '2px solid white';
    this.fuelElement.style.borderRadius = '10px';
    this.fuelElement.style.overflow = 'hidden';
    this.fuelElement.style.marginBottom = '10px';
    
    const fuelBar = document.createElement('div');
    fuelBar.style.width = '100%';
    fuelBar.style.height = '100%';
    fuelBar.style.backgroundColor = '#00ff00';
    fuelBar.style.transition = 'width 0.3s';
    fuelBar.id = 'fuel-bar';
    this.fuelElement.appendChild(fuelBar);
    
    // Create message display (for game over, etc.)
    this.messageElement = document.createElement('div');
    this.messageElement.style.position = 'absolute';
    this.messageElement.style.top = '50%';
    this.messageElement.style.left = '50%';
    this.messageElement.style.transform = 'translate(-50%, -50%)';
    this.messageElement.style.fontSize = '36px';
    this.messageElement.style.fontWeight = 'bold';
    this.messageElement.style.textAlign = 'center';
    this.messageElement.style.display = 'none';
    
    // Add elements to container
    this.container.appendChild(this.scoreElement);
    this.container.appendChild(this.fuelElement);
    this.container.appendChild(this.messageElement);
    
    // Add container to document
    document.body.appendChild(this.container);
  }
  
  public updateScore(score: number): void {
    this.scoreElement.textContent = `Score: ${Math.floor(score)}`;
  }
  
  public updateFuel(fuelPercentage: number): void {
    const fuelBar = document.getElementById('fuel-bar');
    if (fuelBar) {
      fuelBar.style.width = `${Math.max(0, Math.min(100, fuelPercentage))}%`;
      
      // Change color based on fuel level
      if (fuelPercentage > 50) {
        fuelBar.style.backgroundColor = '#00ff00'; // Green
      } else if (fuelPercentage > 25) {
        fuelBar.style.backgroundColor = '#ffff00'; // Yellow
      } else {
        fuelBar.style.backgroundColor = '#ff0000'; // Red
      }
    }
  }
  
  public showMessage(message: string, isGameOver: boolean = false): void {
    this.messageElement.textContent = message;
    this.messageElement.style.display = 'block';
    
    if (isGameOver) {
      // Add restart button for game over
      const restartButton = document.createElement('button');
      restartButton.textContent = 'Restart Game';
      restartButton.style.display = 'block';
      restartButton.style.margin = '20px auto';
      restartButton.style.padding = '10px 20px';
      restartButton.style.fontSize = '18px';
      restartButton.style.backgroundColor = '#4CAF50';
      restartButton.style.color = 'white';
      restartButton.style.border = 'none';
      restartButton.style.borderRadius = '5px';
      restartButton.style.cursor = 'pointer';
      restartButton.style.pointerEvents = 'auto'; // Make button clickable
      
      restartButton.addEventListener('click', () => {
        // Dispatch a custom event that the game can listen for
        const event = new CustomEvent('restartGame');
        document.dispatchEvent(event);
        
        // Hide the message
        this.hideMessage();
      });
      
      this.messageElement.appendChild(restartButton);
    }
  }
  
  public hideMessage(): void {
    this.messageElement.style.display = 'none';
    this.messageElement.innerHTML = ''; // Clear any buttons
  }
  
  public showPauseMenu(): void {
    this.showMessage('Game Paused');
    
    // Add resume button
    const resumeButton = document.createElement('button');
    resumeButton.textContent = 'Resume Game';
    resumeButton.style.display = 'block';
    resumeButton.style.margin = '20px auto';
    resumeButton.style.padding = '10px 20px';
    resumeButton.style.fontSize = '18px';
    resumeButton.style.backgroundColor = '#4CAF50';
    resumeButton.style.color = 'white';
    resumeButton.style.border = 'none';
    resumeButton.style.borderRadius = '5px';
    resumeButton.style.cursor = 'pointer';
    resumeButton.style.pointerEvents = 'auto'; // Make button clickable
    
    resumeButton.addEventListener('click', () => {
      // Dispatch a custom event that the game can listen for
      const event = new CustomEvent('resumeGame');
      document.dispatchEvent(event);
      
      // Hide the message
      this.hideMessage();
    });
    
    this.messageElement.appendChild(resumeButton);
  }
  
  public destroy(): void {
    // Remove UI from document
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
} 