<template>
    <v-navigation-drawer
        rail
        permanent
    >
        <v-list
            density="compact"
            nav
        >
            <v-tooltip text="Homepage" location="end">
                <template #activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        color="primary"
                        base-color="grey-darken-1"
                        prepend-icon="mdi-home"
                        to="home"
                    />
                </template>
            </v-tooltip>

            <v-divider class="my-1" />

            <v-tooltip text="Single analysis" location="end">
                <template #activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        color="primary"
                        base-color="grey-darken-1"
                        prepend-icon="mdi-test-tube"
                        to="single"
                    />
                </template>
            </v-tooltip>
            <v-tooltip text="Comparative analysis" location="end">
                <template #activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        color="primary"
                        base-color="grey-darken-1"
                        prepend-icon="unipept:test-tube-multiple"
                        to="compare"
                    />
                </template>
            </v-tooltip>
        </v-list>

        <template #append>
            <v-list
                density="compact"
                nav
            >
                <v-tooltip text="Export project" location="end">
                    <template #activator="{ props }">
                        <v-list-item
                            v-bind="props"
                            color="primary"
                            base-color="grey-darken-1"
                            prepend-icon="mdi-file-download"
                            to="export"
                        />
                    </template>
                </v-tooltip>
                <v-tooltip text="Manage databases" location="end">
                    <template #activator="{ props }">
                        <v-list-item
                            v-bind="props"
                            color="primary"
                            base-color="grey-darken-1"
                            prepend-icon="mdi-database-cog"
                            to="database"
                        />
                    </template>
                </v-tooltip>
            </v-list>
        </template>
    </v-navigation-drawer>
</template>

<script setup lang="ts">

</script>

<style scoped>
:deep(.v-list-item:not(.v-list-item--active) .v-icon) {
    color: rgb(97, 97, 97);
}
</style>