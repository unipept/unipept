import {useFileSystemAccess} from "@vueuse/core";

export default function useSvgDownload() {
    const serializer = new XMLSerializer();

    const {
        isSupported,
        data: content,
        saveAs
    } = useFileSystemAccess();

    const downloadSvg = async (svg: SVGElement, filename = 'image.png') => {
        let svgString = serializer.serializeToString(svg);

        if (svg.hasAttribute("viewport")) {
            svgString = svgString
                .replace(/width="[0-9]*%?"/, `width="100%"`)
                .replace(/height="[0-9]*%?"/, `height="100%"`);
        }

        if (isSupported.value) {
            content.value = svgString;

            await saveAs({
                suggestedName: filename
            }).catch(() => {});
        } else {
            console.warn("Saving files is not supported by this browser. Falling back to direct download alternative...");

            const blob = new Blob([svgString], { type: "image/svg+xml" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    return {
        downloadSvg
    }
}
