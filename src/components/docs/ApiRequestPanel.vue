<template>
    <div
        id="examples"
        class="api-panel"
    >
        <span
            v-for="example in api.examples.filter(e => e.id)"
            :id="example.id"
            :key="example.id"
            class="api-panel__anchor"
        />
        <span
            id="try"
            class="api-panel__anchor"
        />

        <div class="api-panel__picker">
            <div
                class="api-panel__label"
                aria-hidden="true"
            >
                Request
            </div>
            <v-select
                v-model="selection"
                :items="pickerItems"
                aria-label="Request"
                color="secondary"
                density="compact"
                variant="outlined"
                hide-details
            />
        </div>

        <!-- eslint-disable vue/no-v-html -- HTML that the build rendered from the page's own Markdown -->
        <div
            v-if="selection !== 'own' && api.examples[selection]?.description"
            class="api-panel__description"
            v-html="api.examples[selection].description"
        />
        <!-- eslint-enable vue/no-v-html -->

        <div
            v-if="selection === 'own'"
            class="api-panel__form"
        >
            <v-textarea
                v-for="parameter in listParameters"
                :key="parameter.name"
                v-model="own.lists[parameter.name]"
                :label="`${parameter.name}, one per line`"
                class="api-panel__list"
                color="secondary"
                density="compact"
                variant="outlined"
                rows="3"
                hide-details
            />
            <v-select
                v-for="parameter in choiceParameters"
                :key="parameter.name"
                v-model="own.choices[parameter.name]"
                :items="parameter.values"
                :label="parameter.name"
                color="secondary"
                density="compact"
                variant="outlined"
                multiple
                chips
                closable-chips
                hide-details
            />
            <v-text-field
                v-for="parameter in textParameters"
                :key="parameter.name"
                v-model="own.texts[parameter.name]"
                :label="parameter.name"
                color="secondary"
                density="compact"
                variant="outlined"
                hide-details
            />
            <div
                v-if="booleanParameters.length > 0"
                class="api-panel__checks"
            >
                <v-checkbox
                    v-for="parameter in booleanParameters"
                    :key="parameter.name"
                    v-model="own.booleans[parameter.name]"
                    :label="parameter.name"
                    color="secondary"
                    density="compact"
                    hide-details
                />
            </div>
            <p class="api-panel__hint">
                Starts from the example that was chosen. The request below follows these fields.
            </p>
        </div>

        <api-request-block :requests="requests">
            <template #actions>
                <button
                    type="button"
                    class="api-panel__try"
                    @click="send"
                >
                    Try it ▶
                </button>
            </template>
        </api-request-block>

        <api-response-block
            v-if="shown || result"
            :state="result?.state ?? 'idle'"
            :response="result?.state === 'done' ? result.response : shown?.response"
            :error="result?.error"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useEventListener } from "@vueuse/core";
import { useRequestPanel } from "@/composables/docs/useRequestPanel";
import ApiRequestBlock from "./ApiRequestBlock.vue";
import ApiResponseBlock from "./ApiResponseBlock.vue";
import { DEFAULT_API_BASE_URL } from "@/logic/Constants";
import type { ApiParamValue, ApiReferenceData } from "@/logic/docs/ApiReference";
import { apiCurl, apiGetUrl, apiResponse } from "@/logic/docs/ApiRequests";

interface Result {
    state: "loading" | "done" | "failed";
    response?: unknown;
    error?: string;
}

const props = defineProps<{
    api: ApiReferenceData;
}>();

const route = useRoute();
const { open, isDrawer } = useRequestPanel();

const selection = ref<number | "own">(0);
const results = reactive(new Map<number | "own", Result>());

const fieldName = (name: string) => name.replace(/\[\]$/, "");

/** The examples under a heading, then the own input. */
const pickerItems = computed(() => [
    { type: "subheader", title: "Examples" },
    ...props.api.examples.map((example, index) => ({ title: example.title, value: index })),
    { type: "divider" },
    { title: "Your own input…", value: "own" }
]);
const listParameters = computed(() => props.api.parameters.filter(p => p.name.endsWith("[]")));
const booleanParameters = computed(() => props.api.parameters.filter(p => p.type === "boolean"));
// A parameter with values, such as descendants_ranks, takes a choice of them.
const choiceParameters = computed(() => props.api.parameters.filter(p => p.values && !p.name.endsWith("[]")));
// An object, such as the counts of taxa2tree, cannot be typed in a text field.
const textParameters = computed(() => props.api.parameters.filter(p =>
    !p.name.endsWith("[]") && !p.values && p.type !== "boolean" && p.type !== "object"));

const own = reactive({
    lists: {} as Record<string, string>,
    booleans: {} as Record<string, boolean>,
    choices: {} as Record<string, string[]>,
    texts: {} as Record<string, string>
});

