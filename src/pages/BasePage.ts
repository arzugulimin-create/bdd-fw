/**
 * Base Page Object.
 *
 * All page objects extend this class to share navigation helpers.
 * Page objects encapsulate locators + page actions; they contain
 * NO assertions and NO test logic.
 */
import { Page } from 'playwright';

export abstract class BasePage {
  constructor(public readonly page: Page) {}

  /** Navigates to a path relative to the configured base URL. */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /** Returns the current page title. */
  async title(): Promise<string> {
    return this.page.title();
  }

  /** Returns the current page URL. */
  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
