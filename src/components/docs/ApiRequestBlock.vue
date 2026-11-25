<template>
    <div class="language-bash api-request">
        <div class="code-header">
            <div
                role="tablist"
                aria-label="Request"
                class="api-request__tabs"
            >
                <button
                    v-for="(request, index) in requests"
                    :key="request.label"
                    type="button"
                    role="tab"
                    :aria-selected="index === active"
                    :class="['api-request__tab', { 'api-request__tab--active': index === active }]"
                    @click="active = index"
                >
                    {{ request.label }}
                </button>
            </div>
            <button
                type="button"
                class="copy"
            >
                Copy
            </button>
            <slot name="actions" />
        </div>
        <pre><code>{{ requests[active]?.code }}</code></pre>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

// The markup is that of a Markdown code block, so the docs styles and copy button work on it.
const props = defineProps<{
    requests: { label: string; code: string }[];
}>();

const active = ref(0);

// A request with fewer tabs, such as a POST-only one, starts at the first tab.
watch(() => props.requests.length, length => {
    if (active.value >= length) {
        active.value = 0;
    }
});
</script>

<style scoped>
.api-request__tabs {
    display: flex;
    gap: 2px;
    margin-right: auto;
}

.api-request__tab {
    padding: 4px 12px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--docs-code-muted);
    font: inherit;
    cursor: pointer;
}

.api-request__tab:hover {
    color: var(--docs-code-light);
}

.api-request__tab:focus-visible {
    outline: 2px solid var(--docs-accent);
    outline-offset: 1px;
}

.api-request__tab--active {
    background: var(--docs-code-dark);
    color: var(--docs-code-bright);
}
</style>
