<template>
    <div>
        <v-alert v-if="usesDefaultScores" variant="tonal" type="warning">
            No peptide scores provided.
            Peptonizer 2000 has used default values instead.
            This may impact the accuracy of your analysis results.
            For optimal performance, please provide scores from your search engine.
        </v-alert>
        <v-alert v-else variant="tonal" type="success">
            Custom peptide scores provided.
            Peptonizer 2000 will use these scores for analysis, which typically improves result accuracy.
            Ensure the scores are correctly derived from your search engine for optimal performance.
        </v-alert>
        <highcharts :options="chartOptions" style="min-height: 500px;"/>
    </div>
</template>

<script setup lang="ts">
import {PeptonizerResult} from "peptonizer";
import { Chart as highcharts } from 'highcharts-vue'
import { computed } from "vue";
import { Options } from "highcharts";

const props = defineProps<{
    usesDefaultScores: boolean,
    peptonizerResult: PeptonizerResult
}>();

const chartOptions = computed<Options>(() => {
    if (!props.peptonizerResult) {
        return {} as Options;
    }

    // Extract entries from the Map, format values, and sort them
    const entries = Array.from(props.peptonizerResult.entries()).map(
        ([key, value]) => [key, parseFloat(value.toFixed(2))]
    );
    // @ts-ignore
    const sortedEntries = entries.sort((a, b) => b[1] - a[1]);

    // Extract keys and values from the sorted entries
    const labels = sortedEntries.map(entry => entry[0]); // Sorted keys
    const values = sortedEntries.map(entry => entry[1]); // Sorted values

    return {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Peptonizer Confidence Scores'
        },
        xAxis: {
            categories: labels.slice(0, 20),
            title: {
                text: 'Taxon'
            }
        },
        yAxis: {
            min: 0,
            max: 1,
            title: {
                text: 'Confidence Score',
                align: 'high'
            },
            labels: {
                overflow: 'justify',
                format: '{value:.3f}'
            }
        },
        tooltip: {
            pointFormat: 'Confidence: <b>{point.y:.2f}</b>'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                    format: '{y:.3f}'
                }
            }
        },
        series: [{
            name: 'Confidence score',
            data: values.slice(0, 20)
        }]
    } as Options;
});

</script>

<style scoped>

</style>