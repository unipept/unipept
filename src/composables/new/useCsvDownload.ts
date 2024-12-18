import {useFileSystemAccess} from "@vueuse/core";

export default function useCsvDownload() {
    const {
        isSupported,
        data: content,
        saveAs
    } = useFileSystemAccess();

    const download = async (data: string[][], filename: string, separator = ";") => {
        content.value = createCsvString(data, separator);

        await saveAs({
            suggestedName: filename
        }).catch(() => {});
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