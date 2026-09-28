---
name: search-devops-doc
description: >-
  Use this skill when the user asks questions about Backstage documentation,
  DevOps platform setup, software catalog, scaffolding templates, TechDocs,
  Backstage plugins, or any topic covered in the Backstage open-source project docs.
  This skill searches, lists, and reads Markdown documentation files from the
  backstage/backstage GitHub repository (docs/ folder).
---

# Search DevOps Documentation (Backstage)

This skill provides access to the full Backstage documentation from
`https://github.com/backstage/backstage` (folder `docs/`).

## Setup Automatico

> [!NOTE]
> Non serve alcun setup manuale. Al primo utilizzo di qualsiasi comando,
> la documentazione viene clonata automaticamente (sparse checkout, solo `docs/`).
> Per aggiornare la documentazione, esegui: `node <skill-dir>/scripts/setup.mjs`

## Available Commands

All commands are run via `node <skill-dir>/scripts/search.mjs <command> [args] [options]`.

### 1. `search <query>` — Full-Text Search

Searches all `.md` files for a text string or regex pattern.
Returns matching lines with surrounding context.

```bash
node <skill-dir>/scripts/search.mjs search "software catalog"
node <skill-dir>/scripts/search.mjs search "kubernetes" --max-results=5 --context=5
node <skill-dir>/scripts/search.mjs search "auth.*provider" --case-sensitive
```

**Options:**
- `--max-results=N` — Limit results (default: 20)
- `--context=N` — Lines of context around each match (default: 3)
- `--case-sensitive` — Case-sensitive search (default: case-insensitive)

### 2. `list [subpath]` — List Documentation Files

Lists all `.md` files, optionally under a specific subdirectory.

```bash
node <skill-dir>/scripts/search.mjs list
node <skill-dir>/scripts/search.mjs list features
node <skill-dir>/scripts/search.mjs list getting-started
```

### 3. `read <filepath>` — Read a Documentation File

Reads and prints the full content of a specific Markdown file.
Accepts paths relative to the `docs/` directory.

```bash
node <skill-dir>/scripts/search.mjs read overview/what-is-backstage.md
node <skill-dir>/scripts/search.mjs read features/software-catalog/software-catalog-overview.md
```

### 4. `topics` — List Main Topics

Shows all top-level directories and root files in `docs/` to give
an overview of the documentation structure.

```bash
node <skill-dir>/scripts/search.mjs topics
```

## Workflow for Answering User Questions

Follow this process when the user asks about Backstage documentation:

1. **Run `topics`** to get an overview of the doc structure if you are unfamiliar.
2. **Run `search "<keywords>"`** with relevant keywords from the user's question.
3. **Run `read <filepath>`** on the most relevant files found in step 2.
4. **Synthesize** the information from the docs and answer the user's question,
   citing the specific file paths where the information was found.

> [!IMPORTANT]
> Always cite the source documentation file when answering, so the user knows
> where to find more details. Use the format: `docs/<path-to-file.md>`

## Example Interaction

**User:** "Come configuro il software catalog in Backstage?"

**Agent steps:**
1. `node scripts/search.mjs search "software catalog"`
2. Identify relevant files from search results
3. `node scripts/search.mjs read features/software-catalog/software-catalog-overview.md`
4. Answer the user's question based on the documentation content
