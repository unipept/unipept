import {toPng} from "html-to-image";
import AnalyticsCommunicator from "@/logic/communicators/analytics/AnalyticsCommunicator";
import useBlobDownload from "@/composables/useBlobDownload";

export default function usePngDownload() {
    const analyticsCommunicator = new AnalyticsCommunicator();
    const { saveBlobAs } = useBlobDownload();

    const downloadPng = async (
        svgElement: SVGElement,
        filename = 'image.png',
        scalingFactor = 1
    ) => {
        // Serialize the SVG element to a string
        const svgString = new XMLSerializer().serializeToString(svgElement);

        // Create a Blob object from the SVG string
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Load the image
        // We have to use a Promise to wait for the image to load
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });

        // Get the original dimensions of the SVG
        let originalWidth;
        let originalHeight;

        if (svgElement instanceof SVGSVGElement) {
            originalWidth = svgElement.viewBox.baseVal.width;
            originalHeight = svgElement.viewBox.baseVal.height;
        } else {
            originalWidth = svgElement.clientWidth;
            originalHeight = svgElement.clientHeight;
        }

        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = originalWidth * scalingFactor;
        canvas.height = originalHeight * scalingFactor;

        const ctx = canvas.getContext('2d');

        if (ctx === null) {
            throw new Error(`Canvas context should not be null!`);
        }

        ctx.scale(scalingFactor, scalingFactor);
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight);

        const pngBlob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/png');
        });

        if (pngBlob === null) {
            throw new Error(`Could not create PNG blob!`);
        }

        const saved = await saveBlobAs(pngBlob, filename);

        if (saved) {
            analyticsCommunicator.logDownloadVisualization(filename, 'png', 'svg');
        }

        // Clean up URL
        URL.revokeObjectURL(url);
    }

    const downloadDomPng = async (htmlElement: HTMLElement, filename = 'image.png', scalingFactor = 1) => {
        const pngDataUrl = await toPng(htmlElement, {
            skipFonts: true,
            pixelRatio: scalingFactor
        });

        const pngBlob = await fetch(pngDataUrl).then(res => res.blob());
        const saved = await saveBlobAs(pngBlob, filename);

        if (saved) {
            analyticsCommunicator.logDownloadVisualization(filename, 'png', 'html');
        }
    }

    const downloadCanvasPng = async (canvas: HTMLCanvasElement, filename = 'image.png') => {
        const pngBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));

        if (pngBlob === null) {
            throw new Error('Could not create PNG blob!');
        }

        const saved = await saveBlobAs(pngBlob, filename);

        if (saved) {
            analyticsCommunicator.logDownloadVisualization(filename, 'png', 'canvas');
        }
    };

    return {
        downloadPng,
        downloadDomPng,
        downloadCanvasPng
    }
}
