<template>
    <v-card>
        <v-card-text class="pa-0">
            <v-list-item class="grow">
                <v-list-item-avatar
                    size="36px"
                    color="primary"
                >
                    <img v-if="imgUrl"
                        alt="Avatar"
                        :src="imgUrl"
                    >
                    <p v-else
                        v-text="initials"
                        class="font-weight-bold mb-0 white--text"
                    ></p>
                </v-list-item-avatar>

                <v-list-item-content>
                    <v-list-item-title class="font-weight-bold">
                        {{ name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                        {{ title }}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">import { computed } from 'vue';

export interface Props {
    name: string
    title: string
    imgUrl: string
}

/* eslint-disable */
const props = defineProps<Props>()

const initials = computed(() => {
    const name = props.name;
    const names = name.split(" ");
    const firstInitial = names[0].charAt(0);
    const lastInitial = names[names.length - 1].charAt(0);

    return firstInitial + lastInitial;
});
</script>

<style scoped>
</style>
