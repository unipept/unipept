<template>
    <v-dialog v-model="dialogOpen" width="80%">
        <v-unipept-card class="bg-mainBody">
            <v-card-title class="d-flex align-center">
                <h2>Export pathway image</h2>
                <v-spacer />
                <v-btn icon="mdi-close" variant="plain" @click="dialogOpen = false" />
            </v-card-title>

            <v-card-text style="overflow: visible;">
                <!-- Preview -->
                <div class="d-flex justify-center mb-5">
                    <v-card variant="outlined" class="pa-2" width="60%" style="max-height: 400px;">
                        <div v-if="!previewDataUrl" class="d-flex align-center justify-center" style="min-height: 120px;">
                            <v-progress-circular indeterminate color="primary" size="32" />
                        </div>
                        <v-img
                            v-else
                            :src="previewDataUrl"
                            max-width="100%"
                            max-height="100%"
                        />
                    </v-card>
                </div>

                <v-divider class="mb-4" />

                <!-- Options row -->
                <div class="d-flex align-stretch" style="gap: 0;">
                    <!-- Export region -->
                    <div style="flex: 1;" class="d-flex flex-column align-center px-2">
                        <div class="text-subtitle-2 mb-2">Export region</div>
                        <div class="d-flex flex-grow-1 align-center justify-center">
                            <v-radio-group v-model="selectedRegion" color="primary" hide-details>
                                <v-radio label="Full pathway" value="full" density="compact" />
                                <v-radio label="Visible area" value="viewport" density="compact" />
                            </v-radio-group>
                        </div>
                    </div>

                    <!-- Legend options (only when a legend is present) -->
                    <template v-if="legendEl">
                        <v-divider vertical />

                        <!-- Legend position -->
                        <div style="flex: 1;" class="d-flex flex-column align-center px-2">
                            <div class="text-subtitle-2 mb-2">Legend position</div>
                            <div class="d-flex flex-grow-1 align-center justify-center">
                                <div class="legend-position-grid">
                                    <v-btn
                                        v-for="pos in (['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const)"
                                        :key="pos"
                                        :variant="legendPosition === pos ? 'tonal' : 'outlined'"
                                        :color="legendPosition === pos ? 'primary' : undefined"
                                        :title="pos.replace('-', ' ')"
                                        size="small"
                                        class="px-7"
                                        @click="legendPosition = pos"
                                    >
                                        <v-icon size="22">{{ posIcon(pos) }}</v-icon>
                                    </v-btn>
                                </div>
                            </div>
                        </div>

                        <v-divider vertical />

                        <!-- Legend size -->
                        <div style="flex: 1;" class="d-flex flex-column align-center px-2">
                            <div class="text-subtitle-2 mb-2">Legend size</div>
                            <div class="d-flex flex-grow-1 align-center justify-center">
                                <div class="d-flex align-center ga-2">
                                    <v-btn
                                        icon="mdi-minus"
                                        size="small"
                                        variant="outlined"
                                        :disabled="legendScale <= 0.5"
                                        @click="legendScale = Math.round((legendScale - 0.1) * 10) / 10"
                                    />
                                    <span class="text-body-2" style="min-width: 44px; text-align: center;">
                                        {{ Math.round(legendScale * 100) }}%
                                    </span>
                                    <v-btn
                                        icon="mdi-plus"
                                        size="small"
                                        variant="outlined"
                                        :disabled="legendScale >= 2.0"
                                        @click="legendScale = Math.round((legendScale + 0.1) * 10) / 10"
                                    />
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </v-card-text>

            <v-divider />

            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="dialogOpen = false">Cancel</v-btn>
                <v-btn
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-download"
                    :loading="downloading"
                    @click="download"
                >
                    Download
                </v-btn>
            </v-card-actions>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { toCanvas } from 'html-to-image';
import usePngDownload from '@/composables/usePngDownload';

const props = defineProps<{
    imgEl: HTMLImageElement | null;
    overlayEl: SVGElement | null;
    legendEl: HTMLElement | null;
    scale: number;
    translate: { x: number; y: number };
    containerWidth: number;
    containerHeight: number;
    filename: string;
}>();

const dialogOpen = defineModel<boolean>();

const { downloadCanvasPng } = usePngDownload();

type Region = 'full' | 'viewport';
type LegendPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const selectedRegion = ref<Region>('full');
const legendPosition = ref<LegendPosition>('top-right');
const legendScale = ref(1.0);
const previewDataUrl = ref<string>('');
const downloading = ref(false);

// ---- Canvas compositing ----

