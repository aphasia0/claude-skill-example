import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * OpenCode custom tool for searching Backstage documentation.
 *
 * Installation:
 *   Copy this file to .opencode/tools/search-devops-doc.ts (project)
 *   or ~/.config/opencode/tools/search-devops-doc.ts (global)
 *
 * Setup:
 *   Run `node <plugin-dir>/scripts/setup.mjs` first to clone the docs.
 *
 * The SEARCH_DEVOPS_DOC_DIR env var can override the plugin directory.
 */

// Resolve the plugin directory
const PLUGIN_DIR = process.env.SEARCH_DEVOPS_DOC_DIR
  || resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const SCRIPT = resolve(PLUGIN_DIR, "scripts", "search.mjs");

/**
 * @opencode-tool
 * @name search-devops-doc
 * @description Search, list, and read Backstage documentation (docs/ folder from backstage/backstage repo). Commands: "search <query>" for full-text search, "topics" to list main categories, "list [subpath]" to list files, "read <filepath>" to read a specific doc.
 * @param {string} command - The command to run: search, topics, list, or read
 * @param {string} [argument] - Query string, file path, or subpath (depends on command)
 * @param {number} [maxResults=20] - Maximum number of search results
 * @param {number} [context=3] - Lines of context around each match
 */
export default function searchDevopsDocs({ command, argument, maxResults, context }) {
  const args = [command];

  if (argument) {
    args.push(argument);
  }
  if (maxResults) {
    args.push(`--max-results=${maxResults}`);
  }
  if (context) {
    args.push(`--context=${context}`);
  }

  const cmd = `node ${SCRIPT} ${args.join(" ")}`;

  try {
    const output = execSync(cmd, {
      encoding: "utf-8",
      timeout: 30000,
      maxBuffer: 1024 * 1024, // 1MB
    });
    return output;
  } catch (err) {
    if (err.stdout) return err.stdout;
    return `Error: ${err.message}`;
  }
}
