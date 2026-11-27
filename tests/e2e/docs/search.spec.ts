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
});
