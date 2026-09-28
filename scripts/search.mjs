#!/usr/bin/env node

/**
 * search.mjs — Ricerca full-text nella documentazione Backstage (docs/).
 *
 * Comandi supportati (passati come primo argomento):
 *
 *   search <query>         Cerca una stringa/regex nei file .md
 *   list [subpath]         Elenca i file .md disponibili (opzionalmente sotto un path)
 *   read <filepath>        Legge il contenuto di un file .md specifico
 *   topics                 Elenca gli argomenti principali (cartelle di primo livello)
 *
 * Opzioni globali:
 *   --max-results=N        Numero massimo di risultati (default: 20)
 *   --context=N            Righe di contesto prima e dopo il match (default: 3)
 *   --case-sensitive       Ricerca case-sensitive (default: case-insensitive)
 *
 * Esempi:
 *   node scripts/search.mjs search "software catalog"
 *   node scripts/search.mjs search "kubernetes" --max-results=5
 *   node scripts/search.mjs list features
 *   node scripts/search.mjs read docs/features/software-catalog/index.md
 *   node scripts/search.mjs topics
 */

import { execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { resolve, dirname, relative, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const DOCS_DIR = resolve(ROOT, ".data", "backstage-docs", "docs");

// ─── Helpers ────────────────────────────────────────────────────────────────

function ensureDocsExist() {
  if (!existsSync(DOCS_DIR)) {
    console.log("📥 Prima esecuzione: clono la documentazione Backstage...\n");
    const setupScript = resolve(__dirname, "setup.mjs");
    try {
      execSync(`node "${setupScript}"`, { stdio: "inherit" });
    } catch {
      console.error("❌ Errore durante il clone automatico della documentazione.");
      process.exit(1);
    }
    console.log();
  }
}

/**
 * Raccoglie ricorsivamente tutti i file .md sotto `dir`.
 */
function collectMarkdownFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(full, files);
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") {
      files.push(full);
    }
  }
  return files;
}

/**
 * Restituisce le righe di contesto attorno a un match.
 */
function getContextLines(lines, lineIndex, contextSize) {
  const start = Math.max(0, lineIndex - contextSize);
  const end = Math.min(lines.length - 1, lineIndex + contextSize);
  const result = [];
  for (let i = start; i <= end; i++) {
    const prefix = i === lineIndex ? ">>>" : "   ";
    result.push(`${prefix} ${i + 1}: ${lines[i]}`);
  }
  return result.join("\n");
}

// ─── Comandi ────────────────────────────────────────────────────────────────

function cmdSearch(query, options) {
  ensureDocsExist();
  const files = collectMarkdownFiles(DOCS_DIR);
  const flags = options.caseSensitive ? "g" : "gi";

  let regex;
  try {
    regex = new RegExp(query, flags);
  } catch {
    // Se non è una regex valida, fai escape e cerca come stringa
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    regex = new RegExp(escaped, flags);
  }

  const results = [];
  let totalMatches = 0;

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");
    const fileMatches = [];

    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        fileMatches.push({
          line: i + 1,
          context: getContextLines(lines, i, options.context),
        });
        totalMatches++;
        if (totalMatches >= options.maxResults) break;
      }
      // Reset lastIndex per regex globali
      regex.lastIndex = 0;
    }

    if (fileMatches.length > 0) {
      results.push({
        file: relative(DOCS_DIR, file),
        matches: fileMatches,
      });
    }

    if (totalMatches >= options.maxResults) break;
  }

  if (results.length === 0) {
    console.log(`Nessun risultato trovato per: "${query}"`);
    return;
  }

  console.log(`\n🔍 Trovati ${totalMatches} risultati per "${query}" in ${results.length} file:\n`);

  for (const { file, matches } of results) {
    console.log(`━━━ 📄 ${file} (${matches.length} match) ━━━`);
    for (const m of matches) {
      console.log(`\n  Riga ${m.line}:`);
      console.log(m.context.split("\n").map((l) => `    ${l}`).join("\n"));
    }
    console.log();
  }
}

