# PRG Trust

PRG Trust is split into a React/Vite frontend and an independent Node.js/Express API.
The frontend only communicates with the backend over HTTP. Cloudflare D1 remains the
database; the Node API uses Cloudflare's D1 REST API.

## Project structure

```text
frontend/
  public/                  Static browser assets
  src/
    api/                   Central HTTP client
    components/            Shared and admin UI
    hooks/                 Browser state and API hooks
    routes/                TanStack Router pages
    assets/                Images and other imported assets
    styles.css
  package.json
backend/
  src/
    config/                Environment and Cloudflare D1 client
    controllers/            HTTP request handlers
    middleware/             Express authentication/error middleware
    models/db/              D1 queries and record mapping
    routes/                 Express API route entry point
    services/               Authentication, storage, event rules, data access
    server.ts
  uploads/                  Server-managed local image uploads
  schema.sql
  package.json
package.json                npm workspace and convenience scripts only
```

## Run locally

1. Install workspace dependencies from the repository root:

   ```sh
   npm install
   ```

2. Configure the backend:

   ```sh
   copy backend/.env.example backend/.env
   ```

   Set `ADMIN_PASSCODE`, a unique `JWT_SECRET` of at least 32 characters, and
   `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, and
   `CLOUDFLARE_API_TOKEN`. The Cloudflare token needs D1 read/write permissions.
   `FRONTEND_URL` should contain the browser frontend origin(s), comma-separated.

3. Configure the frontend if the API is not at the local default:

   ```sh
   copy frontend/.env.example frontend/.env
   ```

   `VITE_API_URL` is the public Express API base URL, including `/api`.

4. Start both applications from the root:

   ```sh
   npm run dev
   ```

   The frontend runs at `http://localhost:5173`; the API runs at
   `http://localhost:5000`.

You may also run either app separately with `npm run dev --workspace=@prgtrust/frontend`
or `npm run dev --workspace=@prgtrust/backend`. Build the frontend with
`npm run build`. Start the backend with `npm start` or
`npm start --workspace=@prgtrust/backend`.

## API overview

- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/verify`
- `GET /api/settings`, `PUT /api/settings`
- `GET /api/background`, `POST /api/background`, `PUT /api/background`,
  `DELETE /api/background/:id`
- `GET|POST /api/gallery`, `GET|PUT|DELETE /api/gallery/:id`
- `GET|POST /api/members`, `GET|PUT|DELETE /api/members/:id`
- `GET|POST /api/events`, `GET|PUT|DELETE /api/events/:id`
- `GET|POST /api/donations`, `GET|PUT|DELETE /api/donations/:id`,
  `POST /api/donations/seed`
- `GET|POST /api/payments`, `GET|PUT /api/payments/:id`
- `POST /api/upload`, `GET /api/images/:key`

The backend calculates each event's `UPCOMING`, `TODAY`, or `COMPLETED` status;
completed events are excluded from the home-page preview and shown on the Events page.
Admin event management and the Events page remain available.

## Storage and secrets

New uploaded images are validated and stored under `backend/uploads` by default;
set `UPLOAD_DIR` to change that location. Existing D1 image records remain readable.
Do not commit either app's `.env` file. Keep Cloudflare API tokens and admin secrets
in backend environment variables only; never use a `VITE_*` variable for a secret.

The obsolete Cloudflare Worker deployment config was removed because the API now runs
as a standalone Node/Express service. Rotate any admin credentials or signing secrets
that were previously stored in that Worker config.
