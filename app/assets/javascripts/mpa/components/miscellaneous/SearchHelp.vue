<template>
  <v-row class="search-info">
    <v-col class="info-step">
      <h2>Select samples</h2>
      <p>
        Make a selection of samples that should be analysed. New samples can be added by pasting a peptide list, or existing samples can be reused.
      </p>
    </v-col>
    <v-col class="info-step">
      <h2>Click search</h2>
      <p>
        Review the search settings for peptide deduplication, advanced missed cleavage handling and equating isoleucine and leucine before clicking search.
      </p>
    </v-col>
    <v-col class="info-step">
      <h2>Gain insight</h2>
      <p>
        For each of the peptides, the lowest common ancestor (LCA) will be calculated, aggregated and visualised on the result page, giving you insight in the taxonomic diversity of your sample.
      </p>
    </v-col>
  </v-row>
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';

@Component
export default class SearchHelp extends Vue {}
</script>

<style scoped>
</style>
