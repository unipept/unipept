<template>
    <nav
        v-if="headings.length > 0"
        :aria-labelledby="title ? titleId : undefined"
        :aria-label="title ? undefined : 'On this page'"
        class="docs-toc"
    >
        <div
            v-if="title"
            :id="titleId"
            class="docs-toc__title"
        >
            On this page
        </div>
        <router-link
            v-for="heading in headings"
            :key="heading.slug"
            :to="{ hash: `#${heading.slug}` }"
            :class="['docs-toc__link', `docs-toc__link--level-${heading.level}`, { 'docs-toc__link--active': heading.slug === active }]"
            :aria-current="heading.slug === active ? 'location' : undefined"
        >
            {{ heading.title }}
        </router-link>
    </nav>
</template>

<script setup lang="ts">
import { computed, useId } from "vue";
import type { MarkdownHeader } from "virtual:docs-pages";
import useActiveHeading from "@/composables/docs/useActiveHeading";

const props = withDefaults(defineProps<{
    headers: MarkdownHeader[];
    /** Whether to show the "On this page" title, which the bar's menu leaves out. */
    title?: boolean;
}>(), {
    title: true
});

const titleId = useId();

const headings = computed(() => props.headers.flatMap(header => [header, ...header.children]));
const active = useActiveHeading(computed(() => headings.value.map(heading => heading.slug)));
</script>

<style scoped>
.docs-toc {
    font-size: 14px;
}

.docs-toc__title {
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--docs-text-strong);
}

.docs-toc__link {
    display: block;
    padding: 4px 0 4px 12px;
    border-left: 2px solid var(--docs-border);
    line-height: 24px;
    color: var(--docs-text-muted);
    text-decoration: none;
}

.docs-toc__link--level-3 {
    padding-left: 24px;
}

.docs-toc__link:hover {
    color: var(--docs-text-strong);
}

.docs-toc__link--active {
    border-left-color: var(--docs-accent);
    color: var(--docs-accent-text);
    font-weight: 500;
}
</style>
