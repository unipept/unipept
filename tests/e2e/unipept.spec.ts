import { test, expect } from '@playwright/test';

test.describe('Unipept Web Application', () => {

  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check title/header
    await expect(page).toHaveTitle(/Unipept/);
    // Use class selector for the title link as it is more reliable with Vuetify styling
    await expect(page.locator('.homepage-title')).toBeVisible();
    await expect(page.locator('.homepage-title')).toHaveText('Unipept');

    // Check navigation items
    const navItems = [
      'Single Peptide Analysis',
      'Metaproteomics Analysis',
      'API',
      'CLI',
      'Metagenomics',
      'Unipept Desktop'
    ];

    for (const item of navItems) {
      // Use getByText with exact match to avoid matching description text
      // Scoping to the app bar extension where tabs are usually located would be better but this is fine if unique
      // Since 'API' is duplicated in the card, we scope to the tab
      await expect(page.getByRole('tab', { name: item })).toBeVisible();
    }

    // Check Latest versions card
    // We scope to the card that contains "Latest versions" to avoid ambiguity (e.g. API tab vs API in card)
    const latestVersionsCard = page.locator('.v-card', { hasText: 'Latest versions' });
    await expect(latestVersionsCard).toBeVisible();
    await expect(latestVersionsCard.getByText('Web app', { exact: true })).toBeVisible();
    await expect(latestVersionsCard.getByText('API', { exact: true })).toBeVisible();
    await expect(latestVersionsCard.getByText('CLI', { exact: true })).toBeVisible();
    await expect(latestVersionsCard.getByText('Desktop app', { exact: true })).toBeVisible();

    // Check Footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/Unipept/);
    await expect(footer).toContainText(/UniProt/);
  });

  test('Single Peptide Analysis works', async ({ page }) => {
    // Navigate to SPA
    await page.goto('/spa');

    // Ensure we are on the page
    await expect(page.getByText('Search for a single peptide').first()).toBeVisible();

    // Fill in the peptide
    const sequenceInput = page.locator('input').first();
    await sequenceInput.fill('MDGTEYIIVK');

    // Click Search
    await page.getByText('Search', { exact: true }).click();

    // Wait for result page
    await expect(page).toHaveURL(/.*\/spa\/MDGTEYIIVK.*/, { timeout: 30000 });

    // Check for Analysis results
    // Use first() to avoid strict mode violations if the text appears multiple times (e.g. in title and description)
    await expect(page.getByText('Lowest common ancestor').first()).toBeVisible();

    // Check for matched proteins table/list
    await expect(page.getByText('Matched proteins').first()).toBeVisible();

    // Check for Lineage
    await expect(page.getByText('Lineage').first()).toBeVisible();

    // Check for Functional Analysis summaries (GO, EC, InterPro)
    await expect(page.getByText('GO terms').first()).toBeVisible();
    await expect(page.getByText('EC numbers').first()).toBeVisible();
    await expect(page.getByText('InterPro').first()).toBeVisible();
  });

  test('Metaproteomics Analysis works', async ({ page }) => {
    test.setTimeout(600000); // Analysis takes a while (up to 10 minutes)

    // Navigate to MPA
    await page.goto('/mpa');

    // Select a demo project
    await page.getByRole('button', { name: 'Select a demo project' }).click();

    // Wait for dialog
    const demoDialog = page.locator('.v-dialog');
    await expect(demoDialog).toBeVisible();

    // Select Human Gut
    // The dialog itself is a card, and the items are cards. We want the inner card.
    const humanGutCard = demoDialog.locator('.v-card').filter({ hasText: 'Human Gut' }).last();
    await expect(humanGutCard).toBeVisible();
    await humanGutCard.getByRole('button', { name: 'Load project' }).click();

    // Wait for analysis to load
    // The URL changes to /mpa/result/single
    await expect(page).toHaveURL(/.*\/mpa\/result\/single.*/, { timeout: 30000 });

    // Wait for results to appear or error
    // Check for "Analysis summary" which appears when analysis finishes
    // Also check for error message
    // Increasing timeout to 5 minutes as analysis can be slow
    await expect(page.locator('body')).not.toContainText('An error occurred while analysing this sample', { timeout: 300000 });

    // Wait for processing to finish
    await expect(page.getByText('Processing sample. Please wait...')).toBeHidden({ timeout: 300000 });

    await expect(page.getByText('Analysis summary')).toBeVisible({ timeout: 30000 });

    // Wait for the Peptonizer tab to be visible.
    // Use locator with text content to be safe
    const peptonizerTab = page.locator('.v-tab').filter({ hasText: 'Peptonizer' });
    await expect(peptonizerTab).toBeVisible({ timeout: 30000 });

    // Click Peptonizer tab
    await peptonizerTab.click();

    // Click Start to peptonize
    // Using regex to match "Start to peptonize!" with the icon
    await page.getByText(/Start to peptonize/i).click();

    // Verify peptonizer started (progress message)
    await expect(page.getByText('Peptonizer is running, please wait...')).toBeVisible({ timeout: 30000 });

    // Wait for computation
    // The progress bar appears, then results. We can wait for "Peptonizer Results"
    // Computation can take up to a minute (or more)
    // Also check for potential error
    await expect(page.getByText('An error occurred while running Peptonizer')).not.toBeVisible({ timeout: 300000 });
    await expect(page.getByText('Peptonizer Results')).toBeVisible({ timeout: 300000 });

    // Check for HighCharts
    // Highcharts creates a container with class highcharts-container
    await expect(page.locator('.highcharts-container')).toBeVisible();
  });

});
