import {test, expect} from './fixtures';

test('Metaproteomics Analysis / Comparative Analysis works', async ({page}) => {
    test.setTimeout(300000);

    await page.goto('/mpa');

    await page.getByText('Select a demo project').click();

    const humanGutCard = page.locator('.v-dialog .v-row .v-card', {hasText: 'Human Gut'});
    await humanGutCard.getByText('Load project').click();

    await expect(page).toHaveURL(/.*\/mpa\/result\/single.*/, {timeout: 30000});
    await expect(page.locator('body')).not.toContainText('An error occurred while analysing this sample', {timeout: 60000});
    await expect(page.getByText('Processing sample. Please wait...')).toBeHidden({timeout: 180000});
    await expect(page.getByText('Analysis summary')).toBeVisible({timeout: 60000});

    await page.locator('a[href$="/compare"]').click();

    await expect(page).toHaveURL(/.*\/mpa\/result\/compare.*/);

    await page.getByText('Sample 8').click();

    await expect(page.getByText('Analysis summary')).toBeVisible({timeout: 90000});

    const speciesTable = page.locator('.v-data-table', {hasText: 'Avg. relative abundance'});
    const rows = speciesTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThanOrEqual(5);

    const barplotRoot = page.locator('.v-window-item--active .d-flex.flex-row');
    const barplotSvg = barplotRoot.locator('svg');
    await expect(barplotSvg).toBeVisible();

    await expect(barplotRoot.getByText('Sample 7')).toBeVisible();
    await expect(barplotRoot.getByText('Sample 8')).toBeVisible();

    await expect(async () => {
        const rectCount = await barplotSvg.locator('rect').count();
        expect(rectCount).toBeGreaterThan(10);
    }).toPass();
});
