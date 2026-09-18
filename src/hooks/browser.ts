/**
 * Cucumber browser lifecycle hooks.
 *
 * - Before: initializes a fresh BrowserContext + page objects per scenario.
 * - After: tears the scenario's BrowserContext down.
 * - AfterAll: closes the shared browser instance for the worker.
 */
import { After, AfterAll, Before } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { closeBrowser } from '../utils/browser-manager';

Before(async function (this: CustomWorld): Promise<void> {
  await this.init();
});

After(async function (this: CustomWorld): Promise<void> {
  await this.teardown();
});

AfterAll(async function (): Promise<void> {
  await closeBrowser();
});
