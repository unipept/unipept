import AnalyticsCommunicator from "@/logic/communicators/analytics/AnalyticsCommunicator";
import {toSvg} from "html-to-image";
import useBlobDownload from "@/composables/useBlobDownload";

export default function useSvgDownload() {
    const analyticsCommunicator = new AnalyticsCommunicator();
    const { saveBlobAs } = useBlobDownload();

    const downloadSvg = async (svg: SVGElement, filename = 'image.svg') => {
        let svgString = new XMLSerializer().serializeToString(svg);

        if (svg.hasAttribute("viewport")) {
            svgString = svgString
                .replace(/width="[0-9]*%?"/, `width="100%"`)
                .replace(/height="[0-9]*%?"/, `height="100%"`);
        }

        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const saved = await saveBlobAs(blob, filename);

        if (saved) {
            analyticsCommunicator.logDownloadVisualization(filename, 'svg', 'svg');
        }
    }

    const downloadHtmlAsSvg = async (element: HTMLElement, filename = 'image.svg') => {
        const svgDataUrl = await toSvg(element, { skipFonts: true });
        const svgString = decodeURIComponent(svgDataUrl.split(",")[1]);
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const saved = await saveBlobAs(blob, filename);

        if (saved) {
            analyticsCommunicator.logDownloadVisualization(filename, 'svg', 'html');
        }
    };

    return {
        downloadSvg,
        downloadHtmlAsSvg
    }
}
