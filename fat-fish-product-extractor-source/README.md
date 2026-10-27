# Product Scraper Dashboard

A retrospective-style product data extraction dashboard, presented with a restrained 2018–2019-era admin UI aesthetic and modern maintainable source code. with a Node.js/Express API for extracting product data from **public e-commerce pages that you are permitted to access**.

## Features
- Paste a product/category page URL and request extraction.
- Extract product name, price, currency, availability, image URL, and product URL from common JSON-LD `Product` / `Offer` markup, with conservative HTML metadata fallbacks.
- Review results in a searchable table.
- Export results as CSV or JSON.
- Demo mode supplies sample products without making external requests.
- Basic SSRF protections: only HTTP(S), blocks localhost/private IP literals, limits response size and request time.
- Rate limiting and a small user-agent identification string.

## Stack
- Frontend: React, TypeScript, Vite
- API: Node.js, TypeScript, Express
- Parsing: Cheerio + JSON-LD
- Validation: Zod

## Run locally
Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Vite runs on `http://localhost:5173`; API runs on `http://localhost:3001`.

Use the **Demo data** button first. Live extraction depends on the target website allowing automated access and returning compatible markup. Many commerce sites render data client-side, block automated requests, or prohibit scraping in their terms. Do not bypass logins, CAPTCHAs, paywalls, bot controls, or access restrictions.

## API
- `GET /api/health`
- `POST /api/scrape` with `{ "url": "https://example.com/product-page" }`
- `GET /api/demo`

## Limitations
This is a portfolio-grade starter, not a production crawling platform. It does not crawl whole domains, bypass anti-bot controls, persist jobs, or guarantee extraction across all stores. Prefer official APIs, affiliate feeds, or explicit permission when available. Review site terms, robots directives where applicable, privacy obligations, and rate limits before use.

## Suggested next steps
- Add persistent job history (PostgreSQL)
- Add a queue and per-domain throttling
- Add Playwright only for sites where automated rendering is explicitly permitted
- Add unit/integration tests and CI
- Add authenticated users and deployment configuration


## Historical framing
This repository is styled as a retrospective portfolio sample inspired by the user's Fat Fish Marketing period (September 2018–November 2019). The interface intentionally uses a simpler Bootstrap-era admin-dashboard visual language. Unless verified against archived source code or records, it must not be represented as the exact application delivered during that employment.
