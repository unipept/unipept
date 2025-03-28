<template>
    <v-container>
        <v-row>
            <v-col
                sm="12"
                lg="5"
            >
                <h1 class="font-weight-light">
                    About Unipept
                </h1>
                <p>
                    The Unipept web application supports biodiversity and functional analysis of large and complex metaproteome samples.
                    Its underlying index structure is designed to quickly retrieve all occurrences of a tryptic peptide in UniProt entries.
                    Taxon-specificity of the tryptic peptide is successively derived from these occurrences using a novel lowest common ancestor approach that is robust against taxonomic misarrangements, misidentifications and inaccuracies.
                    This application consists of two separate functionalities: the <RLink
                        to="/tpa"
                        router
                    >
                        Tryptic Peptide Analysis
                    </RLink> and the <RLink
                        to="/mpa"
                        router
                    >
                        Metaproteomics Analysis
                    </RLink>.
                </p>
                <p>
                    The initial Unipept publication can be found at <RLink to="https://pubs.acs.org/doi/10.1021/pr300576s">
                        Unipept: tryptic peptide-based biodiversity analysis of metaproteome samples
                    </RLink>, a follow up publication can be found at <RLink to="https://analyticalsciencejournals.onlinelibrary.wiley.com/doi/10.1002/pmic.201400361">
                        The Unipept Metaproteomics Analysis Pipeline
                    </RLink>.
                    The API was published as <RLink to="https://academic.oup.com/bioinformatics/article/32/11/1746/1742840?login=false">
                        Unipept Web Services for Metaproteomics Analysis
                    </RLink>.
                </p>
            </v-col>

            <v-col
                sm="12"
                lg="7"
            >
                <header-body-card title="How to cite Unipept">
                    <div class="px-2 py-4">
                        <span>
                            If you use Unipept for your research, please cite:
                        </span>
                        <ul class="pl-6">
                            <li>
                                Unipept in 2024: Vande Moortele et al. (2024)
                                <RLink to="https://doi.org/10.1101/2024.09.26.615136">
                                    doi.org/10.1101/2024.09.26.615136
                                </RLink>
                            </li>
                            <li>
                                Unipept Desktop 2.0: Verschaffelt et al. (2023)
                                <RLink to="https://doi.org/10.1021/acs.jproteome.3c00091">
                                    doi.org/10.1021/acs.jproteome.3c00091
                                </RLink>
                            </li>
                            <li>
                                Unipept Desktop: Verschaffelt et al. (2021)
                                <RLink to="https://doi.org/10.1021/acs.jproteome.0c00855">
                                    doi.org/10.1021/acs.jproteome.0c00855
                                </RLink>
                            </li>
                            <li>
                                CLI 2.0: Verschaffelt et al. (2020)
                                <RLink to="https://doi.org/10.1093/bioinformatics/btaa553">
                                    doi.org/10.1093/bioinformatics/btaa553
                                </RLink>
                            </li>
                            <li>
                                CLI: Mesuere et al. (2017)
                                <RLink to="https://doi.org/10.1016/j.jprot.2017.05.022">
                                    doi.org/10.1016/j.jprot.2017.05.022
                                </RLink>
                            </li>
                            <li>
                                Peptidome Analysis: Mesuere et al. (2016) Proteomics
                                <RLink to="https://doi.org/10.1002/pmic.201600023">
                                    doi.org/10.1002/pmic.201600023
                                </RLink>
                            </li>
                            <li>
                                API: Mesuere et al. (2016) Bioinformatics
                                <RLink to="https://doi.org/10.1093/bioinformatics/btw039">
                                    doi.org/10.1093/bioinformatics/btw039
                                </RLink>
                            </li>
                            <li>
                                General: Gurdeep Singh et al. (2019) Journal of Proteome Research
                                <RLink to="https://doi.org/10.1021/acs.jproteome.8b00716">
                                    doi.org/10.1021/acs.jproteome.8b00716
                                </RLink>
                            </li>
                            <li>
                                General: Mesuere et al. (2015) Proteomics
                                <RLink to="https://doi.org/10.1002/pmic.201400361">
                                    doi.org/10.1002/pmic.201400361
                                </RLink>
                            </li>
                            <li>
                                General: Mesuere et al. (2012) J. Proteome Res.
                                <RLink to="https://doi.org/10.1021/pr300576s">
                                    doi.org/10.1021/pr300576s
                                </RLink>
                            </li>
                        </ul>
                    </div>
                </header-body-card>
            </v-col>
        </v-row>

        <h1 class="font-weight-light mt-5">
            Unipept team
        </h1>
        <v-row>
            <v-col
                v-for="member in members"
                :key="member.name"
                sm="6"
                md="4"
            >
                <member-card
                    :name="member.name"
                    :title="member.title"
                    :img-url="member.imgUrl"
                />
            </v-col>
        </v-row>

        <h1 class="font-weight-light mt-5">
            Former members
        </h1>
        <v-row>
            <v-col
                v-for="member in former_members"
                :key="member.name"
                sm="6"
                md="4"
            >
                <member-card
                    :name="member.name"
                    :title="member.title"
                    :img-url="member.imgUrl"
                />
            </v-col>
        </v-row>

        <h1 class="font-weight-light mt-5">
            Supported by
        </h1>
        <v-row>
            <v-col
                v-for="supporter in supporters"
                :key="supporter.name"
                sm="6"
                md="4"
            >
                <v-unipept-card>
                    <v-card-text>
                        <v-img
                            :src="supporter.imgUrl"
                            height="100px"
                            contain
                        />
                    </v-card-text>
                </v-unipept-card>
            </v-col>
        </v-row>

        <h1 class="font-weight-light mt-5">
            Disclaimer
        </h1>
        <p>
            We make no warranties regarding the correctness of the data, and disclaim liability for damages resulting
            from its use.
        </p>
    </v-container>
