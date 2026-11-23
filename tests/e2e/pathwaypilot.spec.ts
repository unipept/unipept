import {test, expect, type Page, type Locator} from './fixtures';

async function openProject(page: Page) {
    await page.goto('/mpa');
    await page.setInputFiles('input[accept=".unipept"]', 'tests/e2e/resources/project_v6_3_4.unipept');
    await page.locator('.v-dialog', {hasText: 'Upload project'}).getByRole('button', {name: 'Upload project'}).click();
    await expect(page).toHaveURL(/.*\/mpa\/result\/single.*/, {timeout: 30000});
    await expect(page.getByText('Processing sample. Please wait...')).toBeHidden({timeout: 180000});
    await expect(page.getByText('Analysis summary')).toBeVisible({timeout: 60000});
}

async function checkSelectionTable(page: Page, root: Locator) {
    const rows = root.locator('.v-data-table tbody tr');
    await expect(root.getByText('map01100')).toBeVisible({timeout: 60000});

    // Search and clear
    await root.getByRole('textbox', {name: 'Search pathways'}).fill('Glycolysis');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('map00010');
    await root.getByRole('button', {name: 'Clear Search pathways'}).click();
    await expect(root.getByText('map01100')).toBeVisible();

    // Page 2
    await root.locator('.v-pagination').getByRole('button', {name: /page 2$/i}).click();
    await expect(root.getByText('map01100')).toBeHidden();
    await root.locator('.v-pagination').getByRole('button', {name: /page 1$/i}).click();
    await expect(root.getByText('map01100')).toBeVisible();

    // Filter on a category, then clear all filters
    await root.locator('button:has(.mdi-filter-variant)').click();
    const dialog = page.locator('.v-overlay--active .v-card', {hasText: 'Filter pathways'});
    await expect(dialog).toBeVisible();
    const count = dialog.getByText(/\d+ pathways? match current filters/);
    const before = await count.textContent();
    await dialog.getByPlaceholder('Search categories...').click();
    await page.locator('.v-overlay--active .v-list-item', {hasText: 'Carbohydrate metabolism'}).click();
    await expect(count).not.toHaveText(before!);
    await dialog.getByText('Filter pathways').click();
    await dialog.getByRole('button', {name: 'Done'}).click();
    await expect(dialog).toBeHidden();
    await expect(root.getByText('map01100')).toBeHidden();
    await expect(rows.first()).toContainText('Carbohydrate metabolism');

    // An EC class and a compound, each cleared again
    await root.locator('button:has(.mdi-filter-variant)').click();
    await expect(dialog).toBeVisible();
    const categoryOnly = await count.textContent();
    await dialog.locator('.treeview-scroll > div').first().locator('.icon[style*="cursor"]').first().click();
    await dialog.locator('xpath=.//div[contains(@class,"text")][normalize-space()="1.1.-.-"]/preceding-sibling::div[contains(@class,"icon")][1]').click();
    await expect(count).not.toHaveText(categoryOnly!);
    await dialog.getByPlaceholder('Search compounds...').click();
    await page.locator('.v-overlay--active .v-list-item').first().click();
    await dialog.getByText('Filter pathways').click();
    const [categories, compounds] = [dialog.locator('.v-autocomplete').nth(0), dialog.locator('.v-autocomplete').nth(1)];
    await expect(compounds.locator('.v-chip')).toHaveCount(1);
    await compounds.locator('.v-field__clearable').click();
    await expect(compounds.locator('.v-chip')).toHaveCount(0);
    await categories.locator('.v-field__clearable').click();
    await expect(categories.locator('.v-chip')).toHaveCount(0);
    await dialog.getByRole('button', {name: 'Clear all'}).last().click();
    await dialog.getByRole('button', {name: 'Done'}).click();
    await expect(root.getByText('map01100')).toBeVisible();

    // The close button of the dialog
    await root.locator('button:has(.mdi-filter-variant)').click();
    await expect(dialog).toBeVisible();
    await dialog.locator('button:has(.mdi-close)').click();
    await expect(dialog).toBeHidden();
}

async function checkVisualization(page: Page, selection: Locator) {
    await selection.getByText('map00010').click();
    const root = page.locator('.v-window-item--active', {has: page.getByRole('button', {name: 'Select a different pathway'})}).last();

    const image = root.locator('.pathway-wrapper img');
    await expect(image).toBeVisible({timeout: 60000});
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth), {timeout: 60000}).toBeGreaterThan(0);

    // Zoom with the mouse wheel, then reset the view
    const transformed = root.locator('.interactive-image-container > div');
    const initial = await transformed.getAttribute('style');
    await root.locator('.interactive-image-container').hover();
    await page.mouse.wheel(0, -500);
    await expect(transformed).not.toHaveAttribute('style', initial!);
    await root.locator('button:has(.mdi-restore)').click();
    await expect(transformed).toHaveAttribute('style', initial!);

    // Drag to pan, then reset the view
    // Playwright's mouse leaves movementX/Y at 0, which the pan handler reads.
    const container = root.locator('.interactive-image-container');
    await container.dispatchEvent('mousedown', {button: 0});
    await container.dispatchEvent('mousemove', {movementX: 150, movementY: 100});
    await container.dispatchEvent('mouseup');
    await expect(transformed).not.toHaveAttribute('style', initial!);
    await root.locator('button:has(.mdi-restore)').click();
    await expect(transformed).toHaveAttribute('style', initial!);

    // A matched area opens the info panel
    await root.locator('svg g.cursor-events').first().click();
    const infoPanel = root.locator('.info-panel-overlay');
    await expect(infoPanel).toBeVisible();
    await expect(infoPanel.getByRole('tab', {name: 'Overview'})).toBeVisible();
    await infoPanel.locator('button:has(.mdi-close)').click();
    await expect(infoPanel).toBeHidden();

    // Download dialog
    await root.locator('button:has(.mdi-download)').first().click();
    const download = page.locator('.v-overlay--active .v-card', {hasText: 'Export pathway image'});
    await expect(download).toBeVisible();
    await download.locator('button:has(.mdi-close)').click();
    await expect(download).toBeHidden();

    await root.getByRole('button', {name: 'Select a different pathway'}).click();
    await expect(selection.getByText('map01100')).toBeVisible();
}

test('PathwayPilot / Single analysis: select, filter and visualize a pathway', async ({page}) => {
    test.setTimeout(300000);
    page.setDefaultTimeout(30000);

    await openProject(page);

    const tab = page.getByRole('tab', {name: /PathwayPilot/});
    await tab.scrollIntoViewIfNeeded();
    await tab.click();
    const root = page.locator('.v-window-item--active', {hasText: 'PathwayPilot maps your metaproteomics data'}).last();

    await checkSelectionTable(page, root);
    await checkVisualization(page, root);
});

test('PathwayPilot / Comparative analysis: select, filter and visualize a pathway', async ({page}) => {
    test.setTimeout(300000);
    page.setDefaultTimeout(30000);

    await openProject(page);

    await page.locator('a[href$="/compare"]').click();
    await expect(page).toHaveURL(/.*\/mpa\/result\/compare.*/);
    await page.getByText('Sample 8').click();
    await expect(page.getByText('Analysis summary')).toBeVisible({timeout: 90000});

    const root = page.locator('.v-window-item--active', {hasText: 'Select a KEGG metabolic pathway to compare'}).last();
    await root.scrollIntoViewIfNeeded();

    await checkSelectionTable(page, root);
    await checkVisualization(page, root);
});
