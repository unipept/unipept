<template>
    <v-container>
        <h1 class="font-weight-light">
            Unipept <Initialism>CLI</Initialism> documentation <small>v2.2.1</small>
        </h1>
        <h3 class="font-weight-light">
            The Unipept command line interface (<Initialism>CLI</Initialism>) offers an easy way to integrate Unipept metaproteomics functionality into your data 
            processing pipelines and scripts.
        </h3>

        <p class="mt-5">
            These tools provide a command line interface to the <RLink to="/apidocs" router>Unipept web services</RLink> and a few utility commands for handling proteins using the command line. All tools support fasta and plain text input, multiple output formats (csv, xml and json) and parallel web requests for improved performance.
        </p>

        <p class="mt-3">
            The Unipept command line tools are open source under the <Initialism>MIT</Initialism> License and all code is available on 
            <RLink to="https://github.com/unipept/unipept-cli">Github</RLink>. Changes between releases are listed in the <RLink to="/news/cli" router>changelog</RLink>. 
            In case you have encountered an issue using these tools, have feature requests or found a bug, don't hesitate to contact us by email 
            (<RLink to="unipept@ugent.be" mail>unipept@ugent.be</RLink>), or create an <RLink to="https://github.com/unipept/unipept-cli/issues">issue</RLink> on 
            Github.
        </p>

        <HeaderBodyCard id="functionality" title="CLI functionality" class="mt-5">
            <v-simple-table>
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-left">Resource</th>
                            <th class="text-left">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <router-link v-for="item in functions" class="clickable" :key="item.resource" :to="item.link" tag="tr">
                            <td style="white-space: nowrap;">
                                <b>{{ item.resource }}</b>
                            </td>
                            <td class="py-3">
                                {{ item.description }}
                            </td>
                        </router-link>
                    </tbody>
                </template>
            </v-simple-table>
        </HeaderBodyCard>

        <HeaderBodyCard id="installation" title="Installation" class="mt-5">
            <p>
                To use the Unipept command line tools, Ruby needs to be installed on your system. We recommend using Ruby 2.6, but all versions since Ruby 2.3 
                are supported. To check if you have the correct Ruby version installed, open a terminal and run <Code>ruby --version</Code>.
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> ruby --version
                <br>ruby 2.6.0p0 (2018-12-25 revision 66547) [x86_64-darwin18]
            </Boxed>

            <StaticAlert class="mt-5" title="Installing Ruby">
                <p>
                    If the <Code>ruby --version</Code> command returns command not found, Ruby is not yet installed on your system. More information on installing 
                    Ruby can be found at <RLink to="https://www.ruby-lang.org/en/installation/">https://www.ruby-lang.org/en/installation/</RLink>.
                </p>
            </StaticAlert>

            <p>
                The Unipept CLI is available as a <RLink to="https://rubygems.org/gems/unipept">gem</RLink>. This means it can easily be installed with the 
                <Code>gem install unipept</Code> command:
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> gem install unipept
                <br>Fetching: unipept-2.2.1.gem (100%)
                <br>Successfully installed unipept-2.2.1
                <br>Parsing documentation for unipept-2.2.1
                <br>Installing ri documentation for unipept-2.2.1
                <br>Done installing documentation for unipept after 0 seconds
                <br>1 gem installed
            </Boxed>

            <p>
                After successful installation, the unipept command should be available. To check if unipept was installed correctly, run <Code>unipept --version</Code>. 
                This should print the version number:
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> unipept --version
                <br>2.2.1
            </Boxed>

            <p>
                More information about the installed command can be found on these pages, or by running the <Code>unipept -h</Code> command.
            </p>

            <StaticAlert class="mt-5" title="Permission problems">
                <p>
                    When trying to install a gem, you might run into permission problems if you don't have write access to the default installation directory. 
                    This can be fixed by doing a user install, which installs the gem in your home directory. Simply run <Code>gem install unipept --user-install</Code> 
                    instead of the normal installation command. More information can be found on the <RLink to="https://guides.rubygems.org/faqs/#user-install">RubyGems website</RLink>.
                </p>
            </StaticAlert>

            <StaticAlert class="mt-5" title="Windows support">
                <p>
                    Unipept <Initialism>CLI</Initialism> should work on Unix, Mac, and Windows. However, because of one of our underlying dependencies (curl), 
                    some windows users experience issues during installation. In case of such issues, we recommend using the Unix Subsystem of Windows 10 instead. 
                    More information can be found on the <RLink to="https://docs.microsoft.com/en-us/windows/wsl/about">Microsoft website</RLink>.
                </p>
            </StaticAlert>
        </HeaderBodyCard>

        <HeaderBodyCard id="updates" title="Updates" class="mt-5">
            <p>
                To update the Unipept command line tools to the latest version, simply run <Code>gem update unipept</Code>. The changes between releases are listed 
                in the <RLink to="/news" router>changelog</RLink>.
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> gem update unipept
                <br>Updating installed gems
                <br>Updating unipept
                <br>Fetching: unipept-2.2.1.gem (100%)
                <br>Successfully installed unipept-2.2.1
                <br>Parsing documentation for unipept-2.2.1
                <br>Installing ri documentation for unipept-2.2.1
                <br>Installing darkfish documentation for unipept-2.2.1
                <br>Done installing documentation for unipept after 0 seconds
                <br>Gems updated: unipept
            </Boxed>
        </HeaderBodyCard>

        <HeaderBodyCard id="configuration" title="Configuration" class="mt-5">
            <p>
                The Unipept command line tools require no additional configuration and can be used immediately after installation. By default, the public Unipept 
                server will be used for all commands. If you have a local Unipept server running, and wish to use it with the command line tools, simply run the 
                <Code>unipept config host http://local.server</Code> command, where you substitute <Code>http://local.server</Code> with the address of your local 
                Unipept server:
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> unipept config host http://local.server
                <br>host was set to http://local.server
            </Boxed>

            <StaticAlert class="mt-5" title="Default settings">
                <p>
                    If you changed the host settings and wish to return to the default host, simply run <Code>unipept config host http://api.unipept.ugent.be</Code>.
                </p>
            </StaticAlert>
        </HeaderBodyCard>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import RLink from '@/components/highlights/ResourceLink.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
import Code from '@/components/highlights/InlineCode.vue';
import StaticAlert from '@/components/alerts/StaticAlert.vue';
import Initialism from '@/components/highlights/Initialism.vue';

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
