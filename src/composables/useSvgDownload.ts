import {useFileSystemAccess} from "@vueuse/core";
import AnalyticsCommunicator from "@/logic/communicators/analytics/AnalyticsCommunicator";

export default function useSvgDownload() {
    const analyticsCommunicator = new AnalyticsCommunicator();

    const {
        isSupported,
        data: content,
        saveAs
    } = useFileSystemAccess();

    const downloadSvg = async (svg: SVGElement, filename = 'image.png') => {
        let svgString = new XMLSerializer().serializeToString(svg);

        if (svg.hasAttribute("viewport")) {
            svgString = svgString
                .replace(/width="[0-9]*%?"/, `width="100%"`)
                .replace(/height="[0-9]*%?"/, `height="100%"`);
        }

        if (isSupported.value) {
            content.value = svgString;

            try {
                await saveAs({
                    suggestedName: filename
                });
                analyticsCommunicator.logDownloadVisualization(filename, 'svg', 'svg');
            } catch (error) {
                // Check if the user is simply the result of the user cancelling the request. Rethrow the error
                // otherwise.
                if (!JSON.stringify(error).includes("The user aborted a request")) {
                    throw error;
                }
            }
        } else {
            console.warn("Saving files is not supported by this browser. Falling back to direct download alternative...");

            const blob = new Blob([svgString], { type: "image/svg+xml" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            analyticsCommunicator.logDownloadVisualization(filename, 'svg', 'svg');
        }
    }

    return {
        downloadSvg
    }
}
