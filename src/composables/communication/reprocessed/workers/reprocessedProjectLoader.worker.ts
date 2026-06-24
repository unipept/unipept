import NetworkUtils from "@/logic/communicators/NetworkUtils";
import type {ReprocessedFile, ReprocessedLoaderData} from "../useReprocessedProjects";

self.onunhandledrejection = (event) => {
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async ({accession, baseUrl}: ReprocessedLoaderData): Promise<ReprocessedFile[]> => {
    const fileNames = await loadFileIndex(baseUrl, accession);
    return Promise.all(fileNames.map(fileName => loadFile(baseUrl, accession, fileName)));
}

const loadFileIndex = async (baseUrl: string, accession: string): Promise<string[]> => {
    const response = await NetworkUtils.getJSON(`${baseUrl}/${accession}/files.json`);
    return response.map((entry: { result_file: string }) => entry.result_file);
}

const loadFile = async (baseUrl: string, accession: string, fileName: string): Promise<ReprocessedFile> => {
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
