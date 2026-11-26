<template>
    <nav
        :aria-label="section.title"
        class="docs-side-menu"
    >
        <template
            v-for="(group, index) in section.menu"
            :key="index"
        >
            <div
                v-if="group.title"
                class="docs-side-menu__group"
            >
                {{ group.title }}
            </div>
            <router-link
                v-for="page in group.pages"
                :key="page.path"
                :to="page.path"
                :class="['docs-side-menu__link', { 'docs-side-menu__link--top': !group.title }]"
                exact-active-class="docs-side-menu__link--active"
            >
                {{ page.menuLabel }}
            </router-link>
        </template>
    </nav>
</template>

<script setup lang="ts">
import type { DocsSection } from "@/logic/docs/DocsSections";

defineProps<{
    section: DocsSection;
}>();
</script>

<style scoped>
.docs-side-menu {
    /* Room for the highlight of a page outside a group, which reaches left of the text. */
    padding-left: 12px;
    font-size: 14px;
}

.docs-side-menu__group {
    margin: 20px 0 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--docs-text-muted);
}

.docs-side-menu__group:first-child {
    margin-top: 0;
}

.docs-side-menu__link {
    display: block;
    padding: 6px 12px;
    border-radius: 6px;
    color: var(--docs-text);
    text-decoration: none;
}

/* A page outside a group, such as the overview, looks like a group title. */
.docs-side-menu__link--top {
    margin: 0 0 8px -12px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--docs-text-muted);
}

.docs-side-menu__link--top + .docs-side-menu__group {
    margin-top: 12px;
}

.docs-side-menu__link:hover {
    background: var(--docs-surface-hover);
}

.docs-side-menu__link--active {
    background: var(--docs-accent-soft);
    color: var(--docs-accent-text);
    font-weight: 600;
}
</style>