</template>

<script setup lang="ts">
import RLink from '@/components/highlights/ResourceLink.vue';
import HeaderBodyCard from '../cards/HeaderBodyCard.vue';
import MemberCard from '../cards/MemberCard.vue';
import elixirLogoImage from "@/assets/about/elixir-logo.svg";
import ugentLogoImage from "@/assets/about/ugent-logo.png";
import timProfilePicture from "@/assets/profiles/tim_van_den_bossche.png?url"
import tanjaProfilePicture from "@/assets/profiles/tanja_holstein.png?url"

const members = [
    { name: "Bart Mesuere", title: "Project lead", imgUrl: "https://avatars.githubusercontent.com/u/481872?v=4" },
    { name: "Pieter Verschaffelt", title: "PostDoc", imgUrl: "https://avatars.githubusercontent.com/u/9608686?v=4" },
    { name: "Tim Van Den Bossche", title: "PostDoc", imgUrl: timProfilePicture },
    { name: "Tibo Vande Moortele", title: "PhD student", imgUrl: "https://avatars.githubusercontent.com/u/34175340?v=4" },
    { name: "Simon Van de Vyver", title: "PhD student", imgUrl: "" },
    { name: "Tanja Holstein", title: "PhD student", imgUrl: tanjaProfilePicture },
    { name: "Jasper Janin", title: "Master student 2024 - 2025", imgUrl: "" },
    { name: "Peter Dawyndt", title: "P.I.", imgUrl: "https://avatars.githubusercontent.com/u/5736113?v=4" },
    { name: "Lennart Martens", title: "P.I.", imgUrl: "" }
];

const former_members = [
    { name: "Robbert Gurdeep Singh", title: "Developer 2017-2018", imgUrl: "https://avatars.githubusercontent.com/u/662538?v=4" },
    { name: "Felix Van der Jeugt", title: "PhD student", imgUrl: "https://avatars.githubusercontent.com/u/994166?v=4" },
    { name: "Toon Willems", title: "Master's student 2013-2014", imgUrl: "https://avatars.githubusercontent.com/u/104395?v=4" },
    { name: "Tom Naessens", title: "Master's student 2014-2015", imgUrl: "https://avatars.githubusercontent.com/u/915130?v=4" },
    { name: "Stijn Seghers", title: "Master's student 2015-2016", imgUrl: "https://avatars.githubusercontent.com/u/607786?v=4" },
    { name: "Kevin Velghe", title: "Master's student 2015-2016", imgUrl: "" },
    { name: "Aranka Steyaert", title: "Master's student 2016-2017", imgUrl: "" },
    { name: "Niels De Graef", title: "Master's student 2016-2018", imgUrl: "https://avatars.githubusercontent.com/u/1382976?v=4" },
    { name: "Stijn De Clercq", title: "Master student 2023 - 2024", imgUrl: "" },
    { name: "Bram Devlaminck", title: "Master student 2023 - 2024", imgUrl: "" },
    { name: "Peter Vandamme", title: "Advisor", imgUrl: "" },
    { name: "Bart Devreese", title: "Advisor", imgUrl: "" },
];

const supporters = [
    { name: "ELIXIR", imgUrl: elixirLogoImage },
    { name: "UGent", imgUrl: ugentLogoImage }
];
</script>
