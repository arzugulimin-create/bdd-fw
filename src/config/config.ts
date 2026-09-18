/**
 * Central configuration layer.
 *
 * RULES:
 *  - This is the ONLY module that reads process.env.
 *  - Everything else imports { config } from here.
 *  - Credentials are never hardcoded. They come from `.env` (via dotenv).
 *    A safe local-demo fallback is allowed ONLY when the target base URL
 *    is the bundled local demo app (localhost).
 */
import 'dotenv/config';
import os from 'node:os';
import { cydeo, dev, prod, qa, stage } from './environments';

export type SupportedBrowser = 'chromium' | 'firefox' | 'webkit';
export type ArtifactMode = 'off' | 'on' | 'only-on-failure' | 'retain-on-failure';

export interface AppConfig {
  /** Active environment name (dev | qa | stage | prod | cydeo) */
  env: string;
  /** Base URL of the application under test */
  baseUrl: string;
  /** Test credentials (from .env) */
  username: string;
  password: string;
  /** Browser engine */
  browser: SupportedBrowser;
  /** Run browser headless */
  headless: boolean;
  /** Playwright action timeout (ms) */
  defaultTimeout: number;
  /** Cucumber retry count */
  retries: number;
  /** Parallel worker processes */
  workers: number;
  /** Screenshot behavior */
  screenshot: ArtifactMode;
  /** Video behavior */
  video: ArtifactMode;
  /** Trace behavior */
  trace: ArtifactMode;
  /** Viewport */
  viewport: { width: number; height: number };
  /** True when running on a CI server */
  isCI: boolean;
  /** True when targeting the bundled local demo app */
  isLocalDemo: boolean;
  /** Artifact output directories */
  dirs: {
    screenshots: string;
    videos: string;
    traces: string;
    allureResults: string;
    cucumberReport: string;
  };
}

const environments: Record<string, { name: string; baseUrl: string; apiBaseUrl?: string }> = {
  dev,
  qa,
  stage,
  prod,
  cydeo,
};

function normalizeBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildConfig(): AppConfig {
  const envName = (process.env.ENV || 'dev').trim().toLowerCase();
  const environment = environments[envName] ?? environments.dev;

  const baseUrl = (process.env.BASE_URL || environment.baseUrl).replace(/\/+$/, '');
  const isLocalDemo = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

  const isCI = normalizeBool(process.env.CI, false);

  // Credentials: from .env. A demo fallback is permitted ONLY for the
  // bundled local demo app so the project works out of the box locally.
  const username = (process.env.USERNAME || (isLocalDemo ? 'admin' : '')).trim();
  const password = process.env.PASSWORD || (isLocalDemo ? 'password123' : '');

  if (!username || !password) {
    throw new Error(
      `Missing credentials for environment "${envName}".\n` +
        `Copy .env.example to .env and set USERNAME and PASSWORD.\n` +
        `Do NOT hardcode credentials in source code or feature files.`,
    );
  }

  const browser = (process.env.BROWSER || 'chromium').trim().toLowerCase() as SupportedBrowser;
  if (!['chromium', 'firefox', 'webkit'].includes(browser)) {
    throw new Error(`Unsupported browser "${browser}". Use chromium | firefox | webkit.`);
  }

  const defaultTimeout = parsePositiveInt(process.env.DEFAULT_TIMEOUT, 15_000);
  const workers = parsePositiveInt(process.env.WORKERS, isCI ? 4 : 1);
  const retries = parsePositiveInt(process.env.RETRIES, isCI ? 1 : 0);

  const screenshot = (process.env.SCREENSHOT || 'only-on-failure') as ArtifactMode;
  const video = (process.env.VIDEO || 'off') as ArtifactMode;
  const trace = (process.env.TRACE || (isCI ? 'retain-on-failure' : 'off')) as ArtifactMode;

  return {
    env: envName,
    baseUrl,
    username,
    password,
    browser,
    headless: normalizeBool(process.env.HEADLESS, true),
    defaultTimeout,
    retries,
    workers,
    screenshot,
    video,
    trace,
    viewport: { width: 1440, height: 900 },
    isCI,
    isLocalDemo,
    dirs: {
      screenshots: 'screenshots',
      videos: 'videos',
      traces: 'traces',
      allureResults: 'reports/allure-results',
      cucumberReport: 'reports/cucumber-report',
    },
  };
}

/** Singleton configuration. Import { config } anywhere in the framework. */
export const config: AppConfig = buildConfig();

/** Platform info used for reporting (also exposed to Allure environmentInfo). */
export const runtimeInfo = {
  nodeVersion: process.version,
  platform: `${process.platform} ${process.arch}`,
  cpus: os.cpus().length,
};
