import {useFileSystemAccess} from "@vueuse/core";
import {toPng} from "html-to-image";

export default function usePngDownload() {
    const serializer = new XMLSerializer();

    const {
        isSupported,
        data: content,
        saveAs
    } = useFileSystemAccess();

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

        if (isSupported.value) {
            // Convert canvas to a PNG blob
            content.value = pngBlob;

            try {
                await saveAs({
                    suggestedName: filename
                });
            } catch (error) {
                // Check if the user is simply the result of the user cancelling the request. Rethrow the error
                // otherwise.
                if (!JSON.stringify(error).includes("The user aborted a request")) {
                    throw error;
                }
            }
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

    const downloadDomPng = async (htmlElement: HTMLElement, filename = 'image.png', scalingFactor = 1) => {
        const pngDataUrl = await toPng(htmlElement, {
            skipFonts: true,
            pixelRatio: scalingFactor
        });

        content.value = await fetch(pngDataUrl).then(res => res.blob());

        try {
            await saveAs({
                suggestedName: filename
            });
        } catch (error) {
            // Check if the user is simply the result of the user cancelling the request. Rethrow the error
            // otherwise.
            if (!JSON.stringify(error).includes("The user aborted a request")) {
                throw error;
            }
        }
    }

    return {
        downloadPng,
        downloadDomPng
    }
}
