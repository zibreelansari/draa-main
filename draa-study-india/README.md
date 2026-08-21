# DRAA Study in India Platform

Independent full-stack international education portal operated by DRAA (OPC)
Private Limited. The user experience is inspired by the clear journey structure
of the public Study in India service, while using DRAA branding, content,
infrastructure and access rules.

## Workspace structure

- `apps/web` — React/Vite public portal, authentication and role dashboards
- `apps/api` — Express API, session security and role authorization
- `packages/shared` — shared roles, schemas and TypeScript contracts
- `packages/database` — SQLite schema, migrations and repository functions
- `data` — local development database files (ignored by Git)
- `docs` — architecture and security documentation

The public portal includes DRAA-adapted guidance pages, programme and
institution discovery, catalogue filters and individual programme details.
Seeded catalogue entries are clearly identified as demonstration data and must
be replaced with verified institutional records before launch.

## Run locally

```bash
npm install
npm run dev
```

Optional configuration can be created by copying `.env.example` to `.env`.
See `docs/api.md` for the frontend-to-backend connection contract.

- Website: `http://localhost:5175`
- API: `http://127.0.0.1:5176`

## Demo accounts

- Student: `student@demo.draa.in` / `Student@123`
- Institute: `institute@demo.draa.in` / `Institute@123`
- Admin: `admin@demo.draa.in` / `Admin@123`

These accounts are created only when `DEV_SEED` is not set to `false`. Replace
all demo credentials and enable secure cookies before production deployment.

## Production domain

The recommended deployment address is `https://study.draa.in`. Set the DRAA
corporate website's `VITE_STUDY_INDIA_URL` to that address after deployment.

## Important notice

This is not the Government of India Study in India portal. DRAA does not issue
visas, complete FRRO decisions or represent government authorities. Official
processes must use current authorised systems.
