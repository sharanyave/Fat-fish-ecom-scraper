import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import * as cheerio from 'cheerio';
import ipaddr from 'ipaddr.js';
import { z } from 'zod';
import dns from 'node:dns/promises';
import net from 'node:net';

const app = express();
const PORT = Number(process.env.PORT || 3001);
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 12, standardHeaders: true, legacyHeaders: false }));

type Product = { name: string; price: number | null; currency: string; availability: string; image: string; url: string; source: string };
const schema = z.object({ url: z.string().url().max(2048) });
const privateRanges = ['loopback', 'private', 'linkLocal', 'uniqueLocal', 'ipv4Mapped'];

function isPublicIp(ip: string): boolean {
  if (!net.isIP(ip)) return false;
  try {
    const parsed = ipaddr.parse(ip);
    return !privateRanges.includes(parsed.range());
  } catch { return false; }
}
async function validateTarget(raw: string): Promise<URL> {
  const target = new URL(raw);
  if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Only HTTP and HTTPS URLs are supported.');
  if (target.username || target.password) throw new Error('URLs containing credentials are not allowed.');
  const host = target.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) throw new Error('Local and private network targets are blocked.');
  if (net.isIP(host)) {
    if (!isPublicIp(host)) throw new Error('Private or reserved IP targets are blocked.');
  } else {
    const records = await dns.lookup(host, { all: true, verbatim: true }).catch(() => []);
    if (!records.length) throw new Error('The hostname could not be resolved.');
    if (records.some(record => !isPublicIp(record.address))) throw new Error('Hostnames resolving to private or reserved IPs are blocked.');
  }
  return target;
}
const clean = (v: unknown) => typeof v === 'string' ? v.trim() : '';
function toPrice(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value.replace(/,/g, '')))) return Number(value.replace(/,/g, ''));
  return null;
}
function asArray<T>(v: T | T[] | undefined): T[] { return v === undefined ? [] : Array.isArray(v) ? v : [v]; }
function parseProducts(html: string, pageUrl: string): Product[] {
  const $ = cheerio.load(html);
  const output: Product[] = [];
  const seen = new Set<string>();
  const add = (p: Product) => {
    const key = `${p.name.toLowerCase()}|${p.url}`;
    if (p.name && !seen.has(key)) { seen.add(key); output.push(p); }
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).contents().text());
      const nodes: any[] = [];
      const visit = (x: any) => {
        if (!x || typeof x !== 'object') return;
        if (Array.isArray(x)) return x.forEach(visit);
        if (x['@graph']) visit(x['@graph']);
        const types = asArray(x['@type']).map(String);
        if (types.includes('Product')) nodes.push(x);
      };
      visit(json);
      for (const p of nodes) {
        const offers = asArray<any>(p.offers)[0] || {};
        const image = asArray<any>(p.image)[0];
        const rawImage = typeof image === 'string' ? image : image?.url;
        add({
          name: clean(p.name),
          price: toPrice(offers.price ?? offers.lowPrice),
          currency: clean(offers.priceCurrency),
          availability: clean(offers.availability).split('/').pop() || '',
          image: rawImage ? new URL(rawImage, pageUrl).toString() : '',
          url: p.url ? new URL(p.url, pageUrl).toString() : pageUrl,
          source: pageUrl
        });
      }
    } catch { /* Ignore malformed JSON-LD blocks. */ }
  });
  if (!output.length) {
    const title = clean($('meta[property="og:title"]').attr('content')) || clean($('h1').first().text()) || clean($('title').text());
    if (title) add({
      name: title,
      price: toPrice($('meta[property="product:price:amount"]').attr('content')),
      currency: clean($('meta[property="product:price:currency"]').attr('content')),
      availability: clean($('meta[property="product:availability"]').attr('content')),
      image: clean($('meta[property="og:image"]').attr('content')),
      url: pageUrl,
      source: pageUrl
    });
  }
  return output.slice(0, 100);
}
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'product-scraper-api' }));
app.get('/api/demo', (_req, res) => res.json({ products: [] }));
app.post('/api/scrape', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Provide a valid public HTTP(S) URL.' });
  try {
    const target = await validateTarget(parsed.data.url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    let response: Response;
    try {
      response = await fetch(target, {
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'user-agent': 'ProductScoutPortfolioDemo/1.0 (responsible public-page extraction)', accept: 'text/html,application/xhtml+xml' }
      });
    } finally { clearTimeout(timeout); }
    if (response.status >= 300 && response.status < 400) return res.status(400).json({ error: 'Redirects are not followed by this demo. Submit the final public page URL directly.' });
    if (!response.ok) return res.status(502).json({ error: `Target site responded with HTTP ${response.status}. It may restrict automated access.` });
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html') && !type.includes('application/xhtml+xml')) return res.status(415).json({ error: 'The target did not return an HTML page.' });
    const declared = Number(response.headers.get('content-length') || 0);
    if (declared > 2_000_000) return res.status(413).json({ error: 'Page is larger than the 2 MB demo limit.' });
    const html = await response.text();
    if (Buffer.byteLength(html, 'utf8') > 2_000_000) return res.status(413).json({ error: 'Page is larger than the 2 MB demo limit.' });
    const products = parseProducts(html, target.toString());
    return res.json({ source: target.toString(), products, count: products.length, message: products.length ? undefined : 'No compatible product markup was found. The page may require JavaScript or use different structured data.' });
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError' ? 'The request timed out after 8 seconds.' : error instanceof Error ? error.message : 'Unexpected extraction error.';
    return res.status(400).json({ error: message });
  }
});
app.listen(PORT, () => console.log(`Product Scraper API listening on http://localhost:${PORT}`));
