import NetworkUtils from "@/logic/communicators/NetworkUtils";
import {DEFAULT_REPROCESSED_PROJECTS_BASE_URL} from "@/logic/Constants";

export interface ReprocessedFile {
    name: string;                      // e.g. "S061.tsv"
    rawPeptides: string;               // peptides joined by "\n"
    intensities: Map<string, number>;  // peptide -> score
}

export default function useReprocessedProjects(
    baseUrl = DEFAULT_REPROCESSED_PROJECTS_BASE_URL,
) {
    const loadAccessions = async (): Promise<string[]> => {
        const response = await NetworkUtils.getJSON(`${baseUrl}/projects.json`);
        return response.map((entry: { accession: string }) => entry.accession);
    }

    const loadFileIndex = async (accession: string): Promise<string[]> => {
        const response = await NetworkUtils.getJSON(`${baseUrl}/${accession}/files.json`);
        return response.map((entry: { result_file: string }) => entry.result_file);
    }

    const loadFile = async (accession: string, fileName: string): Promise<ReprocessedFile> => {
        const text = await NetworkUtils.getText(`${baseUrl}/${accession}/${fileName}`);

        const peptides: string[] = [];
        const intensities = new Map<string, number>();

        for (const line of text.split("\n")) {
            const trimmed = line.trim();
            if (trimmed.length === 0) {
                continue;
            }

            const [peptide, score] = trimmed.split("\t");
            if (!peptide) {
                continue;
            }

            peptides.push(peptide);

            const parsedScore = parseFloat(score);
            if (!isNaN(parsedScore)) {
                intensities.set(peptide, parsedScore);
            }
        }

        return {
            name: fileName,
            rawPeptides: peptides.join("\n"),
            intensities
        };
    }

    const loadProjectFiles = async (accession: string): Promise<ReprocessedFile[]> => {
        const fileNames = await loadFileIndex(accession);
        return Promise.all(fileNames.map(fileName => loadFile(accession, fileName)));
    }

    return {
        loadAccessions,
        loadProjectFiles
    }
}
