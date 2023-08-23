<template>
    <header-body-card title="Latest versions">
        <v-list>
            <v-list-item
                v-for="item in services"
                :key="item.name"
                class="px-0 px-sm-5"
                :to="item.to"
                link
                :prepend-icon="item.icon"
                append-icon="mdi-chevron-right"
            >
                <div class="d-flex flex-row">
                    <div class="flex-grow-1 d-flex align-center">
                        {{ item.name }}
                    </div>

                    <div class="d-flex align-center">
                        <v-chip
                            v-if="recentDate(item.date, 90)"
                            class="recent-release mr-2 justify-left"
                            size="small"
                            label
                            color="green"
                            prepend-icon="mdi-flag"
                        >
                            New
                        </v-chip>

                        <v-tooltip
                            v-if="item.version"
                            :text="formatDateFull(item.date)"
                        >
                            <template #activator="{ props }">
                                <v-chip
                                    class="justify-left"
                                    size="small"
                                    label
                                    color="primary"
                                    v-bind="props"
                                >
                                    {{ item.version }}
                                </v-chip>
                            </template>
                        </v-tooltip>
                    </div>
                </div>
            </v-list-item>
        </v-list>
    </header-body-card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import HeaderBodyCard from "./HeaderBodyCard.vue";

export type Service = {
    name: string,
    icon: string,
    version: string,
    date: string,
    to: string
}

export interface Props {
    services: Service[]
}

const { services } = defineProps<Props>();

const formatDateFull = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('en', { month: 'long' })} ${date.getFullYear()}`;
}

const recentDate = (dateString: string, maxDays: number) => {
    const date = new Date(dateString);
    return Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)) < maxDays;
}
</script>

<style scoped>
</style>
