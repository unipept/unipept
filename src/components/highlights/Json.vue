<template>
    <pre class="fs" v-html="jsonParser.parseAndHighlight(object)"></pre>
</template>

<script setup lang="ts">
import JsonParser from '@/logic/parsers/json/JsonParser';

export interface Props {
    object: Object | [Object]
}

/* eslint-disable */
defineProps<Props>();

const jsonParser = new JsonParser();
</script>

<style scoped>
.fs {
    font-size: 90%;
};
</style>