const buildCanvas = async (region: Region, legendPos: LegendPosition, legScale: number): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Determine source rect (in image coords) and canvas size
    const imgW = props.imgEl?.naturalWidth ?? 0;
    const imgH = props.imgEl?.naturalHeight ?? 0;
    let srcX = 0, srcY = 0, srcW = imgW, srcH = imgH;

    if (region === 'viewport' && props.containerWidth > 0 && props.containerHeight > 0 && props.scale > 0) {
        const s = props.scale;
        const tx = props.translate.x;
        const ty = props.translate.y;
        srcX = Math.max(0, -tx);
        srcY = Math.max(0, -ty);
        const srcX2 = Math.min(imgW, props.containerWidth / s - tx);
        const srcY2 = Math.min(imgH, props.containerHeight / s - ty);
        srcW = Math.max(1, srcX2 - srcX);
        srcH = Math.max(1, srcY2 - srcY);
    }

    canvas.width = Math.round(srcW);
    canvas.height = Math.round(srcH);

    // 1. Draw PNG background directly from the already-loaded img element.
    // crossorigin="anonymous" is set on the element so the canvas won't be tainted.
    // If CORS is not supported by the server a SecurityError is thrown and we fall through
    // with a white background.
    if (props.imgEl) {
        try {
            ctx.drawImage(props.imgEl, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
        } catch {
            // CORS not supported — canvas left with white background
        }
    }

    // 2. Draw SVG overlay
    if (props.overlayEl && imgW > 0 && imgH > 0) {
        const clone = props.overlayEl.cloneNode(true) as SVGElement;
        clone.setAttribute('width', String(imgW));
        clone.setAttribute('height', String(imgH));
        clone.setAttribute('overflow', 'hidden');
        clone.style.position = 'static';
        const svgStr = new XMLSerializer().serializeToString(clone);
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        await new Promise<void>(resolve => {
            const svgImg = new Image();
            svgImg.onload = () => {
                ctx.drawImage(svgImg, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
                resolve();
            };
            svgImg.onerror = () => resolve();
            svgImg.src = svgUrl;  // blob: URL, always same-origin
        });
        URL.revokeObjectURL(svgUrl);
    }

    // 3. Draw legend from the live DOM element
    if (props.legendEl) {
        try {
            // pixelRatio: 1 ensures the canvas dimensions match CSS pixel size exactly,
            // avoiding 2x scaling on retina displays that would misplace the legend.
            const legendCanvas = await toCanvas(props.legendEl, {
                skipFonts: true,
                pixelRatio: 1,
                style: { position: 'static', top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' },
            });
            console.log('Legend canvas dims:', legendCanvas.width, legendCanvas.height);
            const lw = Math.round(legendCanvas.width * legScale);
            const lh = Math.round(legendCanvas.height * legScale);
            const PAD = 10;
            const lx = legendPos.includes('right') ? canvas.width - lw - PAD : PAD;
            const ly = legendPos.includes('bottom') ? canvas.height - lh - PAD : PAD;
            ctx.drawImage(legendCanvas, lx, ly, lw, lh);
        } catch (e) { console.error('Legend capture failed', e) }
    }

    // 4. White border frame — replicates the .border scoped CSS in PathwayImageOverlay
    //    which doesn't survive SVG serialization (scoped styles aren't embedded in SVG).
    const BORDER = 6;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, BORDER);
    ctx.fillRect(0, canvas.height - BORDER, canvas.width, BORDER);
    ctx.fillRect(0, 0, BORDER, canvas.height);
    ctx.fillRect(canvas.width - BORDER, 0, BORDER, canvas.height);

    return canvas;
};


let _previewGen = 0;

const buildPreview = async () => {
    if (!props.imgEl) return;
    const gen = ++_previewGen;
    await nextTick(); // let parent prop updates flush first
    try {
        const canvas = await buildCanvas(selectedRegion.value, legendPosition.value, legendScale.value);
        if (gen === _previewGen) {
            previewDataUrl.value = canvas.toDataURL('image/png');
        }
    } catch {
        // silent — keep showing the previous preview
    }
};

const download = async () => {
    if (!props.imgEl || downloading.value) return;
    downloading.value = true;
    try {
        const canvas = await buildCanvas(selectedRegion.value, legendPosition.value, legendScale.value);
        await downloadCanvasPng(canvas, `${props.filename}.png`);
    } finally {
        downloading.value = false;
    }
};

const posIcon = (pos: LegendPosition): string => ({
    'top-left': 'mdi-arrow-top-left',
    'top-right': 'mdi-arrow-top-right',
    'bottom-left': 'mdi-arrow-bottom-left',
    'bottom-right': 'mdi-arrow-bottom-right',
}[pos]);

// Rebuild preview when dialog opens or options change
watch(dialogOpen, (isOpen) => { if (isOpen) buildPreview(); });
watch([selectedRegion, legendPosition, legendScale], () => { if (dialogOpen.value) buildPreview(); });
</script>

<style scoped>
.legend-position-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    width: fit-content;
}

</style>
