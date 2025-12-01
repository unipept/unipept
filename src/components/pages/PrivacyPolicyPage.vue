<template>
    <v-container class="py-6">
        <v-row>
            <v-col cols="12" lg="10">
                <h1 class="font-weight-light mb-4">Privacy Policy</h1>

                <header-body-card title="Analytics and operational monitoring" class="mb-4">
                    <div class="py-4">
                        <p>
                            We do not store any personal information, nor do we track or retain which peptides or datasets have been
                            analysed by individual users. All analyses are processed in a stateless way, and no analysis content is
                            persisted.
                        </p>

                        <p>
                            For usage analytics on Unipept, we use <RLink to="https://umami.is/">Umami</RLink>, a privacy‑friendly
                            analytics platform. This collects only aggregated, non‑personal metrics (e.g., page views, overall usage
                            patterns). No personally identifiable information (PII) or analysis content is captured.
                        </p>
                        <p>
                            Additionally, we operate an internal Grafana instance that visualizes data extracted from our server
                            access logs (Rust Axum). These logs contain only technical request metadata, such as:
                        </p>
                        <ul class="pl-6">
                            <li>Timestamp of the request</li>
                            <li>Endpoint accessed</li>
                            <li>Request count patterns</li>
                        </ul>
                        <p class="mt-2">
                            We do not log or store request bodies, query contents, peptide sequences, or any user‑associated
                            identifiers.
                        </p>
                    </div>
                </header-body-card>

                <div class="text-body-2 text-medium-emphasis">
                    Last updated: {{ lastUpdated }}
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Show a readable last updated date. Adjust if needed.
const lastUpdated = computed(() => new Date('2025-12-01T00:00:00Z').toLocaleDateString());
</script>

<style scoped>
</style>
