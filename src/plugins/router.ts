import Vue from "vue";
import VueRouter from "vue-router";
import HomePage from "@/components/pages/HomePage.vue";
import AboutPage from "@/components/pages/AboutPage.vue";
import NewsPage from "@/components/pages/NewsPage.vue";
import TrypticPeptideAnalysisPage from "@/components/pages/features/TrypticPeptideAnalysisPage.vue";
import MetaproteomeAnalysisPage from "@/components/pages/features/MetaproteomeAnalysisPage.vue";
import APIPage from "@/components/pages/features/APIPage.vue";
import CLIPage from "@/components/pages/features/CLIPage.vue";
import MetagenomicsPage from "@/components/pages/features/MetagenomicsPage.vue";
import DesktopPage from "@/components/pages/features/DesktopPage.vue";
import TrypticPeptideAnalysisResultPage from "@/components/pages/analysis/TrypticPeptideAnalysisResultPage.vue";
import PublicationsPage from "@/components/pages/PublicationsPage.vue";

// API Documentation
import {
    APIOverviewPage,
    APIPept2ProtPage,
    APIPept2TaxaPage,
    APIPept2LcaPage,
    APIPept2EcPage,
    APIPept2GoPage,
    APIPept2InterproPage,
    APIPept2FunctPage,
    APIPeptInfoPage,
    APITaxa2LcaPage,
    APITaxa2TreePage,
    APITaxonomyPage
} from "@/components/pages/apidocs";

// CLI Documentation
import {
    CLIOverviewPage,
    CLICaseStudiesPage,
    CLITrypticPeptideAnalysisPage,
    CLIMetaproteomicsAnalysisPage,
    CLIUniprotPage,
    CLIProt2PeptPage,
    CLIPeptfilterPage,
    CLIPept2LcaPage,
    CLIPept2ProtPage,
    CLIPept2TaxaPage,
    CLIPept2EcPage,
    CLIPept2GoPage,
    CLIPept2InterproPage,
    CLIPept2FunctPage,
    CLIPeptInfoPage,
    CLITaxa2LcaPage,
    CLITaxa2TreePage,
    CLITaxonomyPage
} from "@/components/pages/clidocs";

// Metagenomics Documentation
import {
    MetagenomicsOverviewPage,
    MetagenomicsCaseStudiesPage,
    MetagenomicsPreconfiguredPage,
    MetagenomicsAdvancedPage,
    MetagenomicsComparativePage,
    MetagenomicsFastq2FastaPage,
    MetagenomicsTranslatePage,
    MetagenomicsProt2TrypPage,
    MetagenomicsProt2KmerPage,
    MetagenomicsFilterPage,
    MetagenomicsPept2LcaPage,
    MetagenomicsProt2Tryp2LcaPage,
    MetagenomicsProt2Kmer2LcaPage,
    MetagenomicsBestofPage,
    MetagenomicsSeedExtendPage,
    MetagenomicsUniqPage,
    MetagenomicsTaxa2AggPage,
    MetagenomicsSnapTaxonPage,
    MetagenomicsTaxa2FreqPage,
    MetagenomicsTaxa2TreePage,
    MetagenomicsTaxonomyPage,
    MetagenomicsSplitKmersPage,
    MetagenomicsJoinKmersPage,
    MetagenomicsBuildIndexPage,
    MetagenomicsPrintIndexPage
} from "@/components/pages/metagenomics"

// Desktop Documentation
import DesktopGettingStartedPage from "@/components/pages/desktopdocs/DesktopGettingStartedPage.vue"
import DesktopApplicationOverviewPage from "@/components/pages/desktopdocs/DesktopApplicationOverviewPage.vue";
import DesktopProjectManagementPage from "@/components/pages/desktopdocs/DesktopProjectManagementPage.vue";
import DesktopSingleAssayAnalysisPage from "@/components/pages/desktopdocs/DesktopSingleAssayAnalysisPage.vue";
import DesktopComparativeAnalysisPage from "@/components/pages/desktopdocs/DesktopComparativeAnalysisPage.vue";
import DesktopConfigurationOptionsPage from "@/components/pages/desktopdocs/DesktopConfigurationOptionsPage.vue";
import DesktopFAQPage from "@/components/pages/desktopdocs/DesktopFAQPage.vue";

