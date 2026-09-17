/**
 * Header component — shared by authenticated pages.
 *
 * Demonstrates Page Object composition: pages that contain this component
 * delegate to it instead of re-implementing header actions.
 */
import { Locator, Page } from 'playwright';

export class Header {
  constructor(private readonly page: Page) {}

  get welcomeMessage(): Locator {
    return this.page.getByTestId('welcome-message');
  }

  get logoutButton(): Locator {
    return this.page.getByRole('button', { name: 'Logout' });
  }

  /** Logs the current user out. */
  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
