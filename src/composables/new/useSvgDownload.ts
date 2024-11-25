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

        content.value = svgString;

        await saveAs({
            suggestedName: filename
        }).catch(() => {});
    }

    return {
        downloadSvg
    }
}
