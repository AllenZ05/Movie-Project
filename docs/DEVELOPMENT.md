# Development guide

These instructions are for working on the code. To use the app, visit [123amovies.web.app](https://123amovies.web.app/).

## Local setup

1. Clone the repository, open `vue-project/`, and run `npm install`.
2. Create a `.env` file inside `vue-project/` with your Firebase web-app configuration and TMDB API key:

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_TMDB_API_KEY=...
```

For your own instance, create a project in the [Firebase Console](https://console.firebase.google.com/), register a web app, enable Email/Password and Google sign-in, and create a Cloud Firestore database. Deploy the repository’s Firestore rules to your project from `vue-project/`:

```bash
npx firebase-tools deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
```

Obtain a TMDB API key through your [TMDB account settings](https://www.themoviedb.org/settings/api).

3. Run `npm run dev` to start the local development server.

The `.env` file is gitignored. Vite includes these client configuration values in the browser bundle; access to library data is enforced by Firestore security rules.

## Verification

From `vue-project/`:

- `npm test` checks library transactions, concurrent saves, undo, authentication readiness, redirects, filters, sorting, and rating-count preservation. Firebase services use test doubles, so the tests do not access live accounts.
- `npm run build` creates the production site in `dist/`.

For changes to sign-in or library persistence, also verify sign-in, saving, rating, and reloading with a test account against the intended Firebase project.

## Publishing the maintained site

The following command is for the project maintainer. From `vue-project/`, run:

```bash
npm run build && npx firebase-tools deploy --only hosting:movies --project cs12-summative
```

The `movies` target in `.firebaserc` points to Hosting site `123amovies`. Its Firebase project remains `cs12-summative`, which contains the existing accounts and saved libraries. The command publishes the new site; the old Hosting site keeps its last release.

In Firebase Console → Authentication → Settings → Authorized domains, ensure `123amovies.web.app` and `123amovies.firebaseapp.com` are listed for Google sign-in.

If deploying your own instance, configure `.firebaserc` for your own project and Hosting site, use that project ID in the deployment command, and authorize your own domains.

README and documentation changes only need a Git commit and push. Changes to the website need a build and Hosting deployment.
