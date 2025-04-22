<template>
    <v-navigation-drawer
        rail
        permanent
    >
        <v-list
            v-model:selected="selectedListItem"
            density="compact"
            nav
        >
            <v-list-item
                color="primary"
                prepend-icon="mdi-test-tube"
                :value="ProjectDrawerItem.ANALYSIS"
                @click="selectAnalysis"
            />
        </v-list>

        <template #append>
            <v-list
                v-model:selected="selectedListItem"
                density="compact"
                nav
            >
                <v-list-item
                    color="primary"
                    prepend-icon="mdi-file-download"
                    :value="ProjectDrawerItem.EXPORT"
                    @click="selectExport"
                />
                <v-list-item
                    color="primary"
                    prepend-icon="mdi-database-cog"
                    :value="ProjectDrawerItem.DATABASE"
                    @click="selectDatabase"
                />
            </v-list>
        </template>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import {ref} from "vue";

const selectedListItem = ref<string[]>([ ProjectDrawerItem.ANALYSIS ]);

const selected = defineModel<ProjectDrawerItem>({ default: ProjectDrawerItem.ANALYSIS });

const selectAnalysis = () => {
    selected.value = ProjectDrawerItem.ANALYSIS;
    selectedListItem.value = [ ProjectDrawerItem.ANALYSIS ];
}

const selectExport = () => {
    selected.value = ProjectDrawerItem.EXPORT;
    selectedListItem.value = [ ProjectDrawerItem.EXPORT ];
}

const selectDatabase = () => {
    selected.value = ProjectDrawerItem.DATABASE;
    selectedListItem.value = [ ProjectDrawerItem.DATABASE ];
}
</script>

<script lang="ts">
export enum ProjectDrawerItem {
    ANALYSIS = "analysis",
    EXPORT = "export",
    DATABASE = "database"
}
</script>
