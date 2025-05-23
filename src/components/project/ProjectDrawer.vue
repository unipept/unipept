<template>
    <v-navigation-drawer
        rail
        permanent
    >
        <v-list
            density="compact"
            nav
        >
            <v-list-item
                color="primary"
                prepend-icon="mdi-test-tube"
                to="single"
            />
<!--            <v-list-item-->
<!--                color="primary"-->
<!--                prepend-icon="mdi-compare"-->
<!--                :value="ProjectDrawerItem.COMPARE"-->
<!--                @click="selectCompare"-->
<!--            />-->
        </v-list>

        <template #append>
            <v-list
                density="compact"
                nav
            >
                <v-list-item
                    color="primary"
                    prepend-icon="mdi-file-download"
                    to="export"
                />
                <v-list-item
                    color="primary"
                    prepend-icon="mdi-database-cog"
                    to="database"
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

const selectCompare = () => {
    selected.value = ProjectDrawerItem.COMPARE;
    selectedListItem.value = [ ProjectDrawerItem.COMPARE ];
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
    COMPARE = "compare",
    EXPORT = "export",
    DATABASE = "database"
}
</script>
