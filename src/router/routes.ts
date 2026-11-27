import type { RouteRecordRaw } from "vue-router";
import docsPages from "virtual:docs-pages";
import { buildDocsSections, docsSectionConfigs, type DocsSectionConfig } from "@/logic/docs/DocsSections";
import { docsRoutes } from "./DocsRoutes";

const docsSections = buildDocsSections(
    docsSectionConfigs(import.meta.glob<DocsSectionConfig>("/src/content/docs/*/_section.ts", { eager: true, import: "default" })),
    docsPages
);

const spaMeta = {
    publication: "Vande Moortele et al. (2025) Journal of Proteome Research",
    publicationLink: "doi.org/10.1021/acs.jproteome.4c00848",
};

const mpaMeta = {
    publication: "Vande Moortele et al. (2025) Journal of Proteome Research",
    publicationLink: "doi.org/10.1021/acs.jproteome.4c00848",
};

const newsMeta = {
    publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
    publicationLink: "doi:10.1021/acs.jproteome.8b00716"
};

export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: () => import("@/components/pages/HomePage.vue"),
        meta: {
            publication: "Vande Moortele et al. (2024) BioRXiv",
            publicationLink: "doi.org/10.1101/2024.09.26.615136"
        }
    },
    {
        path: "/privacy",
        component: () => import("@/components/pages/PrivacyPolicyPage.vue"),
        meta: {}
    },
    {
        path: "/spa",
        alias: "/tpa",
        component: () => import("@/components/pages/features/SinglePeptideAnalysisPage.vue"),
        meta: spaMeta
    },
    {
        path: "/spa/:sequence",
        alias: "/tpa/:sequence",
        name: "spaResult",
        component: () => import("@/components/pages/features/SinglePeptideAnalysisResultPage.vue"),
        meta: spaMeta
    },
    {
        path: "/mpa",
        component: () => import("@/components/pages/features/analysis/MetaproteomeHomePage.vue"),
        meta: mpaMeta
    },
    {
        path: "/mpa/result",
        name: "mpaResult",
        component:  () => import("@/components/pages/features/analysis/MetaproteomeResultsPage.vue"),
        children: [
            { path: "home", name: "home", component: () => import("@/components/pages/features/analysis/MetaproteomeHomePage.vue"), meta: mpaMeta },
            { path: "single", name: "mpaSingle", component: () => import("@/components/pages/features/analysis/MetaproteomeSinglePage.vue"), meta: mpaMeta },
            { path: "compare", component: () => import("@/components/pages/features/analysis/MetaproteomeComparativePage.vue"), meta: mpaMeta },
            { path: "export", name: "mpaExport", component: () => import("@/components/pages/features/analysis/MetaproteomeExportPage.vue"), meta: mpaMeta },
            { path: "database", name: "mpaDatabase", component: () => import("@/components/pages/features/analysis/MetaproteomeDatabasePage.vue"), meta: mpaMeta },
        ],
        meta: mpaMeta
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
    {
        path: "/publications",
        component: () => import("@/components/pages/PublicationsPage.vue"),
        meta: {
            publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
            publicationLink: "doi:10.1021/acs.jproteome.8b00716"
        }
    },
    ...docsRoutes(docsSections, () => import("@/components/docs/DocsLayout.vue"))
]
