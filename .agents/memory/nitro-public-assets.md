---
name: Nitro public asset metadata
description: Production-only response truncation caused by modifying public files after Nitro records their metadata.
---

Never change public asset bytes after Nitro generates its static asset metadata. HTML transformations must finish before the Nitro environment bundles the public-assets manifest.

**Why:** a late HTML compaction step left stale Content-Length and ETag metadata. Development worked, but production announced more bytes than it sent, causing incomplete responses and failed readiness checks.

**How to apply:** preserve transformation ordering and test the built Node server, not only Vite development. Read complete HTTP response bodies and compare Content-Length against actual byte counts for the storefront pages.
