<template>
    <div class="json-node">
        <details
            v-if="container"
            :open="open"
            class="json-node__fold"
            @toggle="open = ($event.target as HTMLDetailsElement).open"
        >
            <summary>
                <span
                    v-if="name !== undefined"
                    class="json-node__key"
                >"{{ name }}"</span><template v-if="name !== undefined">: </template>{{ brackets[0] }}<span class="json-node__preview">
                    {{ preview }} {{ brackets[1] }}{{ last ? "" : "," }}</span>
            </summary>
            <div
                v-if="open"
                class="json-node__children"
            >
                <api-json-view
                    v-for="([key, child], index) in entries.slice(0, shown)"
                    :key="key"
                    :name="Array.isArray(value) ? undefined : key"
                    :value="child"
                    :depth="depth + 1"
                    :first="index === 0"
                    :last="index === entries.length - 1"
                    :mode="mode"
                />
                <button
                    v-if="entries.length > shown"
                    type="button"
                    class="json-node__more"
                    @click="shown += pageSize"
                >
                    Show {{ Math.min(pageSize, entries.length - shown) }} more of {{ entries.length - shown }}
                </button>
            </div>
            <div>{{ brackets[1] }}{{ last ? "" : "," }}</div>
        </details>
        <div v-else>
            <span
                v-if="name !== undefined"
                class="json-node__key"
            >"{{ name }}"</span><template v-if="name !== undefined">: </template><span :class="`json-node__${kind}`">{{ JSON.stringify(value) }}</span>{{ last ? "" : "," }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(defineProps<{
    value: unknown;
    name?: string;
    depth?: number;
    first?: boolean;
    last?: boolean;
    /**
     * Which objects and lists are open: in `start`, the outer one and its first item; in `open`, all of them; in
     * `closed`, only the outer one.
     */
    mode?: "start" | "open" | "closed";
}>(), {
    name: undefined,
    depth: 0,
    first: true,
    last: true,
    mode: "start"
});

const container = computed(() => typeof props.value === "object" && props.value !== null);
const entries = computed(() => Object.entries(props.value as object));
const brackets = computed(() => Array.isArray(props.value) ? ["[", "]"] : ["{", "}"]);
const kind = computed(() => props.value === null ? "null" : typeof props.value);

// The children of a closed object or list are only rendered when it opens, and at most `shown` of them, so that a
// large response stays fast.
const pageSize = 100;
const shown = ref(pageSize);
const open = ref(props.mode === "open" || props.depth === 0
    || (props.mode === "start" && props.depth === 1 && props.first));

const preview = computed(() => {
    if (Array.isArray(props.value)) {
        return `${props.value.length} items`;
    }
    const [firstEntry, ...rest] = entries.value;
    if (!firstEntry) {
        return "";
    }
    const [key, value] = firstEntry;
    const shown = typeof value === "object" && value !== null ? "…" : JSON.stringify(value);
    return `"${key}": ${shown}` + (rest.length > 0 ? `, … ${rest.length} more` : "");
});
</script>

<style scoped>
.json-node__children {
    padding-left: 16px;
}

.json-node__fold {
    margin: 0;
}

.json-node__fold > summary {
    list-style: none;
    cursor: pointer;
}

.json-node__fold > summary::-webkit-details-marker {
    display: none;
}

.json-node__fold > summary::before {
    content: "▸ ";
    color: var(--docs-code-muted);
}

.json-node__fold[open] > summary::before {
    content: "▾ ";
}

.json-node__fold[open] > summary .json-node__preview {
    display: none;
}

.json-node__preview {
    color: var(--docs-code-muted);
}

.json-node__more {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: var(--docs-code-muted);
    text-decoration: underline dotted;
    text-underline-offset: 3px;
    cursor: pointer;
}

.json-node__more:hover {
    color: var(--docs-code-light);
}

.json-node__key {
    color: var(--docs-json-key);
}

.json-node__string {
    color: var(--docs-json-string);
}

.json-node__number {
    color: var(--docs-json-number);
}

.json-node__boolean,
.json-node__null {
    color: var(--docs-json-literal);
}
</style>
