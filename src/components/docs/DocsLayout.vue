<template>
    <div
        v-if="docs"
        :class="['docs-layout', { 'docs-layout--menu-open': menuOpen, 'docs-layout--no-toc': !hasToc }]"
    >
        <aside
            id="docs-menu"
            ref="menu"
            tabindex="-1"
            class="docs-layout__menu"
            @click="closeMenuOnLink"
        >
            <docs-side-menu :section="docs.section" />
        </aside>
        <transition name="docs-fade">
            <div
                v-if="menuOpen"
                class="docs-layout__scrim"
                @click="closeMenu(true)"
            />
        </transition>

        <article class="docs-layout__main">
            <div class="docs-layout__bar">
                <button
                    ref="menuButton"
                    type="button"
                    class="docs-layout__bar-button docs-layout__bar-menu"
                    aria-controls="docs-menu"
                    :aria-expanded="menuOpen"
                    @click="toggleMenu"
                >
                    <v-icon
                        icon="mdi-menu"
                        size="18"
                    />
                    Menu
                </button>
                <v-menu
                    v-if="hasToc"
                    location="bottom end"
                    :attach="true"
                    transition="docs-fade"
                >
                    <template #activator="{ props: activator, isActive }">
                        <button
                            type="button"
                            class="docs-layout__bar-button docs-layout__bar-toc"
                            v-bind="activator"
                        >
                            On this page
                            <v-icon
                                :icon="isActive ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                                size="16"
                            />
                        </button>
                    </template>
                    <div class="docs-layout__toc-menu">
                        <button
                            type="button"
                            class="docs-layout__back-to-top"
                            @click="scrollToTop"
                        >
                            Back to top
                        </button>
                        <docs-toc
                            :headers="docs.page.headers"
                            :title="false"
                        />
                    </div>
                </v-menu>
            </div>

            <nav
                aria-label="Breadcrumb"
                class="docs-layout__breadcrumb"
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

        <aside
            v-if="hasToc"
            class="docs-layout__toc"
        >
            <docs-toc :headers="docs.page.headers" />
        </aside>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useEventListener, useScrollLock } from "@vueuse/core";
import DocsSideMenu from "./DocsSideMenu.vue";
import DocsToc from "./DocsToc.vue";
import DocsPager from "./DocsPager.vue";
import useDocsContent from "@/composables/docs/useDocsContent";
import { docsBreadcrumb } from "@/logic/docs/DocsSections";
import "@/styles/docs.css";

const editBase = "https://github.com/unipept/unipept/edit/main/src/content/docs/";

const route = useRoute();
const content = ref<HTMLElement>();
const menu = ref<HTMLElement>();
const menuButton = ref<HTMLButtonElement>();

useDocsContent(content);

const docs = computed(() => route.meta.docs);
const editLink = computed(() => editBase + docs.value?.page.file);
const breadcrumb = computed(() => docs.value ? docsBreadcrumb(docs.value.section, docs.value.page) : []);
const hasToc = computed(() => (docs.value?.page.headers.length ?? 0) > 0);

// Below 960 px the menu is a drawer, which the Menu button in the bar opens.
const menuOpen = ref(false);

async function toggleMenu() {
    menuOpen.value = !menuOpen.value;
    if (menuOpen.value) {
        await nextTick();
        menu.value?.focus();
    }
}

/** Closes the menu drawer. With `restoreFocus`, the focus goes back to the Menu button if it was in the drawer. */
function closeMenu(restoreFocus = false) {
    if (restoreFocus && menuOpen.value && menu.value?.contains(document.activeElement)) {
        menuButton.value?.focus();
    }
    menuOpen.value = false;
}

// A link closes the drawer, also one to the current page, which does not change the route.
function closeMenuOnLink(event: MouseEvent) {
    if ((event.target as Element | null)?.closest("a")) {
        closeMenu();
    }
}

watch(() => route.path, () => closeMenu());

// The page behind an open drawer does not scroll. The space of the scroll bar stays, so the page does not shift.
const pageLock = useScrollLock(typeof document === "undefined" ? null : document.documentElement);
watch(menuOpen, open => {
    pageLock.value = open;
    document.documentElement.style.scrollbarGutter = open ? "stable" : "";
});

useEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
        closeMenu(true);
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<style scoped>
/*
 * The breakpoints and sizes are those of the Dolos docs (VitePress). Below 1280 px "On this page" is a menu in the
 * bar, and below 960 px the menu is a drawer, so the page has one column. The layout is at most 1440 px wide and
 * centred; the text stays at most 688 px wide, centred between the menu and "On this page".
 */
.docs-layout {
    --docs-menu-width: 272px;
    --docs-toc-width: 224px;
    --docs-text-width: 688px;
    --docs-gutter: 24px;
    --docs-top: 32px;
    /*
     * The columns that stay in view start, on a page at its top, 16 px (the padding of the app) and --docs-top below
     * the header; they keep 16 px free below them.
     */
    --docs-sticky-max-height: calc(100vh - var(--v-layout-top, 0px) - var(--docs-top) - 32px);
    --docs-bar-height: 0px;
    display: grid;
    grid-template-columns: var(--docs-menu-width) minmax(0, 1fr) var(--docs-toc-width);
    gap: 32px;
    max-width: 1440px;
    margin: 0 auto;
    padding: var(--docs-top) var(--docs-gutter) 80px;
    color: var(--docs-text);
}

