<template>
    <router-link
        v-if="router"
        class="link"
        :to="to"
    >
        <slot />
    </router-link>
    <a
        v-else-if="mail"
        class="link"
        :href="'mailto:' + to"
    >
        <slot />
    </a>
    <a
        v-else
        class="link"
        :href="to"
        target="_blank"
    >
        <slot />
    </a>
</template>

<script setup lang="ts">
export interface Props {
    to: string,
    router?: boolean,
    mail?: boolean
}

withDefaults(defineProps<Props>(), {
    router: false,
    mail: false
})
</script>

<style scoped>
.link {
    text-decoration: none;
    color: #2196F3 !important;
    cursor: pointer;
}

.link:hover {
    text-decoration: underline;
    color: #2196F3 !important;
}
</style>
