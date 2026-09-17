/**
 * Users Page Object.
 */
import { Locator, Page } from 'playwright';
import { BasePage } from './BasePage';

export class UsersPage extends BasePage {
  readonly heading: Locator;
  /** All body rows of the users table. */
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Users' });
    this.rows = page.locator('tbody tr');
  }

  /** Opens the users page. Requires an active session. */
  async open(): Promise<void> {
    await this.goto('/users');
  }
}
