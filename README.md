# AshGlide

AshGlide is a neon-themed infinite glider web game using HTML5 Canvas and Firebase.

## 🔧 Setup

1. Create Firebase project and enable Realtime Database.
2. Paste your Firebase config into `firebase.js`.
3. Adjust Firebase Rules:
```json
{
  "rules": {
    ".read": true,
    ".write": "newData.child('score').val() <= 999999"
  }
}
```

## 🚀 Deploy to Vercel

1. Push all files to GitHub.
2. Go to [vercel.com](https://vercel.com), import your repo.
3. Deploy as a static site.

Enjoy!
