import {useFileSystemAccess} from "@vueuse/core";

export default function useCsvDownload() {
    const {
        isSupported,
        data: content,
        saveAs
    } = useFileSystemAccess();

    const download = async (data: string[][], filename: string, separator = ";"): Promise<void> => {
        if (isSupported.value) {
            content.value = createCsvString(data, separator);

            try {
                await saveAs({
                    suggestedName: filename
                });
            } catch (e) {
                // ignore error (otherwise a useless error is printed to the console)
                console.error(e);
            }
        } else {
            console.warn("Saving files is not supported by this browser. Falling back to direct download alternative...");

            const blob = new Blob([createCsvString(data, separator)], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    const createCsvString = (data: string[][], separator = ";") => {
        return data.map(row =>
            row.map(cell => {
                cell = cell.toString();
                if (cell.includes(separator) || cell.includes("\"") || cell.includes("\n") || cell.includes("\r")) {
                    return `"${cell.replace(/"/g, "\"\"")}"`;
                }
                return cell;
            }).join(separator)
        ).join("\n");
    }

    return {
        isSupported,
        download,
    };
}
