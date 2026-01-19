import {test, expect} from '@playwright/test';

test.describe('Unipept Web Application', () => {
    test.beforeEach(async ({page}) => {
        // Disable Umami analytics before the page loads
        await page.addInitScript(() => {
            window.localStorage.setItem('umami.disabled', '1');
        });
    });

    test('Homepage loads correctly', async ({page}) => {
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
            await expect(page.getByRole('tab', {name: item})).toBeVisible();
        }

        // Check Latest versions card
        // We scope to the card that contains "Latest versions" to avoid ambiguity (e.g. API tab vs API in card)
        const latestVersionsCard = page.locator('.v-card', {hasText: 'Latest versions'});
        await expect(latestVersionsCard).toBeVisible();
        await expect(latestVersionsCard.getByText('Web app', {exact: true})).toBeVisible();
        await expect(latestVersionsCard.getByText('API', {exact: true})).toBeVisible();
        await expect(latestVersionsCard.getByText('CLI', {exact: true})).toBeVisible();
        await expect(latestVersionsCard.getByText('Desktop app', {exact: true})).toBeVisible();

        // Check Footer
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
        await expect(footer).toContainText(/Unipept/);
        await expect(footer).toContainText(/UniProt/);
    });

    test('Single Peptide Analysis works', async ({page}) => {
        // Navigate to SPA
        await page.goto('/spa');

        // Ensure we are on the page
        await expect(page.getByText('Search for a single peptide').first()).toBeVisible();

        // Fill in the peptide
        const sequenceInput = page.locator('input').first();
        await sequenceInput.fill('MDGTEYIIVK');

        // Click Search
        await page.getByText('Search', {exact: true}).click();

        // Wait for result page
        await expect(page).toHaveURL(/.*\/spa\/MDGTEYIIVK.*/, {timeout: 30000});

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

    test('Metaproteomics Analysis / Peptonizer works', async ({page}) => {
        test.setTimeout(120000); // Analysis takes a while

        // Navigate to MPA
        await page.goto('/mpa');

        // Define peptides
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
RGGDGGEFGATTGRPR
TVPMFNEALAELNK
DMSNGDMFLSK
KAVEFQDLLK
ANATAPALNVFETEK
RMEVYAAVYDR
ALAADPEYAEAYSNVGLVYLMK
ALEDNLAKYER
LSGLPENQLLGSGTLLDTAR
GDVEAAKDLAR
LLAALEAGNTFKR
ANEVVELFTEFPELVDPHTGRK
ANPMYLELPVMAAAR
DKYVTPSTNNK
FVADSDYKFLLDLRK
LVMLNALEDAEMDPKEVDYLNVHGTSTPVGDLSEAK
VLRPGMYEYEVVAEMNR
FGPTVGGNLNLSDETKTK
AYSGEGALADDAGNVSR
ALAAGKELAEK
VLLPDPVFNDQKVSK
LSELFATQQLKDKVNQK
WVTPGFGLR
VVLFSPHPDDDVLSMGGTLR
GQVLAKPGTLK
GVGSPENFKLLEDLAEVLGGEVSCSR
EFLSMLAYYVR
LFPASALNGNDLDWTK
RAEAVRDLMVNEFGVPASQLKVDYK
GLQYGDEPDTHGWVTLVE
GNTGDNTPAMLYTELVPGEQLK
TKEPGSLGEPLYLDVVAALKGSKFDAVPLLTGR
RPNNLTGEHSFPLR
LGTCGGLQPNTPVGTFVCSQK
AGKPLLLLAEDVEGEALATLVVNTMR
SVPTDLNAPSLGLYPLLESMSGR
KSDLTGSVASVGTK
QVLGQVAADLR
YETQLLQGTLAR
LLTHPNFNGNTLDNDLMLLK
TGYLEEEDLATLNDWRKDPAHWDAGK
HVHMTPEDAEK
TLLLANTSNMPVAAR
LGLKDNQLVR
VAAEKLKEER
QLLPFWK
SKLFDFVKPGVLTGDDVQK
LVELDLNADEKAK
GLFSLPFAGLDEK
FGGADVLATSYTLAQGLK
LLTPLDVNKNNLKDTVLK
TAVSTDHHVSLNGGFKNLPYR
DLMVNEFGVPASQLKVDYKGGVGNMFYDDAK
AYPGDATVTVCHSR
NVMEEYGAVASVK
AVAAQEAGKFDEELVPVEVKK
TALYNYLFAR
AVFEKELATSPK
NTYPALAEGNMTK
TDVYENLHAAGVVDPAKVAR
LEDLTLLRAEALCALNR
SVLLYTPYTK
MGTPNTFLATTK
GYPGYMYTDLATMYER
AGLYLFGQNR
TNDVAGDGTTTATVLAQAMVNEGMKNLAAGANPLLLR
VQFTLPVGTELEKLEKK
ELYPQR
GVDPYLDKEALR
VAGKNMQSDFEPVLER
GMQAANVEKL
LLNELQAQKR
HNLPGPFTFLLNGTNR
YSLNGLWK
LLDLEKLLDR
TLQEGLALAK
GGVGNMFYDDAK
EGLFAGYASNNK
TNEYLDELAFLAETAGAEVVKR
FKEKHPLYGK
LAVMPLLK`;

        // Fill in the peptides
        const peptidesInput = page.locator('textarea').first();
        await peptidesInput.fill(peptides);

        // Click Analyze
        await page.getByText('Analyze', {exact: true}).click();

        // Wait for analysis to load
        // The URL changes to /mpa/result/single
        await expect(page).toHaveURL(/.*\/mpa\/result\/single.*/, {timeout: 30000});

        // Wait for results to appear or error
        // Check for "Analysis summary" which appears when analysis finishes
        // Also check for error message
        await expect(page.locator('body')).not.toContainText('An error occurred while analysing this sample', {timeout: 45000});

        // Wait for processing to finish
        await expect(page.getByText('Processing sample. Please wait...')).toBeHidden({timeout: 45000});

        await expect(page.getByText('Analysis summary')).toBeVisible({timeout: 30000});

        // Wait for the Peptonizer tab to be visible.
        // Use locator with text content to be safe
        const peptonizerTab = page.locator('.v-tab').filter({hasText: 'Peptonizer'});
        await expect(peptonizerTab).toBeVisible({timeout: 30000});

        // Click Peptonizer tab
        await peptonizerTab.click();

        // Click Start to peptonize
        // Using regex to match "Start to peptonize!" with the icon
        await page.getByText(/Start to peptonize/i).click();

        // Verify peptonizer started (progress message)
        await expect(page.getByText('Peptonizer is running, please wait...')).toBeVisible({timeout: 30000});

        // Wait for computation
        // The progress bar appears, then results. We can wait for "Peptonizer Results"
        // Computation can take up to a minute (or more)
        // Also check for potential error
        await expect(page.getByText('An error occurred while running Peptonizer')).not.toBeVisible({timeout: 90000});
        await expect(page.getByText('Peptonizer Results')).toBeVisible({timeout: 90000});

        // Check for HighCharts
        // Highcharts creates a container with class highcharts-container
        await expect(page.locator('.highcharts-container')).toBeVisible();
    });

    test('Metaproteomics Analysis / Comparative Analysis works', async ({page}) => {
        test.setTimeout(300000); // Analysis takes a while

        // Navigate to MPA
        await page.goto('/mpa');

        // Click "Select a demo project"
        await page.getByText('Select a demo project').click();

        // Click "Load project" for "Human Gut"
        // We target the specific card inside the dialog (nested in v-row) to avoid matching the dialog container itself
        const humanGutCard = page.locator('.v-dialog .v-row .v-card', {hasText: 'Human Gut'});
        await humanGutCard.getByText('Load project').click();

        // Wait for analysis to load
        await expect(page).toHaveURL(/.*\/mpa\/result\/single.*/, {timeout: 30000});
        await expect(page.locator('body')).not.toContainText('An error occurred while analysing this sample', {timeout: 60000});
        await expect(page.getByText('Processing sample. Please wait...')).toBeHidden({timeout: 180000});
        await expect(page.getByText('Analysis summary')).toBeVisible({timeout: 60000});

        // Click "Comparative analysis" sidebar button
        await page.locator('a[href$="/compare"]').click();

        // Wait for navigation
        await expect(page).toHaveURL(/.*\/mpa\/result\/compare.*/);

        // Select Sample 8 (Sample 7 is selected by default)
        await page.getByText('Sample 8').click();

        // Check Analysis summary
        // Computing comparative results might take time
        await expect(page.getByText('Analysis summary')).toBeVisible({timeout: 90000});

        // Check "Most common shared species" list (at least 5 items)
        const speciesTable = page.locator('.v-data-table', {hasText: 'Avg. relative abundance'});
        await expect(speciesTable.locator('tbody tr')).toHaveCount(5);

        // Check Barplot
        // TaxonomicBarplot uses custom SVG visualization, not Highcharts
        const barplotSvg = page.locator('.v-window-item--active svg');
        await expect(barplotSvg).toBeVisible();

        // Check 2 bars (columns) labels visible
        // Since showBarLabel is true, sample names should be text elements in the SVG
        await expect(barplotSvg.getByText('Sample 7')).toBeVisible();
        await expect(barplotSvg.getByText('Sample 8')).toBeVisible();

        // Check for legend items or stacked bars.
        // We expect at least 5 species, so there should be at least 5 distinct colors/items.
        // We can check for a significant number of rect elements (bars + legend keys).
        await expect(async () => {
            const rectCount = await barplotSvg.locator('rect').count();
            expect(rectCount).toBeGreaterThan(10);
        }).toPass();
    });

});
