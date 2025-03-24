# River Ride 3D

A 3D remake of the classic River Raid game using Three.js and TypeScript.

## Overview

River Ride 3D is a modern take on the classic Atari 2600 game River Raid. The player controls an aircraft flying over a river, avoiding obstacles like islands and bridges while collecting fuel to keep going.

## Features

- 3D graphics using Three.js
- Procedurally generated river and obstacles
- Physics-based collision detection
- Dynamic skybox with time-of-day changes
- Fuel management system
- Score tracking
- Game over and pause screens

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/river-ride-3d.git
   cd river-ride-3d
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:8080`

### Building for Production

To build the project for production:

```
npm run build
```

The built files will be in the `dist` directory.

## Controls

- **W / Up Arrow**: Accelerate
- **S / Down Arrow**: Decelerate
- **A / Left Arrow**: Move left
- **D / Right Arrow**: Move right
- **Escape**: Pause game

## Project Structure

```
river-ride-3d/
├── src/
│   ├── assets/           # Game assets (3D models, textures, audio)
│   ├── components/       # Reusable game components
│   │   ├── environment/  # Terrain, water, sky components
│   │   ├── entities/     # Player, obstacles, enemies
│   │   ├── effects/      # Particle systems, post-processing
│   │   └── ui/           # HUD, menus, overlays
│   ├── core/             # Core game systems
│   │   ├── engine.ts     # Main game engine
│   │   ├── input.ts      # Input handling
│   │   ├── physics.ts    # Physics integration
│   │   └── renderer.ts   # Rendering pipeline
│   ├── scenes/           # Game scenes/levels
│   ├── services/         # API services (Supabase client, etc.)
│   ├── utils/            # Helper functions
│   └── index.ts          # Main entry point
├── public/               # Static files
├── dist/                 # Build output
├── tests/                # Test directory
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
├── webpack.config.js     # Webpack configuration
└── README.md             # Documentation
```

## Future Enhancements

- Add more obstacle types
- Implement enemy boats and aircraft
- Add weapon systems
- Create multiple environment themes (canyon, arctic, tropical)
- Implement power-ups
- Add mobile touch controls
- Integrate with Supabase for online leaderboards

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original River Raid game by Activision
- Three.js for 3D rendering
- TypeScript for type safety 