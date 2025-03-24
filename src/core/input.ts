export enum KeyState {
  PRESSED,
  RELEASED
}

export class InputManager {
  private keys: Map<string, KeyState>;
  private mousePosition: { x: number, y: number };
  private mouseButtons: Map<number, boolean>;
  
  constructor() {
    this.keys = new Map<string, KeyState>();
    this.mousePosition = { x: 0, y: 0 };
    this.mouseButtons = new Map<number, boolean>();
    
    // Set up event listeners
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
    window.addEventListener('keyup', (event) => this.onKeyUp(event));
    window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    window.addEventListener('mousedown', (event) => this.onMouseDown(event));
    window.addEventListener('mouseup', (event) => this.onMouseUp(event));
  }
  
  private onKeyDown(event: KeyboardEvent): void {
    this.keys.set(event.code, KeyState.PRESSED);
  }
  
  private onKeyUp(event: KeyboardEvent): void {
    this.keys.set(event.code, KeyState.RELEASED);
  }
  
  private onMouseMove(event: MouseEvent): void {
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
  }
  
  private onMouseDown(event: MouseEvent): void {
    this.mouseButtons.set(event.button, true);
  }
  
  private onMouseUp(event: MouseEvent): void {
    this.mouseButtons.set(event.button, false);
  }
  
  public isKeyPressed(keyCode: string): boolean {
    return this.keys.get(keyCode) === KeyState.PRESSED;
  }
  
  public isKeyReleased(keyCode: string): boolean {
    return this.keys.get(keyCode) === KeyState.RELEASED;
  }
  
  public getMousePosition(): { x: number, y: number } {
    return { ...this.mousePosition };
  }
  
  public isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.get(button) === true;
  }
  
  // Normalized coordinates for use with raycasting (-1 to 1)
  public getNormalizedMousePosition(width: number, height: number): { x: number, y: number } {
    return {
      x: (this.mousePosition.x / width) * 2 - 1,
      y: -(this.mousePosition.y / height) * 2 + 1
    };
  }
} 