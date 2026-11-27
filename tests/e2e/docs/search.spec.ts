import {test, expect} from '../fixtures';

test.describe('Documentation search', () => {
    test('finds a heading in another section and opens it with the keyboard', async ({page}) => {
        await page.goto('/clidocs/pept2lca');
        await expect(page.getByRole('main').locator('h1').first()).toBeVisible();

        await page.keyboard.press('ControlOrMeta+k');
        const input = page.getByRole('combobox', {name: 'Search the documentation'});
        await expect(input).toBeFocused();
        await input.fill('taxa2tree');

        const first = page.getByRole('option').first();
        await expect(first).toContainText('API › taxa2tree');
        await expect(first).toHaveAttribute('aria-selected', 'true');
        await input.press('Enter');

        await expect(page).toHaveURL(/\/apidocs\/taxa2tree/);
        await expect(input).toBeHidden();
    });

    test('says when nothing matches and returns the focus to the button on Escape', async ({page}) => {
        await page.goto('/desktop');
        const button = page.locator('.docs-layout__menu').getByRole('button', {name: /Search/});
        await button.click();

        const input = page.getByRole('combobox', {name: 'Search the documentation'});
        await input.fill('zzqqxxww');
        await expect(page.getByText('No results for "zzqqxxww".')).toBeVisible();

        await input.press('Escape');
        await expect(input).toBeHidden();
        await expect(button).toBeFocused();
    });

    test('closes only the dialog on Escape when the menu drawer is open', async ({page}) => {
        await page.setViewportSize({width: 800, height: 900});
        await page.goto('/desktop');
        await page.getByRole('button', {name: 'Menu'}).click();
        const menu = page.locator('.docs-layout__menu');
        const button = menu.getByRole('button', {name: /Search/});
        await button.click();

        const input = page.getByRole('combobox', {name: 'Search the documentation'});
        await expect(input).toBeFocused();
        await input.press('Escape');
        await expect(input).toBeHidden();
        await expect(menu).toBeVisible();
        await expect(button).toBeFocused();
    });

    test('closes the menu drawer and scrolls for a result on the current page', async ({page}) => {
        await page.setViewportSize({width: 800, height: 900});
        await page.goto('/clidocs/pept2lca');
        await expect(page.getByRole('main').locator('h1').first()).toBeVisible();
        await page.getByRole('button', {name: 'Menu'}).click();
        const menu = page.locator('.docs-layout__menu');
        await menu.getByRole('button', {name: /Search/}).click();

        const input = page.getByRole('combobox', {name: 'Search the documentation'});
        await input.fill('pept2lca');
        await page.getByRole('option', {name: '--equate / -e CLI › unipept pept2lca'}).click();

        await expect(input).toBeHidden();
        await expect(menu).toBeHidden();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

        await page.getByRole('button', {name: 'Menu'}).click();
        await menu.getByRole('button', {name: /Search/}).click();
        await input.fill('pept2lca');
        await page.getByRole('option', {name: 'unipept pept2lca CLI › unipept pept2lca'}).click();
        await expect(input).toBeHidden();
        await expect(menu).toBeHidden();
    });
});
