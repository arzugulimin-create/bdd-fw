/**
 * Login Page Object.
 *
 * Locator strategy: Playwright role/label/testid locators only.
 * Business actions live here; step definitions stay thin.
 */
import { Locator, Page } from 'playwright';
import { config } from '../config/config';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByTestId('login-error');
  }

  /** Opens the login page. */
  async open(): Promise<void> {
    await this.goto('/login');
  }

  /** Fills the username field. */
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /** Fills the password field. */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /** Submits the login form. */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /** Performs a full login attempt with the given credentials. */
  async loginWithCredentials(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  /** Logs in using credentials from the active environment config (.env). */
  async loginWithValidCredentials(): Promise<void> {
    await this.loginWithCredentials(config.username, config.password);
  }
}
