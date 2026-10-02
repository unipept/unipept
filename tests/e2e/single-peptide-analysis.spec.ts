import {test, expect} from './fixtures';

test('Single Peptide Analysis works', async ({page}) => {
    await page.goto('/spa');

    await expect(page.getByText('Search for a single peptide').first()).toBeVisible();

    const sequenceInput = page.locator('input[type="text"]').first();
    await sequenceInput.fill('MDGTEYIIVK');

    const searchButton = page.getByRole('button', {name: 'Search'});
    await expect(searchButton).toBeEnabled();
    await searchButton.click();

    await expect(page).toHaveURL(/.*\/spa\/MDGTEYIIVK.*/, {timeout: 30000});

    await expect(page.getByText('Lowest common ancestor').first()).toBeVisible();
    await expect(page.getByText('Matched proteins').first()).toBeVisible();
    await expect(page.getByText('Lineage').first()).toBeVisible();
    await expect(page.getByText('GO terms').first()).toBeVisible();
    await expect(page.getByText('EC numbers').first()).toBeVisible();
    await expect(page.getByText('InterPro').first()).toBeVisible();
});
