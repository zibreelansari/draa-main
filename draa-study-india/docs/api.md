# API connection guide

The React application calls relative `/api` URLs through
`apps/web/src/lib/api.ts`. During development, Vite forwards those requests to
the Express service on `127.0.0.1:5176`. In production, route `/api` to the API
service behind the same HTTPS origin as the frontend.

## Public endpoints

- `GET /api/health`
- `GET /api/catalog/institutes`
- `GET /api/catalog/courses`
- `GET /api/catalog/courses/:slug`
- `POST /api/auth/login`
- `POST /api/auth/register/student`
- `POST /api/auth/register/institute`
- `POST /api/auth/logout`

## Authenticated endpoints

- `GET /api/auth/me` - Student, Institute or Admin
- `GET /api/dashboard` - role-sensitive dashboard summary
- `GET /api/student/applications` - Student only
- `POST /api/student/applications` - Student only

Authentication uses an HTTP-only session cookie. The API hashes the session
token before storing it in SQLite and performs role checks on protected routes.

The development seed provides 18 illustrative programmes across regular,
short-term and skill-based study, plus six demonstration institution profiles.
They are interface and workflow data—not verified DRAA partner listings.

## Environment

Copy `.env.example` to `.env` at the repository root. Database paths are
resolved from that root so the same configuration works with root and workspace
commands.
