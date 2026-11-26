// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from "./routes";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            // Go to the anchor, with its scroll-margin-top as offset, so that it stays below the fixed header.
            const target = document.getElementById(decodeURIComponent(to.hash.slice(1)));
            return {
                el: to.hash,
                top: target ? parseFloat(getComputedStyle(target).scrollMarginTop) || 0 : 0,
                behavior: "smooth"
            }
        } else if (savedPosition) {
            // Go to a saved location (history)
            return savedPosition;
        } else {
            // Go to the top of the page
            return { top: 0 }
        }
    }
});

export default router;
