<template>
    <v-container>
        <h1 class="font-weight-light">
            Unipept <initialism>CLI</initialism> documentation <small>v4.2.2</small>
        </h1>
        <h3 class="font-weight-light">
            The Unipept command line interface (<initialism>CLI</initialism>) offers an easy way to integrate Unipept metaproteomics functionality into your data
            processing pipelines and scripts.
        </h3>

        <p class="mt-5">
            These tools provide a command line interface to the <r-link
                to="/apidocs"
                router
            >
                Unipept web services
            </r-link> and a few utility commands for handling proteins using the command line. All tools support fasta and plain text input, multiple output formats (csv, xml and json) and parallel web requests for improved performance.
        </p>

        <p class="mt-3">
            The Unipept command line tools are open source under the <initialism>MIT</initialism> License and all code is available on
            <r-link to="https://github.com/unipept/unipept-cli">
                Github
            </r-link>. Changes between releases are listed in the <r-link
                to="/news/cli"
                router
            >
                changelog
            </r-link>.
            In case you have encountered an issue using these tools, have feature requests or found a bug, don't hesitate to contact us by email
            (<r-link
                to="unipept@ugent.be"
                mail
            >
                unipept@ugent.be
            </r-link>), or create an <r-link to="https://github.com/unipept/unipept-cli/issues">
                issue
            </r-link> on
            Github.
        </p>

        <header-body-card
            id="functionality"
            title="CLI functionality"
            class="mt-5"
            large-title
        >
            <v-table>
                <thead>
                    <tr>
                        <th class="text-left">
                            Resource
                        </th>
                        <th class="text-left">
                            Description
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in functions"
                        :key="item.resource"
                        class="clickable"
                        @click="navigate(item.link)"
                    >
                        <td style="white-space: nowrap;">
                            <b>{{ item.resource }}</b>
                        </td>
                        <td class="py-3">
                            {{ item.description }}
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </header-body-card>

        <header-body-card
            id="installation"
            title="Installation"
            class="mt-5"
            large-title
        >
            <p>
                To use the Unipept command line tools, Node.js 22 or higher needs to be installed on your system. To check which version you
                have, open a terminal and run <inline-code>node --version</inline-code>.
            </p>

            <boxed>
                <sentinel>$</sentinel> node --version
                <br>v22.3.0
            </boxed>

            <static-alert
                class="mt-5"
                title="Installing Node.js"
            >
                <p>
                    If the <inline-code>node --version</inline-code> command returns command not found, Node.js is not yet installed on your system. More information on
                    installing Node.js can be found at <r-link to="https://nodejs.org/en/download/package-manager">
                        https://nodejs.org/en/download/package-manager
                    </r-link>.
                </p>
            </static-alert>

            <p>
                The Unipept CLI is available as an <r-link to="https://www.npmjs.com/package/unipept-cli">
                    npm package
                </r-link>. This means it can easily be installed with the
                <inline-code>npm install</inline-code> command:
            </p>

            <boxed>
                <sentinel>$</sentinel> npm install -g unipept-cli
                <br>added 3 packages in 986ms
            </boxed>

            <p>
                After successful installation, the unipept command should be available. To check if unipept was installed correctly, run <inline-code>unipept --version</inline-code>.
                This prints the version of the CLI, followed by the UniProt release that the Unipept database was built from:
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept --version
                <br>4.2.2 (UniProt 2026.02)
            </boxed>

            <p>
                More information about the installed command can be found on these pages, or by running the <inline-code>unipept -h</inline-code> command.
            </p>

            <h2 class="mt-5">
                Running without installing
            </h2>

            <p>
                The <initialism>CLI</initialism> can also be run straight through <inline-code>npx</inline-code>, which ships with Node.js. This is handy
                for trying a command out, and for pinning an exact version so that an analysis can be reproduced without asking anyone to install
                anything.
            </p>

            <boxed>
                <sentinel>$</sentinel> npx unipept-cli pept2lca AALTER
                <br>peptide,cutoff_used,taxon_id,taxon_name,taxon_rank
                <br>AALTER,1,1,root,no rank
                <br>
                <br><sentinel>$</sentinel> npx unipept-cli@4.2.2 --version
                <br>4.2.2 (UniProt 2026.02)
            </boxed>

            <p>
                <inline-code>npx unipept-cli</inline-code> runs the <inline-code>unipept</inline-code> command. The other three commands are separate
                binaries in the same package, so they need <inline-code>-p</inline-code> to say which package to take them from.
            </p>

            <boxed>
                <sentinel>$</sentinel> echo "AALTERSVKAAPKR" | npx -p unipept-cli prot2pept
                <br>AALTER
                <br>SVK
                <br>AAPK
                <br>R
            </boxed>

            <static-alert
                class="mt-5"
                title="npx and older versions"
            >
                <p>
                    <inline-code>npx unipept-cli</inline-code> works from version 4.2.2 onwards. For earlier versions, name the command explicitly with
                    <inline-code>npx -p unipept-cli@4.2.1 unipept</inline-code>.
                </p>
            </static-alert>

            <static-alert
                class="mt-5"
                title="Permission problems"
            >
                <p>
                    A global install writes to a directory that your user may not have write access to, which shows up as an <inline-code>EACCES</inline-code> error.
                    Rather than installing with <inline-code>sudo</inline-code>, it is better to point npm at a directory you own. More information can be found on the
                    <r-link to="https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally">
                        npm website
                    </r-link>.
                </p>
            </static-alert>
        </header-body-card>

        <header-body-card
            id="updates"
            title="Updates"
            class="mt-5"
            large-title
        >
            <p>
                To update the Unipept command line tools to the latest version, simply run <inline-code>npm update -g unipept-cli</inline-code>. The changes between releases are listed
                in the <r-link
                    to="/news"
                    router
                >
                    changelog
                </r-link>.
            </p>

            <boxed>
                <sentinel>$</sentinel> npm update -g unipept-cli
                <br>changed 1 package in 1s
            </boxed>
        </header-body-card>

        <header-body-card
            id="configuration"
            title="Configuration"
            class="mt-5"
            large-title
        >
            <p>
                The Unipept command line tools require no configuration and can be used immediately after installation. By default, the public Unipept
                server is used for all commands.
            </p>

            <p>
                If you have a local Unipept server running and wish to use it, pass its address to the <inline-code>--host</inline-code> option. The option
                belongs to the subcommand rather than to <inline-code>unipept</inline-code> itself, so it goes after the subcommand name:
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept pept2lca --host http://local.server AALTER
            </boxed>

            <static-alert
                class="mt-5"
                title="Setting a default server"
            >
                <p>
                    Earlier versions of the <initialism>CLI</initialism> had a <inline-code>unipept config</inline-code> subcommand for storing a default
                    host. It no longer exists, so the host has to be given per command.
                </p>
            </static-alert>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import RLink from '@/components/highlights/ResourceLink.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
