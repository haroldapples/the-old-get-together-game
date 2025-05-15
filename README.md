# The Old Get Together

A 90s-style side-scrolling game inspired by classic Konami titles like Turtles in Time and Sunset Riders.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:8080`

## Game Controls
- Left Arrow: Move left
- Right Arrow: Move right
- Spacebar: Jump

## Game Features
- Classic 90s-style pixel art graphics
- Original soundtrack
- Side-scrolling gameplay
- Multiple enemy types
- Boss battle
- Authentic retro sound effects

## Project Structure
```
├── src/
│   ├── scenes/         # Game scenes (Title, Game, End)
│   ├── sprites/        # Character and enemy sprites
│   ├── index.js        # Main game configuration
│   └── index.html      # HTML template
├── Assets/             # Game assets (music, images)
└── dist/              # Built files (generated)
```

## Development
The game is built using Phaser 3 and modern JavaScript. It uses webpack for bundling and development. 