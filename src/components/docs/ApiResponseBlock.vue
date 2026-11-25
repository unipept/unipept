<template>
    <div
        class="api-response"
        aria-live="polite"
    >
        <div class="api-response__header">
            <span :class="['api-response__dot', `api-response__dot--${state}`]" />
            <span class="api-response__label">{{ labels[state] }}</span>
            <span
                v-if="response !== undefined && container && state !== 'failed'"
                class="api-response__tools"
            >
                <span class="api-response__count">{{ count }}</span>
                <button
                    type="button"
                    class="api-response__expand"
                    @click="setMode('open')"
                >
                    Expand all
                </button>
                <button
                    type="button"
                    class="api-response__expand"
                    @click="setMode('closed')"
                >
                    Collapse all
                </button>
            </span>
        </div>
        <div
            v-if="state === 'failed' || response !== undefined"
            :class="['api-response__body', { 'api-response__body--stale': state !== 'done' && state !== 'failed' }]"
        >
            <template v-if="state === 'failed'">
                {{ error }}
            </template>
            <api-json-view
                v-else
                :key="version"
                :value="response"
                :mode="mode"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ApiJsonView from "./ApiJsonView.vue";

/**
 * The response of a request. While a new response loads, or before the own input is sent, the previous response
 * stays visible, dimmed, so the block does not jump.
 */
const props = defineProps<{
    state: "idle" | "loading" | "done" | "failed";
    response?: unknown;
    error?: string;
}>();

const labels = {
    idle: "Press Try it to send this request",
    loading: "Loading the response from the API…",
    done: "Response, live from the API",
    failed: "The request failed"
};

// Each button press renders the tree anew in that mode; a new response starts in the start mode.
const mode = ref<"start" | "open" | "closed">("start");
const version = ref(0);
const setMode = (next: "open" | "closed") => {
    mode.value = next;
    version.value++;
};
watch(() => props.response, () => {
    mode.value = "start";
    version.value++;
});
const container = computed(() => typeof props.response === "object" && props.response !== null);
const count = computed(() => {
    const size = Array.isArray(props.response) ? props.response.length : Object.keys(props.response as object).length;
    return Array.isArray(props.response) ? `${size} ${size === 1 ? "item" : "items"}` : `${size} fields`;
});
</script>

<style scoped>
/* In the panel, the response shrinks to the space that is left, and its body scrolls. */
.api-response {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    border: 1px solid var(--docs-code-header);
    border-radius: 8px;
    background: var(--docs-code-dark);
}

/* In a narrow panel, the count and the buttons go to a second line together instead of breaking their text. */
.api-response__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--docs-code-header);
    color: var(--docs-code-label);
    font-size: 13px;
}

.api-response__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.api-response__dot--idle,
.api-response__dot--loading {
    background: var(--docs-status-idle);
}

.api-response__dot--loading {
    animation: api-response-pulse 1s ease-in-out infinite alternate;
}

@keyframes api-response-pulse {
    to {
        opacity: 0.3;
    }
}

.api-response__dot--done {
    background: var(--docs-status-done);
}

.api-response__dot--failed {
    background: var(--docs-status-failed);
}

.api-response__label {
    white-space: nowrap;
}

.api-response__tools {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    white-space: nowrap;
}

.api-response__count {
    color: var(--docs-code-muted);
}

.api-response__expand {
    padding: 2px 8px;
    border: 0;
    border-radius: 6px;
    background: var(--docs-code-button);
    color: var(--docs-code-light);
    font: inherit;
    cursor: pointer;
}

.api-response__expand:focus-visible {
    outline: 2px solid var(--docs-accent);
    outline-offset: 2px;
}

.api-response__body {
    flex: 0 1 auto;
    min-height: 0;
    padding: 12px 16px;
    overflow: auto;
    color: var(--docs-code-text);
    font-family: var(--docs-font-mono);
    font-size: 13px;
    line-height: 1.6;
    transition: opacity 0.2s;
}

.api-response__body--stale {
    opacity: 0.4;
}

@media (prefers-reduced-motion: reduce) {
    .api-response__dot--loading {
        animation: none;
    }

    .api-response__body {
        transition: none;
    }
}
</style>
