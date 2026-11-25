// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from "./routes";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            // Go to appended anchor in the url
            return {
                el: to.hash,
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
