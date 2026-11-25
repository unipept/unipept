<template>
    <nav
        v-if="headings.length > 0"
        aria-labelledby="docs-toc-title"
        class="docs-toc"
    >
        <div
            id="docs-toc-title"
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
import { computed } from "vue";
import type { MarkdownHeader } from "virtual:docs-pages";
import useActiveHeading from "@/composables/docs/useActiveHeading";

const props = defineProps<{
    headers: MarkdownHeader[];
}>();

const headings = computed(() => props.headers.flatMap(header => [header, ...header.children]));
const active = useActiveHeading(computed(() => headings.value.map(heading => heading.slug)));
</script>

<style scoped>
.docs-toc {
    font-size: 13px;
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
