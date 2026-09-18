#!/usr/bin/env node
/**
 * Test runner entry point.
 *
 * Responsibilities:
 *  - Parses and forwards CLI flags: --tags, --browser, --headed, --env,
 *    --workers, --debug.
 *  - Maps them to the environment variables consumed by src/config/config.ts.
 *  - Starts/stops the bundled demo app ONLY when targeting a localhost base URL.
 *  - Spawns cucumber-js with the resolved configuration (see cucumber.js).
 */
'use strict';

const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

require('dotenv').config();

// Mirrors src/config/environments so the runner can decide the demo-server
// lifecycle without importing TypeScript modules.
const ENV_DEFAULTS = {
  dev: 'http://localhost:3100',
  qa: 'https://qa.example.com',
  stage: 'https://stage.example.com',
  prod: 'https://www.example.com',
  cydeo: 'https://zincbank.cydeo.io',
};

const ROOT = path.resolve(__dirname, '..');
const DEMO_SERVER = path.join(ROOT, 'scripts', 'demo-server.js');

function parseArgs(argv) {
  const args = {};
  const booleanFlags = new Set(['headed', 'debug', 'help']);
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith('--')) continue;
    const eq = raw.indexOf('=');
    const name = eq === -1 ? raw.slice(2) : raw.slice(2, eq);
    const inline = eq === -1 ? undefined : raw.slice(eq + 1);
    if (booleanFlags.has(name)) {
      args[name] = true;
    } else if (inline !== undefined) {
      args[name] = inline;
    } else {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        args[name] = next;
        i += 1;
      } else {
        args[name] = true;
      }
    }
  }
  return args;
}

function applyArgs(args) {
  if (args.env) process.env.ENV = args.env;
  if (args.browser) process.env.BROWSER = args.browser;
  if (args.workers) process.env.WORKERS = args.workers;
  if (args.headed) process.env.HEADLESS = 'false';
  if (args.debug) {
    process.env.HEADLESS = 'false';
    process.env.DEBUG = 'true';
  }
  return args.tags || undefined;
}

function isLocalTarget() {
  const envName = (process.env.ENV || 'dev').trim().toLowerCase();
  const baseUrl = (process.env.BASE_URL || ENV_DEFAULTS[envName] || ENV_DEFAULTS.dev).replace(
    /\/+$/,
    '',
  );
  return /localhost|127\.0\.0\.1/.test(baseUrl);
}

/**
 * cucumber-js v13 only runs on Node 22, 24, or >= 26. Mirrors the runtime
 * check performed by the cucumber CLI itself.
 */
function isCucumberCompatibleNode(version) {
  const major = Number.parseInt(version.replace(/^v/, '').split('.')[0], 10);
  return major === 22 || major === 24 || major >= 26;
}

/**
 * Returns the absolute path of a Node binary compatible with cucumber-js.
 * When the current process is not supported (e.g. Node 23 / 25), a Node 24
 * runtime is provisioned via npx as a fallback.
 */
function resolveNodeBinary() {
  if (isCucumberCompatibleNode(process.version)) {
    return process.execPath;
  }
  const npxArgs = ['--yes', 'node@24', '-p', 'process.execPath'];
  let result;
  if (process.platform === 'win32') {
    // npx is a .cmd shim on Windows; run it through cmd.exe (no shell: true,
    // which would trigger the DEP0190 security warning and unescaped args).
    const cmd = process.env.ComSpec || 'cmd.exe';
    result = spawnSync(cmd, ['/d', '/s', '/c', 'npx', ...npxArgs], { encoding: 'utf8' });
  } else {
    result = spawnSync('npx', npxArgs, { encoding: 'utf8' });
  }
  const binary = result.status === 0 ? result.stdout.trim() : '';
  if (!binary) {
    throw new Error(
      `cucumber-js requires Node 22, 24, or >= 26 (found ${process.version}) and ` +
        'no compatible runtime could be provisioned via npx. Install Node 22/24/26 and retry.',
    );
  }
  console.warn(
    `[run-tests] Node ${process.version} is not supported by cucumber-js; using provisioned Node at ${binary}`,
  );
  return binary;
}

async function waitForServer(server, port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Demo server exited early with code ${server.exitCode}`);
    }
    const reachable = await new Promise((resolve) => {
      const req = http.get({ host: 'localhost', port, path: '/' }, (res) => {
        res.resume();
        resolve(true);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(500, () => {
        req.destroy();
        resolve(false);
      });
    });
    if (reachable) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Demo server did not become ready on port ${port} within ${timeoutMs}ms`);
}

async function startDemoServer() {
  if (!fs.existsSync(DEMO_SERVER)) {
    console.warn('[run-tests] demo-server.js not found; skipping local demo app startup.');
    return null;
  }
  console.log('[run-tests] Starting bundled demo app...');
  const port = parseInt(process.env.DEMO_SERVER_PORT || '3100', 10);
  const server = spawn(process.execPath, [DEMO_SERVER], { stdio: 'inherit', env: process.env });
  await waitForServer(server, port, 30_000);
  return server;
}

function stopServer(server) {
  if (server && server.exitCode === null) {
    server.kill();
  }
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`
Usage: node scripts/run-tests.js [options]

Options:
  --tags <expression>  Cucumber tag expression (e.g. "@smoke and not @wip")
  --browser <name>     chromium | firefox | webkit
  --headed             Run browser in headed mode
  --env <name>         dev | qa | stage | prod | cydeo
  --workers <n>        Number of parallel workers
  --debug              Headed + verbose debugging
  --help               Show this help
`);
    return;
  }

  const tags = applyArgs(args);
  const local = isLocalTarget();
  const envName = process.env.ENV || 'dev';
  console.log(
    local
      ? `[run-tests] Target: local demo app (${envName})`
      : `[run-tests] Target: external environment (${envName})`,
  );

  let server = null;
  (async () => {
    if (local) server = await startDemoServer();

    const cucumberPkg = require('@cucumber/cucumber/package.json');
    const cucumberDir = path.dirname(require.resolve('@cucumber/cucumber/package.json'));
    const cucumberBin = path.join(cucumberDir, cucumberPkg.bin['cucumber-js']);
    const cucumberArgs = [];
    if (tags) cucumberArgs.push('--tags', tags);

    const nodeBinary = resolveNodeBinary();
    const child = spawn(nodeBinary, [cucumberBin, ...cucumberArgs], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('exit', (code, signal) => {
      stopServer(server);
      process.exit(code === null ? (signal ? 1 : 0) : code);
    });
  })().catch((error) => {
    console.error(`[run-tests] ${error.message}`);
    stopServer(server);
    process.exit(1);
  });
}

run();
