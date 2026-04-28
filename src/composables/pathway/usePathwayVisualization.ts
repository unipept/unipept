import { ref, nextTick } from 'vue';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';
import type PathwayImageOverlay from '@/components/pathway/PathwayImageOverlay.vue';

export type InfoPanelData = { type: 'area'; area: any } | { type: 'compound'; compound: any } | null;

export function usePathwayVisualization() {
    const mappingStore = usePathwayPilotMappingStore();

    const pngUrl = ref<string | undefined>(undefined);
    const rawAreas = ref<any[]>([]);
    const loading = ref(false);
    const error = ref(false);
    const scale = ref(1);
    const translate = ref({ x: 0, y: 0 });
    const initialScale = ref(1);

    const imgRef = ref<HTMLImageElement | null>(null);
    const overlayRef = ref<InstanceType<typeof PathwayImageOverlay> | null>(null);
    const legendRef = ref<HTMLElement | null>(null);
    const vizWrapper = ref<HTMLElement | null>(null);
    const imageLoaded = ref(false);
    const imgWidth = ref(0);
    const imgHeight = ref(0);
    const containerHeight = ref(600);
    const containerWidth = ref(0);

    const downloadDialogOpen = ref(false);
    const infoPanel = ref<InfoPanelData>(null);

    const fetchVisualization = async (pathwayId: string) => {
        loading.value = true;
        error.value = false;
        imageLoaded.value = false;
        pngUrl.value = undefined;
        rawAreas.value = [];
        scale.value = 1;
        translate.value = { x: 0, y: 0 };
        infoPanel.value = null;

        try {
            const data = await mappingStore.getVisualizationData(pathwayId);
            pngUrl.value = data.image;
            rawAreas.value = data.nodes ?? [];
        } catch {
            error.value = true;
        } finally {
            loading.value = false;
        }
    };

    const resetView = () => {
        scale.value = initialScale.value;
        translate.value = { x: 0, y: 0 };
    };

    const onImageLoad = async () => {
        if (imgRef.value) {
            imgWidth.value = imgRef.value.naturalWidth;
            imgHeight.value = imgRef.value.naturalHeight;
            containerHeight.value = Math.min(imgRef.value.naturalHeight, 600);
            imageLoaded.value = true;

            await nextTick();
            if (vizWrapper.value && imgWidth.value > 0) {
                const containerW = vizWrapper.value.clientWidth;
                containerWidth.value = containerW;
                initialScale.value = imgWidth.value > containerW ? containerW / imgWidth.value : 1;
                scale.value = initialScale.value;
            }
        }
    };

    const onAreaClick = (area: any) => {
        infoPanel.value = area ? { type: 'area', area } : null;
    };

    const onCompoundClick = (compound: any) => {
        infoPanel.value = compound ? { type: 'compound', compound } : null;
    };

    return {
        mappingStore,
        pngUrl,
        rawAreas,
        loading,
        error,
        scale,
        translate,
        initialScale,
        imgRef,
        overlayRef,
        legendRef,
        vizWrapper,
        imageLoaded,
        imgWidth,
        imgHeight,
        containerHeight,
        containerWidth,
        downloadDialogOpen,
        infoPanel,
        fetchVisualization,
        resetView,
        onImageLoad,
        onAreaClick,
        onCompoundClick,
    };
}
