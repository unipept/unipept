import {test, expect} from '../fixtures';

test.describe('Documentation hub', () => {
    test('links every section and its main pages, and searches all docs', async ({page}) => {
        await page.goto('/docs');
        await expect(page.getByRole('heading', {level: 1, name: 'Unipept documentation'})).toBeVisible();

        for (const name of ['API', 'CLI', 'UMGAP', 'Desktop Deprecated']) {
            await expect(page.getByRole('heading', {level: 2, name, exact: true})).toBeVisible();
        }
        await expect(page.getByRole('link', {name: 'Getting started'})).toHaveAttribute('href', '/desktop');
        await expect(page.getByRole('link', {name: 'Mesuere et al. (2016) Bioinformatics'}))
            .toHaveAttribute('href', 'https://doi.org/10.1093/bioinformatics/btw039');

        await page.getByRole('link', {name: 'Tryptic peptide analysis'}).click();
        await expect(page).toHaveURL(/\/clidocs\/casestudies\/tpa$/);

        await page.goBack();
        await page.getByRole('button', {name: /Search all documentation/}).click();
        await page.getByRole('combobox', {name: 'Search the documentation'}).fill('fastq2fasta');
        await expect(page.getByRole('option').first()).toContainText('UMGAP › umgap fastq2fasta');
    });
});
