<template>
    <v-container>
        <h1 class="font-weight-light">
            Unipept <initialism>CLI</initialism> documentation <small>v2.2.1</small>
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
                To use the Unipept command line tools, Ruby needs to be installed on your system. We recommend using Ruby 2.6, but all versions since Ruby 2.3
                are supported. To check if you have the correct Ruby version installed, open a terminal and run <inline-code>ruby --version</inline-code>.
            </p>

            <boxed>
                <sentinel>$</sentinel> ruby --version
                <br>ruby 2.6.0p0 (2018-12-25 revision 66547) [x86_64-darwin18]
            </boxed>

            <static-alert
                class="mt-5"
                title="Installing Ruby"
            >
                <p>
                    If the <inline-code>ruby --version</inline-code> command returns command not found, Ruby is not yet installed on your system. More information on installing
                    Ruby can be found at <r-link to="https://www.ruby-lang.org/en/installation/">
                        https://www.ruby-lang.org/en/installation/
                    </r-link>.
                </p>
            </static-alert>

            <p>
                The Unipept CLI is available as a <r-link to="https://rubygems.org/gems/unipept">
                    gem
                </r-link>. This means it can easily be installed with the
                <inline-code>gem install unipept</inline-code> command:
            </p>

            <boxed>
                <sentinel>$</sentinel> gem install unipept
                <br>Fetching: unipept-2.2.1.gem (100%)
                <br>Successfully installed unipept-2.2.1
                <br>Parsing documentation for unipept-2.2.1
                <br>Installing ri documentation for unipept-2.2.1
                <br>Done installing documentation for unipept after 0 seconds
                <br>1 gem installed
            </boxed>

            <p>
                After successful installation, the unipept command should be available. To check if unipept was installed correctly, run <inline-code>unipept --version</inline-code>.
                This should print the version number:
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept --version
                <br>2.2.1
            </boxed>

            <p>
                More information about the installed command can be found on these pages, or by running the <inline-code>unipept -h</inline-code> command.
            </p>

            <static-alert
                class="mt-5"
                title="Permission problems"
            >
                <p>
                    When trying to install a gem, you might run into permission problems if you don't have write access to the default installation directory.
                    This can be fixed by doing a user install, which installs the gem in your home directory. Simply run <inline-code>gem install unipept --user-install</inline-code>
                    instead of the normal installation command. More information can be found on the <r-link to="https://guides.rubygems.org/faqs/#user-install">
                        RubyGems website
                    </r-link>.
                </p>
            </static-alert>

            <static-alert
                class="mt-5"
                title="Windows support"
            >
                <p>
                    Unipept <initialism>CLI</initialism> should work on Unix, Mac, and Windows. However, because of one of our underlying dependencies (curl),
                    some windows users experience issues during installation. In case of such issues, we recommend using the Unix Subsystem of Windows 10 instead.
                    More information can be found on the <r-link to="https://docs.microsoft.com/en-us/windows/wsl/about">
                        Microsoft website
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
                To update the Unipept command line tools to the latest version, simply run <inline-code>gem update unipept</inline-code>. The changes between releases are listed
                in the <r-link
                    to="/news"
                    router
                >
                    changelog
                </r-link>.
            </p>

            <boxed>
                <sentinel>$</sentinel> gem update unipept
                <br>Updating installed gems
                <br>Updating unipept
                <br>Fetching: unipept-2.2.1.gem (100%)
                <br>Successfully installed unipept-2.2.1
                <br>Parsing documentation for unipept-2.2.1
                <br>Installing ri documentation for unipept-2.2.1
                <br>Installing darkfish documentation for unipept-2.2.1
                <br>Done installing documentation for unipept after 0 seconds
                <br>Gems updated: unipept
            </boxed>
        </header-body-card>

        <header-body-card
            id="configuration"
            title="Configuration"
            class="mt-5"
            large-title
        >
            <p>
                The Unipept command line tools require no additional configuration and can be used immediately after installation. By default, the public Unipept
                server will be used for all commands. If you have a local Unipept server running, and wish to use it with the command line tools, simply run the
                <inline-code>unipept config host http://local.server</inline-code> command, where you substitute <inline-code>http://local.server</inline-code> with the address of your local
                Unipept server:
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept config host http://local.server
                <br>host was set to http://local.server
            </boxed>

            <static-alert
                class="mt-5"
                title="Default settings"
            >
                <p>
                    If you changed the host settings and wish to return to the default host, simply run <inline-code>unipept config host http://api.unipept.ugent.be</inline-code>.
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
        resource: "unipept taxa2lca",
        description: "Returns the taxonomic lowest common ancestor for a given list of taxon identifiers.",
        link: "/clidocs/taxa2lca"
    },
    {
        resource: "unipept taxa2tree",
        description: "Returns the taxonomic tree for a given list of taxon identifiers.",
        link: "/clidocs/taxa2tree"
    },
    {
        resource: "unipept taxonomy",
        description: "Returns the taxonomic information for a given taxon identifier.",
        link: "/clidocs/taxonomy"
    }
]
</script>
