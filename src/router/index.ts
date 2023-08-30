// Composables
import { createRouter, createWebHistory } from 'vue-router'

const tpaMeta = {
    publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
    publicationLink: "doi:10.1021/acs.jproteome.8b00716"
};

const apidocsMeta = {
    publication: "Mesuere et al. (2016) Bioinformatics",
    publicationLink: "doi:10.1093/bioinformatics/btw039"
};

const clidocsMeta = {
    publication: "Verschaffelt et al. (2020) Bioinformatics",
    publicationLink: "doi.org/10.1093/bioinformatics/btaa553"
};

const metagenomicsMeta = {
    publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
    publicationLink: "doi:10.1021/acs.jproteome.8b00716"
};

const newsMeta = {
    publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
    publicationLink: "doi:10.1021/acs.jproteome.8b00716"
};

const desktopMeta = {
    publication: "Verschaffelt et al. (2021) Journal of Proteome Research",
    publicationLink: "doi.org/10.1021/acs.jproteome.0c00855"
}

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
        path: "/apidocs",
        component: () => import("@/components/pages/features/APIPage.vue"),
        children: [
            { path: "", component: () => import("@/components/pages/documentation/apidocs/APIDocsOverviewPage.vue"), meta: apidocsMeta },
            { path: "pept2prot", component: () => import("@/components/pages/documentation/apidocs/APIPept2ProtPage.vue"), meta: apidocsMeta },
            { path: "pept2taxa", component: () => import("@/components/pages/documentation/apidocs/APIPept2TaxaPage.vue"), meta: apidocsMeta },
            { path: "pept2lca", component: () => import("@/components/pages/documentation/apidocs/APIPept2LcaPage.vue"), meta: apidocsMeta },
            { path: "pept2ec", component: () => import("@/components/pages/documentation/apidocs/APIPept2EcPage.vue"), meta: apidocsMeta },
            { path: "pept2go", component: () => import("@/components/pages/documentation/apidocs/APIPept2GoPage.vue"), meta: apidocsMeta },
            { path: "pept2interpro", component: () => import("@/components/pages/documentation/apidocs/APIPept2InterproPage.vue"), meta: apidocsMeta },
            { path: "pept2funct", component: () => import("@/components/pages/documentation/apidocs/APIPept2FunctPage.vue"), meta: apidocsMeta },
            { path: "peptinfo", component: () => import("@/components/pages/documentation/apidocs/APIPeptInfoPage.vue"), meta: apidocsMeta },
            { path: "taxa2lca", component: () => import("@/components/pages/documentation/apidocs/APITaxa2LcaPage.vue"), meta: apidocsMeta },
            { path: "taxa2tree", component: () => import("@/components/pages/documentation/apidocs/APITaxa2TreePage.vue"), meta: apidocsMeta },
            { path: "taxonomy", component: () => import("@/components/pages/documentation/apidocs/APITaxonomyPage.vue"), meta: apidocsMeta },
        ],
        meta: apidocsMeta
    },
    {
        path: "/clidocs",
        component: () => import("@/components/pages/features/CLIPage.vue"),
        children: [
            { path: "", component: () => import("@/components/pages/documentation/clidocs/CLIDocsOverviewPage.vue"), meta: clidocsMeta },
            { path: "casestudies", component: () => import("@/components/pages/documentation/clidocs/CLICaseStudiesPage.vue"), meta: clidocsMeta },
            { path: "casestudies/tpa", component: () => import("@/components/pages/documentation/clidocs/casestudies/CLITrypticCaseStudy.vue"), meta: clidocsMeta },
            { path: "casestudies/mpa", component: () => import("@/components/pages/documentation/clidocs/casestudies/CLIMetaproteomicsCaseStudy.vue"), meta: clidocsMeta },
            { path: "uniprot", component: () => import("@/components/pages/documentation/clidocs/CLIUniprotPage.vue"), meta: clidocsMeta },
            { path: "prot2pept", component: () => import("@/components/pages/documentation/clidocs/CLIProt2PeptPage.vue"), meta: clidocsMeta },
            { path: "peptfilter", component: () => import("@/components/pages/documentation/clidocs/CLIPeptfilterPage.vue"), meta: clidocsMeta },
            { path: "pept2lca", component: () => import("@/components/pages/documentation/clidocs/CLIPept2LcaPage.vue"), meta: clidocsMeta },
            { path: "pept2prot", component: () => import("@/components/pages/documentation/clidocs/CLIPept2ProtPage.vue"), meta: clidocsMeta },
            { path: "pept2taxa", component: () => import("@/components/pages/documentation/clidocs/CLIPept2TaxaPage.vue"), meta: clidocsMeta },
            { path: "pept2ec", component: () => import("@/components/pages/documentation/clidocs/CLIPept2EcPage.vue"), meta: clidocsMeta },
            { path: "pept2go", component: () => import("@/components/pages/documentation/clidocs/CLIPept2GoPage.vue"), meta: clidocsMeta },
            { path: "pept2interpro", component: () => import("@/components/pages/documentation/clidocs/CLIPept2InterproPage.vue"), meta: clidocsMeta },
            { path: "pept2funct", component: () => import("@/components/pages/documentation/clidocs/CLIPept2FunctPage.vue"), meta: clidocsMeta },
            { path: "peptinfo", component: () => import("@/components/pages/documentation/clidocs/CLIPeptInfoPage.vue"), meta: clidocsMeta },
            { path: "taxa2lca", component: () => import("@/components/pages/documentation/clidocs/CLIPept2TaxaPage.vue"), meta: clidocsMeta },
            { path: "taxa2tree", component: () => import("@/components/pages/documentation/clidocs/CLITaxa2TreePage.vue"), meta: clidocsMeta },
            { path: "taxonomy", component: () => import("@/components/pages/documentation/clidocs/CLITaxonomyPage.vue"), meta: clidocsMeta }
        ],
        meta: clidocsMeta
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
            return { x: 0, y: 0 }
        }
    }
})

export default router;
