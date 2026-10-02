import NetworkUtils from "@/logic/communicators/NetworkUtils";
import {DEFAULT_REPROCESSED_PROJECTS_BASE_URL} from "@/logic/Constants";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import ReprocessedProjectLoaderWorker from "./workers/reprocessedProjectLoader.worker.ts?worker";

export interface ReprocessedFile {
    name: string;                      // e.g. "S061.tsv"
    rawPeptides: string;               // peptides joined by "\n"
    intensities: Map<string, number>;  // peptide -> score
}

export interface ReprocessedLoaderData {
    accession: string;
    baseUrl: string;
}

const EXCLUDED_ACCESSIONS = new Set<string>([
    "PXD003527",
    "PXD016298",
    "PXD017035",
    "PXD007220",
    "PXD015757",
    "PXD020005",
    "PXD035496",
    "PXD036037",
    "PXD048273",
    "PXD046928",
    "PXD006129",
    "PXD011735",
    "PXD009564",
    "PXD036445",
    "PXD024291",
    "PXD057056",
    "PXD017059",
]);

export default function useReprocessedProjects(
    baseUrl = DEFAULT_REPROCESSED_PROJECTS_BASE_URL,
) {
    const { post } = useAsyncWebWorker<ReprocessedLoaderData, ReprocessedFile[]>(
        () => new ReprocessedProjectLoaderWorker()
    );

    const loadReprocessedAccessions = async (): Promise<string[]> => {
        const response = await NetworkUtils.getJSON(`${baseUrl}/projects.json`);
        return response
            .map((entry: { accession: string }) => entry.accession)
            .filter((accession: string) => !EXCLUDED_ACCESSIONS.has(accession));
    }

    const loadReprocessedProjectFiles = async (accession: string): Promise<ReprocessedFile[]> => {
        return await post({ accession, baseUrl });
    }

    return {
        loadReprocessedAccessions,
        loadReprocessedProjectFiles
    }
}
