# Technical Report — Product Scraper Dashboard

**Status:** Initial working-demo source scaffold  
**Date:** 27 October 2026

## 1. Objective
Provide a small web interface that demonstrates extraction of publicly accessible product data from e-commerce pages where automated access is permitted. The user can submit a URL, inspect normalized records, search results, and export data.

## 2. Architecture
- **React + TypeScript + Vite:** user interface and result table.
- **Node.js + Express + TypeScript:** HTTP API and scraping orchestration.
- **Cheerio:** HTML parsing without executing page scripts.
- **JSON-LD parser:** extracts common Schema.org `Product` and `Offer` data.
- **Zod:** validates request input.
- **CSV/JSON export:** client-side export of returned normalized records.

Request flow: Browser → `POST /api/scrape` → URL validation and safety checks → fetch HTML with timeout/size limits → parse JSON-LD and fallback metadata → normalize product records → browser table/export.

## 3. Data model
A product record contains:
- `name`: product title
- `price`: numeric value when safely parseable
- `currency`: currency code if present
- `availability`: source availability text, if present
- `image`: image URL when present
- `url`: product page URL
- `source`: page URL from which data was extracted

Missing fields remain empty rather than being invented.

## 4. Safety and responsible use
The API only accepts HTTP and HTTPS URLs and blocks localhost/private IP literals, applies a timeout, limits response size, and rate-limits requests. These are useful baseline controls, not a complete production-grade SSRF defense; DNS rebinding and redirects require further hardening before public deployment. Live extraction must only be used where permitted. Do not circumvent authentication, CAPTCHAs, paywalls, or anti-bot measures. Prefer official APIs or feeds.

## 5. Limitations
HTML-only parsing will not work reliably for every site. E-commerce markup differs, and many pages render content dynamically or restrict automated requests. The demo does not include a database, scheduled crawling, multi-page crawling, user accounts, or comprehensive test coverage.

## 6. Verification plan
Before presenting as production-ready:
1. Run `npm install`, `npm run build`, and `npm run dev`.
2. Verify demo data loads and table search works.
3. Verify CSV and JSON downloads.
4. Test a permitted public product page with JSON-LD markup.
5. Test invalid schemes, localhost/private IP literals, timeouts, and oversized responses.
6. Add automated unit and API integration tests.

## 7. Conclusion
This project is a retrospective-style portfolio sample inspired by the kind of work that could fit a 2018–2019 Fat Fish Marketing-era workflow. It is not verified evidence of a historical deliverable. It is a credible starting-point demonstration of React/TypeScript UI development, Node.js API design, HTML parsing, structured data normalization, and data export. The repository should be described as a sample portfolio project unless it is based on verified prior work.


## Historical framing
This repository is styled as a retrospective portfolio sample inspired by the user's Fat Fish Marketing period (September 2018–November 2019). The interface intentionally uses a simpler Bootstrap-era admin-dashboard visual language. Unless verified against archived source code or records, it must not be represented as the exact application delivered during that employment.
