<template>
    <div class="docs-hub">
        <header class="docs-hub__intro">
            <h1 class="docs-hub__title">
                Unipept documentation
            </h1>
            <p class="docs-hub__lead">
                Guides and reference for the API, the command line tools, the metagenomics pipeline and Unipept
                Desktop.
            </p>
            <docs-search
                class="docs-hub__search"
                large
            />
        </header>

        <div class="docs-hub__cards">
            <v-card
                v-for="section in ordered"
                :key="section.name"
                tag="section"
                class="docs-hub__card"
                variant="flat"
                border
                rounded="lg"
                :aria-labelledby="`docs-hub-${section.name}`"
            >
                <div class="docs-hub__card-head">
                    <h2
                        :id="`docs-hub-${section.name}`"
                        class="docs-hub__card-title"
                    >
                        <router-link :to="section.path">
                            {{ section.title }}
                        </router-link>
                        <v-chip
                            v-if="section.deprecated"
                            size="x-small"
                            color="var(--docs-accent-soft)"
                            variant="flat"
                            class="docs-hub__badge"
                            label
                        >
                            Deprecated
                        </v-chip>
                    </h2>
                    <p
                        v-if="section.description"
                        class="docs-hub__card-text"
                    >
                        {{ section.description }}
                    </p>
                </div>
                <router-link
                    v-if="section.start"
                    :to="section.start.page.path"
                    class="docs-hub__start"
                >
                    {{ section.start.label }}
                </router-link>
                <div v-if="section.caseStudies.length > 0">
                    <h3 class="docs-hub__group">
                        Case studies
                    </h3>
                    <ul class="docs-hub__links">
                        <li
                            v-for="{ page, label } in section.caseStudies"
                            :key="page.path"
                        >
                            <router-link :to="page.path">
                                {{ label }}
                            </router-link>
                        </li>
                    </ul>
                </div>
            </v-card>
        </div>

        <section
            class="docs-hub__cite"
            aria-labelledby="docs-hub-cite"
        >
            <h2
                id="docs-hub-cite"
                class="docs-hub__cite-title"
            >
                How to cite
            </h2>
            <dl class="docs-hub__citations">
                <template
                    v-for="section in cited"
                    :key="section.name"
                >
                    <dt>{{ section.title }}</dt>
                    <dd>
                        <a
                            v-if="section.publicationLink"
                            :href="publicationUrl(section.publicationLink)"
                            target="_blank"
                            rel="noopener"
                        >{{ section.publication }}</a>
                        <template v-else>
                            {{ section.publication }}
                        </template>
                    </dd>
                </template>
            </dl>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DocsSearch from "./DocsSearch.vue";
import { publicationUrl, type DocsSection } from "@/logic/docs/DocsSections";
import "@/styles/docs.css";

const props = defineProps<{
    sections: DocsSection[];
}>();

/** Order of the sections on the hub; others follow. */
const order = ["apidocs", "clidocs", "umgap", "desktop"];

const ordered = computed(() => [...props.sections].sort((a, b) => rank(a.name) - rank(b.name)));
const cited = computed(() => ordered.value.filter(section => section.publication));

function rank(name: string): number {
    const index = order.indexOf(name);
    return index === -1 ? order.length : index;
}
</script>

<style scoped>
.docs-hub {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px 72px;
    color: var(--docs-text);
    font-size: 15px;
    line-height: 1.6;
}

.docs-hub a {
    color: var(--docs-link);
    text-decoration: none;
}

.docs-hub a:hover {
    color: var(--docs-accent-text);
    text-decoration: underline dotted currentColor;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
}

.docs-hub__intro {
    margin-bottom: 40px;
}

.docs-hub__title {
    margin: 0;
    color: var(--docs-text-strong);
    font-size: 32px;
    font-weight: 600;
    line-height: 1.25;
}

.docs-hub__lead {
    max-width: 640px;
    margin: 12px 0 0;
    color: var(--docs-text-muted);
    font-size: 18px;
    line-height: 1.5;
}

.docs-hub__search {
    margin-top: 36px;
}

/* Each card spans three rows of the grid (text, first page, case studies), so that the parts line up in a row. */
.docs-hub__cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
}

.docs-hub__card {
    display: grid;
    grid-row: span 3;
    grid-template-rows: subgrid;
    row-gap: 12px;
    align-content: start;
    padding: 22px;
}

.docs-hub__card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.3;
}

.docs-hub .docs-hub__card-title a {
    color: var(--docs-text-strong);
}

.docs-hub__badge {
    color: var(--docs-accent-text);
    font-weight: 600;
}

.docs-hub__card-text {
    margin: 4px 0 0;
    color: var(--docs-text-muted);
    font-size: 14px;
}

.docs-hub__start {
    font-size: 14px;
}

.docs-hub__group {
    margin: 4px 0 6px;
    color: var(--docs-text-muted);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.docs-hub__links {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 14px;
}

.docs-hub__links li {
    font-size: inherit;
}

.docs-hub__cite {
    margin-top: 48px;
}

.docs-hub__cite-title {
    margin: 0 0 12px;
    color: var(--docs-text-strong);
    font-size: 24px;
    font-weight: 600;
    line-height: 1.3;
}

.docs-hub__citations {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 6px 24px;
    margin: 0;
    font-size: 14px;
}

.docs-hub__citations dt {
    color: var(--docs-text-strong);
    font-weight: 600;
}

.docs-hub__citations dd {
    margin: 0;
    color: var(--docs-text-muted);
}

@media (max-width: 600px) {
    .docs-hub {
        padding: 24px 16px 48px;
    }
}
</style>
