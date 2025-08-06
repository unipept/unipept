<template>
    <div
        ref="container"
        style="height: 100%; position: relative; background-color: white;"
    >
        <div
            class="control-bar"
            :style="overlap ? 'position: absolute' : 'position: relative'"
        >
            <span class="align-self-center me-1 text-caption">
                {{ caption }}
            </span>

            <v-menu v-if="settings" :close-on-content-click="false">
                <template #activator="{ props }">
                    <v-btn
                        class="ma-1"
                        icon="mdi-cog-outline"
                        size="x-small"
                        v-bind="props"
                        :elevation="0"
                    />
                </template>
                <v-list style="width: 350px; border-radius: 12px;">
                    <slot name="settings"/>
                </v-list>
            </v-menu>

            <v-btn
                v-if="rotate"
                class="ma-1"
                size="x-small"
                icon="mdi-format-rotate-90"
                :elevation="0"
                @click="rotate"
            />

            <v-btn
                v-if="download && !hideDownload"
                class="ma-1"
                size="x-small"
                icon="mdi-download"
                :elevation="0"
                @click="download"
            />

            <v-btn
                v-else-if="internalDownload && !hideDownload"
                class="ma-1"
                size="x-small"
                fab
                :elevation="0"
                icon="mdi-download"
                @click="downloadOpen = true"
            />

            <v-btn
                v-if="reset"
                class="ma-1"
                size="x-small"
                icon="mdi-restore"
                :elevation="0"
                @click="reset"
            />

            <v-btn
                v-if="fullscreen"
                class="ma-1"
                size="x-small"
                icon="mdi-fullscreen"
                :elevation="0"
                @click="fullscreen"
            />
        </div>

        <div :style="overlap ? 'height: 100%;' : 'height: calc(100% - 40px); position: relative'">
            <slot name="visualization" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface Props {
    caption: string
    overlap?: boolean
    hideDownload?: boolean
    internalDownload?: boolean
    settings?: boolean

    rotate?: () => void
    download?: () => void
    reset?: () => void
    fullscreen?: () => void
}

withDefaults(defineProps<Props>(), {
    overlap: true,
    hideDownload: false,
    internalDownload: false,
    settings: false
});

const emits = defineEmits<{
    reset: () => void
}>();

// Will currently only work for svg images
const downloadOpen = ref(false)

const container = ref<HTMLElement | null>(null);
</script>

<style scoped>
.control-bar {
    display: flex;
    justify-content: end;
    align-self: center;
    opacity: 0.8;
    width: 100%;
    height: 40px;
    background-color: #EDEDED;
    right: 0;
    top: 0;
}
</style>