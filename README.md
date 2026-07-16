# Movie Project

A responsive, user-friendly movie website where you can discover any movie you want. The project integrates data from the TMDb API, ensuring up-to-date movie content around the clock. It features an intuitive search bar for seamless movie discovery and selection, and leverages Firebase for user authentication, login management, and storage of user watchlists and watch history

Originally started as a fun project in my grade 12 CS class, the project has since undergone significant improvements with the addition of new features and enhancements. It was initially part of a larger private repository, but once the project was mostly completed, I moved it to this dedicated repo

## Features

- **User Authentication:** Secure account creation and login with email or Google, including password reset
- **Watchlist Management:** Registered users can easily add or remove movies from their personal watchlist
- **Watch History:** Mark watchlist movies as watched to build a dated history of everything you've seen
- **Movie Search and Discovery:** Search as you type, browse by genre, filter by year, decade, now playing, or coming soon, and sort by popularity, rating, or release date
- **Detailed Movie Information:** Access comprehensive movie details, including synopsis, release date, genre, cast, runtime, budget, revenue, ratings, trailers, and more — with shareable links to individual movies

## Tech Stack and Tools Used 

- **Framework:** Vue.js (with Pinia and Vue Router)
- **Build Tool:** Vite.js
- **Backend:** Firebase (User Authentication, Login Management, Data Storage, Hosting)
- **Programming Languages:** JavaScript, CSS, HTML
- **APIs:** TMDb API (Movie Data)
- **Utilities:** Postman, Axios

## Getting Started

1. **Clone** the repository and `cd vue-project`
2. **Install** the dependencies using `npm install`
3. **Configure** your Firebase and TMDb keys in a `.env` file inside `vue-project/`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_TMDB_API_KEY=...
```

4. **Run** the development server using `npm run dev`

## Deploying

```sh
npm run build
npx firebase-tools deploy
```

Deploys hosting (from `dist/`) and Firestore rules, per `firebase.json`

## Timeline 

- **May - Jun 2023:** Main development
- **Jul 2023 - Aug 2023:** Refactoring and small bug fixes
- **Sep 2023:** Small improvements and movement to this repository
- **Jan 2024:** Major UI and functionality enhancements and code refactoring
- **Jul 2026:** Major overhaul — Firestore security fix, modernized UI (genre chips, sorting, year/era filters, toasts, accessibility), deep-linkable movie pages, and a pivot from the old cart/checkout flow to Watchlist + Watch History

## Hosted website 

**https://cs12-summative.web.app/**
