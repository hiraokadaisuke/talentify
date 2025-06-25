# Talentify Monorepo

This repository contains a sample backend API and two separate React front‑ends.

## Repository Layout

- `Talentify-backend/` – Node.js + Express API with a MongoDB model.
- `talentify-frontend/` – Create React App project that interacts with the backend.
- `talentify-next-frontend/` – Next.js project using the `app` directory.

Each project has its own `package.json` and dependencies. They can be developed and deployed independently but all assume the backend runs locally on port `5000`.

## Backend Setup

1. Install dependencies:
   ```bash
   cd Talentify-backend
   npm install
   ```

2. Copy `.env.example` to `.env` inside `Talentify-backend` and edit the values:
   ```bash
   cp .env.example .env
   # then update the following variables
   MONGODB_URI=<your Mongo connection string>
   PORT=5000 # optional, defaults to 5000
   ```

3. Start the API server:
   ```bash
   node server.js
   ```

### API Endpoints

- `POST /api/register` - Create a new user account.
- `POST /api/login` - Authenticate and receive a JWT token.
- `GET /api/talents` - Retrieve all registered talents.
- `POST /api/talents` - Add a new talent.
- `GET /api/talents/:id` - Retrieve a talent by its MongoDB `_id` (returns `404` if not found).

## React Frontend

The `talentify-frontend` directory contains a Create React App project.

```bash
cd talentify-frontend
npm install
npm start
```

Copy `.env.example` to `.env` first and ensure `REACT_APP_API_BASE` points to your
backend URL (defaults to `http://localhost:5000`).

This frontend expects the backend API at `http://localhost:5000/api/talents` as referenced in `src/App.js`.

## Next.js Frontend

The `talentify-next-frontend` directory is a Next.js application.

```bash
cd talentify-next-frontend
npm install
npm run dev
```

Before starting, copy `.env.example` to `.env` and set `NEXT_PUBLIC_API_BASE` to
your backend URL (defaults to `http://localhost:5000`).

Like the React app, it communicates with the backend at `http://localhost:5000/api/talents` (see `app/page.js`).

The Next.js app also provides a performer search interface at `/performers` where you can filter and browse registered talents.

## License

This repository is provided under the MIT License. See the [LICENSE](LICENSE) file for details.
