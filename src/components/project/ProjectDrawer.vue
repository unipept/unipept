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
        </v-list>

        <template #append>
            <v-list
                density="compact"
                nav
            >
                <v-list-item
                    color="primary"
                    prepend-icon="mdi-content-save"
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

</script>
