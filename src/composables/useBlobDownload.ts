import {useFileSystemAccess} from "@vueuse/core";

export default function useBlobDownload() {
    const {
        isSupported,
        data: content,
        saveAs
    } = useFileSystemAccess();

    const saveBlobAs = async (blob: Blob, filename: string): Promise<boolean> => {
        if (isSupported.value) {
            content.value = blob;
            try {
                await saveAs({ suggestedName: filename });
                return true;
            } catch (error) {
                if (!JSON.stringify(error).includes('The user aborted a request')) {
                    throw error;
                }
                return false;
            }
        } else {
            console.warn("Saving files is not supported by this browser. Falling back to direct download alternative...");

            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return true;
        }
    };

    return {
        saveBlobAs
    }
}
