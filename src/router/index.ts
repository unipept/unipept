// Composables
import { createRouter, createWebHistory } from 'vue-router'

const tpaMeta = {
    publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
    publicationLink: "doi:10.1021/acs.jproteome.8b00716"
};

const newsMeta = {
    publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
    publicationLink: "doi:10.1021/acs.jproteome.8b00716"
};

const routes = [
    {
        path: "/",
        component: () => import("@/components/pages/HomePage.vue"),
        meta: {
            publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
            publicationLink: "doi:10.1021/acs.jproteome.8b00716"
        }
    },
    {
        path: "/tpa",
        component: () => import("@/components/pages/features/TrypticPeptideAnalysisPage.vue"),
        meta: tpaMeta
    },
    {
        path: "/tpa/:sequence",
        name: "tpaResult",
        component: () => import("@/components/pages/features/TrypticPeptideAnalysisResultPage.vue"),
        meta: tpaMeta
    },
    {
        path: "/mpa",
        component: () => import("@/components/pages/features/MetaproteomeAnalysisPage.vue"),
        meta: {
            publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
            publicationLink: "doi:10.1021/acs.jproteome.8b00716"
        }
    },
    {
        path: "/about",
        component:  () => import("@/components/pages/AboutPage.vue"),
        meta: {
            publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
            publicationLink: "doi:10.1021/acs.jproteome.8b00716"
        }
    },
    {
        path: "/news",
        component: () => import("@/components/pages/NewsPage.vue"),
        children: [
            { path: "", component: () => import("@/components/pages/news/NewsOverviewPage.vue"), meta: newsMeta },
            { path: "api", component: () => import("@/components/pages/news/APINewsPage.vue"), meta: newsMeta },
            { path: "cli", component: () => import("@/components/pages/news/CLINewsPage.vue"), meta: newsMeta },
            { path: "web", component: () => import("@/components/pages/news/WebNewsPage.vue"), meta: newsMeta },
            { path: "desktop", component: () => import("@/components/pages/news/DesktopNewsPage.vue"), meta: newsMeta },
        ],
        meta: newsMeta
    },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router;
