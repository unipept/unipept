<template>
    <nav
        v-if="previous || next"
        aria-label="Previous and next page"
        class="docs-pager"
    >
        <router-link
            v-if="previous"
            :to="previous.path"
            class="docs-pager__link"
            rel="prev"
        >
            <span class="docs-pager__label">Previous</span>
            {{ previous.menuLabel }}
        </router-link>
        <router-link
            v-if="next"
            :to="next.path"
            class="docs-pager__link docs-pager__link--next"
            rel="next"
        >
            <span class="docs-pager__label">Next</span>
            {{ next.menuLabel }}
        </router-link>
    </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { adjacentDocsPages, type DocsPage, type DocsSection } from "@/logic/docs/DocsSections";

const props = defineProps<{
    section: DocsSection;
    page: DocsPage;
}>();

const previous = computed(() => adjacentDocsPages(props.section, props.page).previous);
const next = computed(() => adjacentDocsPages(props.section, props.page).next);
</script>

<style scoped>
.docs-pager {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 20px;
}

.docs-pager__link {
    flex: 1 1 200px;
    padding: 12px 16px;
    border: 1px solid var(--docs-border);
    border-radius: 8px;
    background: var(--docs-surface);
    color: var(--docs-link);
    font-weight: 500;
    text-decoration: none;
}

.docs-pager__link:hover {
    border-color: var(--docs-accent);
}

.docs-pager__link--next {
    margin-left: auto;
    text-align: right;
}

.docs-pager__label {
    display: block;
    font-size: 12px;
    font-weight: 400;
    color: var(--docs-text-muted);
}
</style>
