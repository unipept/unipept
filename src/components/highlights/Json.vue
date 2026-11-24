<template>
    <!-- eslint-disable-next-line vue/no-v-html -- JsonParser escapes the JSON before it adds the highlight spans -->
    <pre class="fs" v-html="jsonParser.parseAndHighlight(object)" />
</template>

<script setup lang="ts">
import JsonParser from '@/logic/parsers/json/JsonParser';

export interface Props {
    object: any
}

defineProps<Props>();

const jsonParser = new JsonParser();
</script>

<style scoped>
.fs {
    font-size: 90%;
}
</style>
