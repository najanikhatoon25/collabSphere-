# CollabSphere frontend

React and Vite frontend for the existing CollabSphere API.

## Run locally

1. Start the backend on port `5000`.
2. From this folder, install the declared frontend dependencies:

   ```sh
   npm install
   ```

3. Start the Vite development server:

   ```sh
   npm run dev
   ```

The backend currently allows credentialed requests from `http://localhost:5173`.
The shared API client uses `http://localhost:5000/api` by default. To use a
different API base, create a local `.env` file in this folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Keep `/api` in the configured URL. API requests include browser credentials so
the backend can set and receive its HttpOnly authentication cookie. The
frontend does not read or store the authentication token.

## Available scripts

- `npm run dev` starts the local development server.
- `npm run build` creates the production build in `dist/`.
- `npm run lint` checks the frontend with ESLint.

Registration currently depends on a backend fix: the registration controller
returns a server error after creating the account. The frontend shows the API
error and does not report a successful registration.
