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

2. Create a `.env` file inside `Talentify-backend` with the following variables:
   ```bash
   MONGODB_URI=<your Mongo connection string>
   PORT=5000 # optional, defaults to 5000
   ```

3. Start the API server:
   ```bash
   node server.js
   ```

## React Frontend

The `talentify-frontend` directory contains a Create React App project.

```bash
cd talentify-frontend
npm install
npm start
```

This frontend expects the backend API at `http://localhost:5000/api/talents` as referenced in `src/App.js`.

## Next.js Frontend

The `talentify-next-frontend` directory is a Next.js application.

```bash
cd talentify-next-frontend
npm install
npm run dev
```

Like the React app, it communicates with the backend at `http://localhost:5000/api/talents` (see `app/page.js`).

The Next.js app also provides a performer search interface at `/performers` where you can filter and browse registered talents.

## License

This repository is provided under the MIT License. See the [LICENSE](LICENSE) file for details.
