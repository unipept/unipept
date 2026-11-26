<template>
    <header class="docs-page-header">
        <nav
            aria-label="Breadcrumb"
            class="docs-page-header__breadcrumb"
        >
            <template
                v-for="(crumb, index) in breadcrumb"
                :key="index"
            >
                <span
                    v-if="index > 0"
                    aria-hidden="true"
                > / </span>
                <router-link
                    v-if="crumb.path"
                    :to="crumb.path"
                >
                    {{ crumb.label }}
                </router-link>
                <span
                    v-else
                    :aria-current="index === breadcrumb.length - 1 ? 'page' : undefined"
                >{{ crumb.label }}</span>
            </template>
        </nav>

        <h1 class="docs-page-header__title">
            {{ page.title }}
        </h1>
        <p
            v-if="page.subtitle"
            class="docs-page-header__subtitle"
        >
            {{ page.subtitle }}
        </p>
    </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { docsBreadcrumb, type DocsPage, type DocsSection } from "@/logic/docs/DocsSections";

const props = defineProps<{
    section: DocsSection;
    page: DocsPage;
}>();

const breadcrumb = computed(() => docsBreadcrumb(props.section, props.page));
</script>

<style scoped>
.docs-page-header__breadcrumb {
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--docs-text-muted);
}

.docs-page-header__breadcrumb a {
    color: var(--docs-link);
    text-decoration: none;
}

.docs-page-header__breadcrumb a:hover {
    text-decoration: underline;
}

.docs-page-header__title {
    margin: 0;
    font-size: 32px;
    font-weight: 600;
    line-height: 1.25;
    color: var(--docs-text-strong);
}

.docs-page-header__subtitle {
    margin: 8px 0 0 !important;
    font-size: 18px;
    color: var(--docs-text-muted) !important;
}
</style>