function cmdList(subpath) {
  ensureDocsExist();
  const targetDir = subpath ? resolve(DOCS_DIR, subpath) : DOCS_DIR;

  if (!existsSync(targetDir)) {
    console.error(`❌ Percorso non trovato: ${subpath || "docs/"}`);
    process.exit(1);
  }

  const files = collectMarkdownFiles(targetDir);
  const relFiles = files.map((f) => relative(DOCS_DIR, f)).sort();

  console.log(`\n📚 ${relFiles.length} file Markdown trovati${subpath ? ` in ${subpath}/` : ""}:\n`);
  for (const f of relFiles) {
    // Mostra la dimensione in modo leggibile
    const absPath = resolve(DOCS_DIR, f);
    const size = statSync(absPath).size;
    const sizeStr = size > 1024 ? `${(size / 1024).toFixed(1)}KB` : `${size}B`;
    console.log(`  ${f}  (${sizeStr})`);
  }
}

function cmdRead(filepath) {
  ensureDocsExist();

  // Accetta sia path relativi a docs/ che path completi
  let absPath = resolve(DOCS_DIR, filepath);
  if (!existsSync(absPath)) {
    // Prova rimuovendo "docs/" dal prefisso
    const cleaned = filepath.replace(/^docs\//, "");
    absPath = resolve(DOCS_DIR, cleaned);
  }

  if (!existsSync(absPath)) {
    console.error(`❌ File non trovato: ${filepath}`);
    console.error("   Usa il comando 'list' per vedere i file disponibili.");
    process.exit(1);
  }

  const content = readFileSync(absPath, "utf-8");
  const relPath = relative(DOCS_DIR, absPath);
  console.log(`\n📄 ${relPath}\n${"─".repeat(60)}\n`);
  console.log(content);
}

function cmdTopics() {
  ensureDocsExist();

  const entries = readdirSync(DOCS_DIR, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  const rootFiles = entries
    .filter((e) => e.isFile() && extname(e.name).toLowerCase() === ".md")
    .map((e) => e.name)
    .sort();

  console.log("\n📂 Argomenti principali (cartelle in docs/):\n");
  for (const d of dirs) {
    const fileCount = collectMarkdownFiles(resolve(DOCS_DIR, d)).length;
    console.log(`  📁 ${d}/  (${fileCount} file .md)`);
  }

  if (rootFiles.length > 0) {
    console.log("\n📄 File nella root di docs/:\n");
    for (const f of rootFiles) {
      console.log(`  ${f}`);
    }
  }
}

function printHelp() {
  console.log(`
search-devops-doc — Cerca nella documentazione Backstage

Comandi:
  search <query>         Cerca testo/regex nei file .md
  list [subpath]         Elenca i file .md disponibili
  read <filepath>        Legge un file .md specifico
  topics                 Mostra gli argomenti principali

Opzioni:
  --max-results=N        Max risultati (default: 20)
  --context=N            Righe di contesto (default: 3)
  --case-sensitive       Ricerca case-sensitive

Esempi:
  node scripts/search.mjs search "software catalog"
  node scripts/search.mjs search "kubernetes" --max-results=5
  node scripts/search.mjs list features
  node scripts/search.mjs read features/software-catalog/index.md
  node scripts/search.mjs topics
`);
}

// ─── Parsing argomenti e avvio ──────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2); // rimuovi node e script path
  const command = args[0];
  const positional = [];
  const options = {
    maxResults: 20,
    context: 3,
    caseSensitive: false,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--max-results=")) {
      options.maxResults = parseInt(arg.split("=")[1], 10) || 20;
    } else if (arg.startsWith("--context=")) {
      options.context = parseInt(arg.split("=")[1], 10) || 3;
    } else if (arg === "--case-sensitive") {
      options.caseSensitive = true;
    } else if (!arg.startsWith("--")) {
      positional.push(arg);
    }
  }

  return { command, positional, options };
}

const { command, positional, options } = parseArgs(process.argv);

switch (command) {
  case "search":
    if (positional.length === 0) {
      console.error("❌ Specifica una query di ricerca.\n  Uso: node scripts/search.mjs search <query>");
      process.exit(1);
    }
    cmdSearch(positional.join(" "), options);
    break;

  case "list":
    cmdList(positional[0]);
    break;

  case "read":
    if (positional.length === 0) {
      console.error("❌ Specifica un file da leggere.\n  Uso: node scripts/search.mjs read <filepath>");
      process.exit(1);
    }
    cmdRead(positional.join(" "));
    break;

  case "topics":
    cmdTopics();
    break;

  case "help":
  case "--help":
  case "-h":
    printHelp();
    break;

  default:
    printHelp();
    break;
}
