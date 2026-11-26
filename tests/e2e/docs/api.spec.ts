import {test, expect} from '../fixtures';
import type {Page, Request} from '@playwright/test';

/** Answers every request to the API with `body`, and keeps the requests that were sent. */
async function mockApi(page: Page, body: unknown, status = 200): Promise<Request[]> {
    const requests: Request[] = [];
    await page.route('**/api/v2/**', route => {
        requests.push(route.request());
        return route.fulfill({status, contentType: 'application/json', body: JSON.stringify(body)});
    });
    return requests;
}

async function open(page: Page, url: string) {
    await page.setViewportSize({width: 1600, height: 900});
    await page.goto(url);
}

const response = (page: Page) => page.locator('.api-response');

/** Chooses `title` in the request picker. */
async function pick(page: Page, title: string) {
    await page.locator('.api-panel__picker .v-field').click();
    await page.getByRole('option', {name: title}).click();
}

test.describe('API reference', () => {
    test('sends the chosen example as a POST request and shows the response', async ({page}) => {
        const requests = await mockApi(page, [{peptide: 'AALTER', taxon_id: 1}]);
        await open(page, '/apidocs/pept2lca');

        await expect(response(page)).toContainText('1 item');
        await pick(page, 'Multiple peptides');
        await expect.poll(() => requests.length).toBe(2);
        expect(requests[1].method()).toBe('POST');
        expect(requests[1].postData()).toContain('input%5B%5D=');
    });

    test('lists the examples under a heading, and the own input', async ({page}) => {
        await mockApi(page, []);
        await open(page, '/apidocs/pept2lca');

        await page.locator('.api-panel__picker .v-field').click();
        await expect(page.locator('.v-list-subheader', {hasText: 'Examples'})).toBeVisible();
        await expect(page.getByRole('option')).toHaveText(['One peptide', 'Multiple peptides', 'Equating I and L', 'With the lineage', 'With lineage names', 'Your own input…']);
    });

    test('sends the own input of taxa2tree as counts, without a counts field', async ({page}) => {
        const requests = await mockApi(page, {id: 1, name: 'Organism', children: []});
        await open(page, '/apidocs/taxa2tree');

        await pick(page, 'Your own input…');
        await expect(page.locator('.api-panel__form')).not.toContainText('counts');
        await page.locator('.api-panel__form textarea').fill('817\n329854');
        requests.length = 0;
        await page.getByRole('button', {name: 'Try it'}).click();
        await expect.poll(() => requests.length).toBe(1);
        expect(requests[0].method()).toBe('POST');
        expect(decodeURIComponent(requests[0].postData() ?? '')).toBe('counts[817]=1&counts[329854]=1');
    });

    test('sends a choice of ranks for descendants_ranks', async ({page}) => {
        const requests = await mockApi(page, []);
        await open(page, '/apidocs/taxonomy');

        await pick(page, 'Your own input…');
        await page.locator('.api-panel__form .v-select').click();
        await page.getByRole('option', {name: 'genus', exact: true}).click();
        await page.getByRole('option', {name: 'species', exact: true}).click();
        await page.keyboard.press('Escape');
        requests.length = 0;
        await page.getByRole('button', {name: 'Try it'}).click();
        await expect.poll(() => requests.length).toBe(1);
        expect(decodeURIComponent(requests[0].postData() ?? '')).toContain('descendants_ranks[]=genus&descendants_ranks[]=species');
    });

    test('expands and collapses every level of the response', async ({page}) => {
        await mockApi(page, [{a: {b: 1}}, {a: {b: 2}}]);
        await open(page, '/apidocs/pept2lca');
        const nodes = response(page).locator('.json-node');

        await expect(nodes).toHaveCount(4);
        await page.getByRole('button', {name: 'Expand all'}).click();
        await expect(nodes).toHaveCount(7);
        await page.getByRole('button', {name: 'Collapse all'}).click();
        await expect(nodes).toHaveCount(3);
    });

    test('shows a long list 100 items at a time', async ({page}) => {
        await mockApi(page, Array.from({length: 150}, (_, i) => i));
        await open(page, '/apidocs/pept2lca');
        const items = response(page).locator('.json-node__number');

        await expect(items).toHaveCount(100);
        await page.getByRole('button', {name: 'Show 50 more of 50'}).click();
        await expect(items).toHaveCount(150);
    });

    test('scrolls a large response on its own, so the rest of the panel stays in view', async ({page}) => {
        await mockApi(page, Array.from({length: 60}, (_, i) => ({peptide: `P${i}`, taxon_id: i})));
        await page.setViewportSize({width: 1600, height: 700});
        await page.goto('/apidocs/pept2lca');
        await page.getByRole('button', {name: 'Expand all'}).click();

        const sizes = await page.evaluate(() => {
            const overflow = (selector: string) => {
                const element = document.querySelector(selector)!;
                return element.scrollHeight - element.clientHeight;
            };
            return {panel: overflow('.api-reference__panel'), request: overflow('.api-request'), body: overflow('.api-response__body')};
        });
        expect(sizes.panel).toBe(0);
        expect(sizes.request, 'the request keeps its height').toBe(0);
        expect(sizes.body).toBeGreaterThan(0);
    });

    test('shows the error of a failed request', async ({page}) => {
        await mockApi(page, {message: 'error'}, 500);
        await open(page, '/apidocs/pept2lca');

        await expect(response(page)).toContainText('The request failed');
        await expect(response(page)).toContainText('500');
    });
});
