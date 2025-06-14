# AshGlide - Infinite Glider Game

![Game Screenshot](screenshot.jpg)

A hyper-addictive infinite gliding game with neon synthwave aesthetics and global leaderboard.

## Features

- Smooth physics-based gameplay
- Neon synthwave visual style with glow effects
- Global leaderboard powered by Firebase
- Multiple color themes (Neon, Ocean, Midnight, Light)
- Zen mode for relaxed gameplay
- Responsive design for all devices

## Setup Instructions

### Firebase Configuration

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Realtime Database with the following security rules:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": "newData.child('score').val() <= 999999"
     }
   }
