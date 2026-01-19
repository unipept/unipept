<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex">
                    <v-text-field
                        v-model="proteome"
                        color="primary"
                        density="default"
                        variant="outlined"
                        label="Reference proteome identifier"
                        hint="Provide a unique UniProtKB reference proteome identifier (e.g. UP000005640)."
                        persistent-hint
                        :error-messages="!validProteome ? ['This proteome is not valid'] : []"
                        :rules="[
                            v => selectedProteomes.filter(p => p.id === v).length === 0 || 'This proteome is already added.'
                        ]"
                        @keyup.enter="addProteome"
                    >
                        <template #append-inner>
                            <v-btn
                                text="Add"
                                color="primary"
                                variant="flat"
                                prepend-icon="mdi-plus"
                                :disabled="selectedProteomes.filter(p => p.id === proteome).length > 0 || !validProteome"
                                @click="addProteome"
                            />
                        </template>
                    </v-text-field>
                </div>
                <span class="font-weight-bold">Hint:</span> browse
                <a
                    class="text-primary text-decoration-none"
                    href="https://www.uniprot.org/proteomes"
                    target="_blank"
                >
                    https://www.uniprot.org/proteomes
                </a>
                for a list of all available reference proteomes.
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table-virtual
                    :headers="headers"
                    :items="selectedProteomes"
                    :items-per-page="5"
                    :server-items-length="0"
                    :loading="false"
                    density="compact"
                >
                    <template #no-data>
                        <v-alert
                            class="ma-3"
                            density="compact"
                            type="info"
                            variant="tonal"
                            text="No proteomes added yet"
                        />
                    </template>

                    <template #item.type="{ item }">
                        <v-icon
                            v-if="item.type === ProteomeType.Reference"
                            color="success"
                            icon="mdi-check"
                        />

                        <v-tooltip
                            v-else-if="item.type === ProteomeType.Other"
                            location="bottom"
                            open-delay="500"
                        >
                            <template #activator="{ props }">
                                <v-icon
                                    v-bind="props"
                                    color="warning"
                                    icon="mdi-alert-outline"
                                />
                            </template>
                            <span>This proteome is not marked as a reference proteome, but will be processed for this database</span>
                        </v-tooltip>

                        <v-tooltip
                            v-else-if="item.type === ProteomeType.Redundant"
                            location="bottom"
                            open-delay="500"
                        >
                            <template #activator="{ props }">
                                <v-icon
                                    v-bind="props"
                                    color="error"
                                    icon="mdi-alert-circle-outline"
                                />
                            </template>
                            <span>This proteome is marked as redundant by Uniprot and will <b>not</b> be processed for this database</span>
                        </v-tooltip>

                        <v-tooltip
                            v-else-if="item.type === ProteomeType.Excluded"
                            location="bottom"
                            open-delay="500"
                        >
                            <template #activator="{ props }">
                                <v-icon
                                    v-bind="props"
                                    color="error"
                                    icon="mdi-alert-circle-outline"
                                />
                            </template>
                            <span>This proteome is marked as excluded by Uniprot and will not be processed for this database</span>
                        </v-tooltip>

                        <v-tooltip
                            v-else
                            location="bottom"
                            open-delay="500"
                        >
                            <template #activator="{ props }">
                                <v-icon
                                    v-bind="props"
                                    color="error"
                                    icon="mdi-alert-circle-outline"
                                />
                            </template>
                            <span>This proteome cannot be processed</span>
                        </v-tooltip>
                    </template>

                    <template #item.id="{ item }">
                        <span v-if="item.type in [ProteomeType.Reference, ProteomeType.Other]">{{ item.id }}</span>
                        <span
                            v-else
                            class="text-error"
                        >{{ item.id }}</span>
                    </template>

                    <template #item.organism="{ item }">
                        <span v-if="item.type in [ProteomeType.Reference, ProteomeType.Other]">{{ item.organism }}</span>
                        <span
                            v-else
                            class="text-error"
                        >{{ item.organism }}</span>
                    </template>

                    <template #item.count="{ item }">
                        <span v-if="item.type in [ProteomeType.Reference, ProteomeType.Other]">{{ item.count }}</span>
                        <span
                            v-else
                            class="text-error"
                        >{{ item.count }}</span>
                    </template>

                    <template #item.action="{ item }">
                        <v-btn
                            color="error"
                            density="compact"
                            variant="text"
                            icon="mdi-delete"
                            @click="removeProteome(item)"
                        />
                    </template>
                </v-data-table-virtual>
                <span class="text-caption">
                    Resulting database will contain <b>{{ totalProteins }}</b> UniProtKB records.
                </span>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import UniprotCommunicator, {ProteomeType} from "@/logic/communicators/uniprot/UniprotCommunicator";
import type { DataTableHeader } from "vuetify";

const headers: DataTableHeader[] = [
    {
        title: "Status",
        align: "center",
        value: "type",
        width: "5%"
    },
    {
        title: "Proteome ID",
        align: "start",
        value: "id",
        width: "15%"
    },
    {
        title: "Organism name",
        align: "start",
        value: "organism",
        width: "50%"
    },
    {
        title: "Protein count",
        align: "start",
        value: "count",
        width: "18%"
    },
    {
        title: "",
        align: "start",
        value: "action",
        width: "2%",
        sortable: false
    }
];

const selectedProteomes = defineModel<any[]>({ default: [] });

const proteome = ref("");
const validProteome = ref(true)

const totalProteins = computed(() => selectedProteomes.value
    .filter(p => p.type in [ProteomeType.Reference, ProteomeType.Other])
    .reduce((acc, p) => acc + p.count, 0)
)

const addProteome = () => {
    UniprotCommunicator.getProteome(proteome.value).then(newProteome => {
        validProteome.value = newProteome !== undefined
        if (validProteome.value) {
            selectedProteomes.value = [ ...selectedProteomes.value, newProteome ];
            proteome.value = "";
        }
    })
}

const removeProteome = (item: any) => {
    const idx = selectedProteomes.value.findIndex(element => element.id === item.id);
    selectedProteomes.value.splice(idx, 1)
    selectedProteomes.value = [ ...selectedProteomes.value ];
}

watch(proteome, () => validProteome.value = true);
</script>

<style scoped>
:deep(.v-messages__message) {
    margin-left: -16px;
}
</style>