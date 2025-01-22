<template>
    <div style="height: 100%;">
        <img
            v-if="quickGoSmallUrl"
            class="quickGoThumb"
            :src="quickGoSmallUrl"
            alt="QuickGO chart of top GO terms."
            @click="showModal = !showModal"
        >

        <v-skeleton-loader
            v-else
            class="quickGoThumb"
            type="image"
        />

        <v-dialog
            v-if="items"
            v-model="showModal"
            max-width="90%"
        >
            <v-card>
                <v-card-title>
                    QuickGo {{ namespace.toString() }}
                </v-card-title>
                <v-card-text v-if="topN.length > 0">
                    This chart shows the relationship between the <b>{{ topN.length }}</b> most occurring GO terms:
                    {{ topNSentence }}.
                    <br>
                    <a
                        :href="quickGoChartUrl"
                        target="_blank"
                    >
                        <img
                            style="max-width: 80%; max-height: 600px; position: relative; left: 50%; transform: translateX(-50%); margin-top: 32px; margin-bottom: 32px;"
                            :src="quickGoChartUrl"
                            :alt="'QuickGO chart of ' + topNSentence"
                        >
                    </a>
                    <div>
                        Provided by
                        <a
                            :href="'https://www.ebi.ac.uk/QuickGO/annotations?goId=' + topN.map(x => x.code).join(',')"
                            target="_blank"
                        >
                            QuickGO
                        </a>
                    </div>
                </v-card-text>
                <v-card-text v-else>
                    No GO terms for this domain were found.
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {GoResultsTableItem} from "@/components/new/results/functional/go/GoResultsTable.vue";
import {GoNamespace} from "unipept-web-components";

const props = defineProps<{
    items: GoResultsTableItem[]
    namespace: GoNamespace
    n: number
}>();

const showModal = ref<boolean>(false);

const topN = computed(() =>
    [...props.items].sort((a, b) => b.count - a.count).slice(0, props.n)
);

const topNSentence = computed(() =>
    topN.value.slice(0, -1).map(x => x.name).join(', ') + (topN.value.length > 1 ? " and " : "") + topN.value.slice(-1).map(x => x.name)
);

const quickGoSmallUrl = computed(() => quickGoUrl(topN.value, false));

const quickGoChartUrl = computed(() => quickGoUrl(topN.value, true));

const quickGoUrl = (items: GoResultsTableItem[], showKey: boolean) => {
    if (items.length > 0) {
        const terms = items.map(x => x.code).sort().join(',');
        return `https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/${terms}/chart?showKey=${showKey}`;
    }
}
</script>

<style scoped>
.quickGoThumb {
    max-width: 100%;
    max-height: 300px;
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
}

a {
    color: #2196f3;
    text-decoration: none;
}

a:hover {
    text-decoration: none;
}
</style>