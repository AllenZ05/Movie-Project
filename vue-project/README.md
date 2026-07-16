# 123A-Movies

A movie discovery web app. Browse, search, and filter movies from [TMDB](https://www.themoviedb.org/), watch trailers, and save titles to a cart that syncs to your account.

## Tech Stack

- **Frontend:** Vue 3 (Composition API) + Vite, Pinia, Vue Router
- **Backend:** Firebase — Auth (email/password + Google), Cloud Firestore, Hosting
- **Data:** TMDB API via axios

## Project Setup

```sh
npm install
```

Create a `.env` file in the project root:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_TMDB_API_KEY=...
```

### Development

```sh
npm run dev
```

### Production Build

```sh
npm run build
```

### Deploy

```sh
npm run build
npx firebase-tools deploy
```

Deploys hosting (from `dist/`) and Firestore rules/indexes, per `firebase.json`.
