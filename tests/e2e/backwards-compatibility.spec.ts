import {test, expect} from './fixtures';

test('Metaproteomics Analysis / Backwards compatibility works', async ({page}) => {
    test.setTimeout(120000);

    await page.goto('/mpa');

    await page.setInputFiles('input[accept=".unipept"]', 'tests/e2e/resources/project_v6_3_4.unipept');

    const uploadDialog = page.locator('.v-dialog', {hasText: 'Upload project'});
    await expect(uploadDialog).toBeVisible();

    await uploadDialog.getByRole('button', {name: 'Upload project'}).click();

    await expect(page).toHaveURL(/.*\/mpa\/result\/single.*/, {timeout: 30000});
    await expect(page.locator('body')).not.toContainText('An error occurred while analysing this sample', {timeout: 60000});
    await expect(page.getByText('Processing sample. Please wait...')).toBeHidden({timeout: 180000});
    await expect(page.getByText('Analysis summary')).toBeVisible({timeout: 60000});

    await expect(page.getByText('2065 unique peptides')).toBeVisible();
});
