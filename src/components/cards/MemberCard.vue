<template>
    <v-unipept-card>
        <v-card-text class="pa-2">
            <v-list-item
                class="grow"
                :subtitle="title"
            >
                <template #prepend>
                    <v-avatar
                        size="72px"
                        color="primary"
                    >
                        <v-img
                            v-if="imgUrl"
                            alt="Avatar"
                            :src="imgUrl"
                            :cover="false"
                        />
                        <span
                            v-else
                            class="font-weight-bold mb-0 text-white"
                            style="font-size: 24px;"
                        >
                            {{ initials }}
                        </span>
                    </v-avatar>
                </template>

                <v-list-item-title>
                    <span
                        class="font-weight-bold"
                        style="font-size: 18px;"
                    >
                        {{ name }}
                    </span>
                </v-list-item-title>
            </v-list-item>
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface Props {
    name: string
    title: string
    imgUrl: string
}

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
