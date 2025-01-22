import {useFileSystemAccess} from "@vueuse/core";
import {toPng} from "html-to-image";

export default function usePngDownload() {
    const serializer = new XMLSerializer();

    const {
        isSupported,
        data: content,
        saveAs
    } = useFileSystemAccess();

    const downloadPng = async (svgElement, filename = 'image.png', scalingFactor = 1) => {
        // Serialize the SVG element to a string
        const svgString = new XMLSerializer().serializeToString(svgElement);

        // Create a Blob object from the SVG string
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Load the image
        // We have to use a Promise to wait for the image to load
        const img = await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });

        // Get the original dimensions of the SVG
        const originalWidth = svgElement.viewBox?.baseVal.width || svgElement.width?.baseVal.value || svgElement.clientWidth;
        const originalHeight = svgElement.viewBox?.baseVal.height || svgElement.height?.baseVal.value || svgElement.clientHeight;

        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = originalWidth * scalingFactor;
        canvas.height = originalHeight * scalingFactor;

        const ctx = canvas.getContext('2d');
        ctx.scale(scalingFactor, scalingFactor);
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight);

        const pngBlob = await new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/png');
        });

        if (isSupported.value) {
            // Convert canvas to a PNG blob
            content.value = pngBlob;

            await saveAs({
                suggestedName: filename
            }).catch(() => {});
        } else {
            console.warn("Saving files is not supported by this browser. Falling back to direct download alternative...");

            const link = document.createElement("a");
            link.href = URL.createObjectURL(pngBlob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Clean up URL
        URL.revokeObjectURL(url);
    }

    const downloadDomPng = async (htmlElement, filename = 'image.png', scalingFactor = 1) => {
        const pngDataUrl = await toPng(htmlElement, {
            skipFonts: true,
            pixelRatio: scalingFactor
        });

        content.value = await fetch(pngDataUrl).then(res => res.blob());

        await saveAs({
            suggestedName: filename
        }).catch(() => {});
    }

    return {
        downloadPng,
        downloadDomPng
    }
}
