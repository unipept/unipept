import {test as base, expect} from '@playwright/test';

export const test = base.extend<{}>({
    page: async ({page}, use) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('umami.disabled', '1');
        });
        await use(page);
    }
});

export {expect};
