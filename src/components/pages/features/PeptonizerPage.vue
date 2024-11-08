<template>
  <div class="mt-5">
    <v-row>
      <v-card class="d-flex flex-column flex-grow-1">
        <v-card-title class="bg-primary text-white">
          Peptonizer
        </v-card-title>
        <v-card-text class="mt-4">
          <h2 class="mb-4">Step 1: Upload input data</h2>
          <div>
            <!-- File Input for CSV Upload -->
            <v-file-input
                v-model="csvFile"
                label="Upload CSV File"
                accept=".psm.txt"
                @change="handleFileUpload"
            />
          </div>

          <h2 class="mt-8 mb-4">Step 2: Review parsed data</h2>
          <!-- Placeholder or Data Table -->
          <div v-if="!csvFile">
            Please upload a CSV file containing peptides and scores.
          </div>
          <v-data-table
              v-else
              :headers="tableHeaders"
              :items="tableData"
              class="mt-4"
          />

          <h2 class="mt-8 mb-4">Step 3: Peptonize!</h2>
          <div>
            Click this button to start peptonizing. The PepGM algorithm will be started and run for a set of different
            parameters. Then, the best run of the algorithm is automatically selected and presented here.
          </div>
          <div class="d-flex flex-column align-center">
            <v-btn color="primary" @click="peptonize()">
              Peptonize! ⚡
            </v-btn>
          </div>

          <h2 class="mt-4 mb-4">Step 4: Output</h2>
          <div>
            <v-progress-circular size="100" width="12" color="primary" model-value="20">
              <template v-slot:default>20%</template>
            </v-progress-circular>
          </div>
        </v-card-text>
      </v-card>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePeptonizerStore } from '@/store/PeptonizerStore';
import { VDataTable } from "vuetify/labs/VDataTable";

const peptonizerStore = usePeptonizerStore();
const csvFile = ref<File[] | null>(null);

// Table Headers
const tableHeaders = [
  {
    title: "Peptide",
    align: "start",
    key: "peptide",
    sortable: true
  },
  {
    title: "Score",
    align: "start",
    key: "score",
    sortable: true
  }
];

const readFileContents = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);

    reader.readAsText(file);
  });
};

// Trigger file upload and parse CSV content
const handleFileUpload = async () => {
  if (!csvFile.value) return;

  const fileContent = await readFileContents(csvFile.value[0]);
  peptonizerStore.parsePsmFile(fileContent);
};

const peptonize = async () => {
  if (!csvFile.value) return;

  const fileContent = await readFileContents(csvFile.value[0]);
  await peptonizerStore.runPeptonizer(fileContent);
}

// Data table items sourced from Pinia store
const tableData = computed(() => {
  return Array.from(peptonizerStore.assay.peptideScoreMap).map(([peptide, score]) => ({
    peptide,
    score
  }));
});
</script>

<style scoped>
.placeholder-text {
  font-size: 1.2em;
  color: #888;
  text-align: center;
}
</style>
