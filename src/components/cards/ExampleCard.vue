<template>
    <v-card>
        <v-card-text>
            <h4>
                Example <small>{{ title }}</small>
            </h4>
            <p>
                <slot name="description" />
            </p>

            <initialism><b>post</b></initialism>
            <boxed>
                <sentinel>$</sentinel>
                <slot name="post" />
            </boxed>

            <initialism><b>get</b></initialism>
            <boxed>
                <slot name="get" />
            </boxed>
        </v-card-text>

        <v-divider />

        <v-card-text class="grey lighten-4 limited">
            <h4>Response</h4>
            <json :object="response" />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import Initialism from "@/components/highlights/Initialism.vue";
import Sentinel from "@/components/highlights/Sentinel.vue"
import Boxed from "../highlights/Boxed.vue";
import Json from "@/components/highlights/Json.vue";

export interface Props {
    title: string,
    response: object | object[]
}

defineProps<Props>();

</script>

<style scoped>
h4 {
    font-size: 16px;
}

.limited {
    max-height: 350px;
    overflow: auto;
}
</style>
