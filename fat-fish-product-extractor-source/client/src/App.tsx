import { useMemo, useState } from 'react';
import { Search, Download, Globe2, PackageSearch, RefreshCw, ShieldCheck, CircleCheck, AlertTriangle, ExternalLink, Database, ChevronDown } from 'lucide-react';

type Product = { name: string; price: number | null; currency: string; availability: string; image: string; url: string; source: string };
const demoProducts: Product[] = [
  { name: 'Everyday Canvas Backpack', price: 49.95, currency: 'EUR', availability: 'InStock', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&auto=format&fit=crop', url: 'https://shop.example.test/products/canvas-backpack', source: 'Demo dataset' },
  { name: 'Wireless Headphones', price: 89.00, currency: 'EUR', availability: 'InStock', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop', url: 'https://shop.example.test/products/headphones', source: 'Demo dataset' },
  { name: 'Stainless Steel Bottle', price: 22.50, currency: 'EUR', availability: 'LimitedAvailability', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=120&auto=format&fit=crop', url: 'https://shop.example.test/products/steel-bottle', source: 'Demo dataset' },
  { name: 'Minimal Desk Lamp', price: 35.99, currency: 'EUR', availability: 'InStock', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&auto=format&fit=crop', url: 'https://shop.example.test/products/desk-lamp', source: 'Demo dataset' },
  { name: 'Classic Running Shoes', price: 74.00, currency: 'EUR', availability: 'OutOfStock', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop', url: 'https://shop.example.test/products/running-shoes', source: 'Demo dataset' },
];
const money = (p: Product) => p.price == null ? '—' : new Intl.NumberFormat('en-IE', { style: 'currency', currency: /^[A-Z]{3}$/.test(p.currency) ? p.currency : 'EUR' }).format(p.price);
function download(name: string, text: string, type: string) {
  const blob = new Blob([text], { type }); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
export default function App() {
  const [url, setUrl] = useState('https://example.com/products/sample');
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('Demo dataset loaded. Run a permitted public product page to try live extraction.');
  const [live, setLive] = useState(false);
  const filtered = useMemo(() => products.filter(p => `${p.name} ${p.availability} ${p.source}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  async function scrape() {
    setBusy(true); setNotice('');
    try {
      const response = await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Extraction failed');
      setProducts(body.products); setLive(true); setNotice(`Extracted ${body.products.length} product record(s) from ${body.source}.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not reach the API. Is the server running?');
    } finally { setBusy(false); }
  }
  function loadDemo() { setProducts(demoProducts); setLive(false); setNotice('Demo dataset loaded. These are illustrative records, not live store prices.'); }
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><PackageSearch size={22}/></div><div><strong>Product Data Extractor</strong><small>FAT FISH-ERA PORTFOLIO SAMPLE</small></div></div>
      <div className="nav-label">WORKSPACE</div><div className="nav-item active"><Database size={17}/> Product extraction</div><div className="nav-item muted"><RefreshCw size={17}/> Run history <span className="soon">Soon</span></div>
      <div className="side-bottom"><div className="shield"><ShieldCheck size={18}/><div><strong>Responsible scraping</strong><small>Use permitted public pages only.</small></div></div><div className="version">PORTFOLIO DEMO · v1.0.0</div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Product extraction</b></div><div className="status"><span className="dot"/> Product extraction demo <ChevronDown size={14}/></div></header>
      <section className="content">
        <div className="heading-row"><div><div className="eyebrow">DATA COLLECTION / E-COMMERCE</div><h1>Product extraction</h1><p>Collect structured product details from public pages you’re allowed to access.</p></div><button className="btn btn-quiet" onClick={loadDemo}><RefreshCw size={15}/> Reset demo</button></div>
        <div className="stats">
          <div className="stat-card"><div className="stat-top"><span>Product records</span><PackageSearch size={17}/></div><strong>{products.length}</strong><small>Currently in this session</small></div>
          <div className="stat-card"><div className="stat-top"><span>In stock</span><CircleCheck size={17}/></div><strong>{products.filter(p => /instock/i.test(p.availability)).length}</strong><small>Based on extracted labels</small></div>
          <div className="stat-card"><div className="stat-top"><span>Extraction mode</span><Globe2 size={17}/></div><strong className="mode-value">{live ? 'Live' : 'Demo'}</strong><small>{live ? 'Remote page response' : 'Illustrative sample data'}</small></div>
        </div>
        <section className="panel extractor">
          <div className="panel-title"><div className="title-icon"><Globe2 size={18}/></div><div><h2>New extraction</h2><p>Enter a product or category page URL</p></div></div>
          <label htmlFor="target-url">TARGET URL</label><div className="url-row"><div className="url-input"><Globe2 size={17}/><input id="target-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://store.example/products/item"/></div><button className="btn btn-primary" disabled={busy || !url.trim()} onClick={scrape}>{busy ? <><RefreshCw className="spin" size={16}/> Extracting</> : <><PackageSearch size={16}/> Extract data</>}</button></div>
          <div className="helper"><ShieldCheck size={14}/> Only scrape pages where automated access is permitted. Do not bypass access controls.</div>
          {notice && <div className={`notice ${notice.toLowerCase().includes('could not') || notice.toLowerCase().includes('failed') || notice.toLowerCase().includes('error') ? 'warning' : ''}`}><AlertTriangle size={15}/>{notice}</div>}
        </section>
        <section className="panel results-panel">
          <div className="results-head"><div><h2>Extracted products <span className="count">{filtered.length}</span></h2><p>Normalized product records from your current run</p></div><div className="actions"><div className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products"/></div><button className="btn btn-outline" onClick={() => download('products.json', JSON.stringify(filtered, null, 2), 'application/json')}><Download size={15}/> JSON</button><button className="btn btn-outline" onClick={() => { const cols = ['name','price','currency','availability','image','url','source'] as const; const esc = (v: unknown) => `"${String(v ?? '').replaceAll('"','""')}"`; download('products.csv', [cols.join(','), ...filtered.map(p => cols.map(c => esc(p[c])).join(','))].join('\n'), 'text/csv'); }}><Download size={15}/> CSV</button></div></div>
          <div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>PRICE</th><th>AVAILABILITY</th><th>SOURCE</th><th></th></tr></thead><tbody>{filtered.map((p, i) => <tr key={`${p.url}-${i}`}><td><div className="product-cell">{p.image ? <img src={p.image} alt="" onError={e => (e.currentTarget.style.visibility='hidden')}/> : <div className="product-placeholder"><PackageSearch size={17}/></div>}<div><strong>{p.name || 'Unnamed product'}</strong><small>{p.url}</small></div></div></td><td className="price">{money(p)}</td><td><span className={`availability ${/outofstock/i.test(p.availability) ? 'out' : /instock/i.test(p.availability) ? 'in' : 'unknown'}`}><span/>{p.availability || 'Not specified'}</span></td><td><span className="source-tag">{p.source === 'Demo dataset' ? 'DEMO' : 'LIVE PAGE'}</span></td><td>{p.url.startsWith('http') && !p.url.includes('example.test') && <a className="external" href={p.url} target="_blank" rel="noreferrer" aria-label="Open product page"><ExternalLink size={15}/></a>}</td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty">No matching products. Try another search or load the demo dataset.</div>}</div>
          <div className="table-footer"><span>Showing {filtered.length} of {products.length} records</span><span><span className="dot green"/> {live ? 'Live extraction result' : 'Sample data only'}</span></div>
        </section>
        <footer>Product Data Extractor is a portfolio demo. Sample prices are fictional and must not be treated as current retail offers.</footer>
      </section>
    </main>
  </div>;
}
