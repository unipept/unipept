<template>
    <v-dialog
        v-model="dialogOpen"
        width="80%"
    >
        <v-card>
            <v-card-title class="d-flex align-center">
                <h2>Export image</h2>
                <v-spacer />
                <v-btn
                    icon="mdi-close"
                    variant="plain"
                    @click="closeDialog"
                />
            </v-card-title>
            <v-card-text>
                <div class="d-flex justify-center">
                    <v-card
                        class="pa-2"
                        width="60%"
                        variant="outlined"
                    >
                        <v-img
                            :src="imageDataUrl"
                            max-width="100%"
                            max-height="100%"
                        />
                    </v-card>
                </div>

                <div class="d-flex justify-center flex-column">
                    <v-select
                        v-model="selectedFormat"
                        :items="supportedFormats"
                        color="primary"
                        class="mt-5"
                        density="compact"
                        variant="outlined"
                        label="Image format"
                        hide-details
                    />

                    <v-select
                        v-if="selectedFormat === Format.PNG.valueOf()"
                        v-model="selectedScalingFactor"
                        :items="scalingFactors"
                        color="primary"
                        class="mt-2"
                        density="compact"
                        variant="outlined"
                        label="Scaling factor"
                        hide-details
                    />

                    <span v-if="selectedFormat === Format.PNG.valueOf()">
                        The resulting image will have a resolution of <b>{{ resolution.width }} x {{ resolution.height }}</b> pixels.
                    </span>
                </div>
                <v-btn
                    class="mt-5 float-right"
                    color="primary"
                    variant="tonal"
                    text="Download"
                    prepend-icon="mdi-download"
                    @click="download"
                />
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import useSvgDownload from "@/composables/useSvgDownload";
import usePngDownload from "@/composables/usePngDownload";
import {toSvg} from "html-to-image";

const { downloadSvg } = useSvgDownload();
const { downloadPng, downloadDomPng } = usePngDownload();

const dialogOpen = defineModel<boolean>();

const {
    image,
    filename
} = defineProps<{
    image: SVGElement | HTMLElement;
    filename: string
}>();

const selectedFormat = ref(Format.SVG.valueOf());
const selectedScalingFactor = ref(ScalingFactor.Hundred);
const imageDataUrl = ref<string>("");

const supportedFormats = computed(() => {
    if (image instanceof HTMLElement) {
        return [Format.PNG.valueOf()];
    }

    return [ Format.SVG.valueOf(), Format.PNG.valueOf() ];
})

const resolution = computed(() => {
    const width = image.clientWidth;
    const height = image.clientHeight;
    const factor = scalingFactorToNumber(selectedScalingFactor.value);

    return {
        width: width * factor,
        height: height * factor
    }
})

const download = async () => {
    console.log("Download image:");
    console.log(image);
    if (image instanceof HTMLElement) {
        await downloadDomPng(image, `${filename}.png`, scalingFactorToNumber(selectedScalingFactor.value));
    } else if (selectedFormat.value === Format.SVG.valueOf()) {
        await downloadSvg(image, `${filename}.svg`);
    } else {
        await downloadPng(image, `${filename}.png`, scalingFactorToNumber(selectedScalingFactor.value));
    }
    dialogOpen.value = false;
};

const closeDialog = async () => {
    dialogOpen.value = false;
}

watch(dialogOpen, async (value) => {
    // Update the image when opening the dialog
    if (value) {
        let svgElement = image;
        if (image instanceof HTMLElement) {
            const svgDataUrl = await toSvg(image, { skipFonts: true });
            svgElement = new DOMParser().parseFromString(
                // Use decodeURIComponent to decode the URI encoding
                decodeURIComponent(svgDataUrl.split(",")[1]),
                "image/svg+xml"
            ).documentElement as unknown as SVGElement & { viewBox: any | undefined, width: any | undefined, height: any | undefined };
            selectedFormat.value = Format.PNG.valueOf();
        }
        const svgData = new XMLSerializer().serializeToString(svgElement);
        imageDataUrl.value = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }
});
</script>

<script lang="ts">
export enum Format {
    SVG = 'SVG',
    PNG = 'PNG'
}

enum ScalingFactor {
    Fifty = '50%',
    Hundred = '100%',
    TwoHundred = '200%',
    FourHundred = '400%',
    EightHundred = '800%'
}

const scalingFactors = Object.values(ScalingFactor);

const scalingFactorToNumber = (scalingFactor: ScalingFactor): number => {
    switch (scalingFactor) {
        case ScalingFactor.Fifty: return 0.5;
        case ScalingFactor.Hundred: return 1;
        case ScalingFactor.TwoHundred: return 2;
        case ScalingFactor.FourHundred: return 4;
        case ScalingFactor.EightHundred: return 8;
    }
};
</script>

<style scoped>

</style>
