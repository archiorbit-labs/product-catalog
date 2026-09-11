import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const parse = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const exists = async (file) => access(path.join(root, file));
const fail = (message) => { throw new Error(message); };

const catalog = await parse('catalog/v1/catalog.json');
if (catalog.schemaVersion !== '1.0.0') fail('Unsupported catalog schema version');
if (catalog.defaultLocale !== 'en') fail('English must be the default locale');
for (const locale of ['en', 'tr']) {
  if (!catalog.supportedLocales.includes(locale)) fail(`Missing required locale: ${locale}`);
}

const ids = new Set();
for (const entry of catalog.products) {
  if (ids.has(entry.id)) fail(`Duplicate product id: ${entry.id}`);
  ids.add(entry.id);
  const manifestPath = `catalog/v1/${entry.manifest}`;
  const product = await parse(manifestPath);
  if (product.id !== entry.id) fail(`Product id mismatch: ${entry.id}`);
  if (product.publisherId !== catalog.publisher.id) fail(`Publisher mismatch: ${entry.id}`);
  for (const locale of catalog.supportedLocales) {
    const relative = product.content?.[locale];
    if (!relative) fail(`Missing ${locale} content reference: ${entry.id}`);
    const contentPath = path.normalize(path.join(path.dirname(manifestPath), relative));
    const content = await parse(contentPath);
    if (content.productId !== entry.id || content.locale !== locale) fail(`Invalid localized content: ${entry.id}/${locale}`);
  }
  for (const artifact of product.latestRelease?.artifacts ?? []) {
    if (artifact.status === 'installable') {
      if (!/^https:\/\//.test(artifact.url)) fail(`Artifact URL must be HTTPS: ${entry.id}`);
      if (!/^[a-f0-9]{64}$/.test(artifact.sha256 ?? '')) fail(`Artifact requires SHA-256: ${entry.id}`);
      if (!artifact.signatureUrl) fail(`Artifact requires a signature: ${entry.id}`);
    }
  }
  for (const integration of product.integrations ?? []) {
    if (!catalog.products.some(({ id }) => id === integration.productId)) fail(`Unknown integration target: ${integration.productId}`);
  }
}

await exists('schemas/v1/catalog.schema.json');
console.log(`Validated ${catalog.products.length} products and ${catalog.supportedLocales.length} locales.`);
