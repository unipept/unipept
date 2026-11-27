<template>
    <div>
        <v-btn
            ref="button"
            :class="['docs-search', 'text-none', { 'docs-search--large': large }]"
            variant="flat"
            border
            :size="large ? 'large' : 'default'"
            prepend-icon="mdi-magnify"
            aria-haspopup="dialog"
            @click="open = true"
        >
            <span class="docs-search__label">{{ large ? "Search all documentation, for example pept2lca" : "Search" }}</span>
            <template #append>
                <kbd class="docs-search__key">{{ shortcut }}</kbd>
            </template>
        </v-btn>

        <v-dialog
            v-model="open"
            max-width="640"
            scrollable
            @after-enter="input?.focus()"
            @after-leave="afterLeave"
        >
            <v-card
                class="docs-search__dialog"
                rounded="lg"
            >
                <v-text-field
                    ref="input"
                    v-model="query"
                    type="search"
                    variant="solo"
                    flat
                    hide-details
                    prepend-inner-icon="mdi-magnify"
                    placeholder="Search the documentation"
                    aria-label="Search the documentation"
                    role="combobox"
                    aria-autocomplete="list"
                    :aria-expanded="results.length > 0"
                    aria-controls="docs-search-results"
                    :aria-activedescendant="results.length > 0 ? `docs-search-result-${active}` : undefined"
                    class="flex-grow-0"
                    @keydown.down.prevent="move(1)"
                    @keydown.up.prevent="move(-1)"
                    @keydown.enter.prevent="go(results[active])"
                />
                <v-divider />
                <v-list
                    id="docs-search-results"
                    ref="list"
                    role="listbox"
                    aria-label="Results"
                    tabindex="-1"
                    :class="['pa-2', { 'd-none': results.length === 0 }]"
                >
                    <v-list-item
                        v-for="(result, i) in results"
                        :id="`docs-search-result-${i}`"
                        :key="result.url"
                        :to="result.url"
                        role="option"
                        :aria-selected="i === active"
                        :active="i === active"
                        :title="result.title"
                        :subtitle="where(result)"
                        rounded="lg"
                        @click="closeForResult"
                        @mousemove="active = i"
                    />
                </v-list>
                <p
                    v-if="message"
                    class="docs-search__message"
                >
                    {{ message }}
                </p>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch, type ComponentPublicInstance } from "vue";
import { useRouter } from "vue-router";
import { onKeyStroke, refDebounced } from "@vueuse/core";
import type MiniSearch from "minisearch";
import { loadDocsSearch } from "@/logic/docs/DocsSearch";
import { searchDocs, type DocsSearchDocument, type DocsSearchResult } from "@/logic/docs/DocsSearchIndex";
import "@/styles/docs.css";

defineProps<{
    /** The wide field of the docs hub, instead of the button in the menu. */
    large?: boolean;
}>();

const router = useRouter();

const open = ref(false);
const query = ref("");
const debouncedQuery = refDebounced(query, 80);
const index = shallowRef<MiniSearch<DocsSearchDocument>>();
const failed = ref(false);
const active = ref(0);
const list = ref<ComponentPublicInstance>();
const button = ref<ComponentPublicInstance>();
const input = ref<{ focus: () => void }>();
/** Whether the dialog closed to open a result, which moves the focus to the new page. */
let navigated = false;

const shortcut = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K";

onKeyStroke("k", event => {
    if (event.metaKey || event.ctrlKey) {
        event.preventDefault();
        open.value = true;
    }
});

watch(open, async isOpen => {
    if (isOpen && !index.value) {
        try {
            index.value = await loadDocsSearch();
        } catch {
            failed.value = true;
        }
    }
});

const results = computed<DocsSearchResult[]>(() =>
    index.value && debouncedQuery.value.trim() ? searchDocs(index.value, debouncedQuery.value) : []
);

const message = computed(() => {
    if (failed.value) {
        return "The search could not be loaded.";
    }
    if (!debouncedQuery.value.trim()) {
        return "";
    }
    if (!index.value) {
        return "Loading…";
    }
    return results.value.length === 0 ? `No results for "${debouncedQuery.value.trim()}".` : "";
});

watch(results, () => active.value = 0);

/** The section and the page of a result, such as "API › pept2lca". */
function where(result: DocsSearchResult): string {
    const section = router.resolve(result.url).meta.docs?.section.title;
    return section ? `${section} › ${result.page}` : result.page;
}

async function move(step: number) {
    if (results.value.length > 0) {
        active.value = (active.value + step + results.value.length) % results.value.length;
        await nextTick();
        (list.value?.$el as HTMLElement | undefined)?.querySelector(`#docs-search-result-${active.value}`)?.scrollIntoView({ block: "nearest" });
    }
}

/** Closes the dialog for a result that the router opens. */
function closeForResult() {
    navigated = true;
    open.value = false;
}

function afterLeave() {
    query.value = "";
    if (!navigated) {
        (button.value?.$el as HTMLElement | undefined)?.focus();
    }
    navigated = false;
}

function go(result: DocsSearchResult | undefined) {
    if (result) {
        closeForResult();
        router.push(result.url);
    }
}
</script>

<style scoped>
.docs-search {
    width: 100%;
    color: var(--docs-text-muted);
    font-weight: 400;
    letter-spacing: normal;
}

.docs-search:hover,
.docs-search:focus-visible {
    border-color: var(--docs-link-underline);
}

.docs-search--large {
    max-width: 640px;
    font-size: 16px;
}

/* The label starts on the left and fills the button, so that the key is at the right end. */
.docs-search :deep(.v-btn__content) {
    flex: 1;
    justify-content: flex-start;
    min-width: 0;
}

.docs-search__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.docs-search__key {
    padding: 0 6px;
    border: 1px solid var(--docs-border);
    border-radius: 4px;
    font-family: inherit;
    font-size: 12px;
}

.docs-search__dialog {
    max-height: min(560px, 80vh);
}

.docs-search__message {
    margin: 0;
    padding: 12px 16px;
    color: var(--docs-text-muted);
}
</style>
