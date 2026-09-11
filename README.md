# ArchiOrbit Labs Product Catalog

The canonical, public metadata source used by ArchiConsole to discover ArchiOrbit Labs products, localized product descriptions, compatible releases, and trusted installation artifacts.

This repository contains metadata only. It is not an execution authority and does not contain product secrets, credentials, or mutable installation instructions.

## Stable endpoints

- Catalog: `catalog/v1/catalog.json`
- Product metadata: `catalog/v1/products/<product-id>.json`
- Schema: `schemas/v1/catalog.schema.json`
- English content: `content/v1/en/products/<product-id>.json`
- Turkish content: `content/v1/tr/products/<product-id>.json`

Consumers must validate the catalog against the schema, enforce compatibility bounds, and verify every downloadable artifact using its immutable digest and signature before installation.

## Local validation

```bash
npm test
```

## Publishing model

Changes are reviewed and validated on pull requests. ArchiConsole should consume an immutable release tag in production. The `main` branch is suitable for development and preview channels only.

## Repository scope

The catalog owns product discovery metadata, localized presentation content, release channels, compatibility declarations, and artifact references. Product runtimes remain authoritative for their own operational state and capabilities.
