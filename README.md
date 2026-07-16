# Movie Project

A responsive, user-friendly website where you can discover any movie or TV show you want. The project integrates data from the TMDb API, ensuring up-to-date content around the clock. It features an intuitive search bar for seamless discovery and selection, and leverages Firebase for user authentication, login management, and storage of user watchlists and watch history

Originally started as a fun project in my grade 12 CS class, the project has since undergone significant improvements with the addition of new features and enhancements. It was initially part of a larger private repository, but once the project was mostly completed, I moved it to this dedicated repo

**Check it out here: https://cs12-summative.web.app/**

## Features

- **User Authentication:** Secure account creation and login with email or Google, including password reset
- **Watchlist Management:** Registered users can easily add or remove movies and TV shows from their personal watchlist
- **Watch History:** Mark watchlist titles as watched to build a dated history of everything you've seen, with personal 5-star ratings
- **Search and Discovery:** Search movies and TV shows as you type, browse by genre, filter by year, decade, now playing, or coming soon, and sort by popularity, rating, or release date
- **Detailed Movie Information:** Access comprehensive movie details, including synopsis, release date, genre, cast, runtime, budget, revenue, ratings, trailers, and more, with shareable links to individual movies

## Tech Stack and Tools Used 

- **Framework:** Vue.js (with Pinia and Vue Router)
- **Build Tool:** Vite.js
- **Backend:** Firebase (User Authentication, Login Management, Data Storage, Hosting)
- **Programming Languages:** JavaScript, CSS, HTML
- **APIs:** TMDb API (Movie Data)
- **Utilities:** Postman, Axios

## Running Locally

The hosted site above is the easiest way to use the app. If you want to run or modify it yourself:

<details>
<summary>Developer setup</summary>

1. **Clone** the repository, `cd vue-project`, and run `npm install`
2. **Configure** your own Firebase and TMDb keys in a `.env` file inside `vue-project/` (the file is gitignored):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_TMDB_API_KEY=...
```

   - **Firebase:** Create a project in the [Firebase Console](https://console.firebase.google.com/) and add a web app to it (the config values are in Project Settings). Enable Email/Password and Google sign-in under Authentication, create a Cloud Firestore database, and deploy the security rules with `npx firebase-tools deploy --only firestore:rules`
   - **TMDb:** Create a free account at [themoviedb.org](https://www.themoviedb.org/) and request an API key under Settings > API

   These are client-side keys, inlined into the bundle at build time. That is safe by design: data access is enforced by the Firestore security rules, not by hiding the config, and TMDb keys are intended for client-side use

3. **Run** `npm run dev` for development, or `npm run build && npx firebase-tools deploy` to build and deploy

Both services are free at this scale: TMDb's API is free for non-commercial use, and Firebase's Spark plan cannot incur charges without a payment method attached

</details>

## Timeline 

- **May - Jun 2023:** Main development
- **Jul 2023 - Aug 2023:** Refactoring and small bug fixes
- **Sep 2023:** Small improvements and movement to this repository
- **Jan 2024:** Major UI and functionality enhancements and code refactoring
- **Jul 2026:** Major overhaul: Firestore security fix, modernized UI (genre chips, sorting, year/era filters, toasts, accessibility), deep-linkable movie pages, a pivot from the old cart/checkout flow to Watchlist + Watch History, TV show support, and personal ratings
