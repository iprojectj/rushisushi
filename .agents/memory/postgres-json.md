---
name: Postgres JSON parameters
description: Avoiding double JSON serialization with postgres.js parameter type inference.
---

Pass native objects or scalar values through `sql.json` for JSONB parameters. Do not pre-stringify them: postgres.js serializes JSON-typed parameters itself, which can turn serialized object text into a JSONB string.

**Why:** a checkout appeared to save successfully but property lookups failed because its details were stored as a string instead of an object.

**How to apply:** use typed JSON parameters for inserts, updates, and containment filters. Verify JSON writes with `jsonb_typeof` and a property lookup, not merely a successful response.
