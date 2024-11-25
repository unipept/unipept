<template>
    <v-card-text>
        <p>
            Bringing confidence to metaproteomics! The Peptonizer2000 uses peptide sequences and corresponding scores to
            perform species-level taxonomic identification. All potentially identified species are reported, together
            with a confidence score which indicates the probability of this species actually being present in the
            ecosystem under study.
        </p>
        <div class="d-flex justify-center">
            <v-btn @click="startPeptonizer" :disabled="peptonizerStore.status === PeptonizerStatus.Running" color="primary">
                ↯ Start to peptonize!
            </v-btn>
        </div>
    </v-card-text>
</template>

<script setup lang="ts">
import CountTable from "@/logic/new/CountTable";
import usePeptonizerStore, {PeptonizerStatus} from "@/store/new/PeptonizerAnalysisStore";
import {GridSearchProgressListener} from "peptonizer";
import {Ref, ref} from "vue";

const props = defineProps<{
  peptideCountTable: CountTable<string>
}>();

const peptonizerStore = usePeptonizerStore();
const progress: Ref<number[]> = ref<number[]>([0, 0])

class PeptonizerProgressListener implements GridSearchProgressListener {
    graphsUpdated(currentGraph: number, totalGraphs: number, workerId: number): void {
        console.log(`graphsUpdated called with:
                     currentGraph = ${currentGraph},
                     totalGraphs = ${totalGraphs},
                     workerId = ${workerId}`);
    }

    maxResidualUpdated(maxResidual: number, tolerance: number, workerId: number): void {
        console.log(`maxResidualUpdated called with:
                     maxResidual = ${maxResidual},
                     tolerance = ${tolerance},
                     workerId = ${workerId}`);
    }

    iterationsUpdated(currentIteration: number, totalIterations: number, workerId: number): void {
        console.log(`iterationsUpdated called with:
                     currentIteration = ${currentIteration},
                     totalIterations = ${totalIterations},
                     workerId = ${workerId}`);
    }
}

const startPeptonizer = async () => {
  await peptonizerStore.runPeptonizer(
      props.peptideCountTable,
      new PeptonizerProgressListener()
  );
}
</script>

<style scoped>

</style>