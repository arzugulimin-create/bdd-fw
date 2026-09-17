/**
 * Dashboard Page Object.
 *
 * Demonstrates component composition via the Header component.
 */
import { Locator, Page } from 'playwright';
import { BasePage } from './BasePage';
import { Header } from './components/Header';

export class DashboardPage extends BasePage {
  readonly heading: Locator;
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.header = new Header(page);
  }

  /** Opens the dashboard. Requires an active session. */
  async open(): Promise<void> {
    await this.goto('/dashboard');
  }
}
