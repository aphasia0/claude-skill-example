---
description: >-
  Search Backstage documentation (backstage/backstage GitHub repo, docs/ folder).
  Use when the user asks about Backstage, DevOps portal, software catalog,
  TechDocs, scaffolding templates, Backstage plugins, Kubernetes integration,
  authentication, permissions, or any Backstage-related topic.
allowed-tools:
  - Bash
---

# Search DevOps Documentation (Backstage)

You have access to the full Backstage documentation from the `backstage/backstage`
GitHub repo (`docs/` folder), cloned locally.

## Setup (First-Time Only)

If search commands fail with "documentazione non è stata ancora scaricata", run:

```
!node PLUGIN_DIR/scripts/setup.mjs
```

Replace `PLUGIN_DIR` with the actual install path (see Installation below).

## Commands

Use these shell commands to search and read the documentation.
Replace `PLUGIN_DIR` with the actual path where the plugin is installed.

### Search for keywords

```
!node PLUGIN_DIR/scripts/search.mjs search "$ARGUMENTS"
```

### Show main topics

```
!node PLUGIN_DIR/scripts/search.mjs topics
```

### List files in a section

```
!node PLUGIN_DIR/scripts/search.mjs list <subpath>
```

### Read a specific file

```
!node PLUGIN_DIR/scripts/search.mjs read <filepath>
```

### Search with options

```
!node PLUGIN_DIR/scripts/search.mjs search "<query>" --max-results=10 --context=5
```

## Workflow

When the user asks a question about Backstage:

1. Run `topics` to get an overview (if unfamiliar with the structure)
2. Run `search "<keywords>"` with terms from the user's question
3. Run `read <filepath>` on the most relevant files from the search results
4. Synthesize the information and answer, **always citing** the source file path

## Installation Paths

Depending on where the plugin was installed, `PLUGIN_DIR` is one of:

- **Global personal:** `~/.claude/tools/search-devops-doc`
- **Project-local:** `.claude/tools/search-devops-doc`
- **npm installed:** `node_modules/search-devops-doc`

> Always cite documentation sources as `docs/<path>` so the user can find them
> in the Backstage repo.
