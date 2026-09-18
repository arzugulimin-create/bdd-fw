/**
 * Custom Cucumber World.
 *
 * Owns the Playwright page for the current scenario and exposes ready-to-use
 * page objects. Each scenario gets a fresh BrowserContext (full isolation);
 * the underlying browser instance is shared per worker (see
 * src/utils/browser-manager.ts).
 */
import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import { Page } from 'playwright';
import { config } from '../config/config';
import { DashboardPage } from '../pages/DashboardPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { UsersPage } from '../pages/UsersPage';
import { getBrowser } from '../utils/browser-manager';

export class CustomWorld extends World {
  page!: Page;
  loginPage!: LoginPage;
  dashboardPage!: DashboardPage;
  usersPage!: UsersPage;
  homePage!: HomePage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  /** Creates a fresh BrowserContext + Page and instantiates the page objects. */
  async init(): Promise<void> {
    const browser = await getBrowser();
    const context = await browser.newContext({
      viewport: config.viewport,
      baseURL: config.baseUrl,
    });
    this.page = await context.newPage();
    this.loginPage = new LoginPage(this.page);
    this.dashboardPage = new DashboardPage(this.page);
    this.usersPage = new UsersPage(this.page);
    this.homePage = new HomePage(this.page);
  }

  /** Closes the scenario's BrowserContext, releasing its resources. */
  async teardown(): Promise<void> {
    if (this.page) {
      await this.page
        .context()
        .close()
        .catch(() => undefined);
    }
  }

  /** Navigates to a path on the configured application base URL. */
  async openApp(path = '/'): Promise<void> {
    await this.page.goto(path);
  }
}

setWorldConstructor(CustomWorld);
