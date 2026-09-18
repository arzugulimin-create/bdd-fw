/**
 * Home Page Object — ZincBank landing page.
 *
 * Exposes the primary navigation tabs (PERSONAL / BUSINESS / CARDS / COMPANY)
 * scoped to the `<nav aria-label="Primary">` landmark.
 */
import { Locator, Page } from 'playwright';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  /** The four tabs the ZincBank primary navigation is expected to display. */
  static readonly expectedTabs = ['Personal', 'Business', 'Cards', 'Company'] as const;

  constructor(page: Page) {
    super(page);
  }

  /** The primary navigation landmark (`<nav aria-label="Primary">`). */
  get primaryNavigation(): Locator {
    return this.page.getByRole('navigation', { name: 'Primary' });
  }

  /**
   * Locator for a navigation tab matched by accessible name.
   * Matching is exact but case-insensitive, so 'PERSONAL' resolves the
   * 'Personal' link rendered by the application.
   */
  navTab(tabName: string): Locator {
    const name = new RegExp(`^${HomePage.escapeRegExp(tabName)}$`, 'i');
    return this.primaryNavigation.getByRole('link', { name });
  }

  /** Opens the home page. */
  async open(): Promise<void> {
    await this.goto('/');
  }

  private static escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
