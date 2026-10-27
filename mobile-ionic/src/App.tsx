import { useMemo, useState } from 'react';
import {
  IonApp, IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonChip, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel,
  IonList, IonNote, IonPage, IonSearchbar, IonSpinner, IonText, IonTitle, IonToolbar,
  IonToast
} from '@ionic/react';
import { cloudDownloadOutline, cubeOutline, phonePortraitOutline, searchOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';

type Product = {
  name: string; price: number | null; currency: string; availability: string;
  image: string; url: string; source: string;
};

const demoProducts: Product[] = [
  { name: 'Everyday Canvas Backpack', price: 49.95, currency: 'EUR', availability: 'InStock', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=180&auto=format&fit=crop', url: 'https://example.com/products/canvas-backpack', source: 'Demo data' },
  { name: 'Wireless Headphones', price: 89, currency: 'EUR', availability: 'InStock', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=180&auto=format&fit=crop', url: 'https://example.com/products/headphones', source: 'Demo data' },
  { name: 'Stainless Steel Bottle', price: 22.5, currency: 'EUR', availability: 'LimitedAvailability', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=180&auto=format&fit=crop', url: 'https://example.com/products/steel-bottle', source: 'Demo data' }
];

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3001';
const money = (p: Product) => p.price == null ? 'Price unavailable' : new Intl.NumberFormat('en-IE', {
  style: 'currency', currency: /^[A-Z]{3}$/.test(p.currency) ? p.currency : 'EUR'
}).format(p.price);

function downloadJson(products: Product[]) {
  const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl; link.download = 'product-extraction.json'; link.click();
  URL.revokeObjectURL(objectUrl);
}

export default function App() {
  const [targetUrl, setTargetUrl] = useState('https://example.com/products/sample');
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();

  const visibleProducts = useMemo(() => products.filter((p) =>
    `${p.name} ${p.availability} ${p.source}`.toLowerCase().includes(filter.toLowerCase())
  ), [products, filter]);

  async function extract() {
    let parsed: URL;
    try { parsed = new URL(targetUrl); } catch {
      setToast('Enter a valid product page URL.'); setToastOpen(true); return;
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      setToast('Only HTTP and HTTPS URLs are supported.'); setToastOpen(true); return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/scrape`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: parsed.toString() })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Extraction request failed.');
      setProducts(body.products || []);
      setToast(`Received ${(body.products || []).length} product record(s).`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Could not reach the API. Load demo data to explore the UI.');
    } finally { setLoading(false); setToastOpen(true); }
  }

  return (
    <IonApp>
      <IonPage>
        <IonHeader translucent>
          <IonToolbar color="primary"><IonTitle>Product Extractor</IonTitle></IonToolbar>
          <IonToolbar>
            <div className="platform-strip">
              <IonIcon icon={phonePortraitOutline} />
              <span>{isNative ? `Native app · ${platform}` : 'Ionic React web preview'}</span>
              <IonBadge color={isNative ? 'success' : 'medium'}>{isNative ? 'Capacitor' : 'Web'}</IonBadge>
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <section className="intro">
            <IonChip color="primary"><IonIcon icon={cubeOutline} /> Portfolio demo</IonChip>
            <h1>Product data, <span>made accessible.</span></h1>
            <p>Inspect structured product details from permitted public product pages.</p>
          </section>
          <IonCard className="extract-card">
            <IonCardHeader>
              <IonCardSubtitle>EXTRACTION WORKSPACE</IonCardSubtitle>
              <IonCardTitle>Start with a product URL</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem lines="none" className="url-input">
                <IonInput label="Product page URL" labelPlacement="stacked" type="url" inputMode="url"
                  value={targetUrl} onIonInput={(e) => setTargetUrl(String(e.detail.value || ''))}
                  placeholder="https://store.example/products/item" />
              </IonItem>
              <div className="actions">
                <IonButton expand="block" onClick={extract} disabled={loading}>
                  {loading ? <IonSpinner name="crescent" /> : <IonIcon slot="start" icon={searchOutline} />}
                  {loading ? 'Extracting…' : 'Extract product data'}
                </IonButton>
                <IonButton expand="block" fill="outline" color="medium" onClick={() => {
                  setProducts(demoProducts); setToast('Demo records loaded. These are illustrative, not live store prices.'); setToastOpen(true);
                }}>Load demo data</IonButton>
              </div>
              <IonNote className="safety-note"><IonIcon icon={shieldCheckmarkOutline} /> Use only public pages you are authorised to access. Never bypass site access controls.</IonNote>
            </IonCardContent>
          </IonCard>
          <div className="results-heading">
            <div><h2>Product results</h2><p>{visibleProducts.length} record(s) shown</p></div>
            <IonButton fill="clear" size="small" onClick={() => downloadJson(visibleProducts)} disabled={!visibleProducts.length}>
              <IonIcon slot="start" icon={cloudDownloadOutline} /> Export JSON
            </IonButton>
          </div>
          <IonSearchbar value={filter} onIonInput={(e) => setFilter(e.detail.value || '')} placeholder="Filter products" />
          {visibleProducts.length === 0 ? <IonCard><IonCardContent>No products match this filter.</IonCardContent></IonCard> :
            <IonList inset>
              {visibleProducts.map((product) => (
                <IonItem key={product.name + product.url} className="product-item">
                  <img className="product-image" src={product.image} alt="" slot="start" loading="lazy" />
                  <IonLabel className="ion-text-wrap">
                    <h2>{product.name}</h2><p>{money(product)}</p>
                    <p>{product.availability || 'Availability unknown'}</p>
                    <IonText color="medium"><small>{product.source}</small></IonText>
                  </IonLabel>
                  <IonBadge color={product.availability === 'OutOfStock' ? 'danger' : 'success'}>{product.availability || 'Unknown'}</IonBadge>
                </IonItem>
              ))}
            </IonList>
          }
          <IonCard className="native-card">
            <IonCardContent>
              <h3>Cross-platform foundation</h3>
              <p>This UI uses Ionic React components. Capacitor reports the current runtime and provides the bridge for native plugins when packaged for iOS or Android.</p>
              <IonText color="medium"><small>Runtime: {platform} · Native: {isNative ? 'yes' : 'no'}</small></IonText>
            </IonCardContent>
          </IonCard>
        </IonContent>
        <IonToast isOpen={toastOpen} message={toast} duration={3500} onDidDismiss={() => setToastOpen(false)} />
      </IonPage>
    </IonApp>
  );
}