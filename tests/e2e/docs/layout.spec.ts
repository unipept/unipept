import {test, expect} from '../fixtures';
import type {Page} from '@playwright/test';

async function open(page: Page, width: number, url: string) {
    await page.setViewportSize({width, height: 900});
    await page.goto(url);
    await expect(page.getByRole('main').locator('h1').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal scroll').toBe(true);
}

test.describe('Documentation layout', () => {
    test('shows the menu, the page and On this page side by side on a wide screen', async ({page}) => {
        await open(page, 1600, '/apidocs');

        await expect(page.locator('.docs-layout__menu')).toBeVisible();
        await expect(page.locator('.docs-layout__toc')).toBeVisible();
        await expect(page.locator('.docs-layout__bar')).toBeHidden();
    });

    test('shows the request panel next to the fields of an API page on a wide screen', async ({page}) => {
        await open(page, 1600, '/apidocs/pept2lca');

        await expect(page.locator('#api-panel')).toBeVisible();
        await expect(page.locator('.docs-layout__bar')).toBeHidden();
    });

    test('moves On this page into a menu in the bar below 1280 px', async ({page}) => {
        await open(page, 1100, '/apidocs');

        await expect(page.locator('.docs-layout__toc')).toBeHidden();
        await expect(page.locator('.docs-layout__menu')).toBeVisible();
        await page.locator('.docs-layout__bar-toc').click();
        const menu = page.locator('.docs-layout__toc-menu');
        await expect(menu).toBeVisible();
        await menu.getByRole('link', {name: 'Large requests'}).click();
        await expect(menu).toBeHidden();
        await expect(page).toHaveURL(/#large-requests$/);
    });

    test('opens the request panel as a drawer below 1488 px', async ({page}) => {
        await open(page, 1100, '/apidocs/pept2lca');

        const panel = page.locator('#api-panel');
        const button = page.getByRole('button', {name: 'Request'});
        await expect(panel).toBeHidden();
        await button.click();
        await expect(panel).toBeVisible();
        await expect(panel).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(panel).toBeHidden();
        await expect(button).toBeFocused();
    });

    test('opens the drawer for a link to #try only when the panel is a drawer', async ({page}) => {
        await open(page, 1100, '/apidocs/pept2lca#try');
        await expect(page.locator('#api-panel')).toBeVisible();
        await expect(page.locator('#api-panel .v-select__selection-text')).toHaveText('Your own input…');

        // Another page first, so that the page loads again instead of only changing its hash.
        await open(page, 1600, '/apidocs');
        await open(page, 1600, '/apidocs/pept2lca#try');
        await expect(page.locator('.docs-layout__bar-end')).toHaveAttribute('aria-expanded', 'false');
    });

    test('opens the menu as a drawer below 960 px, which a link or Escape closes', async ({page}) => {
        await open(page, 800, '/apidocs');

        const menu = page.locator('.docs-layout__menu');
        const button = page.getByRole('button', {name: 'Menu'});
        await expect(menu).toBeHidden();
        await button.click();
        await expect(menu).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(menu).toBeHidden();
        await expect(button).toBeFocused();

        await button.click();
        const scrolled = await page.evaluate(() => window.scrollY);
        await page.mouse.move(600, 600);
        await page.mouse.wheel(0, 800);
        await page.waitForTimeout(300);
        expect(await page.evaluate(() => window.scrollY), 'the page behind the drawer does not scroll').toBe(scrolled);

        await menu.getByRole('link', {name: 'pept2lca'}).click();
        await expect(page).toHaveURL(/\/apidocs\/pept2lca$/);
        await expect(menu).toBeHidden();
    });
});
