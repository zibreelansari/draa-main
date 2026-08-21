# Security baseline

- Passwords are hashed with Node's salted `scrypt` implementation.
- Session identifiers use 256 bits of randomness and are stored only as SHA-256
  hashes in the database.
- Authentication cookies are HTTP-only and SameSite=Lax. Set
  `SESSION_COOKIE_SECURE=true` behind HTTPS.
- Login and registration endpoints are rate limited.
- Helmet security headers, explicit CORS and request-origin checks are enabled.
- Role authorization is enforced on the server for protected resources.
- Request payloads are validated with shared Zod schemas.

Before accepting real student documents, complete a privacy impact assessment,
data retention policy, consent language, incident plan and independent security
review.
