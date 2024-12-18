<template>
    <div>
        <highcharts :options="chartOptions"/>
    </div>
</template>

<script setup lang="ts">
import {PeptonizerResult} from "peptonizer";
import { Chart as highcharts } from 'highcharts-vue'
import { computed } from "vue";
import { Options } from "highcharts";

const props = defineProps<{
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
                text: 'Peptide IDs'
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