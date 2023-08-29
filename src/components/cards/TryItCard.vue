<template>
    <header-body-card
        title="Try it"
        large-title
    >
        <p class="mt-2">
            Use the API explorer form below to call the {{ command }} method on live data and see the response.
        </p>

        <slot />

        <template #extension>
            <v-divider />

            <v-card-text
                class="grey lighten-4"
            >
                <h4>
                    Response
                </h4>
                <json
                    class="limited"
                    :object="response"
                />
            </v-card-text>
        </template>
    </header-body-card>
</template>

<script setup lang="ts">
import HeaderBodyCard from './HeaderBodyCard.vue';
import Json from '../highlights/Json.vue';

export interface Props {
    response: object | object[],
    command: string
}

defineProps<Props>();
</script>

<style scoped>
.request {
    display: block;
    border: 1px solid #cccccc;
    border-radius: 2px;
    background-color: #f5f5f5;
    overflow: auto;
    line-height: 0;
    padding: 20px 10px;
    margin-bottom: 12px;
}

.limited {
    max-height: 350px;
    overflow: auto;
}
</style>
