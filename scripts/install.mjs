#!/usr/bin/env node

/**
 * install.mjs — Installa automaticamente il plugin nella piattaforma rilevata.
 *
 * Rileva: Antigravity, Claude Code, OpenCode.
 * Viene eseguito automaticamente dopo `npm install search-devops-doc`
 * oppure manualmente con:  npx search-devops-doc-install
 */

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = resolve(__dirname, "..");
const HOME = homedir();

/** Piattaforme supportate e le loro directory di destinazione. */
const PLATFORMS = [
  {
    name: "Antigravity",
    detect: () => existsSync(resolve(HOME, ".gemini")),
    install() {
      const dest = resolve(HOME, ".gemini", "config", "plugins", "search-devops-doc");
      if (existsSync(dest)) {
        console.log("  ⏩ Già installato, aggiornamento...");
      }
      copyPlugin(dest, [
        "plugin.json",
        "package.json",
        "scripts",
        "skills",
      ]);
      return dest;
    },
  },
  {
    name: "Claude Code",
    detect: () => existsSync(resolve(HOME, ".claude")),
    install() {
      // Copia scripts
      const toolsDir = resolve(HOME, ".claude", "tools", "search-devops-doc");
      copyPlugin(toolsDir, ["scripts", "package.json"]);

      // Copia skill
      const skillsDir = resolve(HOME, ".claude", "skills");
      mkdirSync(skillsDir, { recursive: true });
      const skillSrc = resolve(PLUGIN_ROOT, "claude-code", "skills", "search-devops-doc.md");
      const skillDest = resolve(skillsDir, "search-devops-doc.md");
      if (existsSync(skillSrc)) {
        cpSync(skillSrc, skillDest, { force: true });
      }
      return toolsDir;
    },
  },
  {
    name: "OpenCode",
    detect: () =>
      existsSync(resolve(HOME, ".config", "opencode")) ||
      existsSync(resolve(process.cwd(), "opencode.json")) ||
      existsSync(resolve(process.cwd(), "opencode.jsonc")),
    install() {
      const dest = resolve(HOME, ".config", "opencode", "tools");
      mkdirSync(dest, { recursive: true });
      const src = resolve(PLUGIN_ROOT, "opencode", "tools", "search-devops-doc.mjs");
      if (existsSync(src)) {
        cpSync(src, resolve(dest, "search-devops-doc.mjs"), { force: true });
      }
      // Copia anche scripts per il tool
      const scriptsDir = resolve(HOME, ".config", "opencode", "tools", "search-devops-doc");
      copyPlugin(scriptsDir, ["scripts", "package.json"]);
      return dest;
    },
  },
];

function copyPlugin(dest, items) {
  mkdirSync(dest, { recursive: true });
  for (const item of items) {
    const src = resolve(PLUGIN_ROOT, item);
    if (!existsSync(src)) continue;
    cpSync(src, resolve(dest, item), { recursive: true, force: true });
  }
}

// ─── Verify ─────────────────────────────────────────────────────────────────

