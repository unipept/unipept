import {test, expect} from './fixtures';

test('Metaproteomics Analysis / A peptide in the summary table opens its single peptide analysis', async ({page, context}) => {
    test.setTimeout(120000);

    await page.goto('/mpa');

    await page.setInputFiles('input[accept=".unipept"]', 'tests/e2e/resources/project_v6_3_4.unipept');
    await page.locator('.v-dialog', {hasText: 'Upload project'}).getByRole('button', {name: 'Upload project'}).click();

    await expect(page).toHaveURL(/.*\/mpa\/result\/single.*/, {timeout: 30000});
    await expect(page.getByText('Processing sample. Please wait...')).toBeHidden({timeout: 180000});
    await expect(page.getByText('Analysis summary')).toBeVisible({timeout: 60000});

    const peptideLink = page.locator('.v-data-table tbody tr a.cursor-pointer').first();
    await expect(peptideLink).toBeVisible({timeout: 30000});
    const peptide = (await peptideLink.textContent())!.trim();

    const [spaPage] = await Promise.all([
        context.waitForEvent('page', {timeout: 10000}),
        peptideLink.click()
    ]);

    await expect(spaPage).toHaveURL(new RegExp(`/spa/${peptide}\\?equate=true$`));
    await expect(spaPage.getByText('Lowest common ancestor').first()).toBeVisible({timeout: 60000});
});
