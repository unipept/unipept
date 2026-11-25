<template>
    <div
        v-if="docs"
        class="docs-layout"
    >
        <aside
            v-if="display.mdAndUp.value"
            class="docs-layout__menu"
        >
            <docs-side-menu :section="docs.section" />
        </aside>

        <article class="docs-layout__main">
            <v-expansion-panels
                v-if="!display.mdAndUp.value"
                class="mb-6"
            >
                <v-expansion-panel :title="`${docs.section.title} menu`">
                    <v-expansion-panel-text>
                        <docs-side-menu :section="docs.section" />
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>

            <h1 class="docs-layout__title">
                {{ docs.page.title }}
            </h1>
            <p
                v-if="docs.page.subtitle"
                class="docs-layout__subtitle"
            >
                {{ docs.page.subtitle }}
            </p>

            <div ref="content">
                <router-view />
            </div>

            <footer class="docs-layout__footer">
                <a
                    :href="editLink"
                    target="_blank"
                    rel="noreferrer"
                >Edit this page on GitHub</a>
            </footer>
            <docs-pager
                :section="docs.section"
                :page="docs.page"
            />
        </article>

        <aside class="docs-layout__toc">
            <docs-toc :headers="docs.page.headers" />
        </aside>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useDisplay } from "vuetify";
import DocsSideMenu from "./DocsSideMenu.vue";
import DocsToc from "./DocsToc.vue";
import DocsPager from "./DocsPager.vue";
import useDocsContent from "@/composables/docs/useDocsContent";
import "@/styles/docs.css";

const editBase = "https://github.com/unipept/unipept/edit/main/src/content/docs/";

const route = useRoute();
const display = useDisplay();
const content = ref<HTMLElement>();

useDocsContent(content);

const docs = computed(() => route.meta.docs);
const editLink = computed(() => editBase + docs.value?.page.file);
</script>

<style scoped>
.docs-layout {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr) 200px;
    gap: 40px;
    max-width: 1440px;
    margin: 0 auto;
    padding: 32px 24px 80px;
    color: var(--docs-text);
}

.docs-layout__menu,
.docs-layout__toc {
    position: sticky;
    top: calc(var(--v-layout-top, 0px) + 16px);
    align-self: start;
    max-height: calc(100vh - var(--v-layout-top, 0px) - 32px);
    overflow-y: auto;
}

.docs-layout__main {
    min-width: 0;
    max-width: 820px;
}

.docs-layout__title {
    margin: 0;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--docs-text-strong);
}

.docs-layout__subtitle {
    margin: 8px 0 0 !important;
    font-size: 18px;
    color: var(--docs-text-muted) !important;
}

.docs-layout__footer {
    margin-top: 48px;
    padding-top: 20px;
    border-top: 1px solid var(--docs-border);
    font-size: 14px;
}

.docs-layout__footer a {
    color: var(--docs-link);
}

@media (max-width: 1279.98px) {
    .docs-layout {
        grid-template-columns: 220px minmax(0, 1fr);
    }

    .docs-layout__toc {
        display: none;
    }
}

@media (max-width: 959.98px) {
    .docs-layout {
        grid-template-columns: minmax(0, 1fr);
        padding: 24px 16px 64px;
    }
}
</style>
