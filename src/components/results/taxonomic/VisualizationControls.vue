<template>
    <div
        ref="container"
        style="height: 100%; position: relative; background-color: white;"
    >
        <div
            v-show="hasControls"
            class="control-bar"
            :style="overlap ? 'position: absolute' : 'position: relative'"
        >
            <span class="align-self-center me-1 text-body-small">
                {{ caption }}
            </span>

            <v-menu v-if="settings" :close-on-content-click="false">
                <template #activator="{ props }">
                    <v-btn
                        class="ma-1"
                        icon
                        size="x-small"
                        v-bind="props"
                        :elevation="0"
                    >
                        <v-icon size="x-small">mdi-cog-outline</v-icon>
                    </v-btn>
                </template>
                <v-list style="width: 350px; border-radius: 12px;">
                    <slot name="settings"/>
                </v-list>
            </v-menu>

            <v-btn
                v-if="rotate"
                class="ma-1"
                size="x-small"
                icon
                :elevation="0"
                @click="rotate"
            >
                <v-icon size="x-small">mdi-format-rotate-90</v-icon>
            </v-btn>

            <v-btn
                v-if="download && !hideDownload"
                class="ma-1"
                size="x-small"
                icon
                :elevation="0"
                @click="download"
            >
                <v-icon size="x-small">mdi-download</v-icon>
            </v-btn>

            <v-btn
                v-else-if="internalDownload && !hideDownload"
                class="ma-1"
                size="x-small"
                fab
                :elevation="0"
                icon
                @click="downloadOpen = true"
            >
                <v-icon size="x-small">mdi-download</v-icon>
            </v-btn>

            <v-btn
                v-if="reset"
                class="ma-1"
                size="x-small"
                icon
                :elevation="0"
                @click="reset"
            >
                <v-icon size="x-small">mdi-restore</v-icon>
            </v-btn>

            <v-btn
                v-if="fullscreen"
                class="ma-1"
                size="x-small"
                icon
                :elevation="0"
                @click="fullscreen"
            >
                <v-icon size="x-small">mdi-fullscreen</v-icon>
            </v-btn>
        </div>

        <div :style="overlap ? 'height: 100%;' : 'height: calc(100% - 40px); position: relative'">
            <slot name="visualization" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface Props {
    caption?: string
    overlap?: boolean
    hideDownload?: boolean
    internalDownload?: boolean
    settings?: boolean

    rotate?: () => void
    download?: () => void
    reset?: () => void
    fullscreen?: () => void
}

const props = withDefaults(defineProps<Props>(), {
    overlap: true,
    hideDownload: false,
    internalDownload: false,
    settings: false
});

const hasControls = computed(() =>
    !!props.caption ||
    props.settings ||
    !!props.rotate ||
    (!!props.download || !!props.internalDownload) && !props.hideDownload ||
    !!props.reset ||
    !!props.fullscreen
);

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