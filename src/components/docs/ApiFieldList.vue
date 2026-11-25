<template>
    <div class="api-fields">
        <div
            v-for="field in fields"
            :key="field.name"
            class="api-field"
        >
            <div class="api-field__head">
                <code class="api-field__name">{{ field.name }}</code>
                <span class="api-field__type">{{ field.type }}</span>
                <span
                    v-if="'required' in field && field.required"
                    class="api-field__required"
                >required</span>
                <span
                    v-if="'default' in field && field.default !== undefined"
                    class="api-field__tag"
                >default {{ field.default }}</span>
                <span
                    v-if="'when' in field && field.when"
                    class="api-field__tag api-field__tag--when"
                >
                    with
                    <template
                        v-for="(word, index) in field.when.split(' ')"
                        :key="index"
                    >
                        <code v-if="parameterNames.includes(word)">{{ word }}</code>
                        <template v-else>{{ word }}</template>
                        {{ " " }}
                    </template>
                </span>
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -- HTML that the build rendered from the page's own Markdown -->
            <p class="api-field__summary" v-html="field.summary" />
            <details
                v-if="field.details"
                class="api-field__more"
            >
                <summary>More</summary>
                <!-- eslint-disable-next-line vue/no-v-html -- HTML that the build rendered from the page's own Markdown -->
                <div v-html="field.details" />
            </details>
            <details
                v-if="'names' in field && field.names"
                class="api-field__more"
            >
                <summary>{{ field.names.length }} fields</summary>
                <ul class="api-field__names">
                    <li
                        v-for="name in field.names"
                        :key="name"
                    >
                        <code>{{ name }}</code>
                    </li>
                </ul>
            </details>
            <details
                v-if="'fields' in field && field.fields"
                class="api-field__more"
            >
                <summary>{{ field.fields.length }} fields</summary>
                <api-field-list
                    class="api-field__children"
                    :fields="field.fields"
                    :parameter-names="parameterNames"
                />
            </details>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ApiField, ApiParameter } from "@/logic/docs/ApiReference";

defineProps<{
    fields: (ApiParameter | ApiField)[];
    /** Names in a condition that are parameters, shown as code. */
    parameterNames: string[];
}>();
</script>

<style scoped>
.api-field {
    padding: 14px 0;
    border-bottom: 1px solid var(--docs-border);
}

.api-field__head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 10px;
}

.api-field__name {
    font-weight: 600;
}

.api-field__type {
    color: var(--docs-text-muted);
    font-size: 13px;
}

.api-field__required {
    color: var(--docs-danger-text);
    font-size: 12px;
    font-weight: 600;
}

.api-field__tag {
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--docs-surface-hover);
    color: var(--docs-text-muted);
    font-size: 12px;
}

.api-field__tag--when {
    background: var(--docs-info-bg);
    color: var(--docs-info-text);
}

.api-field__tag code {
    padding: 0;
    background: transparent;
    color: inherit;
    font-size: 1em;
}

.api-field__summary {
    margin: 4px 0 0 !important;
}

.api-field__more {
    margin: 6px 0 0;
    font-size: 14px;
    color: var(--docs-text-muted);
}

.api-field__more > summary {
    color: var(--docs-link);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}

.api-field__more :deep(p) {
    margin: 6px 0 0 !important;
}

.api-field__names {
    columns: 3 12em;
    margin: 8px 0 0;
    padding-left: 18px;
    font-size: 13px;
}

.api-field__children {
    margin-left: 16px;
    padding-left: 12px;
    border-left: 2px solid var(--docs-border);
}

.api-field:last-child {
    border-bottom: 0;
}
</style>
