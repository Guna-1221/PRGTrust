# PRG Trust

PRG Trust is split into a React/Vite frontend and an Express API that can run locally
on Node.js or deploy to Cloudflare Workers. The API uses Cloudflare D1 for application
data and image storage in Workers.

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
    worker.ts               Cloudflare Workers entry point
  wrangler.jsonc            Cloudflare D1 binding
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

## Deploy the backend to Cloudflare Workers

1. Install dependencies from the repository root with `npm install`, then log in:

   ```sh
   npx wrangler login
   ```

   The `CLOUDFLARE_API_TOKEN` currently in `backend/.env` takes precedence over
   OAuth. For OAuth, remove it from `backend/.env` and the shell/Windows
   environment before running `wrangler login`. To deploy with an API token instead,
   it must belong to the configured account and have Workers Scripts Edit and D1
   Edit permissions.

2. Confirm the D1 database configured in `backend/wrangler.jsonc` exists in this
   Cloudflare account. No R2 bucket or R2 billing setup is needed. Worker uploads
   are stored in D1 and are limited to 1 MB per image to stay within D1's row-size
   limit. The D1 free plan includes 500 MB per database, shared by application data
   and images.

3. Set production secrets. Use unique values; `JWT_SECRET` must be at least 32
   characters and `ADMIN_PASSCODE` at least 8 characters:

   ```sh
   npx wrangler secret put ADMIN_PASSCODE --config backend/wrangler.jsonc
   npx wrangler secret put JWT_SECRET --config backend/wrangler.jsonc
   ```

   Set `FRONTEND_URL` as a Worker variable in the Cloudflare dashboard to the
   comma-separated frontend origin(s). Do not put secrets in Wrangler `vars`.

4. Deploy from the repository root:

   ```sh
   npm run worker:deploy --workspace=@prgtrust/backend
   ```

   Test locally with `npm run worker:dev --workspace=@prgtrust/backend`; Wrangler
   loads `backend/.env` for local development. The deployed Worker health endpoint
   is `/health`. Set the frontend's `VITE_API_URL` to the deployed Worker URL ending
   in `/api`, then rebuild and redeploy the frontend.

   If your terminal is already in `backend`, run the secret commands with
   `--config wrangler.jsonc` and deploy with `npm run worker:deploy` (or
   `npx wrangler deploy --config wrangler.jsonc`). Do not prefix the config path
   with `backend/` from that directory.

The Worker login and payment throttles are isolate-local. For rate limits shared
across all Worker instances, also configure Cloudflare's edge rate limiting.

## Deploy the frontend

The frontend is a single-page app. `frontend/wrangler.jsonc` configures Cloudflare's
static asset fallback so direct visits and refreshes on routes such as `/admin` serve
the app's `index.html`.

In the `prgtrust` Workers Builds settings, set the root directory to `/frontend`,
the build command to `npm run build`, the deploy command to
`npx wrangler deploy --config wrangler.jsonc`, and the version command to
`npx wrangler versions upload --config wrangler.jsonc`. Set the production build
variable `VITE_API_URL` to the backend URL ending in `/api`, then save and redeploy
the production branch.

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

For local Node.js runs, new uploaded images are stored under `backend/uploads` by
default; set `UPLOAD_DIR` to change that location. Workers store new images in D1
because the Worker filesystem is not persistent. Existing D1 image records remain
readable. Do not commit either app's `.env` file. Keep Cloudflare API tokens and
admin secrets on the backend only; never use a `VITE_*` variable for a secret.