// News Documentation
import NewsOverviewPage from "@/components/pages/news/NewsOverviewPage.vue";
import APINewsPage from "@/components/pages/news/APINewsPage.vue";
import CLINewsPage from "@/components/pages/news/CLINewsPage.vue";
import WebNewsPage from "@/components/pages/news/WebNewsPage.vue";
import DesktopNewsPage from "@/components/pages/news/DesktopNewsPage.vue";
import AnalyticsCommunicator from "@/logic/communicators/analytics/AnalyticsCommunicator";

Vue.use(VueRouter);

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
        component: HomePage,
        meta: {
            publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
            publicationLink: "doi:10.1021/acs.jproteome.8b00716"
        }
    },
    {
        path: "/tpa",
        component: TrypticPeptideAnalysisPage,
        meta: tpaMeta
    },
    {
        path: "/tpa/:sequence",
        name: "tpaResult",
        component: TrypticPeptideAnalysisResultPage,
        meta: tpaMeta
    },
    {
        path: "/mpa",
        component: MetaproteomeAnalysisPage,
        meta: {
            publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
            publicationLink: "doi:10.1021/acs.jproteome.8b00716"
        }
    },
    {
        path: "/apidocs",
        component: APIPage,
        children: [
            { path: "", component: APIOverviewPage, meta: apidocsMeta },
            { path: "pept2prot", component: APIPept2ProtPage, meta: apidocsMeta },
            { path: "pept2taxa", component: APIPept2TaxaPage, meta: apidocsMeta },
            { path: "pept2lca", component: APIPept2LcaPage, meta: apidocsMeta },
            { path: "pept2ec", component: APIPept2EcPage, meta: apidocsMeta },
            { path: "pept2go", component: APIPept2GoPage, meta: apidocsMeta },
            { path: "pept2interpro", component: APIPept2InterproPage, meta: apidocsMeta },
            { path: "pept2funct", component: APIPept2FunctPage, meta: apidocsMeta },
            { path: "peptinfo", component: APIPeptInfoPage, meta: apidocsMeta },
            { path: "taxa2lca", component: APITaxa2LcaPage, meta: apidocsMeta },
            { path: "taxa2tree", component: APITaxa2TreePage, meta: apidocsMeta },
            { path: "taxonomy", component: APITaxonomyPage, meta: apidocsMeta },
        ],
        meta: apidocsMeta
    },
    {
        path: "/clidocs",
        component: CLIPage,
        children: [
            { path: "", component: CLIOverviewPage, meta: clidocsMeta },
            { path: "casestudies", component: CLICaseStudiesPage, meta: clidocsMeta },
            { path: "casestudies/tpa", component: CLITrypticPeptideAnalysisPage, meta: clidocsMeta },
            { path: "casestudies/mpa", component: CLIMetaproteomicsAnalysisPage, meta: clidocsMeta },
            { path: "uniprot", component: CLIUniprotPage, meta: clidocsMeta },
            { path: "prot2pept", component: CLIProt2PeptPage, meta: clidocsMeta },
            { path: "peptfilter", component: CLIPeptfilterPage, meta: clidocsMeta },
            { path: "pept2lca", component: CLIPept2LcaPage, meta: clidocsMeta },
            { path: "pept2prot", component: CLIPept2ProtPage, meta: clidocsMeta },
            { path: "pept2taxa", component: CLIPept2TaxaPage, meta: clidocsMeta },
            { path: "pept2ec", component: CLIPept2EcPage, meta: clidocsMeta },
            { path: "pept2go", component: CLIPept2GoPage, meta: clidocsMeta },
            { path: "pept2interpro", component: CLIPept2InterproPage, meta: clidocsMeta },
            { path: "pept2funct", component: CLIPept2FunctPage, meta: clidocsMeta },
            { path: "peptinfo", component: CLIPeptInfoPage, meta: clidocsMeta },
            { path: "taxa2lca", component: CLITaxa2LcaPage, meta: clidocsMeta },
            { path: "taxa2tree", component: CLITaxa2TreePage, meta: clidocsMeta },
            { path: "taxonomy", component: CLITaxonomyPage, meta: clidocsMeta }
        ],
        meta: clidocsMeta
    },
    {
        path: "/umgap",
        component: MetagenomicsPage,
        children: [
            { path: "", component: MetagenomicsOverviewPage, meta: metagenomicsMeta },
            { path: "casestudies", component: MetagenomicsCaseStudiesPage, meta: metagenomicsMeta },
            { path: "casestudies/basic", component: MetagenomicsPreconfiguredPage, meta: metagenomicsMeta },
            { path: "casestudies/advanced", component: MetagenomicsAdvancedPage, meta: metagenomicsMeta },
            { path: "casestudies/comparative", component: MetagenomicsComparativePage, meta: metagenomicsMeta },
            { path: "fastq2fasta", component: MetagenomicsFastq2FastaPage, meta: metagenomicsMeta },
            { path: "translate", component: MetagenomicsTranslatePage, meta: metagenomicsMeta },
            { path: "prot2tryp", component: MetagenomicsProt2TrypPage, meta: metagenomicsMeta },
            { path: "prot2kmer", component: MetagenomicsProt2KmerPage, meta: metagenomicsMeta },
            { path: "filter", component: MetagenomicsFilterPage, meta: metagenomicsMeta },
            { path: "pept2lca", component: MetagenomicsPept2LcaPage, meta: metagenomicsMeta },
            { path: "prot2tryp2lca", component: MetagenomicsProt2Tryp2LcaPage, meta: metagenomicsMeta },
            { path: "prot2kmer2lca", component: MetagenomicsProt2Kmer2LcaPage, meta: metagenomicsMeta },
            { path: "bestof", component: MetagenomicsBestofPage, meta: metagenomicsMeta },
            { path: "seedextend", component: MetagenomicsSeedExtendPage, meta: metagenomicsMeta },
            { path: "uniq", component: MetagenomicsUniqPage, meta: metagenomicsMeta },
            { path: "taxa2agg", component: MetagenomicsTaxa2AggPage, meta: metagenomicsMeta },
            { path: "snaptaxon", component: MetagenomicsSnapTaxonPage, meta: metagenomicsMeta },
            { path: "taxa2freq", component: MetagenomicsTaxa2FreqPage, meta: metagenomicsMeta },
            { path: "taxa2tree", component: MetagenomicsTaxa2TreePage, meta: metagenomicsMeta },
            { path: "taxonomy", component: MetagenomicsTaxonomyPage, meta: metagenomicsMeta },
            { path: "splitkmers", component: MetagenomicsSplitKmersPage, meta: metagenomicsMeta },
            { path: "joinkmers", component: MetagenomicsJoinKmersPage, meta: metagenomicsMeta },
            { path: "buildindex", component: MetagenomicsBuildIndexPage, meta: metagenomicsMeta },
            { path: "printindex", component: MetagenomicsPrintIndexPage, meta: metagenomicsMeta }
        ],
        meta: metagenomicsMeta
    },
    {
        path: "/desktop",
        component: DesktopPage,
        children: [
            { path: "", component: DesktopGettingStartedPage, meta: desktopMeta },
            { path: "application-overview", component: DesktopApplicationOverviewPage, meta: desktopMeta },
            { path: "project-management", component: DesktopProjectManagementPage, meta: desktopMeta },
            { path: "single-assay-analysis", component: DesktopSingleAssayAnalysisPage, meta: desktopMeta },
            { path: "comparative-analysis", component: DesktopComparativeAnalysisPage, meta: desktopMeta },
            { path: "configuration", component: DesktopConfigurationOptionsPage, meta: desktopMeta },
            { path: "faq", component: DesktopFAQPage, meta: desktopMeta }
        ],
        meta: desktopMeta
    },
    {
        path: "/about",
        component: AboutPage,
        meta: {
            publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
            publicationLink: "doi:10.1021/acs.jproteome.8b00716"
        }
    },
    {
        path: "/news",
        component: NewsPage,
        children: [
            { path: "", component: NewsOverviewPage, meta: newsMeta },
            { path: "api", component: APINewsPage, meta: newsMeta },
            { path: "cli", component: CLINewsPage, meta: newsMeta },
            { path: "web", component: WebNewsPage, meta: newsMeta },
            { path: "desktop", component: DesktopNewsPage, meta: newsMeta },
        ],
        meta: newsMeta
    },
    {
        path: "/publications",
        component: PublicationsPage,
        meta: {
            publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
            publicationLink: "doi:10.1021/acs.jproteome.8b00716"
        }
    },
];

const router = new VueRouter({
    routes,
    mode: "history",
    base: process.env.BASE_URL,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            // Go to appended anchor in the url
            return {
                selector: to.hash,
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
});

router.afterEach((to, from) => {
    new AnalyticsCommunicator().logRoute(to);
});

export default router;
