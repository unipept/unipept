// Composables
import { createRouter, createWebHistory } from 'vue-router'


const routes = [
    {
        path: "/",
        component: () => import("@/components/pages/HomePage.vue"),
        meta: {
            publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
            publicationLink: "doi:10.1021/acs.jproteome.8b00716"
        }
    },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router;
