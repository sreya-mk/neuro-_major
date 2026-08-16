# neuro-_major

Simple Node/Express backend to serve the existing static site and provide basic API endpoints.

Run locally:

```bash
npm install
npm run dev   # requires nodemon (dev) or
npm start
```

Endpoints:
- `GET /` serves the static files (`index.html`, etc.)
- `GET /api/profile` sample profile JSON
- `GET /api/learning` learning resources JSON
- `GET /api/interview` interview questions JSON
- `POST /api/submit` echoes posted JSON
