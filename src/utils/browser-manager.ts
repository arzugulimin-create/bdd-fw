/**
 * Browser manager.
 *
 * One browser instance is shared per worker process; each scenario gets its
 * own BrowserContext (see support/world.ts) for full isolation.
 */
import { Browser, BrowserType, chromium, firefox, webkit } from 'playwright';
import { config, SupportedBrowser } from '../config/config';
import { logger } from './logger';

const browserTypes: Record<SupportedBrowser, BrowserType> = { chromium, firefox, webkit };

let browser: Browser | null = null;

/**
 * Returns the shared Browser instance for the current worker process,
 * launching it lazily on first use.
 */
export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    logger.debug(`Launching browser: ${config.browser} (headless: ${config.headless})`);
    browser = await browserTypes[config.browser].launch({
      headless: config.headless,
      args: process.env.CI ? ['--no-sandbox'] : [],
    });
  }
  return browser;
}

/** Closes the shared browser instance (called once in AfterAll). */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close().catch(() => undefined);
    browser = null;
    logger.debug('Browser closed');
  }
}
