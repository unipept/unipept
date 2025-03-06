<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center">
                    <v-text-field
                        v-model="protein"
                        color="primary"
                        density="default"
                        variant="outlined"
                        label="UniProtKB identifier"
                        hint="Provide a unique UniProtKB identifier (e.g. A0A0C5B5G6)."
                        persistent-hint
                        :disabled="importing"
                        :error-messages="[
                            ...(!validProtein ? ['This protein is not valid'] : []),
                            ...(selectedProteins.filter(p => p.protein === protein).length > 0 ? ['This protein is already added.'] : [])
                        ]"
                    >
                        <template #append-inner>
                            <v-btn
                                text="Add"
                                color="primary"
                                variant="flat"
                                prepend-icon="mdi-plus"
                                :disabled="selectedProteins.filter(p => p.protein === protein).length > 0 || !validProtein || importing"
                                @click="addProtein"
                            />
                        </template>
                    </v-text-field>

                    <span class="mb-6 mx-10 font-weight-bold">OR</span>

                    <v-tooltip
                        text="Provide a file where each line contains a separate UniProtKB identifier."
                        open-delay="0"
                        max-width="300"
                    >
                        <template #activator="{ props }">
                            <file-upload-button
                                v-bind="props"
                                class="mb-6"
                                :loading="importing"
                                @upload="importProteins"
                            />
                        </template>
                    </v-tooltip>
                </div>
                <span class="font-weight-bold">Hint:</span> browse
                <a
                    class="text-primary text-decoration-none"
                    href="https://www.uniprot.org/uniprotkb?query=*"
                    target="_blank"
                >
                    https://www.uniprot.org/uniprotkb
                </a>
                for a list of all available UniProtKB proteins.
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                    :headers="headers"
                    :items="selectedProteins"
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
                            text="No proteins added yet"
                        />
                    </template>

                    <template #item.type="{ item }">
                        <v-icon
                            v-if="item.type === ProteinType.Valid"
                            color="success"
                            icon="mdi-check"
                        />

                        <v-tooltip
                            v-else
                            location="bottom"
                            open-delay="500"
                            width="300"
                        >
                            <template #activator="{ props }">
                                <v-icon
                                    v-bind="props"
                                    color="error"
                                    icon="mdi-alert-circle-outline"
                                />
                            </template>
                            <span>
                                This protein was not found in UniProtKB. We will not be able to include this
                                protein in the database.
                            </span>
                        </v-tooltip>
                    </template>

                    <template #item.protein="{ item }">
                        <span v-if="item.type === ProteinType.Valid">{{ item.protein }}</span>
                        <span
                            v-else
                            class="text-error"
                        >{{ item.protein }}</span>
                    </template>

                    <template #item.name="{ item }">
                        <span v-if="item.type === ProteinType.Valid">{{ item.name }}</span>
                        <span
                            v-else
                            class="text-error"
                        >{{ item.name }}</span>
                    </template>

                    <template #item.taxon_name="{ item }">
                        <span v-if="item.type === ProteinType.Valid">{{ item.taxon_name }}</span>
                        <span
                            v-else
                            class="text-error"
                        >{{ item.taxon_name }}</span>
                    </template>

                    <template #item.action="{ item }">
                        <v-btn
                            color="error"
                            density="compact"
                            variant="text"
                            icon="mdi-delete"
                            @click="removeProtein(item)"
                        />
                    </template>
                </v-data-table>
                <span class="text-caption">
                    Resulting database will contain <b>{{ totalProteins }}</b> UniProtKB records.
                </span>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import ProtinfoCommunicator from "@/logic/communicators/unipept/protein/ProtinfoCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_BATCH_SIZE} from "@/logic/Constants";
import FileUploadButton from "@/components/filesystem/FileUploadButton.vue";

const uploadedFile = ref<File | null>(null);

const proteinCommunicator = new ProtinfoCommunicator(
    DEFAULT_API_BASE_URL,
    DEFAULT_BATCH_SIZE
);

enum ProteinType {
    Valid,
    Invalid
}

// TODO: need to annotate this as any until Vuetify correctly exposes the DataTableHeader types.
const headers: any = [
    {
        title: "Status",
        align: "center",
        value: "type",
        width: "5%"
    },
    {
        title: "Protein ID",
        align: "start",
        value: "protein",
        width: "15%"
    },
    {
        title: "Protein name",
        align: "start",
        value: "name",
        width: "45%"
    },
    {
        title: "Organism name",
        align: "start",
        value: "taxon_name",
        width: "23%"
    },
    {
        title: "",
        align: "left",
        value: "action",
        width: "2%",
        sortable: false
    }
];

const selectedProteins = defineModel<any[]>({ default: [] });

const protein = ref("");
const validProtein = ref(true)
const importing = ref(false);

const totalProteins = computed(() => selectedProteins.value.length);

const addProtein = async () => {
    const responses = await proteinCommunicator.getResponses(protein.value);
    validProtein.value = responses.has(protein.value);
    if (validProtein.value) {
        selectedProteins.value = [
            ...selectedProteins.value,
            { ...responses.get(protein.value), type: ProteinType.Valid }
        ];
        protein.value = "";
    }
}

const importProteins = async (file: File) => {
    importing.value = true;

    const proteins = await file.text().then(t => t.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0));

    const responses = await proteinCommunicator.getResponses(...proteins);
    const existingProteins = new Set(selectedProteins.value.map(p => p.protein));
    for (const protein of proteins) {
        if (!existingProteins.has(protein)) {
            if (responses.has(protein)) {
                selectedProteins.value.push({ ...responses.get(protein), type: ProteinType.Valid });
            } else {
                selectedProteins.value.push({ protein: protein, name: "N/A", taxon_name: "N/A", type: ProteinType.Invalid });
            }
        }
    }

    selectedProteins.value = [ ...selectedProteins.value ];
    protein.value = "";
    importing.value = false;
}

const removeProtein = (item: any) => {
    const idx = selectedProteins.value.findIndex(element => element.protein === item.protein);
    selectedProteins.value.splice(idx, 1);
    selectedProteins.value = [ ...selectedProteins.value ];
}

watch(protein, () => validProtein.value = true);
</script>

<style scoped>
:deep(.v-messages__message) {
    margin-left: -16px;
}
</style>
