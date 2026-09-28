#!/usr/bin/env node

/**
 * setup.mjs — Clona (sparse checkout) solo la cartella docs/ dal repo Backstage.
 *
 * Uso:
 *   node scripts/setup.mjs [--force]
 *
 * Il clone viene salvato in <plugin-root>/.data/backstage-docs/
 * Se la cartella esiste già, viene fatto un pull. Con --force viene ricreata.
 */

import { execSync } from "node:child_process";
import { existsSync, rmSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT, ".data");
const REPO_DIR = resolve(DATA_DIR, "backstage-docs");
const REPO_URL = "https://github.com/backstage/backstage.git";

const force = process.argv.includes("--force");

function run(cmd, cwd = REPO_DIR) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

async function main() {
  // Se --force, elimina tutto e riparti
  if (force && existsSync(REPO_DIR)) {
    console.log("🗑  Rimozione clone esistente (--force)...");
    rmSync(REPO_DIR, { recursive: true, force: true });
  }

  if (existsSync(resolve(REPO_DIR, ".git"))) {
    // Aggiorna il clone esistente
    console.log("🔄  Clone già presente, aggiornamento...");
    run("git pull --ff-only");
  } else {
    // Sparse checkout: solo la cartella docs/
    console.log("📥  Clone sparse del repo Backstage (solo docs/)...");
    mkdirSync(DATA_DIR, { recursive: true });

    run(`git clone --filter=blob:none --sparse --depth=1 ${REPO_URL} ${REPO_DIR}`, DATA_DIR);
    run("git sparse-checkout set docs");
  }

  console.log("✅  Setup completato! Documentazione disponibile in .data/backstage-docs/docs/");
}

main().catch((err) => {
  console.error("❌  Errore durante il setup:", err.message);
  process.exit(1);
});
