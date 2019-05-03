<template>
    <table class="table table-condensed table-amounttable">
        <thead>
            <tr>
                <th scope="col">Peptides</th>
                <th scope="col">GO term</th>
                <th scope="col">Name</th>
                <th scope="col"></th>
                <th scope="col">
                    <button class="btn btn-default btn-xs btn-animate amounttable-download">
                        <span class="glyphicon glyphicon-download down"></span> Save table as CSV
                    </button>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr aria-expanded="false" tabindex="0" role="button" style="cursor: pointer;" v-for="goTerm of goTerms" v-bind:key="goTerm.code">
                <td class="shaded-cell" style="background-image: linear-gradient(to right, rgb(221, 221, 221) 10.0301%, transparent 10.0301%); width: 5em;">
                    {{ goTerm.popularity }}
                </td>
                <td style="width: 7em;">
                    <a :href="`https://www.ebi.ac.uk/QuickGO/term/${goTerm.code}`" target="_blank">
                        {{ goTerm.code }}
                    </a>
                </td>
                <td>
                    {{ goTerm.name }}
                </td>
                <td style="width: 6em; text-align: right;">
                    <span class="glyphicon glyphicon-download glyphicon-inline down btn-icon" title="" role="button" tabindex="0" data-original-title="Download CSV of the matched peptides"></span>
                </td>
                <td class="glyphicon glyphicon-inline amounttable-chevron">
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
import GoTerm from "../../../fa/GoTerm";

    @Component({
        components: {}
    })
    export default class AmountTable extends Vue {
        @Prop({required: true})
        private goTerms: GoTerm[];
    }
</script>

<style scoped>
</style>
