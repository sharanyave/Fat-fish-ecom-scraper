# Product Data Extractor

A lightweight e-commerce product data extraction demo built with **React, TypeScript, Node.js, Express, and Cheerio**.

The application demonstrates how publicly accessible product pages can be inspected to extract structured product information, including product names, prices, descriptions, images, and product URLs.

> **Portfolio project:** This is a retrospective demonstration inspired by web development and e-commerce use cases from my time at Fat Fish Marketing (2018–2019). It is not represented as the original source code or an archived company deliverable.

## Features

- **Product extraction:** Extract product information from supported public product pages.
- **Structured data parsing:** Read Product schema data from JSON-LD where available.
- **Web interface:** React and TypeScript frontend for submitting product URLs and viewing results.
- **Backend API:** Node.js and Express API for processing extraction requests.
- **Data export:** Export extracted results as JSON or CSV.
- **Input validation:** Validate submitted URLs before processing.
- **Demo data:** Explore sample product records without relying on a live website.
- **Request safeguards:** Includes basic request timeouts, response-size limits, and rate limiting.

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| HTML parsing | Cheerio |
| Data extraction | JSON-LD structured data |
| Data formats | JSON, CSV |
| Development | npm |

## Architecture

```text
React + TypeScript UI
        |
        | HTTP request
        v
Express API
        |
        v
URL validation and request controls
        |
        v
Public product page
        |
        v
Cheerio + JSON-LD parsing
        |
        v
Structured product data
        |
        v
UI results / JSON / CSV export
```

## Getting Started

### Prerequisites

- Node.js and npm
- Internet access for extracting data from permitted public URLs

Check your installed versions:

```bash
node --version
npm --version
```

### Installation

Clone the repository:

```bash
git clone https://github.com/sharanyave/Fat-fish-ecom-scraper.git
cd Fat-fish-ecom-scraper
```

Install the frontend and backend dependencies using the instructions in their respective `package.json` files and the project directory structure.

### Running the Application

Start the backend API and frontend development server using the scripts defined in their respective `package.json` files.

Check the terminal output for the local URLs and ensure the frontend is configured to call the backend API.

*Exact commands and ports should be documented here once the project has been installed and verified locally.*

## Example Output

A successful extraction may return a record similar to the following:

```json
{
  "name": "Demo Cotton T-Shirt",
  "price": "24.99",
  "currency": "EUR",
  "description": "A sample product description.",
  "image": "https://example.com/product-image.jpg",
  "url": "https://example.com/products/demo-shirt"
}
```

This is illustrative demo data, not a live extraction result. Actual fields depend on the page's HTML and structured data.

## Limitations

- Product data extraction depends on the structure and availability of the target page.
- Not every website publishes JSON-LD Product data.
- Prices, currency, availability, and other fields may be missing or represented differently across websites.
- The application is a demonstration and has not been independently verified for production deployment.
- Website terms, access restrictions, and applicable laws must be respected.

## Responsible Use

Use this project only with websites and data you are authorised to access.

- Prefer official APIs, product feeds, or documented data access methods where available.
- Respect website terms of service and applicable privacy and copyright requirements.
- Do not attempt to bypass authentication, CAPTCHAs, paywalls, or anti-bot controls.
- Before production use, implement robust SSRF protections, destination and redirect validation, network-level egress restrictions, and appropriate monitoring.

## Future Improvements

- Support additional product schema formats and HTML fallbacks.
- Add automated tests for extraction and validation.
- Improve error handling for unsupported pages and missing fields.
- Add pagination and batch processing with appropriate limits.
- Introduce a persistent extraction history and downloadable reports.
- Add deployment configuration and CI checks.

## Project Context

This project demonstrates practical skills in frontend development, backend API design, HTML parsing, structured data extraction, and data export. It is intended as a portfolio exercise and is not affiliated with or endorsed by Fat Fish Marketing.

## License

No licence has been specified yet. Add a `LICENSE` file before explicitly permitting reuse or redistribution.
