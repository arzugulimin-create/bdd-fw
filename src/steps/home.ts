/**
 * Step definitions for the ZincBank home page navigation tabs.
 */
import { DataTable, Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CustomWorld } from '../support/world';

Given('the user opens the ZincBank home page', async function (this: CustomWorld): Promise<void> {
  await this.homePage.open();
});

Then(
  'the primary navigation should display the following tabs:',
  async function (this: CustomWorld, table: DataTable): Promise<void> {
    const tabs = table.rows().map((row) => row[0]);
    for (const tab of tabs) {
      await expect(this.homePage.navTab(tab)).toBeVisible();
    }
  },
);

Then(
  'the {string} tab should be visible in the primary navigation',
  async function (this: CustomWorld, tabName: string): Promise<void> {
    await expect(this.homePage.navTab(tabName)).toBeVisible();
  },
);

Then(
  'the primary navigation should contain a link for each expected tab',
  async function (this: CustomWorld): Promise<void> {
    const nav = this.homePage.primaryNavigation;
    await expect(nav).toBeVisible();
    for (const tab of HomePage.expectedTabs) {
      const tabLink = this.homePage.navTab(tab);
      await expect(tabLink).toBeAttached();
      await expect(tabLink).toBeVisible();
    }
  },
);
