<template>
    <div class="api-reference">
        <div class="api-reference__top">
            <docs-page-header
                v-if="docs"
                :section="docs.section"
                :page="docs.page"
            />
            <div
                id="request"
                class="api-reference__endpoint"
            >
                <span class="api-reference__method api-reference__method--post">POST</span>
                <span class="api-reference__method api-reference__method--get">GET</span>
                <code>{{ DEFAULT_API_BASE_URL }}/api/v2/{{ api.endpoint }}</code>
            </div>
            <slot />
            <div class="vp-doc">
                <h2 id="parameters">
                    Parameters
                </h2>
                <api-field-list
                    :fields="api.parameters"
                    :parameter-names="parameterNames"
                />
            </div>
        </div>

        <aside
            id="api-panel"
            ref="panel"
            tabindex="-1"
            :class="['api-reference__panel', 'vp-doc', { 'api-reference__panel--open': open }]"
            aria-label="Request and response"
        >
            <button
                type="button"
                class="api-reference__close"
                @click="close"
            >
                Close
                <v-icon
                    icon="mdi-close"
                    size="16"
                />
            </button>
            <api-request-panel :api="api" />
        </aside>

        <div class="api-reference__bottom vp-doc">
            <h2 id="response">
                Response
            </h2>
            <!-- eslint-disable-next-line vue/no-v-html -- HTML that the build rendered from the page's own Markdown -->
            <div v-if="api.response.summary" v-html="api.response.summary" />
            <api-field-list
                :fields="api.response.fields"
                :parameter-names="parameterNames"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import ApiFieldList from "./ApiFieldList.vue";
import DocsPageHeader from "./DocsPageHeader.vue";
import ApiRequestPanel from "./ApiRequestPanel.vue";
import { useRequestPanel } from "@/composables/docs/useRequestPanel";
import type { ApiReferenceData } from "@/logic/docs/ApiReference";
import { DEFAULT_API_BASE_URL } from "@/logic/Constants";

/**
 * The reference of one API endpoint: the page's text, its parameters and response fields, and a panel with its
 * examples, the request and the live response. The panel is 560 px wide and stays in view next to the fields,
 * which are at most 688 px wide and centred in the rest of the width; below 1488 px the panel is a drawer, which the
 * Request button of the docs layout opens.
 */
const props = defineProps<{
    api: ApiReferenceData;
}>();

const route = useRoute();
const docs = computed(() => route.meta.docs);
const parameterNames = computed(() => props.api.parameters.map(p => p.name));

const { open, close, element: panel } = useRequestPanel();
watch(open, async isOpen => {
    if (isOpen) {
        await nextTick();
        panel.value?.focus({ preventScroll: true });
    }
});
</script>

<style scoped>
.api-reference {
    display: grid;
    grid-template-areas: "top panel" "bottom panel";
    grid-template-columns: minmax(520px, 1fr) 560px;
    grid-template-rows: auto 1fr;
    gap: 0 40px;
}

/* The fields are at most 688 px wide, as the text of a normal page, and centred in the space next to the panel. */
.api-reference__top,
.api-reference__bottom {
    justify-self: center;
    width: 100%;
    max-width: var(--docs-text-width);
}

.api-reference__top {
    grid-area: top;
}

.api-reference__bottom {
    grid-area: bottom;
}

/* A column, so that the response takes the space that is left and scrolls on its own. */
.api-reference__panel {
    grid-area: panel;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: calc(var(--v-layout-top, 0px) + 16px);
    align-self: start;
    max-height: var(--docs-sticky-max-height);
    overflow-y: auto;
    /* Room for focus rings, which the scrolling panel would cut off. */
    margin: -4px;
    padding: 4px;
}

.api-reference__panel:focus {
    outline: none;
}

.api-reference__close {
    display: none;
    align-items: center;
    gap: 4px;
    margin: 0 0 12px auto;
    padding: 4px 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: 13px;
    color: var(--docs-text-muted);
    cursor: pointer;
}

.api-reference__close:hover {
    color: var(--docs-text-strong);
}

.api-reference__endpoint {
    display: flex;
    flex-wrap: wrap;
    width: fit-content;
    max-width: 100%;
    align-items: center;
    gap: 8px;
    margin: 24px 0 8px;
    padding: 10px 14px;
    border: 1px solid var(--docs-border);
    border-radius: 8px;
    background: var(--docs-surface);
    scroll-margin-top: calc(var(--v-layout-top, 0px) + var(--docs-bar-height, 0px) + 24px);
}

.api-reference__endpoint code {
    font-family: var(--docs-font-mono);
    font-size: 14px;
    overflow-wrap: anywhere;
}

.api-reference__method {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
}

.api-reference__method--post {
    background: var(--docs-post);
    color: var(--docs-code-bright);
}

.api-reference__method--get {
    background: var(--docs-accent-soft);
    color: var(--docs-accent-text);
}

/* Below 1488 px the main column of the docs layout is too narrow for 520 px of fields next to the panel. */
@media (max-width: 1487.98px) {
    .api-reference {
        grid-template-areas: "top" "bottom";
        grid-template-columns: minmax(0, 1fr);
    }

    .api-reference__panel {
        position: fixed;
        top: var(--v-layout-top, 0px);
        right: 0;
        bottom: 0;
        z-index: 1001;
        align-self: stretch;
        width: min(560px, 100vw);
        max-height: none;
        overscroll-behavior: contain;
        margin: 0;
        padding: 12px 20px 24px;
        background: rgb(var(--v-theme-mainBody));
        box-shadow: 0 0 24px rgb(var(--docs-shadow) / 16%);
        transform: translateX(100%);
        visibility: hidden;
        transition: transform 0.2s ease, visibility 0s 0.2s;
    }

    .api-reference__panel--open {
        transform: none;
        visibility: visible;
        transition: transform 0.2s ease;
    }

    .api-reference__close {
        display: flex;
    }
}

@media (prefers-reduced-motion: reduce) {
    .api-reference__panel {
        transition: none;
    }
}
</style>
