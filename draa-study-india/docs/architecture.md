# Platform architecture

## Applications

The React web application communicates with the Express API through `/api`.
Vite proxies API calls to port 5176 during development. Production hosting
should place both behind one HTTPS origin or an explicitly configured trusted
origin.

## Roles

- `STUDENT`: course discovery, profile and application access
- `INSTITUTE`: institution onboarding and future course/application management
- `ADMIN`: platform administration and approval oversight

Role restrictions are checked by API middleware for every protected endpoint.
Removing menu items is not considered an authorization control.

## Database

The local implementation uses SQLite in WAL mode with foreign keys enabled.
Tables cover users, profiles, sessions, institutions, courses, applications and
audit logs. The repository boundary in `packages/database` allows a future
PostgreSQL adapter without coupling database code to React.

## Next production modules

1. Document storage with malware scanning and restricted signed URLs
2. Email verification, password reset and optional MFA for administrators
3. Institute approval, course publishing and student document review workflows
4. Application status history and notifications
5. PostgreSQL deployment, backups, retention policies and observability
