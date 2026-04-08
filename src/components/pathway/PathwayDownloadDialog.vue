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
                <div class="d-flex align-start" style="gap: 0;">
                    <!-- Export region -->
                    <div style="flex: 1;" class="d-flex flex-column align-center px-2">
                        <div class="text-subtitle-2 mb-2">Export region</div>
                        <v-radio-group v-model="selectedRegion" color="primary" hide-details>
                            <v-radio label="Full pathway" value="full" density="compact" />
                            <v-radio label="Visible area" value="viewport" density="compact" />
                        </v-radio-group>
                    </div>

                    <!-- Legend options (only when legend entries exist) -->
                    <template v-if="legendEntries.length > 0">
                        <v-divider vertical />

                        <!-- Legend position -->
                        <div style="flex: 1;" class="d-flex flex-column align-center px-2">
                            <div class="text-subtitle-2 mb-2">Legend position</div>
                            <div class="legend-position-grid">
                                <v-btn
                                    v-for="pos in (['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const)"
                                    :key="pos"
                                    :variant="legendPosition === pos ? 'tonal' : 'outlined'"
                                    :color="legendPosition === pos ? 'primary' : undefined"
                                    :title="pos.replace('-', ' ')"
                                    @click="legendPosition = pos"
                                >
                                    <v-icon size="22">{{ posIcon(pos) }}</v-icon>
                                </v-btn>
                            </div>
                        </div>

                        <v-divider vertical />

                        <!-- Legend size -->
                        <div style="flex: 1;" class="d-flex flex-column align-center px-2">
                            <div class="text-subtitle-2 mb-2">Legend size</div>
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

const props = defineProps<{
    pngUrl: string;
    overlayEl: SVGElement | null;
    imgWidth: number;
    imgHeight: number;
    scale: number;
    translate: { x: number; y: number };
    containerWidth: number;
    containerHeight: number;
    legendEntries: { name: string; color: string }[];
    isDifferential: boolean;
    filename: string;
}>();