/** File da controllare per ogni piattaforma. */
const VERIFY_CHECKS = [
  {
    name: "Antigravity",
    files: [
      { path: resolve(HOME, ".gemini", "config", "plugins", "search-devops-doc", "plugin.json"), label: "plugin.json" },
      { path: resolve(HOME, ".gemini", "config", "plugins", "search-devops-doc", "scripts", "search.mjs"), label: "scripts/search.mjs" },
      { path: resolve(HOME, ".gemini", "config", "plugins", "search-devops-doc", "scripts", "setup.mjs"), label: "scripts/setup.mjs" },
      { path: resolve(HOME, ".gemini", "config", "plugins", "search-devops-doc", "skills", "search-devops-doc", "SKILL.md"), label: "skills/SKILL.md" },
    ],
    docsDir: resolve(HOME, ".gemini", "config", "plugins", "search-devops-doc", ".data", "backstage-docs", "docs"),
  },
  {
    name: "Claude Code",
    files: [
      { path: resolve(HOME, ".claude", "skills", "search-devops-doc.md"), label: "skill .md" },
      { path: resolve(HOME, ".claude", "tools", "search-devops-doc", "scripts", "search.mjs"), label: "scripts/search.mjs" },
      { path: resolve(HOME, ".claude", "tools", "search-devops-doc", "scripts", "setup.mjs"), label: "scripts/setup.mjs" },
    ],
    docsDir: resolve(HOME, ".claude", "tools", "search-devops-doc", ".data", "backstage-docs", "docs"),
  },
  {
    name: "OpenCode",
    files: [
      { path: resolve(HOME, ".config", "opencode", "tools", "search-devops-doc.mjs"), label: "tool .mjs" },
      { path: resolve(HOME, ".config", "opencode", "tools", "search-devops-doc", "scripts", "search.mjs"), label: "scripts/search.mjs" },
      { path: resolve(HOME, ".config", "opencode", "tools", "search-devops-doc", "scripts", "setup.mjs"), label: "scripts/setup.mjs" },
    ],
    docsDir: resolve(HOME, ".config", "opencode", "tools", "search-devops-doc", ".data", "backstage-docs", "docs"),
  },
];

function verify() {
  console.log("\n🔍 search-devops-doc — Verifica installazione\n");

  let anyInstalled = false;

  for (const platform of VERIFY_CHECKS) {
    const found = platform.files.filter((f) => existsSync(f.path));
    const missing = platform.files.filter((f) => !existsSync(f.path));
    const docsExist = existsSync(platform.docsDir);

    if (found.length === 0) {
      console.log(`⬜ ${platform.name}: non installato`);
      console.log();
      continue;
    }

    anyInstalled = true;
    const allOk = missing.length === 0;
    const icon = allOk ? "✅" : "⚠️";
    console.log(`${icon} ${platform.name}: ${found.length}/${platform.files.length} file presenti`);

    for (const f of found) {
      console.log(`   ✅ ${f.path}`);
    }
    for (const f of missing) {
      console.log(`   ❌ ${f.path} — MANCANTE`);
    }

    if (docsExist) {
      console.log(`   📚 Documentazione: clonata in ${platform.docsDir}`);
    } else {
      console.log(`   📥 Documentazione: verrà clonata al primo utilizzo in ${platform.docsDir}`);
    }
    console.log();
  }

  if (!anyInstalled) {
    console.log("❌ Nessuna piattaforma ha il plugin installato.");
    console.log("   Esegui: node scripts/install.mjs\n");
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

/** Log to stderr so npm postinstall doesn't swallow the output. */
function log(msg = "") {
  process.stderr.write(msg + "\n");
}

function main() {
  const arg = process.argv[2];

  if (arg === "--verify" || arg === "verify") {
    verify();
    return;
  }

  log("\n🔧 search-devops-doc — Installazione automatica\n");

  const installed = [];

  for (const platform of PLATFORMS) {
    if (platform.detect()) {
      log(`✅ ${platform.name} rilevato!`);
      const dest = platform.install();
      log(`   → Installato in: ${dest}\n`);
      installed.push(platform.name);
    }
  }

  if (installed.length === 0) {
    log("⚠️  Nessuna piattaforma rilevata (Antigravity, Claude Code, OpenCode).");
    log("   Puoi copiare manualmente il plugin dalla cartella:");
    log(`   ${PLUGIN_ROOT}\n`);
  } else {
    // Scrivi marker file per verifica post-install
    const marker = resolve(PLUGIN_ROOT, ".installed");
    const info = {
      timestamp: new Date().toISOString(),
      version: "1.2.0",
      platforms: installed,
    };
    try {
      writeFileSync(marker, JSON.stringify(info, null, 2) + "\n");
    } catch {
      // Non bloccare se non riesce a scrivere il marker
    }

    log("━".repeat(50));
    log(`📦 Installato per: ${installed.join(", ")}`);
    log("📥 La documentazione verrà clonata automaticamente al primo utilizzo.");
    log("🔍 Verifica con: npx search-devops-doc-install --verify");
    log("━".repeat(50));
  }

  log();
}

main();
