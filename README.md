# search-devops-doc

Plugin multi-piattaforma per cercare nella documentazione [Backstage](https://backstage.io) direttamente dal tuo AI coding assistant.

Clona in modo efficiente solo la cartella `docs/` dal repo [backstage/backstage](https://github.com/backstage/backstage) e fornisce strumenti di ricerca full-text basati su Node.js. Zero dipendenze esterne.

Supporta: **Antigravity** · **Claude Code** · **OpenCode**

---

## Installazione

```bash
npm install search-devops-doc
```

**Fatto.** L'installer rileva automaticamente le piattaforme presenti sulla tua macchina (Antigravity, Claude Code, OpenCode) e copia i file nelle posizioni corrette.

La documentazione Backstage viene clonata automaticamente al primo utilizzo (sparse checkout, solo `docs/`).

> **Nota:** se la folder di destinazione non ha un `package.json`, creane uno prima con `npm init -y`.

### Cosa succede sotto il cofano

1. `npm install` scarica il pacchetto in `node_modules/`
2. Lo script `postinstall` parte automaticamente e:
   - Rileva le piattaforme installate (`~/.gemini`, `~/.claude`, `~/.config/opencode`)
   - Copia plugin, skill e tool nelle directory corrette di ciascuna piattaforma
3. Al primo comando di ricerca, la documentazione viene clonata automaticamente

### Reinstallazione manuale (opzionale)

Se vuoi reinstallare in un secondo momento:

```bash
npx search-devops-doc-install
```

---

## Comandi

Tutti i comandi sono disponibili tramite lo script `search.mjs`:

```bash
node scripts/search.mjs <comando> [argomenti] [opzioni]
```

### `search <query>` — Ricerca full-text

Cerca una stringa o una regex in tutti i file `.md` della documentazione.

```bash
node scripts/search.mjs search "software catalog"
node scripts/search.mjs search "kubernetes" --max-results=5 --context=5
node scripts/search.mjs search "auth.*provider" --case-sensitive
```

| Opzione | Default | Descrizione |
|---------|---------|-------------|
| `--max-results=N` | 20 | Numero massimo di risultati |
| `--context=N` | 3 | Righe di contesto attorno al match |
| `--case-sensitive` | off | Ricerca case-sensitive |

### `topics` — Argomenti principali

Mostra tutte le cartelle di primo livello in `docs/` con il conteggio dei file.

```bash
node scripts/search.mjs topics
```

### `list [subpath]` — Elenco file

Elenca tutti i file `.md`, opzionalmente sotto un sotto-percorso.

```bash
node scripts/search.mjs list
node scripts/search.mjs list features
node scripts/search.mjs list getting-started
```

### `read <filepath>` — Leggi un file

Legge e stampa il contenuto di un file Markdown specifico. Accetta path relativi a `docs/`.

```bash
node scripts/search.mjs read overview/what-is-backstage.md
node scripts/search.mjs read features/software-catalog/software-catalog-overview.md
```

---

## Uso con l'AI Agent

Una volta installato, l'agent utilizza automaticamente la skill quando fai domande sulla documentazione Backstage.

**Esempi di domande:**
- "Come configuro il software catalog in Backstage?"
- "Quali plugin sono disponibili per Kubernetes?"
- "Come funziona TechDocs?"
- "Come configuro l'autenticazione con GitHub?"

L'agent segue questo workflow:
1. `topics` → panoramica della struttura
2. `search "<keywords>"` → trova i file rilevanti
3. `read <file>` → legge il contenuto
4. Sintetizza e risponde citando le fonti

---

## Piattaforme Supportate

### Antigravity (Google)

L'installer copia il plugin in `~/.gemini/config/plugins/search-devops-doc/`.
Antigravity scopre automaticamente `plugin.json` e la skill `SKILL.md`.

**Attivazione:** automatica quando chiedi qualcosa su Backstage.

### Claude Code (Anthropic)

L'installer copia:
- Gli script in `~/.claude/tools/search-devops-doc/`
- La skill in `~/.claude/skills/search-devops-doc.md`

**Attivazione:** usa il comando `/user:search-devops-doc` oppure chiedi direttamente su Backstage.

### OpenCode

L'installer copia il custom tool in `~/.config/opencode/tools/`.

**Attivazione:** automatica, il tool è disponibile all'agent.

---

## Struttura del Progetto

```
search-devops-doc/
├── plugin.json                              # Manifesto plugin (Antigravity)
├── package.json                             # npm + postinstall automatico
├── scripts/
│   ├── install.mjs                          # Auto-installer multi-piattaforma
│   ├── setup.mjs                            # Clone sparse della documentazione
│   └── search.mjs                           # Motore di ricerca Node.js
├── skills/
│   └── search-devops-doc/
│       └── SKILL.md                         # Istruzioni agent (Antigravity)
├── claude-code/
│   └── skills/
│       └── search-devops-doc.md             # Skill per Claude Code
├── opencode/
│   └── tools/
│       └── search-devops-doc.mjs            # Custom tool per OpenCode
└── .data/                                   # (generata al primo utilizzo)
    └── backstage-docs/docs/                 # ~750+ file Markdown
```

---

## Aggiornamento Documentazione

La documentazione viene aggiornata con un semplice `git pull`:

```bash
# Dalla directory dove è installato il plugin
node scripts/setup.mjs
```

Per forzare un re-clone completo:

```bash
node scripts/setup.mjs --force
```

---

## Sviluppo

```bash
# Clona il repo
git clone <repo-url>
cd search-devops-doc

# Scarica la documentazione
node scripts/setup.mjs

# Testa i comandi
node scripts/search.mjs topics
node scripts/search.mjs search "techdocs"
node scripts/search.mjs list features
node scripts/search.mjs read overview/what-is-backstage.md

# Testa l'installer
node scripts/install.mjs

# Pubblica su npm
npm publish
```

## Licenza

MIT
# claude-skill-example
