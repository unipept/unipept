import {test, expect} from './fixtures';

test('Metaproteomics Analysis / Peptonizer works', async ({page}) => {
    test.setTimeout(300000);

    await page.goto('/mpa');

    const peptides = `TTTVPWLELR
AGPVLMEPLMK
TGGLPYVGTGWYR
TQDATHGNSLSHR
VYFTADEAKAAHEAGER
GAALSQNDNMLQMPLLTPVADETWGVK
QGEGDKGTMKYEEFAK
MLANAEEAGYKLLDRR
QSLDLLSKFPTLLAYAYNMLRHATFGR
QNVVLATLAGLSQLKTPEEVAK
GLYKYTPGDNYVDGSDKK
MNTYMANPDKLER
EAAEQELQSYGCR
DLSFSYDGKR
MNLYTVGAATQGLSNYLK
VTVQNLQVLK
LLLNHPETELVFLNSSSNAGNR
KGVTPPLDVLPSLSR
MDQAQYRELEAFSK
RGGDGGEFGATTGRPR`;

    const peptidesInput = page.locator('textarea').first();
    await peptidesInput.fill(peptides);

    await page.getByText('Analyze', {exact: true}).click();

    await expect(page).toHaveURL(/.*\/mpa\/result\/single.*/, {timeout: 30000});

    await expect(page.locator('body')).not.toContainText('An error occurred while analysing this sample', {timeout: 45000});
    await expect(page.getByText('Processing sample. Please wait...')).toBeHidden({timeout: 45000});
    await expect(page.getByText('Analysis summary')).toBeVisible({timeout: 30000});

    const peptonizerTab = page.locator('.v-tab').filter({hasText: 'Peptonizer'});
    await expect(peptonizerTab).toBeVisible({timeout: 30000});
    await peptonizerTab.click();

    await page.getByText(/Start to peptonize/i).click();

    await expect(page.getByText('Peptonizer is running, please wait...')).toBeVisible({timeout: 30000});

    await expect(page.getByText('An error occurred while running Peptonizer')).not.toBeVisible({timeout: 180000});
    await expect(page.getByText('Peptonizer Results')).toBeVisible({timeout: 180000});

    await expect(page.locator('.chart-container svg')).toBeVisible();
});
