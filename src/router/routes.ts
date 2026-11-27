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

const metagenomicsMeta = {
    publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
    publicationLink: "doi:10.1021/acs.jproteome.8b00716"
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
        path: "/umgap",
        component: () => import("@/components/pages/features/MetagenomicsPage.vue"),
        children: [
            { path: "", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsOverviewPage.vue"), meta: metagenomicsMeta },
            { path: "casestudies", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsCaseStudiesPage.vue"), meta: metagenomicsMeta },
            { path: "casestudies/basic", component: () => import("@/components/pages/documentation/metagenomics/casestudies/MetagenomicsPreconfiguredPage.vue"), meta: metagenomicsMeta },
            { path: "casestudies/advanced", component: () => import("@/components/pages/documentation/metagenomics/casestudies/MetagenomicsAdvancedPage.vue"), meta: metagenomicsMeta },
            { path: "casestudies/comparative", component: () => import("@/components/pages/documentation/metagenomics/casestudies/MetagenomicsComparativePage.vue"), meta: metagenomicsMeta },
            { path: "fastq2fasta", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsFastq2FastaPage.vue"), meta: metagenomicsMeta },
            { path: "translate", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsTranslatePage.vue"), meta: metagenomicsMeta },
            { path: "prot2tryp", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsProt2TrypPage.vue"), meta: metagenomicsMeta },
            { path: "prot2kmer", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsProt2KmerPage.vue"), meta: metagenomicsMeta },
            { path: "filter", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsFilterPage.vue"), meta: metagenomicsMeta },
            { path: "pept2lca", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsPept2LcaPage.vue"), meta: metagenomicsMeta },
            { path: "prot2tryp2lca", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsProt2Tryp2LcaPage.vue"), meta: metagenomicsMeta },
            { path: "prot2kmer2lca", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsProt2Kmer2LcaPage.vue"), meta: metagenomicsMeta },
            { path: "bestof", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsBestofPage.vue"), meta: metagenomicsMeta },
            { path: "seedextend", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsSeedExtendPage.vue"), meta: metagenomicsMeta },
            { path: "uniq", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsUniqPage.vue"), meta: metagenomicsMeta },
            { path: "taxa2agg", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsTaxa2AggPage.vue"), meta: metagenomicsMeta },
            { path: "snaptaxon", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsSnapTaxonPage.vue"), meta: metagenomicsMeta },
            { path: "taxa2freq", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsTaxa2FreqPage.vue"), meta: metagenomicsMeta },
            { path: "taxa2tree", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsTaxa2TreePage.vue"), meta: metagenomicsMeta },
            { path: "taxonomy", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsTaxonomyPage.vue"), meta: metagenomicsMeta },
            { path: "splitkmers", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsSplitKmersPage.vue"), meta: metagenomicsMeta },
            { path: "joinkmers", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsJoinKmersPage.vue"), meta: metagenomicsMeta },
            { path: "buildindex", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsBuildIndexPage.vue"), meta: metagenomicsMeta },
            { path: "printindex", component: () => import("@/components/pages/documentation/metagenomics/MetagenomicsPrintIndexPage.vue"), meta: metagenomicsMeta }
        ],
        meta: metagenomicsMeta
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
