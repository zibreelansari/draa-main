# DRAA Study in India

Standalone demonstration frontend for DRAA's international education portal.
It is intentionally separate from `draa-frontend` and has its own dependencies,
assets, source code, build output and development server.

## Local development

```bash
npm install
npm run dev
```

The portal runs on `http://localhost:5175` by default. The DRAA corporate app
uses `VITE_STUDY_INDIA_URL` to open this portal in a new browser tab.

## Production domain

A recommended deployment address is `https://study.draa.in`. Configure DNS and
hosting separately, then set this in the corporate frontend environment:

```text
VITE_STUDY_INDIA_URL=https://study.draa.in
```

## Important

This is an independent DRAA demonstration portal. It is not affiliated with or
operated by the Government of India's Study in India programme. Official
applications, visas and FRRO services must use authorised government systems.
