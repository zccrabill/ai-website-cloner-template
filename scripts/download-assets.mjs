import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const ASSETS = [
  // Logo variations
  { url: 'https://images.squarespace-cdn.com/content/v1/64ec1ff72a67d31d66807947/9e671163-debd-4d78-afac-13b76204b730/IMG_2381.PNG', dest: 'public/images/logo-arrow.png' },
  { url: 'https://images.squarespace-cdn.com/content/v1/64ec1ff72a67d31d66807947/c7d00c9a-767e-4d5c-b50e-89b38a920e30/Transparent+copy.png', dest: 'public/images/logo-transparent.png' },
  // Hero background image
  { url: 'https://images.squarespace-cdn.com/content/v1/64ec1ff72a67d31d66807947/1693955108866-9Z8PTPV8UV6N65RYUOKI/image-asset.jpeg', dest: 'public/images/hero-bg.jpeg' },
  // Featured In logos
  { url: 'https://images.squarespace-cdn.com/content/v1/64ec1ff72a67d31d66807947/c6236bc2-0365-4e3b-a831-50911ebb68b2/IMG_2486.jpeg', dest: 'public/images/featured-1.jpeg' },
  { url: 'https://images.squarespace-cdn.com/content/v1/64ec1ff72a67d31d66807947/d0928ef7-1c20-4c5c-b4ee-d2ab39d15374/IMG_2487.png', dest: 'public/images/featured-2.png' },
  { url: 'https://images.squarespace-cdn.com/content/v1/64ec1ff72a67d31d66807947/eeaca749-2275-4652-ba6b-64aa671a39b5/IMG_2491.png', dest: 'public/images/featured-3.png' },
  { url: 'https://images.squarespace-cdn.com/content/v1/64ec1ff72a67d31d66807947/41a212dd-61d6-42e5-82fa-a3a24356d2e0/IMG_2490.webp', dest: 'public/images/featured-4.webp' },
  // Solutions section image
  { url: 'https://images.squarespace-cdn.com/content/v1/64ec1ff72a67d31d66807947/a1e3139e-ee29-43bc-8479-89d481d7465b/Untitled_Artwork+8.jpg', dest: 'public/images/solutions-artwork.jpg' },
  // Unsplash image used in solutions/billing section
  { url: 'https://images.squarespace-cdn.com/content/v1/64ec1ff72a67d31d66807947/1768967425117-UBFB3KT9QELU9GKTLX6O/unsplash-image-AHaaWiSZJbY.jpg', dest: 'public/images/billing-bg.jpg' },
];

async function downloadAsset(url, dest) {
  try {
    const dir = path.dirname(dest);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    if (existsSync(dest)) { console.log(`  skip: ${dest}`); return; }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    console.log(`  ok: ${dest} (${Math.round(buf.length/1024)}kb)`);
  } catch (e) {
    console.error(`  FAIL: ${dest} — ${e.message}`);
  }
}

// Batch download 4 at a time
async function batchDownload(assets, batchSize = 4) {
  for (let i = 0; i < assets.length; i += batchSize) {
    const batch = assets.slice(i, i + batchSize);
    await Promise.all(batch.map(a => downloadAsset(a.url, a.dest)));
  }
}

console.log('Downloading assets...');
await batchDownload(ASSETS);
console.log('Done.');