/** Fills the own input form with the parameters of an example, and the defaults for the rest. */
function fillOwn(params: Record<string, ApiParamValue> = {}) {
    for (const p of listParameters.value) {
        const value = params[fieldName(p.name)];
        own.lists[p.name] = Array.isArray(value) ? value.join("\n") : "";
    }
    for (const p of booleanParameters.value) {
        const value = params[p.name] ?? p.default;
        own.booleans[p.name] = value === true;
    }
    for (const p of choiceParameters.value) {
        const value = params[p.name];
        own.choices[p.name] = Array.isArray(value) ? value.map(String) : value === undefined ? [] : [String(value)];
    }
    for (const p of textParameters.value) {
        const value = params[p.name] ?? p.default;
        own.texts[p.name] = value === undefined ? "" : String(value);
    }
}

const ownParams = computed(() => {
    const params: Record<string, ApiParamValue> = {};
    for (const p of listParameters.value) {
        params[fieldName(p.name)] = (own.lists[p.name] ?? "").split("\n").map(line => line.trim()).filter(line => line !== "");
    }
    for (const p of booleanParameters.value) {
        params[p.name] = own.booleans[p.name] ?? false;
    }
    for (const p of choiceParameters.value) {
        if (own.choices[p.name]?.length) {
            params[p.name] = own.choices[p.name];
        }
    }
    for (const p of textParameters.value) {
        if (own.texts[p.name]) {
            params[p.name] = own.texts[p.name];
        }
    }
    return params;
});

const current = computed(() => selection.value === "own"
    ? { params: ownParams.value, json: undefined }
    : { params: props.api.examples[selection.value]?.params ?? {}, json: props.api.examples[selection.value]?.json });

const requests = computed(() => [
    { label: "POST", code: apiCurl(props.api.endpoint, current.value.params, current.value.json) },
    ...(current.value.json === undefined ? [{ label: "GET", code: apiGetUrl(props.api.endpoint, current.value.params) }] : [])
]);

const result = computed(() => results.get(selection.value));

// The last response on screen stays until the next one is there, so switching examples does not make the block jump.
const shown = ref<Result>();
watch(result, next => {
    if (next?.state === "done") {
        shown.value = next;
    }
}, { immediate: true });

async function send() {
    const key = selection.value;
    const { params, json } = current.value;
    results.set(key, { state: "loading" });
    try {
        results.set(key, { state: "done", response: await apiResponse(DEFAULT_API_BASE_URL, props.api.endpoint, params, json) });
    } catch (e) {
        results.set(key, { state: "failed", error: e instanceof Error ? e.message : String(e) });
    }
}

watch(selection, (next, previous) => {
    if (next === "own") {
        fillOwn(typeof previous === "number" ? props.api.examples[previous]?.params : undefined);
    } else if (!results.has(next)) {
        send();
    }
});

/** A link to an example's anchor chooses that example; a link to #try chooses the own input. */
function followHash(hash: string) {
    const index = props.api.examples.findIndex(e => e.id && `#${e.id}` === hash);
    if (index >= 0) {
        selection.value = index;
    } else if (hash === "#try") {
        selection.value = "own";
    } else {
        return;
    }
    // A drawer opens; on a wider screen the panel is in view already.
    if (isDrawer.value) {
        open.value = true;
    }
}

watch(() => route.hash, followHash);

// A link to the hash that the URL already has does not change the route, so it is followed here.
useEventListener("click", (event: MouseEvent) => {
    const hash = (event.target as Element | null)?.closest("a")?.getAttribute("href");
    if (hash && hash === route.hash) {
        followHash(hash);
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
});

onMounted(() => {
    followHash(route.hash);
    if (selection.value !== "own" && props.api.examples.length > 0 && !results.has(selection.value)) {
        send();
    }
});
</script>

<style scoped>
.api-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
}

/* Only the response gives up space when the panel is full; the rest keeps its height. */
.api-panel > :not(.api-response) {
    flex-shrink: 0;
}

.api-panel__anchor {
    position: absolute;
    top: 0;
    scroll-margin-top: calc(var(--v-layout-top, 0px) + var(--docs-bar-height, 0px) + 24px);
}

.api-panel__label {
    display: block;
    margin-bottom: 6px;
    color: var(--docs-text-muted);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

/* Lists are typed in a monospace font, as in a request. */
.api-panel__list :deep(textarea) {
    font-family: var(--docs-font-mono);
    font-size: 13px;
}

.api-panel__description {
    color: var(--docs-text-muted);
    font-size: 13px;
}

.api-panel__description :deep(p) {
    margin: 0 !important;
}

.api-panel__form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--docs-border);
    border-radius: 8px;
    background: var(--docs-surface);
}

.api-panel__checks {
    display: flex;
    flex-wrap: wrap;
    gap: 0 16px;
}

/* The checkboxes take the height of their text, so the hint below stays close. */
.api-panel__checks :deep(.v-selection-control) {
    --v-selection-control-size: 32px;
    min-height: 32px;
}

.api-panel__hint {
    margin: 0 !important;
    color: var(--docs-text-muted);
    font-size: 12px;
}

.api-panel__try {
    min-height: 28px;
    padding: 4px 12px;
    border: 0;
    border-radius: 6px;
    background: var(--docs-accent);
    color: var(--docs-on-accent);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.api-panel__try:focus-visible {
    outline: 2px solid var(--docs-code-bright);
    outline-offset: 2px;
}
</style>