const dialogOpen = defineModel<boolean>();

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
    let srcX = 0, srcY = 0, srcW = props.imgWidth, srcH = props.imgHeight;

    if (region === 'viewport' && props.containerWidth > 0 && props.containerHeight > 0 && props.scale > 0) {
        const s = props.scale;
        const tx = props.translate.x;
        const ty = props.translate.y;
        srcX = Math.max(0, -tx);
        srcY = Math.max(0, -ty);
        const srcX2 = Math.min(props.imgWidth, props.containerWidth / s - tx);
        const srcY2 = Math.min(props.imgHeight, props.containerHeight / s - ty);
        srcW = Math.max(1, srcX2 - srcX);
        srcH = Math.max(1, srcY2 - srcY);
    }

    canvas.width = Math.round(srcW);
    canvas.height = Math.round(srcH);

    // 1. Draw PNG background
    // crossOrigin = 'anonymous' requests CORS headers so the canvas won't be tainted.
    // If the server doesn't support CORS, onerror fires and we continue with a white background.
    await new Promise<void>(resolve => {
        const bg = new Image();
        bg.crossOrigin = 'anonymous';
        bg.onload = () => {
            ctx.drawImage(bg, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
            resolve();
        };
        bg.onerror = () => resolve();
        bg.src = props.pngUrl;
    });

    // 2. Draw SVG overlay
    if (props.overlayEl && props.imgWidth > 0 && props.imgHeight > 0) {
        const clone = props.overlayEl.cloneNode(true) as SVGElement;
        clone.setAttribute('width', String(props.imgWidth));
        clone.setAttribute('height', String(props.imgHeight));
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

    // 3. Draw legend
    if (props.legendEntries.length > 0) {
        drawLegend(ctx, canvas.width, canvas.height, legendPos, legScale);
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

const drawLegend = (
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    legendPos: LegendPosition,
    legScale: number
) => {
    const PAD = Math.round(10 * legScale);
    const SWATCH = Math.round(14 * legScale);
    const LINE_H = Math.round(22 * legScale);
    const GAP = Math.round(6 * legScale);
    const FONT = `${Math.round(12 * legScale)}px sans-serif`;
    const RADIUS = Math.round(6 * legScale);
    const BG_ALPHA = 0.92;

    ctx.font = FONT;

    if (props.isDifferential && props.legendEntries.length === 2) {
        // Differential legend: gradient bar + two labels
        const GRAD_W = Math.round(14 * legScale);
        const GRAD_H = Math.round(80 * legScale);
        const label1 = props.legendEntries[0].name;
        const label2 = props.legendEntries[1].name;
        const maxTextW = Math.max(ctx.measureText(label1).width, ctx.measureText(label2).width);
        const boxW = PAD * 2 + GRAD_W + GAP + maxTextW;
        const boxH = PAD * 2 + LINE_H + GRAD_H + LINE_H;

        const { lx, ly } = legendCorner(legendPos, canvasW, canvasH, boxW, boxH, PAD);

        ctx.fillStyle = `rgba(255,255,255,${BG_ALPHA})`;
        roundRect(ctx, lx, ly, boxW, boxH, RADIUS);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        roundRect(ctx, lx, ly, boxW, boxH, RADIUS);
        ctx.stroke();

        const textX = lx + PAD + GRAD_W + GAP;

        // Top label (color 1)
        ctx.fillStyle = props.legendEntries[0].color;
        ctx.fillText(label1, textX, ly + PAD + SWATCH);

        // Gradient bar
        const gradX = lx + PAD;
        const gradY = ly + PAD + LINE_H;
        const grad = ctx.createLinearGradient(gradX, gradY, gradX, gradY + GRAD_H);
        grad.addColorStop(0, props.legendEntries[0].color);
        grad.addColorStop(0.5, '#ffffe0');
        grad.addColorStop(1, props.legendEntries[1].color);
        ctx.fillStyle = grad;
        ctx.fillRect(gradX, gradY, GRAD_W, GRAD_H);

        // Bottom label (color 2)
        ctx.fillStyle = props.legendEntries[1].color;
        ctx.fillText(label2, textX, ly + PAD + LINE_H + GRAD_H + SWATCH);

    } else {
        // Per-taxon/group legend: colored swatches + labels
        const maxTextW = Math.max(...props.legendEntries.map(e => ctx.measureText(e.name).width));
        const boxW = PAD * 2 + SWATCH + GAP + maxTextW;
        const boxH = PAD * 2 + props.legendEntries.length * LINE_H - (LINE_H - SWATCH) / 2;

        const { lx, ly } = legendCorner(legendPos, canvasW, canvasH, boxW, boxH, PAD);

        ctx.fillStyle = `rgba(255,255,255,${BG_ALPHA})`;
        roundRect(ctx, lx, ly, boxW, boxH, RADIUS);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        roundRect(ctx, lx, ly, boxW, boxH, RADIUS);
        ctx.stroke();

        for (let i = 0; i < props.legendEntries.length; i++) {
            const entry = props.legendEntries[i];
            const rowY = ly + PAD + i * LINE_H;
            const swatchY = rowY + (LINE_H - SWATCH) / 2;

            ctx.fillStyle = entry.color;
            roundRect(ctx, lx + PAD, swatchY, SWATCH, SWATCH, Math.round(3 * legScale));
            ctx.fill();

            ctx.fillStyle = '#212121';
            ctx.font = FONT;
            ctx.fillText(entry.name, lx + PAD + SWATCH + GAP, rowY + SWATCH - 1);
        }
    }
};

const legendCorner = (
    pos: LegendPosition,
    canvasW: number,
    canvasH: number,
    boxW: number,
    boxH: number,
    pad: number
): { lx: number; ly: number } => {
    const lx = pos.includes('right') ? canvasW - boxW - pad : pad;
    const ly = pos.includes('bottom') ? canvasH - boxH - pad : pad;
    return { lx, ly };
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
};

let _previewGen = 0;

const buildPreview = async () => {
    if (!props.pngUrl) return;
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
    if (!props.pngUrl || downloading.value) return;
    downloading.value = true;
    try {
        const canvas = await buildCanvas(selectedRegion.value, legendPosition.value, legendScale.value);
        await new Promise<void>(resolve => {
            canvas.toBlob(blob => {
                if (!blob) { resolve(); return; }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${props.filename}.png`;
                a.click();
                URL.revokeObjectURL(url);
                resolve();
            }, 'image/png');
        });
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
