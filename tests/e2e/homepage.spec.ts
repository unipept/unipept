import {test, expect} from './fixtures';

test('Homepage loads correctly', async ({page}) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Unipept/);
    await expect(page.locator('.homepage-title')).toBeVisible();
    await expect(page.locator('.homepage-title')).toHaveText('Unipept');

    const navItems = [
        'Single Peptide Analysis',
        'Metaproteomics Analysis',
        'API',
        'CLI',
        'Metagenomics',
        'Unipept Desktop'
    ];

    for (const item of navItems) {
        await expect(page.getByRole('tab', {name: item})).toBeVisible();
    }

    const latestVersionsCard = page.locator('.v-card', {hasText: 'Latest versions'});
    await expect(latestVersionsCard).toBeVisible();
    await expect(latestVersionsCard.getByText('Web app', {exact: true})).toBeVisible();
    await expect(latestVersionsCard.getByText('API', {exact: true})).toBeVisible();
    await expect(latestVersionsCard.getByText('CLI', {exact: true})).toBeVisible();
    await expect(latestVersionsCard.getByText('Desktop app', {exact: true})).toBeVisible();

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/Unipept/);
    await expect(footer).toContainText(/UniProt/);
});
