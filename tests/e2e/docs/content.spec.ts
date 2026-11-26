import {test, expect} from '../fixtures';

test.describe('Documentation content', () => {
    test.beforeEach(async ({page}) => {
        await page.setViewportSize({width: 1600, height: 900});
        await page.goto('/apidocs');
    });

    test('copies only the commands of a terminal session', async ({page, context}) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        const button = page.locator('.vp-doc button.copy').first();

        await button.click();
        await expect(button).toHaveText('Copied');
        const copied = await page.evaluate(() => navigator.clipboard.readText());
        expect(copied).toMatch(/^curl -X POST/);
        expect(copied).not.toContain('$ ');
    });

    test('follows a link to another docs page without loading the app again', async ({page}) => {
        await page.evaluate(() => { (window as unknown as {marker: boolean}).marker = true; });

        await page.locator('.vp-doc').getByRole('link', {name: 'taxa2tree'}).first().click();
        await expect(page).toHaveURL(/\/apidocs\/taxa2tree$/);
        await expect(page.getByRole('main').locator('h1').first()).toHaveText('taxa2tree');
        expect(await page.evaluate(() => (window as unknown as {marker?: boolean}).marker)).toBe(true);
    });

    test('marks the heading in view in On this page', async ({page}) => {
        const link = page.locator('.docs-layout__toc').getByRole('link', {name: 'API versions'});

        await link.click();
        await expect(page).toHaveURL(/#versions$/);
        await expect(link).toHaveAttribute('aria-current', 'location');
    });
});