.docs-layout__menu,
.docs-layout__toc {
    position: sticky;
    top: calc(var(--v-layout-top, 0px) + 16px);
    align-self: start;
    max-height: var(--docs-sticky-max-height);
    overflow-y: auto;
}

.docs-layout__menu:focus {
    outline: none;
}

.docs-layout__main {
    min-width: 0;
}

/* The page is at most as wide as the text and centred in its column; the bar can be wider. */
.docs-layout__main > :not(.docs-layout__bar) {
    max-width: var(--docs-text-width);
    margin-right: auto;
    margin-left: auto;
}

.docs-layout__bar {
    display: none;
    position: sticky;
    top: var(--v-layout-top, 0px);
    z-index: 5;
    align-items: center;
    gap: 16px;
    height: 44px;
    margin-top: calc(-1 * var(--docs-top));
    margin-bottom: 24px;
    border-bottom: 1px solid var(--docs-border);
    background: rgb(var(--v-theme-mainBody));
}

.docs-layout__bar-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: 13px;
    color: var(--docs-text-muted);
    cursor: pointer;
}

.docs-layout__bar-button:hover {
    color: var(--docs-text-strong);
}

.docs-layout__bar-menu {
    display: none;
}

.docs-layout__bar-toc {
    margin-left: auto;
}

.docs-layout__toc-menu {
    width: min(320px, calc(100vw - 32px));
    max-height: 60vh;
    overflow-y: auto;
    padding: 12px 16px;
    border: 1px solid var(--docs-border);
    border-radius: 8px;
    background: var(--docs-surface);
    box-shadow: 0 8px 24px rgb(15 23 42 / 12%);
}

.docs-layout__back-to-top {
    display: block;
    width: 100%;
    margin-bottom: 8px;
    padding: 0 0 8px;
    border: 0;
    border-bottom: 1px solid var(--docs-border);
    background: none;
    font: inherit;
    font-size: 13px;
    text-align: left;
    color: var(--docs-link);
    cursor: pointer;
}

.docs-layout__scrim {
    display: none;
}

.docs-layout__breadcrumb {
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--docs-text-muted);
}

.docs-layout__breadcrumb a {
    color: var(--docs-link);
    text-decoration: none;
}

.docs-layout__breadcrumb a:hover {
    text-decoration: underline;
}

.docs-layout__title {
    margin: 0;
    font-size: 32px;
    font-weight: 600;
    line-height: 1.25;
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

@media (max-width: 1279.98px) {
    .docs-layout {
        --docs-bar-height: 44px;
        grid-template-columns: var(--docs-menu-width) minmax(0, 1fr);
    }

    .docs-layout__toc {
        display: none;
    }

    /* The bar reaches the right edge, and below 960 px the left edge too. */
    .docs-layout__bar {
        display: flex;
        margin-right: calc(-1 * var(--docs-gutter));
        padding-right: var(--docs-gutter);
    }

    /* With the menu as a column, the bar only holds "On this page". */
    .docs-layout--no-toc {
        --docs-bar-height: 0px;
    }

    .docs-layout--no-toc .docs-layout__bar {
        display: none;
    }
}

@media (max-width: 959.98px) {
    .docs-layout,
    .docs-layout--no-toc {
        --docs-bar-height: 44px;
        grid-template-columns: minmax(0, 1fr);
    }

    .docs-layout .docs-layout__bar {
        display: flex;
        margin-left: calc(-1 * var(--docs-gutter));
        padding-left: var(--docs-gutter);
    }

    .docs-layout__bar-menu {
        display: inline-flex;
    }

    .docs-layout__menu {
        position: fixed;
        top: var(--v-layout-top, 0px);
        bottom: 0;
        left: 0;
        z-index: 1001;
        align-self: stretch;
        width: min(300px, 85vw);
        max-height: none;
        overscroll-behavior: contain;
        padding: 24px 16px;
        background: rgb(var(--v-theme-mainBody));
        box-shadow: 0 0 24px rgb(15 23 42 / 16%);
        transform: translateX(-100%);
        visibility: hidden;
        transition: transform 0.2s ease, visibility 0s 0.2s;
    }

    .docs-layout--menu-open .docs-layout__menu {
        transform: none;
        visibility: visible;
        transition: transform 0.2s ease;
    }

    .docs-layout__scrim {
        display: block;
        position: fixed;
        inset: var(--v-layout-top, 0px) 0 0;
        z-index: 1000;
        background: rgb(15 23 42 / 40%);
    }
}

@media (prefers-reduced-motion: reduce) {
    .docs-layout__menu {
        transition: none;
    }
}
</style>
