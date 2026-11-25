import {test, expect} from './fixtures';
import {docsPages} from './docs-pages';

for (const {url, title, anchors} of docsPages) {
    test(`Documentation page ${url} has its title and anchors`, async ({page}) => {
        await page.goto(url);

        await expect(page.getByRole('main').locator('h1').first()).toHaveText(title);

        for (const anchor of anchors) {
            await expect(page.locator(`[id="${anchor}"]`), `#${anchor}`).toHaveCount(1);
        }
    });
}