import InlineCode from '@/components/highlights/InlineCode.vue';
import StaticAlert from '@/components/alerts/StaticAlert.vue';
import initialism from '@/components/highlights/Initialism.vue';
import useNavigation from "@/composables/useNavigation";

const { navigate } = useNavigation();

const functions = [
    {
        resource: "uniprot",
        description: "Fetches UniProt entries based on their accession numbers.",
        link: "/clidocs/uniprot"
    },
    {
        resource: "prot2pept",
        description: "Splits proteins into peptides based on (trypsin) digest.",
        link: "/clidocs/prot2pept"
    },
    {
        resource: "peptfilter",
        description: "Filters peptides based on length and amino acid occurrence.",
        link: "/clidocs/peptfilter"
    },
    {
        resource: "unipept pept2prot",
        description: "Returns the set of UniProt entries containing a given tryptic peptide.",
        link: "/clidocs/pept2prot"
    },
    {
        resource: "unipept pept2taxa",
        description: "Returns the set of taxa extracted from the UniProt entries containing a given tryptic peptide.",
        link: "/clidocs/pept2taxa"
    },
    {
        resource: "unipept pept2lca",
        description: "Returns the taxonomic lowest common ancestor for a given tryptic peptide.",
        link: "/clidocs/pept2lca"
    },
    {
        resource: "unipept pept2ec",
        description: "Returns the functional EC-numbers associated with a given tryptic peptide.",
        link: "/clidocs/pept2ec"
    },
    {
        resource: "unipept pept2go",
        description: "Returns the functional GO-terms associated with a given tryptic peptide.",
        link: "/clidocs/pept2go"
    },
    {
        resource: "unipept pept2interpro",
        description: "Returns the functional InterPro entries associated with a given tryptic peptide.",
        link: "/clidocs/pept2interpro"
    },
    {
        resource: "unipept pept2funct",
        description: "Returns the functional EC-numbers, GO-terms and InterPro entries associated with a given tryptic peptide.",
        link: "/clidocs/pept2funct"
    },
    {
        resource: "unipept peptinfo",
        description: "Returns functional information and the lowest common ancestor for a given tryptic peptide.",
        link: "/clidocs/peptinfo"
    },
    {
        resource: "unipept protinfo",
        description: "Returns functional and taxonomic information for a given UniProt accession number.",
        link: "/clidocs/protinfo"
    },
    {
        resource: "unipept taxa2lca",
        description: "Returns the taxonomic lowest common ancestor for a given list of taxon identifiers.",
        link: "/clidocs/taxa2lca"
    },
    {
        resource: "unipept taxonomy",
        description: "Returns the taxonomic information for a given taxon identifier.",
        link: "/clidocs/taxonomy"
    }
]
</script>
